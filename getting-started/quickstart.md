# K-SYNCHRONY Quick Start

Get up and running with K-SYNCHRONY in 5 minutes.

## Installation

```bash
npm install k-synchrony
```

Or clone and build from source:

```bash
git clone https://github.com/your-repo/k-synchrony.git
cd k-synchrony
npm install
npm run build
```

## Basic Setup

```typescript
import { KSynchrony } from 'k-synchrony';

// Initialize with testnet
const ks = new KSynchrony({
  network: 'testnet'
});

await ks.initialize();
```

## Track 1: Payments

### Create a Payment Request

```typescript
const merchantAddress = 'kaspa:qz...';

// Create payment request with QR code
const payment = await ks.payments.createPaymentRequest(
  merchantAddress,
  100000000, // 1 KAS in Sompi
  { item: 'Coffee', orderId: '12345' }
);

console.log('QR Code:', payment.qrCode);
console.log('Nonce:', payment.nonce);
console.log('Expires:', new Date(payment.expiresAt));
```

### Monitor Payment Probability

```typescript
// Get instant probability
const prob = await ks.payments.getProbabilityOfInclusion(txId);

console.log(`Probability: ${(prob.probability * 100).toFixed(2)}%`);
console.log(`DAG Depth: ${prob.dagDepth}`);
console.log(`Confirming Blocks: ${prob.confirmingBlocks}`);

// Accept payment when confidence is high
if (prob.probability > 0.99) {
  console.log('✓ Payment accepted!');
  await ks.payments.markNonceUsed(merchantAddress, payment.nonce);
}
```

### Real-Time Monitoring

```typescript
// Monitor until high confidence
for await (const prob of ks.payments.monitorPayment(txId)) {
  console.log(`${(prob.probability * 100).toFixed(2)}%`);
  
  if (prob.probability >= 0.99) {
    break;
  }
}
```

## Track 2: Gaming

### Create a Game

```typescript
const game = await ks.gaming.createGame(
  'my-game-001',
  'street-fighter',
  ['player1_address', 'player2_address']
);

console.log('Game ID:', game.gameId);
```

### Submit Moves (Micro-Transactions)

```typescript
// Each move is a transaction on Kaspa
const move = await ks.gaming.submitMove(
  game.gameId,
  'player1_address',
  { action: 'punch', power: 50, score: 10 }
);

console.log('Move TX:', move.txId);
```

### Get Real-Time Leaderboard

```typescript
const leaderboard = await ks.gaming.getLeaderboard('street-fighter', 10);

leaderboard.entries.forEach((entry, i) => {
  console.log(`${i + 1}. ${entry.playerId} - ${entry.score} pts`);
});
```

### End Game

```typescript
const finalGame = await ks.gaming.endGame(game.gameId);
console.log('Final Scores:', finalGame.state.scores);
```

## Track 3: IoT

### Anchor Data

```typescript
const deviceId = 'sensor-001';

const sensorData = {
  temperature: 2.5,
  humidity: 45,
  location: 'Warehouse A'
};

const anchor = await ks.iot.anchorData(deviceId, sensorData);
console.log('Anchored:', anchor.txId);
```

### Covenant-Locked Data

```typescript
// Data only valid if conditions are met
const covenantAnchor = await ks.iot.anchorWithCovenant(
  deviceId,
  sensorData,
  {
    maxTemperature: 5,
    minTemperature: -10,
    allowedLocations: ['Warehouse A', 'Warehouse B']
  }
);

console.log('Covenant TX:', covenantAnchor.txId);
```

### Continuous Anchoring

```typescript
// Anchor data every 1 second
ks.iot.startContinuousAnchoring(
  deviceId,
  async () => ({
    temperature: readTemperature(),
    humidity: readHumidity(),
    timestamp: Date.now()
  }),
  1000 // 1 second
);

// Stop when done
ks.iot.stopContinuousAnchoring(deviceId);
```

### Verify Data

```typescript
const isValid = await ks.iot.verifyData(
  deviceId,
  sensorData,
  anchor.txId
);

console.log('Valid:', isValid);
```

### Get History

```typescript
const history = await ks.iot.getDataHistory(
  deviceId,
  Date.now() - 3600000, // Last hour
  Date.now()
);

console.log(`${history.length} data points`);
```

## Complete Example

```typescript
import { KSynchrony } from 'k-synchrony';

async function main() {
  // Initialize
  const ks = new KSynchrony({ network: 'testnet' });
  await ks.initialize();

  // Payments
  const payment = await ks.payments.createPaymentRequest(
    'kaspa:qz...',
    100000000
  );
  console.log('Payment:', payment.nonce);

  // Gaming
  const game = await ks.gaming.createGame(
    'game-001',
    'chess',
    ['player1', 'player2']
  );
  await ks.gaming.submitMove(game.gameId, 'player1', { move: 'e4' });

  // IoT
  await ks.iot.anchorData('device-001', { temp: 2.5 });

  // Cleanup
  ks.shutdown();
}

main().catch(console.error);
```

## Running Examples

```bash
# Payment demo
npm run demo:payment

# Gaming demo
npm run demo:gaming

# IoT demo
npm run demo:iot

# Full demo (all features)
npm run demo:all
```

## Configuration Options

```typescript
const ks = new KSynchrony({
  network: 'testnet' | 'mainnet',
  apiEndpoint: 'custom.endpoint.com', // Optional
  apiKey: 'your-api-key' // Optional
});
```

## Network Endpoints

### Testnet (Recommended for Development)
- Endpoint: `testnet.kaspathon.com`
- Faucet: https://faucet-tn10.kaspanet.io/

### Mainnet
- Endpoint: `mainnet.kaspathon.com`

## Next Steps

- [API Reference](../docs/API.md) - Complete API documentation
- [Examples](../examples/) - More code examples
- [Architecture](../ARCHITECTURE.md) - How it works
- [Use Cases](../docs/USE_CASES.md) - Real-world applications

## Common Patterns

### Merchant Dashboard

```typescript
const stats = await ks.payments.getMerchantStats(merchantAddress);
console.log('Active Requests:', stats.activePaymentRequests);
console.log('Completed:', stats.completedPayments);
```

### Game Statistics

```typescript
const stats = ks.gaming.getGameStats(gameId);
console.log('Total Moves:', stats.totalMoves);
console.log('Duration:', stats.duration);
```

### Device Monitoring

```typescript
const stats = await ks.iot.getDeviceStats(deviceId);
console.log('Total Anchors:', stats.totalAnchors);
console.log('Verified:', stats.verifiedAnchors);
```

## Troubleshooting

### Connection Issues

```typescript
try {
  await ks.initialize();
} catch (error) {
  console.error('Failed to connect:', error);
  // Check network and endpoint
}
```

### Transaction Not Found

```typescript
const prob = await ks.payments.getProbabilityOfInclusion(txId);
if (prob.probability === 0) {
  console.log('Transaction still in mempool');
}
```

## Support

Need help? Join the [Kaspa Discord](https://discord.gg/kaspa) and ask in the Kaspathon channel!
