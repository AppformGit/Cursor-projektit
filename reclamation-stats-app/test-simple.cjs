const https = require('https');

console.log('Testing Fodesco API with Authorization header...\n');

const options = {
  hostname: 'www.fodesco.fi',
  port: 443,
  path: '/json/reklamaatiot/',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 3p5yq0zussyac3hrhek44itxkcu7ip2z7a'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('Headers:', res.headers);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    console.log(body);
    
    if (res.statusCode === 403) {
      console.log('\n🔍 403 Forbidden - Let\'s see what the API says...');
      try {
        const errorData = JSON.parse(body);
        console.log('Error details:', errorData);
      } catch (e) {
        console.log('Response is not JSON');
      }
    }
  });
});

req.on('error', (err) => {
  console.log('Request error:', err.message);
});

req.end();
