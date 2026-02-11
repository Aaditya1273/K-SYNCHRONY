# ESP32 + Kaspa Integration Setup Guide

## 🎯 What We're Building

A complete IoT system where:
- **ESP32** (delivery boy) → reads button/sensor
- **Backend Server** (restaurant) → processes request, talks to Kaspa
- **Kaspa Blockchain** (payment system) → records transaction
- **Frontend** (customer app) → shows live updates

Think: **Swiggy for IoT** 🚀

---

## 📋 Prerequisites

### Hardware
- ESP32 development board
- Button (with pull-up resistor)
- LED (optional, built-in LED works)
- USB cable
- Breadboard and jumper wires

### Software
- Node.js (v16+)
- Arduino IDE or PlatformIO
- Your K-SYNCHRONY project (already set up!)

### Network
- WiFi network
- Computer and ESP32 on same network
- Internet connection for Kaspa testnet

---

## 🚀 Step-by-Step Setup

### Step 1: Test Kaspa Connection

First, verify your K-SYNCHRONY can connect to Kaspa testnet:

```bash
npm run test:kaspa
```

**Expected Output:**
```
=== Kaspa Testnet Integration Test ===

1. Initializing K-Synchrony...
✓ Connected to Kaspa testnet

2. Checking wallet balance...
✓ Wallet Balance: 1000000000 sompi (10 KAS)

3. Getting network info...
✓ Network Info:
  - Virtual DAG Tips: 3
  - Network: testnet

4. Testing IoT Data Anchoring...
✓ Data Anchored:
  - Device: door-sensor-001
  - Hash: abc123...
  - TX ID: tx_xyz789...

=== All Tests Completed ===
✓ K-Synchrony is working with Kaspa testnet!
```

**If it fails:**
- Check internet connection
- Verify Kaspa testnet is accessible
- Try alternative endpoint: `testnet-api.kaspa.org`

---

### Step 2: Start Backend Server

Start the server that will receive ESP32 requests:

```bash
npm run server:esp32
```

**Expected Output:**
```
═══════════════════════════════════════
🚀 ESP32 Backend Server Running
═══════════════════════════════════════
📡 Server: http://localhost:3000
🔗 Network: Kaspa Testnet
💼 Wallet: kaspa:qz0h05ep5uxz9...
═══════════════════════════════════════

📋 Available Endpoints:
  POST   /api/trigger              - ESP32 trigger endpoint
  GET    /api/device/:id/history   - Device history
  GET    /api/wallet/balance       - Wallet balance
  GET    /api/monitor/:txId        - Monitor transaction
  GET    /health                   - Health check

⏳ Waiting for ESP32 requests...
```

**Keep this terminal open!** The server needs to run continuously.

---

### Step 3: Test Backend with curl

Before connecting ESP32, test the backend manually:

```bash
# Test health check
curl http://localhost:3000/health

# Test trigger endpoint
curl -X POST http://localhost:3000/api/trigger \
  -H "Content-Type: application/json" \
  -d '{"device":"door1","action":"open","sensor":"button"}'

# Check wallet balance
curl http://localhost:3000/api/wallet/balance
```

**Expected Response:**
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

---

### Step 4: Find Your Computer's IP Address

The ESP32 needs to know where to send requests.

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.100`)

**Mac/Linux:**
```bash
ifconfig
```
Look for "inet" under your WiFi interface (e.g., `192.168.1.100`)

**Write down this IP address!** You'll need it for ESP32 configuration.

---

### Step 5: Configure ESP32 Code

Open `examples/esp32-arduino-code.ino` in Arduino IDE and update:

```cpp
// WiFi credentials
const char* ssid = "YOUR_WIFI_NAME";        // ← Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // ← Your WiFi password

// Backend server URL
const char* serverUrl = "http://192.168.1.100:3000/api/trigger"; // ← Your computer's IP

