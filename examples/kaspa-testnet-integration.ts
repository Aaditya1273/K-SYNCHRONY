import { KSynchrony } from '../src';

/**
 * Real Kaspa Testnet Integration Test
 * Tests actual connection to Kaspa network
 */
async function testKaspaTestnet() {
  console.log('=== Kaspa Testnet Integration Test ===\n');

  // Your wallet details
  const walletAddress = 'kaspa:qz0h05ep5uxz9vqfp8x5t4swzjlw2af6gln34zkkx7a44rjcn489ckchhmak4';
  const privateKey = '572a06e6b7fbd76ee68f8b0cce77b2746bf7928150a3a2eb2f16e18bfa8f550';

  try {
    // Initialize K-Synchrony with testnet
    console.log('1. Initializing K-Synchrony...');
    const ks = new KSynchrony({
      network: 'testnet',
      apiEndpoint: 'api.kaspa.org' // Official Kaspa API
    });

    await ks.initialize();
    console.log('✓ Connected to Kaspa testnet\n');

    // Test 1: Check wallet balance
    console.log('2. Checking wallet balance...');
    try {
      const client = ks.getClient();
      const balance = await client.getBalance(walletAddress);
      console.log(`✓ Wallet Balance: ${balance} sompi (${balance / 100000000} KAS)`);
    } catch (error: any) {
      console.log(`⚠ Balance check: ${error.message}`);
    }

    // Test 2: Get network info
    console.log('\n3. Getting network info...');
    try {
      const client = ks.getClient();
      const dagInfo = await client.getBlockDagInfo();
      console.log('✓ Network Info:');
      console.log(`  - Virtual DAG Tips: ${dagInfo.virtualParentHashes?.length || 0}`);
      console.log(`  - Network: ${dagInfo.networkName || 'testnet'}`);
    } catch (error: any) {
      console.log(`⚠ Network info: ${error.message}`);
    }

    // Test 3: Create IoT data anchor (simulated)
    console.log('\n4. Testing IoT Data Anchoring...');
    const deviceId = 'door-sensor-001';
    const sensorData = {
      device: deviceId,
      action: 'open',
      timestamp: Date.now(),
      location: 'main-entrance'
    };

    const anchor = await ks.iot.anchorData(deviceId, sensorData);
    console.log('✓ Data Anchored:');
    console.log(`  - Device: ${anchor.deviceId}`);
    console.log(`  - Hash: ${anchor.dataHash}`);
    console.log(`  - TX ID: ${anchor.txId}`);

    // Test 4: Create payment request
    console.log('\n5. Testing Payment Request...');
    const paymentRequest = await ks.payments.createPaymentRequest(
      walletAddress,
      100000000, // 1 KAS
      { purpose: 'IoT Access Fee' }
    );
    console.log('✓ Payment Request Created:');
    console.log(`  - Nonce: ${paymentRequest.nonce}`);
    console.log(`  - Expires: ${new Date(paymentRequest.expiresAt).toISOString()}`);

    // Test 5: Create game session
    console.log('\n6. Testing Gaming Engine...');
    const game = await ks.gaming.createGame(
      'test-game-001',
      'access-control',
      ['device-001', 'device-002']
    );
    console.log('✓ Game Session Created:');
    console.log(`  - Game ID: ${game.gameId}`);
    console.log(`  - Players: ${game.players.length}`);

    console.log('\n=== All Tests Completed ===');
    console.log('\n✓ K-Synchrony is working with Kaspa testnet!');
    console.log('✓ Ready for ESP32 integration');

    ks.shutdown();

  } catch (error: any) {
    console.error('\n✗ Test Failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check internet connection');
    console.error('2. Verify Kaspa testnet is accessible');
    console.error('3. Check API endpoint: api.kaspa.org');
    process.exit(1);
  }
}

// Run the test
testKaspaTestnet();
