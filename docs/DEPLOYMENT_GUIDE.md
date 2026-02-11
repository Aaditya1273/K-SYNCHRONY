# 🚀 Deployment Guide - Make Your Backend Public

## 🎯 The Problem

Your ESP32 in Wokwi simulator runs in the cloud and cannot reach `http://localhost:3000` on your computer.

**You need a PUBLIC URL** like:
- `https://your-app.railway.app`
- `https://your-app.onrender.com`
- `https://abcd.ngrok.io`

---

## ✅ Option 1: Railway (Recommended - Free & Easy)

### Step 1: Sign Up
1. Go to https://railway.app
2. Sign up with GitHub
3. Free tier: $5 credit/month (enough for testing)

### Step 2: Deploy
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Step 3: Get Your URL
```bash
railway domain
```

You'll get: `https://your-app.railway.app`

### Step 4: Set Environment Variables
```bash
railway variables set WALLET_ADDRESS=kaspa:qz0h05ep5uxz9...
railway variables set PRIVATE_KEY=572a06e6b7fbd76...
railway variables set KASPA_ENDPOINT=api.kaspa.org
```

### Step 5: Update ESP32 Code
```cpp
const char* serverUrl = "https://your-app.railway.app/api/trigger";
```

**Done!** ✅

---

## ✅ Option 2: Render (Free Forever)

### Step 1: Sign Up
1. Go to https://render.com
2. Sign up with GitHub
3. Free tier: Always free (with limitations)

### Step 2: Create Web Service
1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: k-synchrony-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/examples/esp32-backend-server.js`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard:
- `WALLET_ADDRESS` = `kaspa:qz0h05ep5uxz9...`
- `PRIVATE_KEY` = `572a06e6b7fbd76...`
- `KASPA_ENDPOINT` = `api.kaspa.org`

### Step 4: Deploy
Click "Create Web Service" - Render will auto-deploy

### Step 5: Get Your URL
You'll get: `https://k-synchrony-backend.onrender.com`

### Step 6: Update ESP32 Code
```cpp
const char* serverUrl = "https://k-synchrony-backend.onrender.com/api/trigger";
```

**Done!** ✅

---

## ✅ Option 3: ngrok (Quick Testing)

**Best for**: Quick testing, not permanent

### Step 1: Install ngrok
```bash
# Download from https://ngrok.com
# Or use npm
npm install -g ngrok
```

### Step 2: Start Your Local Server
```bash
npm run server:esp32
```

### Step 3: Create Tunnel
```bash
# In another terminal
ngrok http 3000
```

### Step 4: Get Your URL
You'll see:
```
Forwarding  https://abcd-1234.ngrok.io -> http://localhost:3000
```

### Step 5: Update ESP32 Code
```cpp
const char* serverUrl = "https://abcd-1234.ngrok.io/api/trigger";
```

**⚠️ Warning**: URL changes every time you restart ngrok (unless you have paid plan)

---

## ✅ Option 4: Vercel (Serverless)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Create vercel.json
Already created in project root!

### Step 3: Deploy
```bash
vercel
```

### Step 4: Get Your URL
You'll get: `https://your-project.vercel.app`

### Step 5: Update ESP32 Code
```cpp
const char* serverUrl = "https://your-project.vercel.app/api/trigger";
```

---

## 🧪 Testing Your Deployed Backend

### Test 1: Health Check
```bash
curl https://your-app.railway.app/health
```

**Expected:**
```json
{
  "status": "ok",
  "service": "K-Synchrony ESP32 Backend",
  "network": "testnet",
  "timestamp": 1234567890
}
```

### Test 2: Trigger Endpoint
```bash
curl -X POST https://your-app.railway.app/api/trigger \
  -H "Content-Type: application/json" \
  -d '{"device":"door1","action":"open","sensor":"test"}'
```

**Expected:**
```json
{
  "success": true,
  "message": "Access open for door1",
  "data": {
    "device": "door1",
    "action": "open",
    "txId": "anchor_abc123",
    "dataHash": "hash_xyz789",
    "probability": 0.95,
    "duration": "234ms"
  },
  "ui": {
    "status": "Access Granted",
    "color": "green",
    "icon": "🔓"
  }
}
```

### Test 3: Wallet Balance
```bash
curl https://your-app.railway.app/api/wallet/balance
```

**If all tests pass: Your backend is ready!** ✅

