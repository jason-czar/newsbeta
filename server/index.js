import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { calculateMarketImpact } from './marketImpact.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables before any other operations
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

if (!process.env.OPENAI_API_KEY || !process.env.TELEGRAM_BOT_TOKEN) {
  console.error('Required environment variables are missing. Please check your .env file.');
  process.exit(1);
}

const app = express();
app.use(cors());

const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Store connected WebSocket clients
const clients = new Set();

// Initialize Telegram bot with token from environment variable and disable polling initially
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: false,
  filepath: false // Disable file download
});

const channels = [
  '@ournewsfeedtoday',
  '@Damhistory',
  '@ClashReport'
];

let isPolling = false;

// Function to start bot polling with error handling
async function startBotPolling() {
  if (isPolling) return;
  
  try {
    isPolling = true;
    await bot.stopPolling();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for previous polling to fully stop
    
    bot.startPolling({
      restart: false,
      timeout: 30
    });

    console.log('Bot polling started successfully');

    bot.on('polling_error', (error) => {
      console.error('Polling error:', error.message);
      if (error.code === 'ETELEGRAM' && error.message.includes('terminated by other getUpdates')) {
        restartBotPolling();
      }
    });

  } catch (error) {
    console.error('Error starting bot polling:', error);
    isPolling = false;
    setTimeout(startBotPolling, 5000); // Retry after 5 seconds
  }
}

async function restartBotPolling() {
  isPolling = false;
  try {
    await bot.stopPolling();
    await new Promise(resolve => setTimeout(resolve, 1000));
    startBotPolling();
  } catch (error) {
    console.error('Error restarting bot polling:', error);
  }
}

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);
  
  // Send initial connection confirmation
  ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));
  
  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    ws.close();
  });
});

// Broadcast message to all connected clients
function broadcast(message) {
  clients.forEach(client => {
    if (client.readyState === 1) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error broadcasting to client:', error);
        client.close();
      }
    }
  });
}

// Handle incoming channel messages
bot.on('channel_post', async (msg) => {
  if (channels.includes('@' + msg.chat.username)) {
    try {
      const marketImpact = await calculateMarketImpact(msg.text);
      
      const newsItem = {
        id: msg.message_id.toString(),
        source: msg.chat.title,
        content: msg.text,
        timestamp: new Date(msg.date * 1000),
        marketImpactScore: marketImpact.score,
        category: marketImpact.category
      };
      
      broadcast(newsItem);
    } catch (error) {
      console.error('Error processing channel message:', error);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connections: clients.size,
    botPolling: isPolling
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startBotPolling(); // Start bot polling after server is ready
});