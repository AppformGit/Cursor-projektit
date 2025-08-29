const express = require('express');
const cors = require('cors');
const https = require('https');

// API configuration - can be set via environment variables
const API_CONFIG = {
  hostname: 'www.fodesco.fi',
  port: 443,
  path: '/json/reklamaatiot/',
  apiKey: process.env.FODESCO_API_KEY || '3p5yq0zussyacsa141s5872iuloezzk' // Your API key
};

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Main reclamations endpoint - Now using real Fodesco API
app.get('/api/reclamations', async (req, res) => {
  try {
    console.log('Fetching real data from Fodesco API...');
    
    const data = await new Promise((resolve, reject) => {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };
      
      // Add API key if configured
      if (API_CONFIG.apiKey) {
        headers['Authorization'] = `Bearer ${API_CONFIG.apiKey}`;
      }
      
      const options = {
        hostname: API_CONFIG.hostname,
        port: API_CONFIG.port,
        path: API_CONFIG.path,
        method: 'GET',
        headers: headers
      };

      const req = https.request(options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          console.log('Fodesco API Response Status:', res.statusCode);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const data = JSON.parse(body);
              resolve(data);
            } catch (e) {
              reject(new Error('Invalid JSON response from Fodesco API'));
            }
          } else {
            reject(new Error(`Fodesco API HTTP error! status: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (err) => {
        console.error('Fodesco API Request error:', err);
        reject(err);
      });

      req.end();
    });

    console.log(`✅ Success! Received ${data.length} reclamation records from Fodesco API`);
    res.json(data);
    
  } catch (error) {
    console.error('❌ Fodesco API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from Fodesco API', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// API Test endpoint - Shows raw data and toggle between mock/real API
app.get('/api/test', async (req, res) => {
  const { mode = 'mock' } = req.query; // ?mode=real or ?mode=mock
  
  if (mode === 'real') {
    try {
      console.log('Testing real API connection...');
      
      const data = await new Promise((resolve, reject) => {
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        };
        
        // Add API key if configured
        if (API_CONFIG.apiKey) {
          headers['Authorization'] = `Bearer ${API_CONFIG.apiKey}`;
        }
        
        const options = {
          hostname: API_CONFIG.hostname,
          port: API_CONFIG.port,
          path: API_CONFIG.path,
          method: 'GET',
          headers: headers
        };

        const req = https.request(options, (res) => {
          let body = '';
          
          res.on('data', (chunk) => {
            body += chunk;
          });
          
          res.on('end', () => {
            console.log('Real API Response Status:', res.statusCode);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const data = JSON.parse(body);
                resolve(data);
              } catch (e) {
                reject(new Error('Invalid JSON response'));
              }
            } else {
              reject(new Error(`HTTP error! status: ${res.statusCode}`));
            }
          });
        });

        req.on('error', (err) => {
          console.error('Real API Request error:', err);
          reject(err);
        });

        req.end();
      });

      res.json({
        source: 'Real Fodesco API',
        status: 'success',
        data: data,
        recordCount: data.length,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({
        source: 'Real Fodesco API',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    // Mock data mode
    const mockData = [
      {
        date: '2024-12-15',
        product: 'Sample Product A',
        customer: 'Test Customer',
        reason: 'Quality Issue - Minor defect'
      },
      {
        date: '2024-12-10',
        product: 'Sample Product B', 
        customer: 'Demo Customer',
        reason: 'Packaging - Damaged during shipping'
      },
      {
        date: '2024-12-05',
        product: 'Sample Product C',
        customer: 'Preview Customer',
        reason: 'Functionality - Not working as expected'
      }
    ];
    
    res.json({
      source: 'Mock Data',
      status: 'success',
      data: mockData,
      recordCount: mockData.length,
      timestamp: new Date().toISOString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`🌐 Test with: http://localhost:${PORT}/health`);
  console.log(`🧪 API Test: http://localhost:${PORT}/api/test`);
});
