'use client' // This directive tells Next.js this is a client-side component

import { useState, useEffect, useRef } from 'react'
import styles from './page.module.css'

export default function Home() {
  // State management for the chat application
  const [userName, setUserName] = useState('') // User's entered name
  const [isConnected, setIsConnected] = useState(false) // WebSocket connection status
  const [nameSet, setNameSet] = useState(false) // Whether server has confirmed the name
  const [messages, setMessages] = useState([]) // Array of chat messages
  const [newMessage, setNewMessage] = useState('') // Current message input
  const [ws, setWs] = useState(null) // WebSocket connection reference
  const [pendingName, setPendingName] = useState('') // Name waiting to be sent after connection
  const messagesEndRef = useRef(null) // Reference to scroll to bottom of messages

  // Function to automatically scroll to the bottom of the messages
  // This ensures users always see the latest messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Effect hook that runs whenever messages array changes
  // Automatically scrolls to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Function to establish WebSocket connection with the backend server
  const connectWebSocket = () => {
    // Create new WebSocket connection to the backend server
    const websocket = new WebSocket('ws://localhost:3001')
    
    // Event handler for when WebSocket connection is established
    websocket.onopen = () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      setWs(websocket) // Store the WebSocket reference for later use
      
      // If there's a pending name waiting to be sent, send it now
      // This handles the case where user entered name before connection was ready
      if (pendingName) {
        console.log('Sending pending name:', pendingName)
        websocket.send(JSON.stringify({
          type: 'setName',
          name: pendingName
        }))
        setPendingName('') // Clear the pending name after sending
      }
    }

    // Event handler for receiving messages from the server
    websocket.onmessage = (event) => {
      try {
        // Parse the JSON message from the server
        const data = JSON.parse(event.data)
        console.log('Received message:', data)
        
        // Handle different types of messages from the server
        switch (data.type) {
          case 'nameSet':
            // Server confirmed that the user's name was set successfully
            console.log('Name set successfully:', data.name)
            setNameSet(true); // Allow user to start chatting
            break
          case 'message':
          case 'userJoined':
          case 'userLeft':
            // Add these messages to the chat display
            setMessages(prev => [...prev, data])
            break
          default:
            console.log('Unknown message type:', data.type)
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    // Event handler for when WebSocket connection is closed
    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
      setNameSet(false) // Reset name status since connection is lost
      setWs(null) // Clear the WebSocket reference
    }

    // Event handler for WebSocket errors
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
      setNameSet(false) // Reset name status on error
    }
  }

  // Function to handle user name submission
  const handleSetName = () => {
    if (userName.trim()) {
      if (!ws) {
        // If no WebSocket connection exists, store the name and create connection
        // The name will be sent once the connection is established
        setPendingName(userName.trim())
        connectWebSocket()
      } else if (ws.readyState === WebSocket.OPEN) {
        // If WebSocket is already connected, send the name immediately
        console.log('Sending setName immediately')
        ws.send(JSON.stringify({
          type: 'setName',
          name: userName.trim()
        }))
      }
    }
  }

  // Function to handle sending a new chat message
  const handleSendMessage = () => {
    if (newMessage.trim() && ws && ws.readyState === WebSocket.OPEN) {
      // Create the message data object
      const messageData = {
        type: 'message',
        message: newMessage.trim()
      }
      console.log('Sending message:', messageData)
      // Send the message to the server via WebSocket
      ws.send(JSON.stringify(messageData))
      setNewMessage('') // Clear the input field after sending
    } else {
      // Log debugging information if message cannot be sent
      console.log('Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        hasWs: !!ws,
        wsState: ws ? ws.readyState : 'no ws'
      })
    }
  }

  // Function to handle Enter key press in input fields
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isConnected || !nameSet) {
        // If not connected or name not set, try to set the name
        handleSetName()
      } else {
        // If connected and name is set, send the message
        handleSendMessage()
      }
    }
  }

  // Function to format timestamps for display
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <h1 className={styles.title}>Chat App</h1>
        
        {/* Conditional rendering based on connection and name status */}
        {!isConnected || !nameSet ? (
          // Show name input form if not connected or name not set
          <div className={styles.nameInput}>
            <h2>Enter your name to join the chat</h2>
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name"
                className={styles.input}
              />
              <button 
                onClick={handleSetName}
                className={styles.button}
                disabled={!userName.trim()} // Disable button if no name entered
              >
                Join Chat
              </button>
            </div>
          </div>
        ) : (
          // Show chat interface if connected and name is set
          <div className={styles.chat}>
            {/* Messages display area */}
            <div className={styles.messages}>
              {messages.map((msg, index) => (
                <div key={index} className={styles.message}>
                  {msg.type === 'message' ? (
                    // Display user messages with name, text, and timestamp
                    <div className={styles.userMessage}>
                      <span className={styles.userName}>{msg.name}</span>
                      <span className={styles.messageText}>{msg.message}</span>
                      <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                    </div>
                  ) : (
                    // Display system messages (user joined/left)
                    <div className={styles.systemMessage}>
                      {msg.message}
                    </div>
                  )}
                </div>
              ))}
              {/* Invisible element for auto-scrolling to bottom */}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input area */}
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={styles.input}
              />
              <button 
                onClick={handleSendMessage}
                className={styles.button}
                disabled={!newMessage.trim()} // Disable button if no message entered
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 