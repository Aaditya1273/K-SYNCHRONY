import { GamingEngine } from '../../src/gaming/GamingEngine';
import { KaspaClient } from '../../src/core/KaspaClient';

describe('GamingEngine', () => {
  let gamingEngine: GamingEngine;
  let mockClient: KaspaClient;

  beforeEach(() => {
    mockClient = new KaspaClient({
      endpoint: 'testnet.kaspathon.com',
      network: 'testnet'
    });
    
    gamingEngine = new GamingEngine(
      { network: 'testnet' },
      mockClient
    );
  });

  afterEach(() => {
    gamingEngine.shutdown();
  });

  describe('Game Creation', () => {
    test('should create game session', async () => {
      const gameId = 'test-game-001';
      const gameType = 'chess';
      const players = ['player1', 'player2'];

      const game = await gamingEngine.createGame(gameId, gameType, players);

      expect(game).toBeDefined();
      expect(game.gameId).toBe(gameId);
      expect(game.gameType).toBe(gameType);
      expect(game.players).toEqual(players);
      expect(game.state.moves).toEqual([]);
    });

    test('should initialize scores for all players', async () => {
      const players = ['player1', 'player2', 'player3'];

      const game = await gamingEngine.createGame('game-001', 'tournament', players);

      expect(game.state.scores).toBeDefined();
      expect(game.state.scores['player1']).toBe(0);
      expect(game.state.scores['player2']).toBe(0);
      expect(game.state.scores['player3']).toBe(0);
    });
  });

  describe('Game State', () => {
    test('should retrieve game state', async () => {
      const gameId = 'test-game-002';
      await gamingEngine.createGame(gameId, 'chess', ['p1', 'p2']);

      const state = await gamingEngine.getGameState(gameId);

      expect(state).toBeDefined();
      if (state) {
        expect(state.gameId).toBe(gameId);
      }
    });

    test('should return null or undefined for non-existent game', async () => {
      const state = await gamingEngine.getGameState('non-existent');

      expect(state).toBeFalsy(); // null or undefined
    });
  });

  describe('Leaderboard', () => {
    test('should get leaderboard for game type', async () => {
      const leaderboard = await gamingEngine.getLeaderboard('chess');

      expect(leaderboard).toBeDefined();
      expect(leaderboard.gameType).toBe('chess');
      expect(Array.isArray(leaderboard.entries)).toBe(true);
    });

    test('should sort leaderboard by score', async () => {
      const leaderboard = await gamingEngine.getLeaderboard('chess');

      if (leaderboard.entries.length > 1) {
        for (let i = 0; i < leaderboard.entries.length - 1; i++) {
          expect(leaderboard.entries[i].score).toBeGreaterThanOrEqual(
            leaderboard.entries[i + 1].score
          );
        }
      }
    });
  });

  describe('Game Statistics', () => {
    test('should return game statistics', async () => {
      const gameId = 'test-game-003';
      await gamingEngine.createGame(gameId, 'chess', ['p1', 'p2']);

      const stats = await gamingEngine.getGameStats(gameId);

      expect(stats).toBeDefined();
      expect(typeof stats.totalMoves).toBe('number');
      expect(typeof stats.duration).toBe('number');
    });
  });
});
