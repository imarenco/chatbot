// Import required dependencies
const express = require('express');
const http = require('http');
const WebSocket = require('ws'); // WebSocket library for real-time communication
const cors = require('cors'); // Enable Cross-Origin Resource Sharing

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Create WebSocket server attached to the HTTP server
// This allows both HTTP and WebSocket connections on the same port
const wss = new WebSocket.Server({ server });

// Middleware setup
app.use(cors()); // Allow cross-origin requests from frontend
app.use(express.json()); // Parse JSON request bodies

// Store connected users with WebSocket connection as key and username as value
// This allows us to track which user is connected to which WebSocket
const users = new Map();

// WebSocket connection handling - triggered when a new client connects
wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Track the username for this specific WebSocket connection
  // This ensures messages are attributed to the correct user
  let userName = null;

  // Handle incoming messages from this client
  ws.on('message', (message) => {
    try {
      // Parse the JSON message from the client
      const data = JSON.parse(message);
      console.log('Received message from client:', data);
      
      // Handle different types of messages based on their 'type' field
      switch (data.type) {
        case 'setName':
          // Client is setting their username
          userName = data.name;
          users.set(ws, userName); // Store the username for this connection
          
          // Send confirmation back to the client that their name was set
          ws.send(JSON.stringify({
            type: 'nameSet',
            name: userName
          }));
          
          // Notify all other clients that a new user joined
          broadcastMessage({
            type: 'userJoined',
            name: userName,
            message: `${userName} joined the chat`
          });
          
          console.log(`User ${userName} joined the chat`);
          break;
          
        case 'message':
          // Client is sending a chat message
          if (userName) {
            // Only allow messages if the user has set their name
            const messageData = {
              type: 'message',
              name: userName,
              message: data.message,
              timestamp: new Date().toISOString() // Add timestamp for message ordering
            };
            
            // Broadcast the message to all connected clients
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

  // Handle client disconnection
  ws.on('close', () => {
    if (userName) {
      // Remove the user from our tracking map
      users.delete(ws);
      
      // Notify all other clients that this user left
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
// This ensures all users see the same messages in real-time
function broadcastMessage(message) {
  console.log('Broadcasting message to all clients:', message);
  let clientCount = 0;
  
  // Iterate through all connected WebSocket clients
  wss.clients.forEach((client) => {
    // Only send to clients that are still connected and ready
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      clientCount++;
    }
  });
  console.log(`Message sent to ${clientCount} clients`);
}

// Health check endpoint - useful for monitoring server status
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    connectedUsers: users.size, // Number of currently connected users
    timestamp: new Date().toISOString()
  });
});

// Set the port from environment variable or default to 3001
const PORT = process.env.PORT || 3001;

// Start the server and listen for connections
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
}); 