const https = require('https');

console.log('Testing Fodesco API authentication...\n');

// Test 1: No authentication
console.log('Test 1: No authentication');
testAPI('', 'No auth');

// Test 2: Bearer token
console.log('\nTest 2: Bearer token');
testAPI('Bearer 3p5yq0zussyac3hrhek44itxkcu7ip2z7a', 'Bearer');

// Test 3: X-API-Key
console.log('\nTest 3: X-API-Key');
testAPI('3p5yq0zussyac3hrhek44itxkcu7ip2z7a', 'X-API-Key');

// Test 4: api-key
console.log('\nTest 4: api-key');
testAPI('3p5yq0zussyac3hrhek44itxkcu7ip2z7a', 'api-key');

function testAPI(authValue, authType) {
  const options = {
    hostname: 'www.fodesco.fi',
    port: 443,
    path: '/json/reklamaatiot/',
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  // Add authentication header based on type
  if (authType === 'Bearer') {
    options.headers['Authorization'] = authValue;
  } else if (authType === 'X-API-Key') {
    options.headers['X-API-Key'] = authValue;
  } else if (authType === 'api-key') {
    options.headers['api-key'] = authValue;
  }

  const req = https.request(options, (res) => {
    console.log(`  Status: ${res.statusCode} ${res.statusMessage}`);
    console.log(`  Headers:`, res.headers);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`  ✅ SUCCESS! Response length: ${body.length} characters`);
        try {
          const data = JSON.parse(body);
          console.log(`  Data type: ${typeof data}, Keys: ${Object.keys(data).join(', ')}`);
        } catch (e) {
          console.log(`  Response is not valid JSON`);
        }
      } else {
        console.log(`  ❌ FAILED: ${body.substring(0, 200)}...`);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`  ❌ ERROR: ${err.message}`);
  });

  req.end();
}
