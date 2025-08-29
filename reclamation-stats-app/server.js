const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint for reclamations (you can modify this as needed)
app.get('/api/reclamations', (req, res) => {
  // For now, return sample data
  // In production, you might connect to a database
  res.json([
    {
      date: '2025-08-08',
      product: 'P5849206_A.07 / Unimax / Run. strip. pl. dual',
      customer: '0001',
      reason: 'Burrs in hole for insert (3pcs) Unreable numbers (1pc)'
    }
    // Add more sample data as needed
  ]);
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Reclamation Stats App running on port ${PORT}`);
  console.log(`📊 Dashboard available at: http://localhost:${PORT}`);
});
