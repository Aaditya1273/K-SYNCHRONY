import { KSynchrony } from '../src';
import { MerchantDashboard } from '../src/dashboard/MerchantDashboard';
import { Formatter } from '../src/utils/Formatter';

async function merchantDashboardDemo() {
  console.log('=== K-SYNCHRONY Merchant Dashboard Demo ===\n');

  const ks = new KSynchrony({ network: 'testnet' });
  await ks.initialize();

  const merchantAddress = 'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd';
  const dashboard = new MerchantDashboard(ks.payments, merchantAddress);

  console.log('1. Creating Payment Requests...');
  
  // Simulate multiple payments
  const payments = [];
  for (let i = 0; i < 5; i++) {
    const amount = Math.floor(Math.random() * 500000000) + 50000000; // 0.5-5 KAS
    const payment = await ks.payments.createPaymentRequest(
      merchantAddress,
      amount,
      { item: `Product ${i + 1}`, orderId: `ORD-${1000 + i}` }
    );
    
    payments.push({ payment, amount });
    dashboard.trackTransaction(`tx_${i}`, amount);
    
    console.log(`  ✓ Payment ${i + 1}: ${Formatter.formatKAS(amount)} KAS`);
  }

  console.log('\n2. Simulating Payment Confirmations...');
  
  // Simulate some confirmations
  await new Promise(r => setTimeout(r, 2000));
  
  dashboard.updateTransactionStatus('tx_0', 'confirmed');
  dashboard.updateTransactionStatus('tx_1', 'confirmed');
  dashboard.updateTransactionStatus('tx_2', 'confirmed');
  dashboard.updateTransactionStatus('tx_3', 'failed');
  
  console.log('  ✓ 3 payments confirmed');
  console.log('  ✗ 1 payment failed');
  console.log('  ⏳ 1 payment pending');

  console.log('\n3. Dashboard Statistics...');
  const stats = await dashboard.getStats();
  
  console.log(`  Total Revenue:        ${Formatter.formatKAS(stats.totalRevenue)} KAS`);
  console.log(`  Total Transactions:   ${stats.totalTransactions}`);
  console.log(`  Active Requests:      ${stats.activeRequests}`);
  console.log(`  Average Value:        ${Formatter.formatKAS(stats.averageTransactionValue)} KAS`);
  console.log(`  Success Rate:         ${Formatter.formatProbability(stats.successRate)}`);

  console.log('\n4. Generating Full Report...');
  const report = await dashboard.generateReport();
  console.log(report);

  console.log('\n5. Real-Time Monitoring...');
  console.log('  Starting live dashboard (5 second updates)...');
  console.log('  Press Ctrl+C to stop\n');

  // Display live dashboard for 15 seconds
  const liveInterval = setInterval(async () => {
    console.clear();
    const liveReport = await dashboard.generateReport();
    console.log(liveReport);
    console.log('\n  Live updates every 5 seconds... (Demo will end in a moment)');
  }, 5000);

  // Stop after 15 seconds
  setTimeout(() => {
    clearInterval(liveInterval);
    ks.shutdown();
    console.log('\n=== Demo Complete ===');
  }, 15000);
}

merchantDashboardDemo().catch(console.error);
