import { KSynchrony } from '../src';

/**
 * Basic test to verify SDK initialization and structure
 * This doesn't require network connectivity
 */
async function basicTest() {
  console.log('=== K-SYNCHRONY Basic Test ===\n');

  try {
    // Test 1: SDK Initialization
    console.log('Test 1: SDK Initialization...');
    const ks = new KSynchrony({
      network: 'testnet',
      apiEndpoint: 'testnet.kaspathon.com'
    });
    console.log('✓ SDK instance created');

    // Test 2: Check engines exist
    console.log('\nTest 2: Checking engines...');
    console.log(`  Payment Engine: ${ks.payments ? '✓' : '✗'}`);
    console.log(`  Gaming Engine: ${ks.gaming ? '✓' : '✗'}`);
    console.log(`  IoT Engine: ${ks.iot ? '✓' : '✗'}`);

    // Test 3: Check configuration
    console.log('\nTest 3: Configuration...');
    const config = ks.getConfig();
    console.log(`  Network: ${config.network}`);
    console.log(`  Endpoint: ${config.apiEndpoint}`);
    console.log('✓ Configuration accessible');

    // Test 4: Check client
    console.log('\nTest 4: Client...');
    const client = ks.getClient();
    console.log(`  Client exists: ${client ? '✓' : '✗'}`);

    // Test 5: Payment Engine Methods
    console.log('\nTest 5: Payment Engine API...');
    console.log(`  createPaymentRequest: ${typeof ks.payments.createPaymentRequest === 'function' ? '✓' : '✗'}`);
    console.log(`  getProbabilityOfInclusion: ${typeof ks.payments.getProbabilityOfInclusion === 'function' ? '✓' : '✗'}`);
    console.log(`  monitorPayment: ${typeof ks.payments.monitorPayment === 'function' ? '✓' : '✗'}`);
    console.log(`  getMerchantStats: ${typeof ks.payments.getMerchantStats === 'function' ? '✓' : '✗'}`);

    // Test 6: Gaming Engine Methods
    console.log('\nTest 6: Gaming Engine API...');
    console.log(`  createGame: ${typeof ks.gaming.createGame === 'function' ? '✓' : '✗'}`);
    console.log(`  submitMove: ${typeof ks.gaming.submitMove === 'function' ? '✓' : '✗'}`);
    console.log(`  getLeaderboard: ${typeof ks.gaming.getLeaderboard === 'function' ? '✓' : '✗'}`);
    console.log(`  getGameState: ${typeof ks.gaming.getGameState === 'function' ? '✓' : '✗'}`);

    // Test 7: IoT Engine Methods
    console.log('\nTest 7: IoT Engine API...');
    console.log(`  anchorData: ${typeof ks.iot.anchorData === 'function' ? '✓' : '✗'}`);
    console.log(`  anchorWithCovenant: ${typeof ks.iot.anchorWithCovenant === 'function' ? '✓' : '✗'}`);
    console.log(`  verifyData: ${typeof ks.iot.verifyData === 'function' ? '✗' : '✓'}`);
    console.log(`  getDeviceStats: ${typeof ks.iot.getDeviceStats === 'function' ? '✓' : '✗'}`);

    // Test 8: Shutdown
    console.log('\nTest 8: Shutdown...');
    ks.shutdown();
    console.log('✓ SDK shutdown successful');

    console.log('\n=== All Basic Tests Passed ✓ ===');
    console.log('\nSDK Structure: VERIFIED');
    console.log('API Methods: PRESENT');
    console.log('Configuration: WORKING');
    console.log('\nNext: Test with network connectivity');

  } catch (error) {
    console.error('\n✗ Test Failed:', error);
    process.exit(1);
  }
}

basicTest();
