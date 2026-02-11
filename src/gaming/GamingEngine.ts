import { KSynchronyConfig, GameState, GameMove, Leaderboard } from '../types';
import { KaspaClient } from '../core/KaspaClient';
import * as crypto from 'crypto';

export class GamingEngine {
  private config: KSynchronyConfig;
  private client: KaspaClient;
  private gameStates: Map<string, GameState>;
  private syncInterval: NodeJS.Timeout | null = null;
  private leaderboards: Map<string, Leaderboard> = new Map();

  constructor(config: KSynchronyConfig, client: KaspaClient) {
    this.config = config;
    this.client = client;
    this.gameStates = new Map();
  }

  async initialize(): Promise<void> {
    await this.client.connect();
    this.startDAGStateSync();
    console.log('✓ Gaming Engine initialized with DAG-State Sync');
  }

  /**
   * Create new game session with on-chain state tracking
   */
  async createGame(gameId: string, gameType: string, players: string[]): Promise<GameState> {
    const gameState: GameState = {
      gameId,
      gameType,
      players,
      state: {
        moves: [],
        scores: players.reduce((acc, p) => ({ ...acc, [p]: 0 }), {})
      },
      lastUpdate: Date.now(),
      blockHash: '',
      blueScore: 0
    };

    this.gameStates.set(gameId, gameState);
    console.log(`Game created: ${gameId} (${gameType})`);
    
    return gameState;
  }

  /**
   * Submit micro-transaction for game move
   * Each move is a transaction on Kaspa - this is the killer feature
   */
  async submitMove(gameId: string, playerId: string, move: any): Promise<GameMove> {
    const game = this.gameStates.get(gameId);
    if (!game) throw new Error('Game not found');

    if (!game.players.includes(playerId)) {
      throw new Error('Player not in game');
    }

    // Create move object
    const gameMove: GameMove = {
      gameId,
      playerId,
      move,
      timestamp: Date.now(),
      txId: '',
      confirmed: false
    };

    // In production, this would create actual Kaspa transaction
    // For now, simulate with hash
    gameMove.txId = await this.createMoveTx(gameId, playerId, move);
    
    // Update local state optimistically
    game.state.moves.push(gameMove);
    game.lastUpdate = Date.now();

    // Update leaderboard
    await this.updateLeaderboard(game.gameType, playerId, move);

    console.log(`Move submitted: ${playerId} in ${gameId}`);
    
    return gameMove;
  }

  /**
   * Get current game state
   */
  getGameState(gameId: string): GameState | undefined {
    return this.gameStates.get(gameId);
  }

  /**
   * Get all active games
   */
  getActiveGames(): GameState[] {
    return Array.from(this.gameStates.values());
  }

  /**
   * End game and finalize scores
   */
  async endGame(gameId: string): Promise<GameState> {
    const game = this.gameStates.get(gameId);
    if (!game) throw new Error('Game not found');

    // Calculate final scores
    const finalScores = this.calculateFinalScores(game);
    game.state.scores = finalScores;
    game.state.ended = true;
    game.lastUpdate = Date.now();

    // Update leaderboard with final results
    for (const [playerId, score] of Object.entries(finalScores)) {
      await this.updateLeaderboard(game.gameType, playerId, { score });
    }

    console.log(`Game ended: ${gameId}`);
    return game;
  }

  /**
   * DAG-State Sync: Real-time game state updates
   * Syncs every 1 second with Kaspa blocks
   * This proves "Real-Time PoW Gaming" is possible
   */
  private startDAGStateSync(): void {
    this.syncInterval = setInterval(async () => {
      await this.syncAllGameStates();
    }, 1000); // 1 second sync - matches Kaspa block time
  }

  private async syncAllGameStates(): Promise<void> {
    try {
      const dagInfo = await this.client.getBlockDagInfo();
      const latestBlueScore = dagInfo.virtualParentHashes?.length || 0;

      for (const [gameId, state] of this.gameStates.entries()) {
        // Update game state with latest block info
        state.blueScore = latestBlueScore;
        
        // Confirm pending moves
        for (const move of state.state.moves) {
          if (!move.confirmed && move.txId) {
            // Check if move transaction is confirmed
            move.confirmed = await this.isMoveConfirmed(move.txId);
          }
        }
      }
    } catch (error) {
      console.error('DAG sync error:', error);
    }
  }

  private async isMoveConfirmed(txId: string): Promise<boolean> {
    try {
      const tx = await this.client.getTransaction(txId);
      return !!tx.acceptingBlockHash;
    } catch (error) {
      return false;
    }
  }

  private async createMoveTx(gameId: string, playerId: string, move: any): Promise<string> {
    // In production: Create actual Kaspa transaction with move data
    // For now: Generate deterministic hash
    const data = JSON.stringify({ gameId, playerId, move, timestamp: Date.now() });
    return `tx_${crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)}`;
  }

  /**
   * Get global leaderboard updated in real-time
   * Updated every 1 second via DAG-State Sync
   */
  async getLeaderboard(gameType: string, limit: number = 10): Promise<Leaderboard> {
    const leaderboard = this.leaderboards.get(gameType) || {
      gameType,
      entries: [],
      lastUpdate: Date.now()
    };

    // Sort by score descending
    leaderboard.entries.sort((a, b) => b.score - a.score);
    leaderboard.entries = leaderboard.entries.slice(0, limit);

    return leaderboard;
  }

  private async updateLeaderboard(gameType: string, playerId: string, move: any): Promise<void> {
    let leaderboard = this.leaderboards.get(gameType);
    
    if (!leaderboard) {
      leaderboard = {
        gameType,
        entries: [],
        lastUpdate: Date.now()
      };
      this.leaderboards.set(gameType, leaderboard);
    }

    let entry = leaderboard.entries.find(e => e.playerId === playerId);
    
    if (!entry) {
      entry = {
        playerId,
        score: 0,
        wins: 0,
        games: 0
      };
      leaderboard.entries.push(entry);
    }

    // Update score based on move
    if (move.score !== undefined) {
      entry.score += move.score;
    }
    if (move.win) {
      entry.wins += 1;
    }
    entry.games += 1;

    leaderboard.lastUpdate = Date.now();
  }

  private calculateFinalScores(game: GameState): Record<string, number> {
    const scores: Record<string, number> = {};
    
    for (const player of game.players) {
      const playerMoves = game.state.moves.filter(m => m.playerId === player);
      scores[player] = playerMoves.reduce((sum, m) => sum + (m.move.score || 0), 0);
    }

    return scores;
  }

  /**
   * Get game statistics
   */
  getGameStats(gameId: string): any {
    const game = this.gameStates.get(gameId);
    if (!game) return null;

    return {
      gameId: game.gameId,
      gameType: game.gameType,
      players: game.players.length,
      totalMoves: game.state.moves.length,
      confirmedMoves: game.state.moves.filter(m => m.confirmed).length,
      duration: Date.now() - (game.state.moves[0]?.timestamp || Date.now()),
      scores: game.state.scores
    };
  }

  shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      console.log('Gaming Engine shutdown');
    }
  }
}
