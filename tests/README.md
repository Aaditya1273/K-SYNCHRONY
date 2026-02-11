# K-SYNCHRONY Testing Guide

Comprehensive testing documentation for K-SYNCHRONY.

## Test Structure

```
tests/
├── unit/
│   ├── core/
│   │   ├── KaspaClient.test.ts
│   │   └── DAGAnalyzer.test.ts
│   ├── payments/
│   │   └── PaymentEngine.test.ts
│   ├── gaming/
│   │   └── GamingEngine.test.ts
│   └── iot/
│       └── IoTEngine.test.ts
├── integration/
│   ├── payment-flow.test.ts
│   ├── gaming-flow.test.ts
│   └── iot-flow.test.ts
└── e2e/
    └── full-demo.test.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- PaymentEngine.test.ts

# Run in watch mode
npm test -- --watch
```

## Unit Tests

### Example: Payment Engine Test

```typescript
// tests/unit/payments/PaymentEngine.test.ts
import { PaymentEngine } from '../../../src/payments/PaymentEngine';
import { KaspaClient } from '../../../src/core/KaspaClient';

describe('PaymentEngine', () => {
  let engine: PaymentEngine;
  let mockClient: jest.Mocked<KaspaClient>;

  beforeEach(() => {
    mockClient = {
      connect: jest.fn(),
      getBalance: jest.fn(),
      // ... other mocked methods
    } as any;

    engine = new PaymentEngine(
      { network: 'testnet' },
      mockClient
    );
  });

  describe('createPaymentRequest', () => {
    it('should create payment request with nonce', async () => {
      const payment = await engine.createPaymentRequest(
        'kaspa:qz...',
        100000000
      );

      expect(payment.nonce).toBeDefined();
      expect(payment.qrCode).toBeDefined();
      expect(payment.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should generate unique nonces', async () => {
      const payment1 = await engine.createPaymentRequest('kaspa:qz...', 100);
      const payment2 = await engine.createPaymentRequest('kaspa:qz...', 100);

      expect(payment1.nonce).not.toBe(payment2.nonce);
    });
  });

  describe('getProbabilityOfInclusion', () => {
    it('should return probability result', async () => {
      mockClient.getTransaction = jest.fn().mockResolvedValue({
        txId: 'tx123',
        acceptingBlockHash: 'block123'
      });

      const result = await engine.getProbabilityOfInclusion('tx123');

      expect(result.probability).toBeGreaterThanOrEqual(0);
      expect(result.probability).toBeLessThanOrEqual(1);
    });
  });
});
```

## Integration Tests

### Example: Payment Flow Test

```typescript
// tests/integration/payment-flow.test.ts
import { KSynchrony } from '../../src';

describe('Payment Flow Integration', () => {
  let ks: KSynchrony;

  beforeAll(async () => {
    ks = new KSynchrony({ network: 'testnet' });
    await ks.initialize();
  });

  afterAll(() => {
    ks.shutdown();
  });

  it('should complete full payment flow', async () => {
    // Create payment request
    const payment = await ks.payments.createPaymentRequest(
      'kaspa:qz...',
      100000000
    );

    expect(payment.nonce).toBeDefined();

    // Validate payment request
    const isValid = await ks.payments.validatePaymentRequest(
      payment.encoded
    );

    expect(isValid).toBe(true);

    // Get merchant stats
    const stats = await ks.payments.getMerchantStats('kaspa:qz...');

    expect(stats.activePaymentRequests).toBeGreaterThan(0);
  });
});
```

## E2E Tests

### Example: Full Demo Test