// Device configuration
const char* deviceId = "door1"; // ← Your device name
```

---

### Step 6: Hardware Wiring

Connect your ESP32:

```
ESP32 Pin Layout:
┌─────────────────┐
│  ESP32          │
│                 │
│  GPIO 4  ──────┼──── Button ──── GND
│  GPIO 2  ──────┼──── LED ──── GND (with resistor)
│  GPIO 34 ──────┼──── Sensor (optional)
│  GND    ──────┼──── Common Ground
│  3.3V   ──────┼──── Power (if needed)
└─────────────────┘
```

**Simple Setup (Just Button):**
1. Connect button between GPIO 4 and GND
2. Use built-in LED on GPIO 2
3. That's it!

---

### Step 7: Upload ESP32 Code

1. Open Arduino IDE
2. Select Board: "ESP32 Dev Module"
3. Select Port: Your ESP32's COM port
4. Click Upload
5. Open Serial Monitor (115200 baud)

**Expected Serial Output:**
```
═══════════════════════════════════════
🚀 ESP32 Kaspa IoT Device Starting
═══════════════════════════════════════
📡 Connecting to WiFi: YourWiFi
.....
✓ WiFi Connected!
📍 IP Address: 192.168.1.101
📶 Signal Strength: -45 dBm

✓ Device ready!
⏳ Waiting for button press...
```

---

### Step 8: Test the System

1. **Press the button on ESP32**

2. **Watch ESP32 Serial Monitor:**
```
🔘 Button Pressed!
📤 Sending request to backend...
🔗 URL: http://192.168.1.100:3000/api/trigger
📦 Payload:
{"device":"door1","action":"open","sensor":"button_pressed"}

✓ Response Code: 200
⏱️  Duration: 234 ms

📥 Response:
{"success":true,"message":"Access open for door1"...}

═══════════════════════════════════════
✅ 🔓 Access Granted
═══════════════════════════════════════

📊 Transaction Details:
  TX ID: anchor_abc123def456
  Hash: hash_xyz789abc
  Probability: 95.00%

⏳ Waiting for next button press...
```

3. **Watch Backend Server Terminal:**
```
📡 ESP32 Request Received:
{
  "device": "door1",
  "action": "open",
  "sensor": "button_pressed"
}

1️⃣ Anchoring data to Kaspa...
✓ Data anchored: anchor_abc123def456

2️⃣ Creating access transaction...
✓ Payment request: nonce_xyz789

3️⃣ Calculating transaction probability...
✓ Probability: 95.00%

✅ Response sent to ESP32
```

---

## 🎨 Adding a Frontend (Optional)

Create a simple HTML page to show live updates:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Kaspa IoT Dashboard</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #1a1a1a; color: #fff; }
        .status { padding: 20px; margin: 10px 0; border-radius: 10px; font-size: 24px; }
        .success { background: #00ff00; color: #000; }
        .error { background: #ff0000; }
        .pending { background: #ffaa00; color: #000; }
    </style>
</head>
<body>
    <h1>🔓 Kaspa IoT Access Control</h1>
    <div id="status" class="status pending">⏳ Waiting for activity...</div>
    <div id="details"></div>

    <script>
        // Poll for updates every 2 seconds
        setInterval(async () => {
            try {
                const response = await fetch('http://localhost:3000/api/device/door1/history');
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('status').className = 'status success';
                    document.getElementById('status').innerHTML = '✅ Access Granted';
                    document.getElementById('details').innerHTML = `
                        <p>Device: ${data.device}</p>
                        <p>Total Accesses: ${data.stats.totalAnchors}</p>
                        <p>Last Access: ${new Date(data.stats.lastAnchor).toLocaleString()}</p>
                    `;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }, 2000);
    </script>
</body>
</html>
```

Save as `dashboard.html` and open in browser.

---

## 🔧 Troubleshooting

### ESP32 Can't Connect to WiFi
- ✅ Check WiFi credentials (case-sensitive!)
- ✅ Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- ✅ Check WiFi signal strength

