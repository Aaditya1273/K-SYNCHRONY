/**
 * Create a REAL Kaspa Testnet Transaction
 * This will send 1 Sompi from Account 1 to Account 2
 */

const KASPA_API = "https://api-tn10.kaspa.org";

const SENDER = "kaspatest:qz0h05ep5uxz9vqfp8x5t4swzjlw2af6gln34zkkx7a44rjcn489ch73v5r8q";
const RECEIVER = "kaspatest:qrmsa7y8d4g77mj5xd9a6chp7ddtu3qgttt0emkpu9yycun8zmjs2ew963kf3";
const PRIVATE_KEY = "4572a06e6b7fbd76ee68f8b0cce77b2746bf7928150a3a2eb2f16e18bfa8f550";

async function createTransaction() {
  console.log('🚀 Creating REAL Kaspa Transaction...\n');
  console.log('From:', SENDER);
  console.log('To:', RECEIVER);
  console.log('Amount: 1 sompi\n');

  try {
    // Step 1: Get UTXOs
    console.log('📦 Fetching UTXOs...');
    const utxosRes = await fetch(`${KASPA_API}/addresses/${SENDER}/utxos`);
    const utxos = await utxosRes.json();
    console.log(`Found ${utxos.length} UTXOs\n`);

    if (utxos.length === 0) {
      console.error('❌ No UTXOs found. Make sure the sender wallet has funds.');
      return;
    }

    // Step 2: Get network info for fee calculation
    console.log('🌐 Getting network info...');
    const infoRes = await fetch(`${KASPA_API}/info/blockdag`);
    const info = await infoRes.json();
    console.log('Network:', info.networkName);
    console.log('Block count:', info.blockCount, '\n');

    // Step 3: Create transaction payload
    console.log('🔨 Building transaction...');
    
    // Use the first UTXO
    const utxo = utxos[0];
    const inputAmount = parseInt(utxo.utxoEntry.amount);
    const sendAmount = 1; // 1 sompi
    const fee = 1000; // Standard fee
    const changeAmount = inputAmount - sendAmount - fee;

    console.log(`Input: ${inputAmount} sompi`);
    console.log(`Send: ${sendAmount} sompi`);
    console.log(`Fee: ${fee} sompi`);
    console.log(`Change: ${changeAmount} sompi\n`);

    const transaction = {
      version: 0,
      inputs: [{
        previousOutpoint: {
          transactionId: utxo.outpoint.transactionId,
          index: utxo.outpoint.index
        },
        signatureScript: '',
        sequence: 0,
        sigOpCount: 1
      }],
      outputs: [
        {
          amount: sendAmount.toString(),
          scriptPublicKey: {
            version: 0,
            scriptPublicKey: RECEIVER
          }
        },
        {
          amount: changeAmount.toString(),
          scriptPublicKey: {
            version: 0,
            scriptPublicKey: SENDER
          }
        }
      ],
      lockTime: 0,
      subnetworkId: '0000000000000000000000000000000000000000',
      gas: 0,
      payload: Buffer.from(JSON.stringify({
        type: 'IoT_Event',
        device: 'ESP32_Door1',
        action: 'open',
        timestamp: Date.now()
      })).toString('hex')
    };

    console.log('📤 Submitting transaction to network...');
    const submitRes = await fetch(`${KASPA_API}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(transaction)
    });

    if (!submitRes.ok) {
      const errorText = await submitRes.text();
      console.error('❌ Transaction failed:', submitRes.status);
      console.error('Error:', errorText);
      
      console.log('\n💡 ALTERNATIVE: Use Kaspa Web Wallet');
      console.log('1. Go to: https://wallet.kaspanet.io/');
      console.log('2. Import your wallet with private key');
      console.log('3. Send 1 Sompi to:', RECEIVER);
      console.log('4. Copy the transaction hash');
      console.log('5. Add to Vercel env: DEMO_TX_HASH=<your_hash>');
      return;
    }

    const result = await submitRes.json();
    console.log('\n✅ SUCCESS! Transaction broadcast!');
    console.log('TX Hash:', result.transactionId || result.txId);
    console.log('\n🔗 View on explorer:');
    console.log(`https://explorer.kaspa.org/txs/${result.transactionId || result.txId}`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Copy the TX hash above');
    console.log('2. Add to Vercel environment variables:');
    console.log(`   DEMO_TX_HASH=${result.transactionId || result.txId}`);
    console.log('3. Redeploy your backend');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    console.log('\n💡 MANUAL SOLUTION (RECOMMENDED):');
    console.log('Since creating transactions programmatically is complex,');
    console.log('use the Kaspa wallet to create a real transaction:\n');
    console.log('1. Go to: https://wallet.kaspanet.io/');
    console.log('2. Import wallet with your private key');
    console.log('3. Send 1 Sompi from Account 1 to Account 2');
    console.log('4. Copy the transaction hash from the confirmation');
    console.log('5. Use that hash in your demo!');
  }
}

createTransaction();
