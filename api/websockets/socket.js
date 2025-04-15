// websockets/socket.js
import { WebSocketServer } from 'ws';
import { 
  handleChatMessage, 
  handleAuthentication, 
  handleTyping, 
  handleUserStatus,
  handleDisconnect
} from './handlers/messageHandler.js';

import {
  handleVideoAssigned,
  handleVideoEdited,
  handleRevisionRequested,
  handleVideoPublished
} from './handlers/notificationHandler.js';

// Store authenticated clients with their user IDs
const clients = new Map();

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  // ✅ Log when WebSocket server is up
  console.log('✅ WebSocket server is up and listening for connections');

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data.type);
        
        switch (data.type) {
          case 'auth':
            handleAuthentication(ws, data, clients);
            break;
          case 'message':
            await handleChatMessage(ws, data, clients);
            break;
          case 'typing':
            handleTyping(data, clients);
            break;
          case 'get_user_status':
            handleUserStatus(ws, data, clients);
            break;
          // Notification handlers
          case 'video_assigned':
            await handleVideoAssigned(data, clients);
            break;
          case 'video_edited':
            await handleVideoEdited(data, clients);
            break;
          case 'revision_requested':
            await handleRevisionRequested(data, clients);
            break;
          case 'video_published':
            await handleVideoPublished(data, clients);
            break;
        }
      } catch (error) {
        console.error('❌ Error processing WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Failed to process message'
        }));
      }
    });

    ws.on('close', () => {
      handleDisconnect(ws.userId, clients);
    });

    ws.on('error', (error) => {
      console.error('⚠️ WebSocket error:', error);
    });
    
    // Send initial ping to keep connection alive
    ws.send(JSON.stringify({ type: 'ping' }));
    
    // Set up keep-alive pings every 30 seconds
    const pingInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  global.wsClients = clients;
  return wss;
};

// Helper function to send to a specific client
export const sendToClient = (userId, data) => {
  const ws = global.wsClients?.get(userId);
  if (ws) {
    ws.send(JSON.stringify(data));
    return true;
  }
  return false;
};

// Helper to broadcast to all clients
export const broadcastToAll = (data, excludeUserId = null) => {
  if (!global.wsClients) return;
  
  global.wsClients.forEach((ws, userId) => {
    if (excludeUserId !== userId && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
};