### ESP32 Can't Reach Backend
- ✅ Verify computer's IP address
- ✅ Ensure both on same WiFi network
- ✅ Check firewall settings (allow port 3000)
- ✅ Test with curl first

### Backend Can't Connect to Kaspa
- ✅ Check internet connection
- ✅ Try alternative endpoint: `testnet-api.kaspa.org`
- ✅ Verify Kaspa testnet is online

### Button Not Working
- ✅ Check wiring (GPIO 4 to button to GND)
- ✅ Verify pull-up resistor or use INPUT_PULLUP
- ✅ Check Serial Monitor for debug messages

---

## 📊 API Endpoints Reference

### POST /api/trigger
Trigger an action from ESP32

**Request:**
```json
{
  "device": "door1",
  "action": "open",
  "sensor": "button_pressed",
  "data": {
    "sensorValue": 1024,
    "timestamp": 1234567890
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Access open for door1",
  "data": {
    "device": "door1",
    "action": "open",
    "txId": "anchor_abc123",
    "dataHash": "hash_xyz789",
    "paymentNonce": "nonce_abc",
    "probability": 0.95,
    "timestamp": 1234567890,
    "duration": "234ms"
  },
  "ui": {
    "status": "Access Granted",
    "color": "green",
    "icon": "🔓"
  }
}
```

### GET /api/device/:deviceId/history
Get device transaction history

**Response:**
```json
{
  "success": true,
  "device": "door1",
  "stats": {
    "totalAnchors": 42,
    "lastAnchor": 1234567890,
    "verified": 40
  }
}
```

### GET /api/wallet/balance
Check wallet balance

**Response:**
```json
{
  "success": true,
  "address": "kaspa:qz0h05ep5uxz9...",
  "balance": {
    "sompi": 1000000000,
    "kas": 10.0
  }
}
```

### GET /api/monitor/:txId
Monitor transaction status

**Response:**
```json
{
  "success": true,
  "txId": "anchor_abc123",
  "probability": 0.95,
  "dagDepth": 10,
  "confirmingBlocks": 8,
  "status": "confirmed"
}
```

---

## 🎯 Next Steps

### Enhance Your System:

1. **Add More Sensors**
   - Temperature sensor (DHT22)
   - Motion sensor (PIR)
   - Door sensor (magnetic switch)

2. **Add Security**
   - API keys for authentication
   - HTTPS for encrypted communication
   - Device whitelisting

3. **Add Features**
   - Real-time WebSocket updates
   - Mobile app integration
   - Email/SMS notifications
   - Data analytics dashboard

4. **Scale Up**
   - Multiple ESP32 devices
   - Load balancing
   - Database for history
   - Cloud deployment

---

## 📚 Resources

- **K-Synchrony Docs**: See `/docs` folder
- **Kaspa Testnet**: https://kaspa.org
- **ESP32 Docs**: https://docs.espressif.com
- **Arduino IDE**: https://www.arduino.cc/en/software

---

## 🎉 Success Checklist

- [ ] Kaspa testnet connection working
- [ ] Backend server running
- [ ] ESP32 connected to WiFi
- [ ] Button press triggers request
- [ ] Backend receives and processes request
- [ ] Transaction created on Kaspa
- [ ] Response sent back to ESP32
- [ ] LED blinks to confirm success

**When all checked: You have a working Kaspa IoT system!** 🚀

---

## 💡 Real-World Use Cases

Now that you have this working, you can build:

1. **Smart Door Lock** - Unlock with blockchain verification
2. **Vending Machine** - Pay with Kaspa, dispense product
3. **Parking System** - Entry/exit recorded on blockchain
4. **Supply Chain** - Track product movement
5. **Cold Chain** - Monitor temperature with blockchain proof
6. **Access Control** - Building entry with audit trail

**The possibilities are endless!** 🌟

---

**Built with ❤️ using K-SYNCHRONY and Kaspa**
