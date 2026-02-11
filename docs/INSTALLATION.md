# K-SYNCHRONY Installation Guide

Complete installation and setup guide for K-SYNCHRONY.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Configuration](#configuration)
4. [Verification](#verification)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm)
- **TypeScript**: 5.0.0 or higher (for development)

### Optional

- **Git**: For cloning repository
- **Docker**: For containerized deployment
- **Kaspa Node**: For production use (optional, can use public endpoints)

### Check Prerequisites

```bash
# Check Node.js version
node --version
# Should output: v18.0.0 or higher

# Check npm version
npm --version
# Should output: 9.0.0 or higher

# Check TypeScript version (if installed globally)
tsc --version
# Should output: Version 5.0.0 or higher
```

---

## Installation Methods

### Method 1: NPM Package (Recommended)

```bash
# Install from npm
npm install k-synchrony

# Or with yarn
yarn add k-synchrony

# Or with pnpm
pnpm add k-synchrony
```

### Method 2: From Source

```bash
# Clone repository
git clone https://github.com/your-repo/k-synchrony.git
cd k-synchrony

# Install dependencies
npm install

# Build project
npm run build

# Link for local development (optional)
npm link
```

### Method 3: Direct Download

```bash
# Download latest release
wget https://github.com/your-repo/k-synchrony/archive/refs/tags/v0.1.0.tar.gz

# Extract
tar -xzf v0.1.0.tar.gz
cd k-synchrony-0.1.0

# Install and build
npm install
npm run build
```

---

## Configuration

### Basic Configuration

Create a configuration file or use environment variables:

#### Option 1: Configuration File

Create `k-synchrony.config.js`:

```javascript
module.exports = {
  network: 'testnet', // or 'mainnet'
  apiEndpoint: 'testnet.kaspathon.com',
  // Optional
  apiKey: process.env.KASPA_API_KEY
};
```

#### Option 2: Environment Variables

Create `.env` file:

```env
# Network Configuration
KASPA_NETWORK=testnet
KASPA_ENDPOINT=testnet.kaspathon.com

# Optional API Key
KASPA_API_KEY=your-api-key

# Merchant Configuration (for payment examples)
MERCHANT_ADDRESS=kaspa:qz...

# Device Configuration (for IoT examples)
DEVICE_ID=sensor-001

# Logging
LOG_LEVEL=info
```

### Network Endpoints

#### Testnet (Recommended for Development)

```typescript
const ks = new KSynchrony({
  network: 'testnet',
  apiEndpoint: 'testnet.kaspathon.com'
});
```

**Testnet Faucet**: https://faucet-tn10.kaspanet.io/

#### Mainnet (Production)

```typescript
const ks = new KSynchrony({
  network: 'mainnet',
  apiEndpoint: 'mainnet.kaspathon.com'
});
```

#### Custom Node

```typescript
const ks = new KSynchrony({
  network: 'mainnet',
  apiEndpoint: 'your-node.example.com:16110'
});
```

---

## Verification

### Step 1: Basic Import Test

Create `test.js`:

```javascript
const { KSynchrony } = require('k-synchrony');

console.log('K-SYNCHRONY imported successfully!');
console.log('Version:', require('k-synchrony/package.json').version);
```

Run:

```bash
node test.js
```

Expected output:
```
K-SYNCHRONY imported successfully!
Version: 0.1.0
```

### Step 2: Connection Test

Create `connection-test.js`:

```javascript
const { KSynchrony } = require('k-synchrony');

async function test() {
  const ks = new KSynchrony({ network: 'testnet' });
  
  try {
    await ks.initialize();
    console.log('✓ Connected to Kaspa network');
    ks.shutdown();
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
  }
}

test();
```

Run:

```bash
node connection-test.js
```

Expected output:
```
🚀 Initializing K-SYNCHRONY...
Network: testnet
Endpoint: testnet.kaspathon.com
✓ Connected to Kaspa testnet
✓ Payment Engine initialized
✓ Gaming Engine initialized with DAG-State Sync
✓ IoT Engine initialized
✓ K-SYNCHRONY initialized successfully
✓ Connected to Kaspa network
```

### Step 3: Feature Test

Create `feature-test.js`:

```javascript
const { KSynchrony } = require('k-synchrony');

async function test() {
  const ks = new KSynchrony({ network: 'testnet' });
  await ks.initialize();

  // Test Payment Engine
  const payment = await ks.payments.createPaymentRequest(
    'kaspa:qz7ulu4c25dh7fzec9zjyrmlhnkzrg4wmf89q7gzr3gfrsj3uz6xjceef60sd',
    100000000
  );
  console.log('✓ Payment Engine working');

  // Test Gaming Engine
  const game = await ks.gaming.createGame(
    'test-game',
    'chess',
    ['player1', 'player2']
  );
  console.log('✓ Gaming Engine working');

  // Test IoT Engine
  const anchor = await ks.iot.anchorData(
    'test-device',
    { temperature: 2.5 }
  );
  console.log('✓ IoT Engine working');

  ks.shutdown();
  console.log('\n✓ All features working correctly!');
}

test().catch(console.error);
```

Run:

```bash
node feature-test.js
```

### Step 4: Run Examples

```bash
# Payment demo
npm run demo:payment

# Gaming demo
npm run demo:gaming

# IoT demo
npm run demo:iot

# Full demo
npm run demo:all
```

---

## Troubleshooting

### Issue: Module Not Found

**Error**:
```
Error: Cannot find module 'k-synchrony'
```

**Solution**:
```bash
# Reinstall package
npm install k-synchrony

# Or rebuild from source
npm run build
```

### Issue: Connection Timeout

**Error**:
```
NetworkError: Failed to connect to Kaspa network
```

**Solutions**:

1. Check internet connection
2. Verify endpoint is accessible:
   ```bash
   curl https://testnet.kaspathon.com
   ```
3. Try alternative endpoint
4. Check firewall settings

### Issue: TypeScript Errors

**Error**:
```
Cannot find type definitions
```

**Solution**:
```bash
# Install type definitions
npm install --save-dev @types/node

# Rebuild
npm run build
```

### Issue: Permission Denied

**Error**:
```
EACCES: permission denied
```

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### Issue: Out of Memory

**Error**:
```
JavaScript heap out of memory
```

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or in package.json scripts
"build": "NODE_OPTIONS='--max-old-space-size=4096' tsc"
```

### Issue: Port Already in Use

**Error**:
```
EADDRINUSE: address already in use
```

**Solution**:
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

---

## Platform-Specific Instructions

### Windows

```powershell
# Install Node.js from nodejs.org
# Then install K-SYNCHRONY
npm install k-synchrony

# Run examples
npm run demo:all
```

### macOS

```bash
# Install Node.js with Homebrew
brew install node

# Install K-SYNCHRONY
npm install k-synchrony

# Run examples
npm run demo:all
```

### Linux (Ubuntu/Debian)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install K-SYNCHRONY
npm install k-synchrony

# Run examples
npm run demo:all
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Run
CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t k-synchrony .
docker run -e KASPA_NETWORK=testnet k-synchrony
```

---

## Development Setup

### For Contributors

```bash
# Clone repository
git clone https://github.com/your-repo/k-synchrony.git
cd k-synchrony

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run linter
npm run lint

# Build
npm run build
```

### IDE Setup

#### VS Code

Install recommended extensions:
- ESLint
- TypeScript
- Prettier

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

#### WebStorm/IntelliJ

1. Open project
2. Enable TypeScript support
3. Configure ESLint
4. Set Node.js interpreter

---

## Next Steps

After successful installation:

1. Read [Quick Start Guide](./getting-started/quickstart.md)
2. Explore [Examples](./examples/)
3. Check [API Reference](./docs/API.md)
4. Join [Discord Community](https://discord.gg/kaspa)

---

## Support

If you encounter issues:

1. Check [Troubleshooting](#troubleshooting) section
2. Search [GitHub Issues](https://github.com/your-repo/k-synchrony/issues)
3. Ask in [Discord](https://discord.gg/kaspa)
4. Create new issue with:
   - K-SYNCHRONY version
   - Node.js version
   - Operating system
   - Error message
   - Steps to reproduce

---

## Uninstallation

### Remove Package

```bash
npm uninstall k-synchrony
```

### Remove Global Installation

```bash
npm uninstall -g k-synchrony
```

### Clean Build Artifacts

```bash
# Remove node_modules
rm -rf node_modules

# Remove build output
rm -rf dist

# Remove lock files
rm package-lock.json
```

---

**Installation complete! Ready to build real-time applications on Kaspa.** 🚀
