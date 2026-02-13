/**
 * Create REAL Kaspa Transaction using Official SDK
 */

const kaspa = require('kaspa');

const SENDER = "kaspatest:qz0h05ep5uxz9vqfp8x5t4swzjlw2af6gln34zkkx7a44rjcn489ch73v5r8q";
const RECEIVER = "kaspatest:qrmsa7y8d4g77mj5xd9a6chp7ddtu3qgttt0emkpu9yycun8zmjs2ew963kf3";
const PRIVATE_KEY = "4572a06e6b7fbd76ee68f8b0cce77b2746bf7928150a3a2eb2f16e18bfa8f550";

async function createTransaction() {
  console.log('🚀 Creating REAL Kaspa Transaction using SDK...\n');

  try {
    // Initialize Kaspa client for testnet
    const client = new kaspa.Client({
      network: 'testnet',
      endpoint: 'https://api-tn10.kaspa.org'
    });

    console.log('📡 Connecting to Kaspa testnet...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Create wallet from private key
    console.log('🔑 Loading wallet...');
    const wallet = kaspa.Wallet.fromPrivateKey(PRIVATE_KEY, 'testnet');
    console.log('✅ Wallet loaded:', SENDER, '\n');

    // Get balance
    console.log('💰 Checking balance...');
    const balance = await client.getBalance(SENDER);
    console.log('Balance:', balance, 'sompi\n');

    // Create transaction
    console.log('🔨 Creating transaction...');
    const tx = await wallet.createTransaction({
      to: RECEIVER,
      amount: 1, // 1 sompi
      fee: 1000, // Standard fee
      payload: JSON.stringify({
        type: 'IoT_Event',
        device: 'ESP32_Door1',
        action: 'open',
        timestamp: Date.now()
      })
    });

    console.log('📤 Broadcasting transaction...');
    const txId = await client.submitTransaction(tx);
    
    console.log('\n✅ SUCCESS!');
    console.log('Transaction Hash:', txId);
    console.log('\n🔗 View on explorer:');
    console.log(`https://explorer.kaspa.org/txs/${txId}`);
    
    console.log('\n📝 Add this to Vercel:');
    console.log(`DEMO_TX_HASH=${txId}`);

    await client.disconnect();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 The Kaspa SDK might not support testnet transactions this way.');
    console.log('RECOMMENDED: Use Kaspa web wallet to create one manual transaction.');
  }
}

createTransaction();
