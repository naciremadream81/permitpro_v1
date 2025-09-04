const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PermitPro API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple API endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PermitPro API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/packages', (req, res) => {
  res.json({
    packages: [
      {
        id: 'PKG-001',
        customerName: 'Demo Customer',
        propertyAddress: '123 Demo St, Demo City, FL',
        county: 'Demo County',
        status: 'Draft',
        createdAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/auth/login', (req, res) => {
  res.json({
    user: {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'Admin'
    },
    token: 'demo-token-123'
  });
});

// Catch-all handler
app.get('*', (req, res) => {
  res.json({ 
    message: 'PermitPro API',
    endpoints: [
      'GET /health',
      'GET /api/health',
      'GET /api/packages',
      'GET /api/auth/login'
    ]
  });
});

// Export handlers for serverless
module.exports.health = serverless(app);
module.exports.api = serverless(app);
