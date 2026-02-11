# K-SYNCHRONY Deployment Guide

Complete guide for deploying K-SYNCHRONY in various environments.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Building for Production](#building-for-production)
3. [NPM Package Publishing](#npm-package-publishing)
4. [Docker Deployment](#docker-deployment)
5. [Cloud Deployment](#cloud-deployment)
6. [Hardware Integration](#hardware-integration)

---

## Development Setup

### Prerequisites

- Node.js 18+ or Bun
- npm or yarn
- Git
- TypeScript 5.0+

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/k-synchrony.git
cd k-synchrony

# Install dependencies
npm install

# Build project
npm run build

# Run tests
npm test

# Run examples
npm run demo:all
```

### Environment Variables

Create `.env` file:

```env
# Network Configuration
KASPA_NETWORK=testnet
KASPA_ENDPOINT=testnet.kaspathon.com

# Optional API Key
KASPA_API_KEY=your-api-key

# Merchant Configuration (for examples)
MERCHANT_ADDRESS=kaspa:qz...

# Device Configuration (for IoT examples)
DEVICE_ID=sensor-001
```

---

## Building for Production

### Build Commands

```bash
# Clean build
npm run build

# Development build with watch
npm run dev

# Lint code
npm run lint

# Run tests
npm test
```

### Output

Build artifacts are generated in `dist/` directory:

```
dist/
├── index.js
├── index.d.ts
├── KSynchrony.js
├── KSynchrony.d.ts
├── core/
├── payments/
├── gaming/
└── iot/
```

### TypeScript Configuration

The project uses `tsconfig.json` for compilation:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true
  }
}
```

---

## NPM Package Publishing

### Prepare for Publishing

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Build project
4. Run tests

```bash
# Update version
npm version patch  # or minor, major

# Build
npm run build

# Test
npm test

# Publish to NPM
npm publish
```

### Package Configuration

Ensure `package.json` has correct fields:

```json
{
  "name": "k-synchrony",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY src ./src

# Build
RUN npm run build

# Expose port (if running server)
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  k-synchrony:
    build: .
    environment:
      - KASPA_NETWORK=mainnet
      - KASPA_ENDPOINT=mainnet.kaspathon.com
    ports:
      - "3000:3000"
    restart: unless-stopped
```

### Build and Run

```bash
# Build image
docker build -t k-synchrony:latest .

# Run container
docker run -d \
  -e KASPA_NETWORK=mainnet \
  -e KASPA_ENDPOINT=mainnet.kaspathon.com \
  -p 3000:3000 \
  k-synchrony:latest

# Using docker-compose
docker-compose up -d
```

---

## Cloud Deployment

### AWS Lambda

Create `lambda.ts`:

```typescript
import { KSynchrony } from './src';

let ks: KSynchrony;

export const handler = async (event: any) => {
  if (!ks) {
    ks = new KSynchrony({
      network: process.env.KASPA_NETWORK as any,
      apiEndpoint: process.env.KASPA_ENDPOINT
    });
    await ks.initialize();
  }

  // Handle different operations
  switch (event.operation) {
    case 'createPayment':
      return await ks.payments.createPaymentRequest(
        event.address,
        event.amount
      );
    
    case 'checkProbability':
      return await ks.payments.getProbabilityOfInclusion(event.txId);
    
    default:
      throw new Error('Unknown operation');
  }
};
```

### Vercel/Netlify Functions

Create `api/payment.ts`:

```typescript
import { KSynchrony } from 'k-synchrony';

export default async function handler(req: any, res: any) {
  const ks = new KSynchrony({ network: 'mainnet' });
  await ks.initialize();

  const payment = await ks.payments.createPaymentRequest(
    req.body.address,
    req.body.amount
  );

  res.json(payment);
}
```

### Kubernetes

Create `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: k-synchrony
spec:
  replicas: 3
  selector:
    matchLabels:
      app: k-synchrony
  template:
    metadata:
      labels:
        app: k-synchrony
    spec:
      containers:
      - name: k-synchrony
        image: k-synchrony:latest
        env:
        - name: KASPA_NETWORK
          value: "mainnet"
        - name: KASPA_ENDPOINT
          value: "mainnet.kaspathon.com"
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: k-synchrony-service
spec:
  selector:
    app: k-synchrony
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## Hardware Integration

### Raspberry Pi Setup

```bash
# Install Node.js on Raspberry Pi
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and build
git clone https://github.com/your-repo/k-synchrony.git
cd k-synchrony
npm install
npm run build

# Run IoT example
npm run demo:iot
```

### IoT Device Integration

```typescript
// device.ts
import { KSynchrony } from 'k-synchrony';
import { readTemperature, readHumidity } from './sensors';

async function main() {
  const ks = new KSynchrony({ network: 'mainnet' });
  await ks.initialize();

  // Start continuous monitoring
  ks.iot.startContinuousAnchoring(
    process.env.DEVICE_ID!,
    async () => ({
      temperature: await readTemperature(),
      humidity: await readHumidity(),
      timestamp: Date.now()
    }),
    1000
  );

  console.log('Device monitoring started');
}

main().catch(console.error);
```

### NFC Reader Integration

```typescript
// nfc-pos.ts
import { KSynchrony } from 'k-synchrony';
import { NFCReader } from 'nfc-pcsc';

const ks = new KSynchrony({ network: 'mainnet' });
await ks.initialize();

const reader = new NFCReader();

reader.on('card', async (card) => {
  // Create payment request
  const payment = await ks.payments.createPaymentRequest(
    MERCHANT_ADDRESS,
    AMOUNT
  );

  // Write to NFC card
  await card.write(payment.encoded);
  
  console.log('Payment request written to NFC');
});
```

---

## Production Checklist

### Before Deployment

- [ ] Update to mainnet configuration
- [ ] Set up monitoring and logging
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up backup Kaspa nodes
- [ ] Test with real transactions
- [ ] Review security settings
- [ ] Set up rate limiting
- [ ] Configure CORS if needed
- [ ] Set up SSL/TLS
- [ ] Test failover scenarios

### Security

```typescript
// Use environment variables
const ks = new KSynchrony({
  network: process.env.KASPA_NETWORK as any,
  apiEndpoint: process.env.KASPA_ENDPOINT,
  apiKey: process.env.KASPA_API_KEY
});

// Validate inputs
function validateAddress(address: string): boolean {
  return address.startsWith('kaspa:') && address.length > 40;
}

// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### Monitoring

```typescript
// Add logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log operations
logger.info('Payment created', { txId, amount });
logger.error('Payment failed', { error, txId });
```

---

## Performance Optimization

### Caching

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 });

async function getCachedProbability(txId: string) {
  const cached = cache.get(txId);
  if (cached) return cached;

  const prob = await ks.payments.getProbabilityOfInclusion(txId);
  cache.set(txId, prob);
  return prob;
}
```

### Connection Pooling

```typescript
// Reuse KSynchrony instance
let ksInstance: KSynchrony;

export async function getKSynchrony(): Promise<KSynchrony> {
  if (!ksInstance) {
    ksInstance = new KSynchrony({ network: 'mainnet' });
    await ksInstance.initialize();
  }
  return ksInstance;
}
```

---

## Troubleshooting

### Common Issues

**Connection Timeout**
```typescript
// Increase timeout
const client = new KaspaClient({
  endpoint: 'mainnet.kaspathon.com',
  timeout: 30000 // 30 seconds
});
```

**Memory Leaks**
```typescript
// Always cleanup
process.on('SIGTERM', () => {
  ks.shutdown();
  process.exit(0);
});
```

**Rate Limiting**
```typescript
// Use your own node
const ks = new KSynchrony({
  network: 'mainnet',
  apiEndpoint: 'your-node.example.com'
});
```

---

## Support

For deployment issues:
- GitHub Issues: [Report issues](https://github.com/your-repo/k-synchrony/issues)
- Discord: [Get help](https://discord.gg/kaspa)
- Documentation: [Full docs](./README.md)

---

## Next Steps

1. Choose deployment method
2. Configure environment
3. Test thoroughly
4. Deploy to production
5. Monitor and optimize
