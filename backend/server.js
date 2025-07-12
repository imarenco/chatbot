const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Store connected users
const users = new Map();

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  let userName = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message from client:', data);
      
      switch (data.type) {
        case 'setName':
          userName = data.name;
          users.set(ws, userName);
          
          // Send confirmation to the user
          ws.send(JSON.stringify({
            type: 'nameSet',
            name: userName
          }));
          
          // Broadcast user joined message
          broadcastMessage({
            type: 'userJoined',
            name: userName,
            message: `${userName} joined the chat`
          });
          
          console.log(`User ${userName} joined the chat`);
          break;
          
        case 'message':
          if (userName) {
            const messageData = {
              type: 'message',
              name: userName,
              message: data.message,
              timestamp: new Date().toISOString()
            };
            
            // Broadcast message to all connected clients
            broadcastMessage(messageData);
            console.log(`Broadcasting message from ${userName}: ${data.message}`);
          } else {
            console.log('Message received but user not set');
          }
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    if (userName) {
      users.delete(ws);
      
      // Broadcast user left message
      broadcastMessage({
        type: 'userLeft',
        name: userName,
        message: `${userName} left the chat`
      });
      
      console.log(`User ${userName} disconnected`);
    }
  });
});

// Function to broadcast messages to all connected clients
function broadcastMessage(message) {
  console.log('Broadcasting message to all clients:', message);
  let clientCount = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      clientCount++;
    }
  });
  console.log(`Message sent to ${clientCount} clients`);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connectedUsers: users.size,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
}); 