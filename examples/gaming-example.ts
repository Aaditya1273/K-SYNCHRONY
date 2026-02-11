import { KSynchrony } from '../src';

async function realTimeGamingDemo() {
  console.log('=== K-SYNCHRONY Gaming Demo ===\n');

  const ks = new KSynchrony({
    network: 'testnet'
  });

  await ks.initialize();

  console.log('1. Creating Game Session...');
  // Create new game session
  const game = await ks.gaming.createGame(
    'street-fighter-001',
    'street-fighter',
    [
      'player1_kaspa_address',
      'player2_kaspa_address'
    ]
  );

  console.log(`  ✓ Game created: ${game.gameId}`);
  console.log(`  Type: ${game.gameType}`);
  console.log(`  Players: ${game.players.length}`);

  console.log('\n2. Simulating Game Moves (Micro-Transactions)...');
  
  // Player 1 makes moves
  const move1 = await ks.gaming.submitMove(
    game.gameId,
    'player1_kaspa_address',
    { action: 'punch', power: 50, score: 10 }
  );
  console.log(`  ✓ Player 1: Punch (${move1.txId.substring(0, 16)}...)`);

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Player 2 makes moves
  const move2 = await ks.gaming.submitMove(
    game.gameId,
    'player2_kaspa_address',
    { action: 'kick', power: 70, score: 15 }
  );
  console.log(`  ✓ Player 2: Kick (${move2.txId.substring(0, 16)}...)`);

  await new Promise(resolve => setTimeout(resolve, 1000));

  // More moves
  const move3 = await ks.gaming.submitMove(
    game.gameId,
    'player1_kaspa_address',
    { action: 'special', power: 100, score: 25 }
  );
  console.log(`  ✓ Player 1: Special Move (${move3.txId.substring(0, 16)}...)`);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const move4 = await ks.gaming.submitMove(
    game.gameId,
    'player2_kaspa_address',
    { action: 'block', power: 30, score: 5 }
  );
  console.log(`  ✓ Player 2: Block (${move4.txId.substring(0, 16)}...)`);

  console.log('\n3. Real-Time Game State (DAG-State Sync)...');
  // Wait for DAG sync
  await new Promise(resolve => setTimeout(resolve, 2000));

  const currentState = ks.gaming.getGameState(game.gameId);
  if (currentState) {
    console.log(`  Total Moves: ${currentState.state.moves.length}`);
    console.log(`  Confirmed Moves: ${currentState.state.moves.filter(m => m.confirmed).length}`);
    console.log(`  Blue Score: ${currentState.blueScore}`);
    console.log(`  Last Update: ${new Date(currentState.lastUpdate).toISOString()}`);
  }

  console.log('\n4. Game Statistics...');
  const stats = ks.gaming.getGameStats(game.gameId);
  if (stats) {
    console.log(`  Game ID: ${stats.gameId}`);
    console.log(`  Total Moves: ${stats.totalMoves}`);
    console.log(`  Confirmed: ${stats.confirmedMoves}`);
    console.log(`  Duration: ${(stats.duration / 1000).toFixed(1)}s`);
    console.log(`  Scores:`, stats.scores);
  }

  console.log('\n5. Ending Game...');
  const finalGame = await ks.gaming.endGame(game.gameId);
  console.log('  ✓ Game ended');
  console.log('  Final Scores:');
  for (const [player, score] of Object.entries(finalGame.state.scores)) {
    console.log(`    ${player.substring(0, 20)}...: ${score} points`);
  }

  console.log('\n6. Global Leaderboard (Real-Time)...');
  const leaderboard = await ks.gaming.getLeaderboard('street-fighter', 5);
  console.log(`  Game Type: ${leaderboard.gameType}`);
  console.log(`  Last Update: ${new Date(leaderboard.lastUpdate).toISOString()}`);
  console.log('  Top Players:');
  leaderboard.entries.forEach((entry, i) => {
    console.log(`    ${i + 1}. ${entry.playerId.substring(0, 20)}... - ${entry.score} pts (${entry.wins}W/${entry.games}G)`);
  });

  console.log('\n7. Creating Multiple Games...');
  const games = [];
  for (let i = 0; i < 3; i++) {
    const g = await ks.gaming.createGame(
      `fast-chess-${i}`,
      'fast-chess',
      [`player_a_${i}`, `player_b_${i}`]
    );
    games.push(g);
  }
  console.log(`  ✓ Created ${games.length} concurrent games`);

  const activeGames = ks.gaming.getActiveGames();
  console.log(`  Active Games: ${activeGames.length}`);

  console.log('\n8. Key Features Demonstrated:');
  console.log('  ✓ High-Frequency Micro-Wagering (each move = transaction)');
  console.log('  ✓ DAG-State Sync (1-second updates)');
  console.log('  ✓ Real-Time Leaderboard');
  console.log('  ✓ Proves "Real-Time PoW Gaming" is possible!');

  ks.shutdown();
  console.log('\n=== Demo Complete ===');
}

realTimeGamingDemo().catch(console.error);
