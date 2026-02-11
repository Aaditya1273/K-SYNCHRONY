# K-SYNCHRONY API Reference

Complete API documentation for K-SYNCHRONY SDK.

## Table of Contents

- [KSynchrony](#ksynchrony)
- [Payment Engine](#payment-engine)
- [Gaming Engine](#gaming-engine)
- [IoT Engine](#iot-engine)
- [Types](#types)

---

## KSynchrony

Main SDK class that provides access to all engines.

### Constructor

```typescript
new KSynchrony(config: KSynchronyConfig)
```

**Parameters:**
- `config.network`: `'mainnet' | 'testnet'` - Network to connect to
- `config.apiEndpoint?`: `string` - Custom RPC endpoint (optional)
- `config.apiKey?`: `string` - API key for authentication (optional)

**Example:**
```typescript
const ks = new KSynchrony({
  network: 'testnet',
  apiEndpoint: 'testnet.kaspathon.com'
});
```

### Methods

#### initialize()

Initialize all engines and connect to Kaspa network.

```typescript
await ks.initialize(): Promise<void>
```

#### shutdown()

Shutdown all engines and disconnect.

```typescript
ks.shutdown(): void
```

#### getConfig()

Get current configuration.

```typescript
ks.getConfig(): KSynchronyConfig
```

#### getClient()

Get underlying Kaspa client.

```typescript
ks.getClient(): KaspaClient
```

---

## Payment Engine

Access via `ks.payments`

### Methods

#### createPaymentRequest()

Create a payment request with unique nonce and QR code.

```typescript
await ks.payments.createPaymentRequest(
  merchantAddress: string,
  amount: number,
  metadata?: any
): Promise<PaymentRequest>
```

**Parameters:**
- `merchantAddress`: Kaspa address to receive payment
- `amount`: Amount in Sompi (1 KAS = 100,000,000 Sompi)
- `metadata`: Optional metadata (order ID, item name, etc.)

**Returns:**
```typescript
{
  encoded: string;      // Base64 encoded payment data
  qrCode: string;       // Data URL for QR code image
  nonce: string;        // Unique nonce
  expiresAt: number;    // Expiration timestamp
  data: any;            // Payment data object
}
```

**Example:**
```typescript
const payment = await ks.payments.createPaymentRequest(
  'kaspa:qz...',
  100000000,
  { item: 'Coffee', orderId: '12345' }
);
```

#### getProbabilityOfInclusion()

Get real-time probability of transaction inclusion.

```typescript
await ks.payments.getProbabilityOfInclusion(
  txId: string
): Promise<ProbabilityResult>
```

**Returns:**
```typescript
{
  txId: string;
  probability: number;              // 0-1
  estimatedConfirmationTime: number; // milliseconds
  dagDepth: number;
  confirmingBlocks: number;
  timestamp: number;
}
```

#### monitorPayment()

Monitor payment in real-time until high confidence.

```typescript
for await (const prob of ks.payments.monitorPayment(txId)) {
  console.log(prob.probability);
  if (prob.probability >= 0.99) break;
}
```

#### generateSompiNonce()

Generate unique nonce for collision-free payments.

```typescript
await ks.payments.generateSompiNonce(
  merchantAddress: string
): Promise<SompiNonce>
```

#### validatePaymentRequest()

Validate payment request and check nonce.

```typescript
await ks.payments.validatePaymentRequest(
  encoded: string
): Promise<boolean>
```

#### markNonceUsed()

Mark nonce as used after payment.

```typescript
await ks.payments.markNonceUsed(
  merchantAddress: string,
  nonce: string
): Promise<void>
```

#### getMerchantStats()

Get merchant payment statistics.

```typescript
await ks.payments.getMerchantStats(
  merchantAddress: string
): Promise<{
  address: string;
  balance: number;
  activePaymentRequests: number;
  completedPayments: number;
  totalRequests: number;
}>
```

---

## Gaming Engine

Access via `ks.gaming`

### Methods

#### createGame()

Create new game session.

```typescript
await ks.gaming.createGame(
  gameId: string,
  gameType: string,
  players: string[]
): Promise<GameState>
```

**Example:**
```typescript
const game = await ks.gaming.createGame(
  'sf-001',
  'street-fighter',
  ['player1', 'player2']
);
```

#### submitMove()

Submit game move as micro-transaction.

```typescript
await ks.gaming.submitMove(
  gameId: string,
  playerId: string,
  move: any
): Promise<GameMove>
```

**Returns:**
```typescript
{
  gameId: string;
  playerId: string;
  move: any;
  timestamp: number;
  txId: string;
  confirmed: boolean;
}
```

#### getGameState()

Get current game state.

```typescript
ks.gaming.getGameState(gameId: string): GameState | undefined
```

#### getActiveGames()

Get all active games.

```typescript
ks.gaming.getActiveGames(): GameState[]
```

#### endGame()

End game and finalize scores.

```typescript
await ks.gaming.endGame(gameId: string): Promise<GameState>
```

#### getLeaderboard()

Get real-time global leaderboard.

```typescript
await ks.gaming.getLeaderboard(
  gameType: string,
  limit?: number
): Promise<Leaderboard>
```

**Returns:**
```typescript
{
  gameType: string;
  entries: Array<{
    playerId: string;
    score: number;
    wins: number;
    games: number;
  }>;
  lastUpdate: number;
}
```

#### getGameStats()

Get game statistics.

```typescript
ks.gaming.getGameStats(gameId: string): {
  gameId: string;
  gameType: string;
  players: number;
  totalMoves: number;
  confirmedMoves: number;
  duration: number;
  scores: Record<string, number>;
}
```

---

## IoT Engine

Access via `ks.iot`

### Methods

#### anchorData()

Anchor IoT data to blockchain.

```typescript
await ks.iot.anchorData(
  deviceId: string,
  data: any
): Promise<IoTDataAnchor>
```

**Returns:**
```typescript
{
  deviceId: string;
  dataHash: string;
  data: any;
  timestamp: number;
  txId: string;
  covenantLocked: boolean;
  verified: boolean;
}
```

#### anchorWithCovenant()

Anchor data with covenant conditions.

```typescript
await ks.iot.anchorWithCovenant(
  deviceId: string,
  data: any,
  conditions: CovenantConditions
): Promise<IoTDataAnchor>
```

**Conditions:**
```typescript
{
  maxTemperature?: number;
  minTemperature?: number;
  maxHumidity?: number;
  allowedLocations?: string[];
  timeWindow?: {
    start: number;
    end: number;
  };
}
```

#### startContinuousAnchoring()

Start continuous data anchoring.

```typescript
ks.iot.startContinuousAnchoring(
  deviceId: string,
  dataSource: () => Promise<any>,
  intervalMs: number = 1000
): void
```

**Example:**
```typescript
ks.iot.startContinuousAnchoring(
  'sensor-001',
  async () => ({
    temperature: readSensor(),
    timestamp: Date.now()
  }),
  1000
);
```

#### stopContinuousAnchoring()

Stop continuous anchoring.

```typescript
ks.iot.stopContinuousAnchoring(deviceId: string): void
```

#### verifyData()

Verify data integrity against blockchain.

```typescript
await ks.iot.verifyData(
  deviceId: string,
  data: any,
  txId: string
): Promise<boolean>
```

#### getDataHistory()

Get historical data for device.

```typescript
await ks.iot.getDataHistory(
  deviceId: string,
  fromTime?: number,
  toTime?: number,
  limit?: number
): Promise<IoTDataAnchor[]>
```

#### getDeviceStats()

Get device statistics.

```typescript
await ks.iot.getDeviceStats(deviceId: string): Promise<{
  deviceId: string;
  totalAnchors: number;
  verifiedAnchors: number;
  covenantLockedAnchors: number;
  firstAnchor: number;
  lastAnchor: number;
  isContinuous: boolean;
}>
```

#### getRegisteredDevices()

Get all registered devices.

```typescript
ks.iot.getRegisteredDevices(): string[]
```

---

## Types

### KSynchronyConfig

```typescript
interface KSynchronyConfig {
  network: 'mainnet' | 'testnet';
  apiEndpoint?: string;
  apiKey?: string;
}
```

### ProbabilityResult

```typescript
interface ProbabilityResult {
  txId: string;
  probability: number;
  estimatedConfirmationTime: number;
  dagDepth: number;
  confirmingBlocks: number;
  timestamp: number;
}
```

### PaymentRequest

```typescript
interface PaymentRequest {
  encoded: string;
  qrCode: string;
  nonce: string;
  expiresAt: number;
  data: any;
}
```

### GameState

```typescript
interface GameState {
  gameId: string;
  gameType: string;
  players: string[];
  state: {
    moves: GameMove[];
    scores: Record<string, number>;
    ended?: boolean;
  };
  lastUpdate: number;
  blockHash: string;
  blueScore: number;
}
```

### IoTDataAnchor

```typescript
interface IoTDataAnchor {
  deviceId: string;
  dataHash: string;
  data: any;
  timestamp: number;
  txId: string;
  covenantLocked: boolean;
  covenantConditions?: CovenantConditions;
  verified: boolean;
}
```

---

## Error Handling

All async methods can throw errors. Always use try-catch:

```typescript
try {
  await ks.initialize();
} catch (error) {
  console.error('Initialization failed:', error);
}
```

## Rate Limits

Public endpoints may have rate limits. Consider running your own node for production.

## Best Practices

1. Always call `initialize()` before using engines
2. Call `shutdown()` when done to clean up resources
3. Use `monitorPayment()` for real-time updates
4. Set appropriate covenant conditions for IoT data
5. Handle errors gracefully

## Support

- [GitHub Issues](https://github.com/your-repo/k-synchrony/issues)
- [Discord](https://discord.gg/kaspa)
- [Documentation](../README.md)
