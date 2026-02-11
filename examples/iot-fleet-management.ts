import { KSynchrony } from '../src';
import { Formatter } from '../src/utils/Formatter';

async function iotFleetManagementDemo() {
  console.log('=== K-SYNCHRONY IoT Fleet Management Demo ===\n');
  console.log('Managing a fleet of cold chain sensors\n');

  const ks = new KSynchrony({ network: 'testnet' });
  await ks.initialize();

  // Fleet of devices
  const devices = [
    { id: 'truck-001', location: 'Route A', type: 'refrigerated-truck' },
    { id: 'truck-002', location: 'Route B', type: 'refrigerated-truck' },
    { id: 'warehouse-001', location: 'Warehouse A', type: 'cold-storage' },
    { id: 'warehouse-002', location: 'Warehouse B', type: 'cold-storage' },
    { id: 'container-001', location: 'Port', type: 'shipping-container' }
  ];

  console.log('1. Fleet Overview...');
  console.log(`  Total Devices: ${devices.length}`);
  devices.forEach(d => {
    console.log(`  • ${d.id} (${d.type}) - ${d.location}`);
  });

  console.log('\n2. Starting Continuous Monitoring...');
  
  // Start monitoring all devices
  for (const device of devices) {
    ks.iot.startContinuousAnchoring(
      device.id,
      async () => {
        // Simulate sensor readings
        const baseTemp = device.type === 'shipping-container' ? 0 : 2;
        const variance = Math.random() * 2 - 1;
        
        return {
          temperature: baseTemp + variance,
          humidity: 40 + Math.random() * 10,
          location: device.location,
          deviceType: device.type,
          batteryLevel: 85 + Math.random() * 15,
          timestamp: Date.now()
        };
      },
      2000 // 2 seconds for demo
    );
    console.log(`  ✓ Started monitoring: ${device.id}`);
  }

  console.log('\n3. Monitoring Fleet (10 seconds)...\n');
  
  // Monitor for 10 seconds
  await new Promise(r => setTimeout(r, 10000));

  // Stop all monitoring
  for (const device of devices) {
    ks.iot.stopContinuousAnchoring(device.id);
  }

  console.log('  ✓ Monitoring stopped\n');

  console.log('4. Fleet Statistics...\n');

  // Get statistics for each device
  for (const device of devices) {
    const stats = await ks.iot.getDeviceStats(device.id);
    const history = await ks.iot.getDataHistory(device.id);
    
    if (history.length > 0) {
      const temps = history.map(h => h.data.temperature);
      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);

      console.log(`${device.id}:`);
      console.log(`  Data Points:    ${stats.totalAnchors}`);
      console.log(`  Avg Temp:       ${Formatter.formatTemperature(avgTemp)}`);
      console.log(`  Min Temp:       ${Formatter.formatTemperature(minTemp)}`);
      console.log(`  Max Temp:       ${Formatter.formatTemperature(maxTemp)}`);
      console.log(`  Duration:       ${Formatter.formatDuration(stats.lastAnchor - stats.firstAnchor)}\n`);
    }
  }

  console.log('5. Compliance Check...\n');

  // Check compliance for each device
  for (const device of devices) {
    const history = await ks.iot.getDataHistory(device.id);
    const violations = history.filter(h => 
      h.data.temperature > 5 || h.data.temperature < -10
    );

    const status = violations.length === 0 ? '✓ COMPLIANT' : '✗ VIOLATIONS';
    const color = violations.length === 0 ? '' : ' (!)';
    
    console.log(`  ${device.id}: ${status}${color}`);
    if (violations.length > 0) {
      console.log(`    Violations: ${violations.length} data points out of range`);
    }
  }

  console.log('\n6. Generating Fleet Report...\n');

  const totalDataPoints = devices.reduce((sum, device) => {
    const stats = ks.iot.getDeviceStats(device.id);
    return sum + (stats ? (stats as any).totalAnchors : 0);
  }, 0);

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              FLEET MANAGEMENT REPORT                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log(`Fleet Size:           ${devices.length} devices`);
  console.log(`Total Data Points:    ${totalDataPoints}`);
  console.log(`Monitoring Duration:  ~10 seconds`);
  console.log(`Data Frequency:       Every 2 seconds`);
  console.log(`Blockchain:           Kaspa Testnet`);
  console.log(`Status:               All devices operational\n`);

  console.log('7. Use Cases Demonstrated...\n');
  console.log('  ✓ Multi-device fleet management');
  console.log('  ✓ Real-time temperature monitoring');
  console.log('  ✓ Compliance verification');
  console.log('  ✓ Immutable audit trail');
  console.log('  ✓ Automated data anchoring');
  console.log('  ✓ Historical data analysis');

  console.log('\n8. Real-World Applications...\n');
  console.log('  • Pharmaceutical cold chain');
  console.log('  • Food safety tracking');
  console.log('  • Vaccine distribution');
  console.log('  • Perishable goods logistics');
  console.log('  • Regulatory compliance');
  console.log('  • Insurance claims verification');

  ks.shutdown();
  console.log('\n=== Demo Complete ===');
}

iotFleetManagementDemo().catch(console.error);