---

## 🎯 Professional Build Order

Follow this order for best results:

### 1. Deploy Backend ✅
```bash
# Choose one: Railway, Render, or ngrok
railway up
# or
vercel
```

### 2. Test from Browser ✅
```
https://your-app.railway.app/health
```

### 3. Test with curl ✅
```bash
curl -X POST https://your-app.railway.app/api/trigger \
  -H "Content-Type: application/json" \
  -d '{"device":"test","action":"open"}'
```

### 4. Update ESP32 Code ✅
```cpp
const char* serverUrl = "https://your-app.railway.app/api/trigger";
```

### 5. Test in Wokwi ✅
1. Go to https://wokwi.com
2. Create new ESP32 project
3. Paste your code
4. Add `wokwi-diagram.json`
5. Run simulation

### 6. Build Frontend ✅
Create dashboard to show live updates

### 7. Connect to Real Kaspa ✅
Verify transactions on Kaspa explorer

---

## 📋 Deployment Checklist

Before deploying:
- [ ] Code builds successfully: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Environment variables configured
- [ ] CORS enabled for ESP32
- [ ] Health check endpoint works
- [ ] Wallet address configured

After deploying:
- [ ] Health check returns 200
- [ ] Trigger endpoint works
- [ ] Wallet balance retrieves
- [ ] Logs show no errors
- [ ] ESP32 can reach endpoint

---

## 🔧 Environment Variables

Set these in your deployment platform:

```bash
# Required
WALLET_ADDRESS=kaspa:qz0h05ep5uxz9vqfp8x5t4swzjlw2af6gln34zkkx7a44rjcn489ckchhmak4
PRIVATE_KEY=572a06e6b7fbd76ee68f8b0cce77b2746bf7928150a3a2eb2f16e18bfa8f550

# Optional
KASPA_ENDPOINT=api.kaspa.org
PORT=3000
NODE_ENV=production
```

**⚠️ Security**: Never commit private keys to git!

---

## 🐛 Troubleshooting

### Backend won't start
- Check logs: `railway logs` or Render dashboard
- Verify build command: `npm run build`
- Check start command: `node dist/examples/esp32-backend-server.js`

### ESP32 can't reach backend
- Verify URL is HTTPS (not HTTP)
- Test URL in browser first
- Check CORS is enabled
- Verify firewall allows outbound HTTPS

### Kaspa connection fails
- Check internet connectivity
- Try alternative endpoint: `testnet-api.kaspa.org`
- Verify wallet address format
- Check Kaspa testnet status

### 502 Bad Gateway
- Backend crashed - check logs
- Build failed - verify build command
- Port mismatch - use `process.env.PORT`

---

## 💰 Cost Comparison

| Platform | Free Tier | Pros | Cons |
|----------|-----------|------|------|
| **Railway** | $5 credit/month | Easy, fast, great DX | Credit runs out |
| **Render** | Forever free | Always free, reliable | Slower cold starts |
| **ngrok** | Free (temp URLs) | Instant, no deploy | URL changes |
| **Vercel** | Free | Fast, CDN | Serverless limits |

**Recommendation**: Start with Railway for hackathon, move to Render for production.

---

## 🎯 Quick Start (Railway)

```bash
# 1. Install CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize
railway init

# 4. Deploy
railway up

# 5. Get URL
railway domain

# 6. Set variables
railway variables set WALLET_ADDRESS=kaspa:qz0h05ep5uxz9...
railway variables set PRIVATE_KEY=572a06e6b7fbd76...

# 7. Test
curl https://your-app.railway.app/health

# Done! ✅
```

---

## 🎉 Success Criteria

You'll know it's working when:

1. ✅ `curl https://your-app.railway.app/health` returns 200
2. ✅ Browser shows JSON response
3. ✅ POST to `/api/trigger` returns success
4. ✅ ESP32 in Wokwi can reach your backend
5. ✅ Logs show Kaspa transactions
6. ✅ LED blinks in simulator

**When all checked: Your backend is live!** 🚀

---

## 📚 Next Steps

After deployment:
1. Test ESP32 in Wokwi simulator
2. Build frontend dashboard
3. Add authentication
4. Set up monitoring
5. Add analytics
6. Scale as needed

---

**Built with ❤️ for hackathons and production**

*"From localhost to worldwide in 5 minutes!"* 🌍
