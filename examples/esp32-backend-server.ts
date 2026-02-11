import express from 'express';
import { KSynchrony } from '../src';

/**
 * ESP32 Backend Server
 * Receives HTTP requests from ESP32 devices and creates Kaspa transactions
 * 
 * Think of this as the "Swiggy Server" that connects:
 * - ESP32 (delivery boy) → Server → Kaspa (restaurant)
 */

// Configuration
const PORT = 3000;
const WALLET_ADDRESS = 'kaspa:qz0h05ep5uxz9vqfp8x5t4swzjlw2af6gln34zkkx7a44rjcn489ckchhmak4';
const PRIVATE_KEY = '572a06e6b7fbd76ee68f8b0cce77b2746bf7928150a3a2eb2f16e18bfa8f550';

// Initialize Express
const app = express();
app.use(express.json());

// Initialize K-Synchrony
let ks: KSynchrony;

async function initializeKaspa() {
  console.log('🚀 Initializing Kaspa connection...');
  ks = new KSynchrony({
    network: 'testnet',
    apiEndpoint: 'api.kaspa.org'
  });
  
  await ks.initialize();
  console.log('✓ Connected to Kaspa testnet');
  console.log(`✓ Wallet: ${WALLET_ADDRESS}\n`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'K-Synchrony ESP32 Backend',
    network: 'testnet',
    timestamp: Date.now()
  });
});

/**
 * Main ESP32 Trigger Endpoint
 * This is what your ESP32 will call
 * 
 * Example ESP32 request:
 * POST /api/trigger
 * {
 *   "device": "door1",
 *   "action": "open",
 *   "sensor": "button_pressed"
 * }
 */
app.post('/api/trigger', async (req, res) => {
  const startTime = Date.now();
  console.log('\n📡 ESP32 Request Received:');
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const { device, action, sensor, data } = req.body;

    // Validate request
    if (!device || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: device, action'
      });
    }

    // Step 1: Anchor IoT data to Kaspa
    console.log('\n1️⃣ Anchoring data to Kaspa...');
    const iotData = {
      device,
      action,
      sensor: sensor || 'unknown',
      timestamp: Date.now(),
      data: data || {}
    };

    const anchor = await ks.iot.anchorData(device, iotData);
    console.log(`✓ Data anchored: ${anchor.txId}`);

    // Step 2: Create access transaction (if needed)
    let paymentTx = null;
    if (action === 'open' || action === 'access') {
      console.log('\n2️⃣ Creating access transaction...');
      const payment = await ks.payments.createPaymentRequest(
        WALLET_ADDRESS,
        1000000, // 0.01 KAS access fee
        { device, action, purpose: 'IoT Access' }
      );
      paymentTx = payment.nonce;
      console.log(`✓ Payment request: ${paymentTx}`);
    }

    // Step 3: Calculate probability of inclusion
    console.log('\n3️⃣ Calculating transaction probability...');
    const probability = await ks.payments.getProbabilityOfInclusion(anchor.txId);
    console.log(`✓ Probability: ${(probability.probability * 100).toFixed(2)}%`);

    // Step 4: Prepare response
    const duration = Date.now() - startTime;
    const response = {
      success: true,
      message: `Access ${action} for ${device}`,
      data: {
        device,
        action,
        txId: anchor.txId,
        dataHash: anchor.dataHash,
        paymentNonce: paymentTx,
        probability: probability.probability,
        timestamp: Date.now(),
        duration: `${duration}ms`
      },
      ui: {
        status: action === 'open' ? 'Access Granted' : 'Action Completed',
        color: 'green',
        icon: action === 'open' ? '🔓' : '✓'
      }
    };

    console.log('\n✅ Response sent to ESP32:');
    console.log(JSON.stringify(response, null, 2));

    res.json(response);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      ui: {
        status: 'Error',
        color: 'red',
        icon: '❌'
      }
    });
  }
});

/**
 * Get device history
 * Shows all transactions for a device
 */
app.get('/api/device/:deviceId/history', async (req, res) => {
  try {
    const { deviceId } = req.params;
    console.log(`\n📊 Fetching history for: ${deviceId}`);

    const stats = await ks.iot.getDeviceStats(deviceId);
    
    res.json({
      success: true,
      device: deviceId,
      stats
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get wallet balance
 */
app.get('/api/wallet/balance', async (req, res) => {
  try {
    console.log('\n💰 Checking wallet balance...');
    const client = ks.getClient();
    const balance = await client.getBalance(WALLET_ADDRESS);
    
    res.json({
      success: true,
      address: WALLET_ADDRESS,
      balance: {
        sompi: balance,
        kas: balance / 100000000
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Monitor transaction in real-time
 * WebSocket-like endpoint for live updates
 */
app.get('/api/monitor/:txId', async (req, res) => {
  try {
    const { txId } = req.params;
    console.log(`\n👀 Monitoring transaction: ${txId}`);

    const probability = await ks.payments.getProbabilityOfInclusion(txId);
    
    res.json({
      success: true,
      txId,
      probability: probability.probability,
      dagDepth: probability.dagDepth,
      confirmingBlocks: probability.confirmingBlocks,
      status: probability.probability > 0.99 ? 'confirmed' : 'pending'
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
async function startServer() {
  try {
    await initializeKaspa();
    
    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════');
      console.log('🚀 ESP32 Backend Server Running');
      console.log('═══════════════════════════════════════');
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🔗 Network: Kaspa Testnet`);
      console.log(`💼 Wallet: ${WALLET_ADDRESS.substring(0, 20)}...`);
      console.log('═══════════════════════════════════════\n');
      console.log('📋 Available Endpoints:');
      console.log(`  POST   /api/trigger              - ESP32 trigger endpoint`);
      console.log(`  GET    /api/device/:id/history   - Device history`);
      console.log(`  GET    /api/wallet/balance       - Wallet balance`);
      console.log(`  GET    /api/monitor/:txId        - Monitor transaction`);
      console.log(`  GET    /health                   - Health check`);
      console.log('\n💡 ESP32 Example Request:');
      console.log(`  curl -X POST http://localhost:${PORT}/api/trigger \\`);
      console.log(`    -H "Content-Type: application/json" \\`);
      console.log(`    -d '{"device":"door1","action":"open","sensor":"button"}'`);
      console.log('\n⏳ Waiting for ESP32 requests...\n');
    });

  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  if (ks) {
    ks.shutdown();
  }
  process.exit(0);
});

// Start the server
startServer();
