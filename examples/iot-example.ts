import { KSynchrony } from '../src';

async function iotDataAnchoringDemo() {
  console.log('=== K-SYNCHRONY IoT Demo ===\n');

  const ks = new KSynchrony({
    network: 'testnet'
  });

  await ks.initialize();

  const deviceId = 'cold-chain-sensor-001';

  console.log('1. Single Data Anchor...');
  // Anchor temperature data
  const sensorData = {
    temperature: 2.5,
    humidity: 45,
    location: 'Warehouse A',
    timestamp: Date.now()
  };

  const anchor = await ks.iot.anchorData(deviceId, sensorData);
  console.log(`  ✓ Data anchored: ${anchor.txId}`);
  console.log(`  Hash: ${anchor.dataHash.substring(0, 16)}...`);

  console.log('\n2. Covenant-Locked Data Anchor...');
  // Anchor with covenant lock (data only valid if temp < 5°C)
  const covenantAnchor = await ks.iot.anchorWithCovenant(
    deviceId,
    sensorData,
    { 
      maxTemperature: 5,
      minTemperature: -10,
      allowedLocations: ['Warehouse A', 'Warehouse B']
    }
  );

  console.log(`  ✓ Covenant-locked anchor: ${covenantAnchor.txId}`);
  console.log(`  Conditions: temp < 5°C, location in [Warehouse A, B]`);

  console.log('\n3. Data Verification...');
  // Verify data integrity
  const isValid = await ks.iot.verifyData(
    deviceId,
    sensorData,
    anchor.txId
  );

  console.log(`  Data verification: ${isValid ? '✓ Valid' : '✗ Invalid'}`);

  // Test with tampered data
  const tamperedData = { ...sensorData, temperature: 10 };
  const isTamperedValid = await ks.iot.verifyData(
    deviceId,
    tamperedData,
    anchor.txId
  );
  console.log(`  Tampered data: ${isTamperedValid ? '✓ Valid' : '✗ Invalid (Expected)'}`);

  console.log('\n4. Continuous Data Anchoring...');
  // Start continuous anchoring (every 2 seconds for demo)
  let dataPoint = 0;
  ks.iot.startContinuousAnchoring(
    deviceId,
    async () => ({
      temperature: 2 + Math.random() * 2,
      humidity: 40 + Math.random() * 10,
      location: 'Warehouse A',
      dataPoint: ++dataPoint,
      timestamp: Date.now()
    }),
    2000 // 2 seconds for demo (1 second in production)
  );

  console.log('  ✓ Started continuous anchoring (2s intervals)');
  console.log('  Anchoring data...');

  // Let it run for 10 seconds
  await new Promise(resolve => setTimeout(resolve, 10000));

  ks.iot.stopContinuousAnchoring(deviceId);
  console.log('  ✓ Stopped continuous anchoring');

  console.log('\n5. Data History...');
  // Get historical data
  const history = await ks.iot.getDataHistory(deviceId);
  console.log(`  Total data points: ${history.length}`);
  console.log(`  Covenant-locked: ${history.filter(h => h.covenantLocked).length}`);
  console.log(`  Verified: ${history.filter(h => h.verified).length}`);

  // Show last 3 entries
  console.log('\n  Last 3 entries:');
  history.slice(-3).forEach((h, i) => {
    console.log(`    ${i + 1}. Temp: ${h.data.temperature?.toFixed(2)}°C | ${new Date(h.timestamp).toISOString()}`);
  });

  console.log('\n6. Device Statistics...');
  const stats = await ks.iot.getDeviceStats(deviceId);
  console.log(`  Device ID: ${stats.deviceId}`);
  console.log(`  Total Anchors: ${stats.totalAnchors}`);
  console.log(`  Verified: ${stats.verifiedAnchors}`);
  console.log(`  Covenant-Locked: ${stats.covenantLockedAnchors}`);
  console.log(`  Duration: ${((stats.lastAnchor - stats.firstAnchor) / 1000).toFixed(1)}s`);

  console.log('\n7. Use Case: Cold Chain Monitoring');
  console.log('  ✓ Pharmaceutical temperature tracking');
  console.log('  ✓ Immutable audit trail');
  console.log('  ✓ Covenant ensures compliance');
  console.log('  ✓ Real-time alerts on violations');

  ks.shutdown();
  console.log('\n=== Demo Complete ===');
}

iotDataAnchoringDemo().catch(console.error);
