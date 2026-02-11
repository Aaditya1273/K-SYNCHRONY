/**
 * Quick Test Script - Test Backend Locally
 * Run this to verify your backend works before deploying
 */

const http = require('http');

console.log('🧪 Testing Backend Locally...\n');

// Test data
const testData = JSON.stringify({
  device: 'door1',
  action: 'open',
  sensor: 'test'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/trigger',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('📤 Sending POST request to http://localhost:3000/api/trigger');
console.log('📦 Payload:', testData);
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Response received!\n');
    console.log('Status Code:', res.statusCode);
    console.log('');
    
    try {
      const json = JSON.parse(data);
      console.log('📥 Response JSON:');
      console.log(JSON.stringify(json, null, 2));
      console.log('');
      
      if (json.success) {
        console.log('🎉 SUCCESS! Backend is working!');
        console.log('');
        console.log('✅ Step 1 Complete: Backend works locally');
        console.log('✅ Step 2 Complete: Already on Kaspa testnet');
        console.log('⏭️  Next: Deploy to Railway/Render');
      } else {
        console.log('⚠️  Backend returned success: false');
        console.log('Check backend logs for errors');
      }
    } catch (e) {
      console.log('❌ Invalid JSON response');
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Connection failed!');
  console.log('');
  console.log('Error:', error.message);
  console.log('');
  console.log('💡 Make sure backend is running:');
  console.log('   npm run server:esp32');
  console.log('');
  console.log('Then run this test again:');
  console.log('   node test-backend-local.js');
});

req.write(testData);
req.end();
