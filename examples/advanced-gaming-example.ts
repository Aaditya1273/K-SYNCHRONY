import { KSynchrony } from '../src';
import { Formatter } from '../src/utils/Formatter';

async function advancedGamingDemo() {
  console.log('=== K-SYNCHRONY Advanced Gaming Demo ===\n');
  console.log('Building a complete Street Fighter tournament system\n');

  const ks = new KSynchrony({ network: 'testnet' });
  await ks.initialize();

  // Tournament setup
  const players = [
    'player_ryu',
    'player_ken',
    'player_chun_li',
    'player_guile'
  ];

  console.log('1. Tournament Setup...');
  console.log(`  Players: ${players.length}`);
  console.log(`  Format: Round Robin`);
  console.log(`  Game Type: Street Fighter\n`);

  // Create multiple games
  const games = [];
  let gameCount = 0;

  console.log('2. Creating Tournament Matches...');
  
  // Round robin: each player plays every other player
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const gameId = `tournament-match-${++gameCount}`;
      const game = await ks.gaming.createGame(
        gameId,
        'street-fighter',
        [players[i], players[j]]
      );
      games.push(game);
      console.log(`  ✓ Match ${gameCount}: ${players[i]} vs ${players[j]}`);
    }
  }

  console.log(`\n  Total matches: ${games.length}\n`);

  console.log('3. Simulating Tournament Matches...\n');

  // Simulate each match
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    console.log(`Match ${i + 1}: ${game.players[0]} vs ${game.players[1]}`);
    
    // Simulate 5 moves per player
    for (let round = 0; round < 5; round++) {
      for (const player of game.players) {
        const moves = ['punch', 'kick', 'block', 'special', 'combo'];
        const move = moves[Math.floor(Math.random() * moves.length)];
        const power = Math.floor(Math.random() * 50) + 50;
        const score = Math.floor(power / 5);

        await ks.gaming.submitMove(game.gameId, player, {
          action: move,
          power,
          score,
          round: round + 1
        });
      }
    }

    // End game
    await ks.gaming.endGame(game.gameId);
    const stats = ks.gaming.getGameStats(game.gameId);
    
    if (stats) {
      const winner = Object.entries(stats.scores).reduce((a, b) => 
        b[1] > a[1] ? b : a
      );
      console.log(`  Winner: ${winner[0]} (${winner[1]} points)`);
      console.log(`  Duration: ${Formatter.formatDuration(stats.duration)}\n`);
    }

    // Small delay between matches
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('4. Tournament Results...\n');

  // Get final leaderboard
  const leaderboard = await ks.gaming.getLeaderboard('street-fighter', 10);
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              TOURNAMENT FINAL STANDINGS                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  leaderboard.entries.forEach((entry, i) => {
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
    console.log(`${medal} ${i + 1}. ${entry.playerId.padEnd(20)} - ${entry.score} pts (${entry.wins}W/${entry.games}G)`);
  });

  console.log('\n5. Tournament Statistics...\n');
  
  const totalMoves = games.reduce((sum, game) => {
    const stats = ks.gaming.getGameStats(game.gameId);
    return sum + (stats?.totalMoves || 0);
  }, 0);

  const totalDuration = games.reduce((sum, game) => {
    const stats = ks.gaming.getGameStats(game.gameId);
    return sum + (stats?.duration || 0);
  }, 0);

  console.log(`  Total Matches:        ${games.length}`);
  console.log(`  Total Moves:          ${totalMoves}`);
  console.log(`  Total Duration:       ${Formatter.formatDuration(totalDuration)}`);
  console.log(`  Avg Moves/Match:      ${Math.floor(totalMoves / games.length)}`);
  console.log(`  Avg Match Duration:   ${Formatter.formatDuration(totalDuration / games.length)}`);

  console.log('\n6. Real-Time Features Demonstrated...\n');
  console.log('  ✓ Multiple concurrent games');
  console.log('  ✓ Micro-transaction moves (each move = transaction)');
  console.log('  ✓ DAG-State Sync (1-second updates)');
  console.log('  ✓ Real-time leaderboard updates');
  console.log('  ✓ Tournament management');
  console.log('  ✓ Provably fair gameplay');

  console.log('\n7. Use Cases Enabled...\n');
  console.log('  • Esports tournaments with real money');
  console.log('  • Betting on individual moves');
  console.log('  • Live streaming with on-chain verification');
  console.log('  • Global competitive rankings');
  console.log('  • Instant prize distribution');

  ks.shutdown();
  console.log('\n=== Demo Complete ===');
}

advancedGamingDemo().catch(console.error);
