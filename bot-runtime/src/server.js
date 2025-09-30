const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'bot-runtime',
    version: '1.0.0',
  });
});

// Basic info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'TelegramBot Constructor - Bot Runtime',
    version: '1.0.0',
    description: 'Service for running user-created Telegram bots',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🤖 Bot Runtime service running on port ${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});
