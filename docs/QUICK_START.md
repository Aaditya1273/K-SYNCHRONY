# ⚡ Quick Start - Get Running in 5 Minutes

## 🎯 Goal
Get your ESP32 IoT system working with Kaspa blockchain in Wokwi simulator.

---

## 🚀 Step 1: Deploy Backend (Choose One)

### Option A: Railway (Easiest)
```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway domain  # Get your URL
```

### Option B: Render (Free Forever)
1. Go to https://render.com
2. New Web Service → Connect GitHub
3. Build: `npm install && npm run build`
4. Start: `node dist/examples/esp32-backend-server.js`
5. Deploy!

### Option C: ngrok (Quick Test)
```bash
npm run server:esp32  # Terminal 1
ngrok http 3000       # Terminal 2
```

**Copy your URL!** (e.g., `https://your-app.railway.app`)

---

## 🧪 Step 2: Test Backend

```bash
# Test health
curl https://your-app.railway.app/health

# Test trigger
curl -X POST https://your-app.railway.app/api/trigger \
  -H "Content-Type: application/json" \
  -d '{"device":"door1","action":"open","sensor":"test"}'
```

**Expected**: JSON response with `"success": true`

---

## 🔧 Step 3: Update ESP32 Code

Open `examples/esp32-arduino-code.ino` and change:

```cpp
const char* serverUrl = "https://YOUR-URL-HERE/api/trigger";
```

Replace `YOUR-URL-HERE` with your actual URL from Step 1.

---

## 🎮 Step 4: Run in Wokwi

### Method A: Wokwi Website
1. Go to https://wokwi.com
2. New Project → ESP32
3. Copy code from `examples/esp32-arduino-code.ino`
4. Copy `examples/wokwi-diagram.json` to diagram.json
5. Click "Start Simulation"

### Method B: VS Code Extension
1. Install "Wokwi Simulator" extension
2. Open `examples/esp32-arduino-code.ino`
3. Press F1 → "Wokwi: Start Simulator"

---

## 👀 Step 5: Watch It Work!

**In Wokwi Serial Monitor:**
```
🚀 ESP32 Kaspa IoT Device Starting
📡 Connecting to WiFi: Wokwi-GUEST
✓ WiFi Connected!

🔘 Auto Trigger!
📤 Sending request to backend...
✓ Response Code: 200
⏱️  Duration: 234 ms

✅ 🔓 Access Granted

📊 Transaction Details:
  TX ID: anchor_abc123
  Probability: 95.00%
```

**LED will blink green!** ✅

---

## 🎯 That's It!

You now have:
- ✅ Backend deployed and public
- ✅ ESP32 running in simulator
- ✅ Kaspa transactions being created
- ✅ Real-time IoT system working

---

## 🐛 Troubleshooting

### "Connection failed"
- Check your URL is correct
- Verify backend is running: `curl https://your-url/health`
- Make sure URL starts with `https://` not `http://`

### "WiFi not connected"
- Wokwi uses `Wokwi-GUEST` automatically
- No password needed
- Should connect instantly

### "Backend error"
- Check backend logs
- Verify environment variables set
- Test with curl first

---

## 📚 Full Documentation

- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **ESP32 Setup**: See `ESP32_SETUP_GUIDE.md`
- **API Reference**: See backend server code

---

## 🎉 Next Steps

1. ✅ Add more sensors
2. ✅ Build frontend dashboard
3. ✅ Add authentication
4. ✅ Deploy to production
5. ✅ Win hackathon! 🏆

---

**Time to working system: 5 minutes** ⚡

**Built with K-Synchrony + Kaspa + ESP32** 🚀
