#!/usr/bin/env node
/**
 * Script to test NocoDB API connection
 * Usage: node test-nocodb-api.js [barcode] [token]
 */

const NOCODB_BASE_URL = 'https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records';

// Get barcode and token from command line arguments or use defaults
const testBarcode = process.argv[2] || '8936186880060'; // Default test barcode
const token = process.argv[3] || process.env.NOCODB_TOKEN || '';

console.log('🔍 Testing NocoDB API Connection...\n');
console.log('📊 Configuration:');
console.log(`   Base URL: ${NOCODB_BASE_URL}`);
console.log(`   Test Barcode: ${testBarcode}`);
console.log(`   Token: ${token ? '***' + token.slice(-8) : 'NOT PROVIDED'}\n`);

async function testAPI() {
  try {
    const where = encodeURIComponent(`(barcode,eq,${testBarcode})`);
    const url = `${NOCODB_BASE_URL}?offset=0&limit=25&where=${where}`;

    console.log('🌐 Request URL:', url);

    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['xc-token'] = token;
      console.log('🔑 Using authentication token\n');
    } else {
      console.log('⚠️  WARNING: No token provided, request may fail\n');
    }

    console.log('⏳ Sending request...\n');

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('📥 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }
    console.log('');

    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ API Error:');
      console.error('   Status:', response.status);
      console.error('   Response:', responseText);
      console.log('\n💡 Troubleshooting:');

      if (response.status === 401 || response.status === 403) {
        console.log('   - Token is invalid or missing');
        console.log('   - Get token from: https://db.salesai.vn (Account Settings > API Tokens)');
        console.log('   - Or check browser DevTools > Application > Cookies > xc-auth');
      } else if (response.status === 404) {
        console.log('   - Table URL might be incorrect');
        console.log('   - Verify table ID: m3rrbw0dbrlqogw');
      } else {
        console.log('   - Check NocoDB server status');
        console.log('   - Verify network connection');
      }

      return;
    }

    const data = JSON.parse(responseText);

    console.log('✅ API Response Successful!\n');
    console.log('📦 Data:', JSON.stringify(data, null, 2));

    if (data.list && data.list.length > 0) {
      console.log('\n🎉 Found product(s):');
      data.list.forEach((product, index) => {
        console.log(`\n   Product #${index + 1}:`);
        console.log(`   - Title: ${product.title || 'N/A'}`);
        console.log(`   - Barcode: ${product.barcode || 'N/A'}`);
        console.log(`   - Price: ${product.price || 'N/A'}`);
        console.log(`   - Sale Price: ${product.sale_price || 'N/A'}`);
        console.log(`   - Brand: ${product.brand || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️  No products found with barcode:', testBarcode);
      console.log('   Try a different barcode or check database content');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ Error: fetch is not available');
  console.error('   Please use Node.js 18 or higher');
  console.error('   Or run: npm install node-fetch');
  process.exit(1);
}

console.log('━'.repeat(60));
testAPI().then(() => {
  console.log('\n' + '━'.repeat(60));
  console.log('\n📝 Usage:');
  console.log('   node test-nocodb-api.js [barcode] [token]');
  console.log('\n   Example:');
  console.log('   node test-nocodb-api.js 8936186880060 nc_your_token_here');
  console.log('');
});
