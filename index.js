require('dotenv').config();
const express = require('express');
const { initializeBot, handleWebhook } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  console.log('Health check endpoint hit');
  res.json({ 
    status: 'OK', 
    message: 'Telegram Watermark Bot is running',
    timestamp: new Date().toISOString()
  });
});

// Webhook endpoint for Telegram
app.post('/webhook', handleWebhook);

// Initialize bot and start server
async function startServer() {
  try {
    await initializeBot();
    
    app.listen(PORT, () => {
      console.log(`🚀 Bot server running on port ${PORT}`);
      console.log(`📡 Webhook URL: ${process.env.WEBHOOK_URL || 'Not set'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer(); 