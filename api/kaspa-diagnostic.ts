/**
 * Kaspa TN10 API Diagnostic Tool
 * Run this to test connectivity before deploying to Vercel
 * 
 * Usage: node kaspa-diagnostic.js
 * Or: ts-node kaspa-diagnostic.ts
 */

const KASPA_API = "https://api-tn10.kaspa.org";

// Test addresses (public testnet addresses)
const TEST_ADDRESSES = [
  "kaspatest:qz0h05ep5uxz9vqfp8x5t4swzjlw2af6gln34zkkx7a44rjcn489ckchhmak4",
  // Add your wallet address here
];

interface DiagnosticResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  data?: any;
  duration?: number;
}

const results: DiagnosticResult[] = [];

function log(result: DiagnosticResult) {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${result.test}: ${result.message}`);
  if (result.duration) {
    console.log(`   ⏱️  ${result.duration}ms`);
  }
  if (result.data) {
    console.log(`   📊 Data:`, JSON.stringify(result.data, null, 2));
  }
  results.push(result);
}

async function testEndpoint(name: string, url: string, options: RequestInit = {}) {
  const start = Date.now();
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const duration = Date.now() - start;
    
    if (!response.ok) {
      const errorText = await response.text();
      log({
        test: name,
        status: 'FAIL',
        message: `HTTP ${response.status}`,
        data: { error: errorText },
        duration
      });
      return null;
    }
    
    const data = await response.json();
    log({
      test: name,
      status: 'PASS',
      message: 'Success',
      data: data,
      duration
    });
    return data;
    
  } catch (error: any) {
    log({
      test: name,
      status: 'FAIL',
      message: error.message,
      duration: Date.now() - start
    });
    return null;
  }
}

async function runDiagnostics() {
  console.log('🔬 Kaspa TN10 API Diagnostics');
  console.log('═══════════════════════════════════════════════════\n');

  // Test 1: API Health Check
  console.log('1️⃣  Testing API Base Connectivity...');
  const health = await testEndpoint(
    'API Health',
    `${KASPA_API}/info/health`,
    { method: 'GET' }
  );

  // Test 2: Network Info
  console.log('\n2️⃣  Testing Network Info...');
  const networkInfo = await testEndpoint(
    'Network Info',
    `${KASPA_API}/info/network`,
    { method: 'GET' }
  );

  // Test 3: Block DAG Info
  console.log('\n3️⃣  Testing Block DAG Info...');
  const dagInfo = await testEndpoint(
    'DAG Info',
    `${KASPA_API}/info/blockdag`,
    { method: 'GET' }
  );

  // Test 4: Balance Check
  for (const address of TEST_ADDRESSES) {
    console.log(`\n4️⃣  Testing Balance for ${address.substring(0, 20)}...`);
    const balance = await testEndpoint(
      `Balance: ${address.substring(0, 20)}...`,
      `${KASPA_API}/addresses/${address}/balance`,
      { method: 'GET' }
    );

    if (balance && typeof balance === 'object' && 'balance' in balance) {
      const balanceAmount = (balance as any).balance;
      const kas = balanceAmount ? (balanceAmount / 100000000).toFixed(8) : '0';
      console.log(`   💰 Balance: ${kas} KAS (${balanceAmount} sompi)`);
    }
  }

  // Test 5: UTXO Check
  console.log(`\n5️⃣  Testing UTXO Retrieval...`);
  const utxos = await testEndpoint(
    'UTXO Check',
    `${KASPA_API}/addresses/${TEST_ADDRESSES[0]}/utxos`,
    { method: 'GET' }
  );

  // Test 6: CORS Check (simulate browser)
  console.log(`\n6️⃣  Testing CORS (OPTIONS)...`);
  const cors = await testEndpoint(
    'CORS Preflight',
    `${KASPA_API}/info/health`,
    { 
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      }
    }
  );

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('═══════════════════════════════════════════════════');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warned}`);
  console.log(`📝 Total: ${results.length}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your Kaspa TN10 integration should work.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
    console.log('Common fixes:');
    console.log('  - Check your internet connection');
    console.log('  - Verify the API endpoint is correct');
    console.log('  - Make sure you\'re using a valid testnet address');
    console.log('  - Check if the Kaspa TN10 node is online');
  }

  console.log('\n═══════════════════════════════════════════════════\n');
}

// Run diagnostics
runDiagnostics().catch(console.error);