```typescript
// tests/e2e/full-demo.test.ts
import { KSynchrony } from '../../src';

describe('Full Product Demo E2E', () => {
  let ks: KSynchrony;

  beforeAll(async () => {
    ks = new KSynchrony({ network: 'testnet' });
    await ks.initialize();
  });

  afterAll(() => {
    ks.shutdown();
  });

  it('should demonstrate all three tracks', async () => {
    // Track 1: Payments
    const payment = await ks.payments.createPaymentRequest(
      'kaspa:qz...',
      100000000
    );
    expect(payment).toBeDefined();

    // Track 2: Gaming
    const game = await ks.gaming.createGame(
      'test-game',
      'chess',
      ['player1', 'player2']
    );
    expect(game.gameId).toBe('test-game');

    // Track 3: IoT
    const anchor = await ks.iot.anchorData(
      'device-001',
      { temperature: 2.5 }
    );
    expect(anchor.txId).toBeDefined();
  });
});
```

## Manual Testing

### Payment Engine

```bash
# Run payment demo
npm run demo:payment

# Expected output:
# - Payment request created
# - QR code generated
# - Nonce assigned
# - Multiple simultaneous payments
# - Merchant statistics
```

### Gaming Engine

```bash
# Run gaming demo
npm run demo:gaming

# Expected output:
# - Game created
# - Moves submitted
# - State synchronized
# - Leaderboard updated
# - Game statistics
```

### IoT Engine

```bash
# Run IoT demo
npm run demo:iot

# Expected output:
# - Data anchored
# - Covenant locked
# - Continuous monitoring
# - Data verified
# - Device statistics
```

## Performance Testing

### Load Test Example

```typescript
// tests/performance/load-test.ts
import { KSynchrony } from '../../src';

describe('Performance Tests', () => {
  it('should handle 100 simultaneous payments', async () => {
    const ks = new KSynchrony({ network: 'testnet' });
    await ks.initialize();

    const start = Date.now();
    
    const payments = await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        ks.payments.createPaymentRequest(
          'kaspa:qz...',
          100000000,
          { index: i }
        )
      )
    );

    const duration = Date.now() - start;

    expect(payments.length).toBe(100);
    expect(duration).toBeLessThan(5000); // < 5 seconds
    
    // Verify all nonces are unique
    const nonces = payments.map(p => p.nonce);
    const uniqueNonces = new Set(nonces);
    expect(uniqueNonces.size).toBe(100);

    ks.shutdown();
  });
});
```

## Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: All major flows
- **E2E Tests**: Complete user journeys
- **Performance Tests**: Load and stress testing

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test -- --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

## Test Data

### Mock Addresses

```typescript
export const TEST_ADDRESSES = {
  merchant: 'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd',
  player1: 'kaspa:qz1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  player2: 'kaspa:qz0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
  device: 'device-test-001'
};
```

### Mock Data

```typescript
export const MOCK_SENSOR_DATA = {
  temperature: 2.5,
  humidity: 45,
  location: 'Test Warehouse',
  timestamp: Date.now()
};

export const MOCK_GAME_MOVE = {
  action: 'test-move',
  power: 50,
  score: 10
};
```

## Debugging Tests

### Enable Debug Logging

```typescript
// Set environment variable
process.env.DEBUG = 'k-synchrony:*';

// Or in test
import debug from 'debug';
const log = debug('k-synchrony:test');

log('Test starting...');
```

### Inspect Test Failures

```bash
# Run with verbose output
npm test -- --verbose

# Run single test
npm test -- --testNamePattern="should create payment"

# Debug in VS Code
# Add to .vscode/launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

## Best Practices

1. **Isolate Tests**: Each test should be independent
2. **Mock External Calls**: Don't hit real Kaspa network in unit tests
3. **Use Descriptive Names**: Test names should explain what they test
4. **Test Edge Cases**: Include error conditions and boundary values
5. **Keep Tests Fast**: Unit tests should run in milliseconds
6. **Clean Up**: Always cleanup resources in afterEach/afterAll

## Contributing Tests

When adding new features:

1. Write unit tests for new functions
2. Add integration tests for new flows
3. Update E2E tests if needed
4. Ensure coverage doesn't decrease
5. Document any new test utilities

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)
