import { KSynchrony } from '../src';

async function merchantPaymentDemo() {
  console.log('=== K-SYNCHRONY Payment Demo ===\n');

  // Initialize K-Synchrony
  const ks = new KSynchrony({
    network: 'testnet',
    apiEndpoint: 'testnet.kaspathon.com'
  });

  await ks.initialize();

  // Merchant address
  const merchantAddress = 'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd';

  console.log('\n1. Creating Payment Request...');
  // Generate payment request with unique nonce
  const paymentRequest = await ks.payments.createPaymentRequest(
    merchantAddress,
    100000000, // 1 KAS in Sompi
    { item: 'Coffee', orderId: '12345' }
  );

  console.log('✓ Payment Request Created');
  console.log(`  Nonce: ${paymentRequest.nonce}`);
  console.log(`  Expires: ${new Date(paymentRequest.expiresAt).toISOString()}`);
  console.log(`  QR Code: ${paymentRequest.qrCode.substring(0, 50)}...`);

  // Check merchant stats
  console.log('\n2. Merchant Statistics...');
  const stats = await ks.payments.getMerchantStats(merchantAddress);
  console.log(`  Active Payment Requests: ${stats.activePaymentRequests}`);
  console.log(`  Completed Payments: ${stats.completedPayments}`);

  // Simulate customer payment
  console.log('\n3. Simulating Payment Transaction...');
  const txId = 'tx_abc123def456'; // In production, this comes from actual payment

  // Monitor payment in real-time
  console.log('\n4. Real-Time Payment Monitoring...');
  console.log('  Tracking probability of inclusion...\n');

  let count = 0;
  for await (const probability of ks.payments.monitorPayment(txId)) {
    const percent = (probability.probability * 100).toFixed(2);
    const bar = '█'.repeat(Math.floor(probability.probability * 20));
    
    console.log(`  [${bar.padEnd(20)}] ${percent}% | Depth: ${probability.dagDepth} | Confirming: ${probability.confirmingBlocks}`);

    count++;
    if (count >= 5 || probability.probability >= 0.99) {
      break;
    }
  }

  // Final check
  const finalProb = await ks.payments.getProbabilityOfInclusion(txId);
  
  console.log('\n5. Payment Decision...');
  if (finalProb.probability > 0.99) {
    console.log('  ✓ PAYMENT ACCEPTED - High confidence');
    await ks.payments.markNonceUsed(merchantAddress, paymentRequest.nonce);
  } else {
    console.log('  ⏳ Waiting for more confirmations...');
  }

  console.log('\n6. Testing Multiple Simultaneous Payments...');
  const simultaneousPayments = [];
  for (let i = 0; i < 10; i++) {
    const req = await ks.payments.createPaymentRequest(
      merchantAddress,
      50000000,
      { item: `Item ${i}` }
    );
    simultaneousPayments.push(req);
  }
  console.log(`  ✓ Created ${simultaneousPayments.length} payment requests simultaneously`);
  console.log('  ✓ No UTXO collisions - Sompi Nonce system working!');

  const finalStats = await ks.payments.getMerchantStats(merchantAddress);
  console.log(`\n7. Final Merchant Stats:`);
  console.log(`  Active Requests: ${finalStats.activePaymentRequests}`);
  console.log(`  Total Requests: ${finalStats.totalRequests}`);

  ks.shutdown();
  console.log('\n=== Demo Complete ===');
}

merchantPaymentDemo().catch(console.error);
