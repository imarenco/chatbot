'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './page.module.css'

export default function Home() {
  const [userName, setUserName] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [nameSet, setNameSet] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [ws, setWs] = useState(null)
  const [pendingName, setPendingName] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectWebSocket = () => {
    const websocket = new WebSocket('ws://localhost:3001')
    
    websocket.onopen = () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
      setWs(websocket) // Set the WebSocket reference when connection is open
      
      // If there's a pending name, send it now that we're connected
      if (pendingName) {
        console.log('Sending pending name:', pendingName)
        websocket.send(JSON.stringify({
          type: 'setName',
          name: pendingName
        }))
        setPendingName('')
      }
    }

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received message:', data)
        
        switch (data.type) {
          case 'nameSet':
            console.log('Name set successfully:', data.name)
            setNameSet(true);
            break
          case 'message':
          case 'userJoined':
          case 'userLeft':
            setMessages(prev => [...prev, data])
            break
          default:
            console.log('Unknown message type:', data.type)
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    websocket.onclose = () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
      setNameSet(false)
      setWs(null)
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsConnected(false)
      setNameSet(false)
    }
  }

  const handleSetName = () => {
    if (userName.trim()) {
      if (!ws) {
        // Store the name to send when connection is established
        setPendingName(userName.trim())
        connectWebSocket()
      } else if (ws.readyState === WebSocket.OPEN) {
        // If WebSocket is already connected, send name immediately
        console.log('Sending setName immediately')
        ws.send(JSON.stringify({
          type: 'setName',
          name: userName.trim()
        }))
      }
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() && ws && ws.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'message',
        message: newMessage.trim()
      }
      console.log('Sending message:', messageData)
      ws.send(JSON.stringify(messageData))
      setNewMessage('')
    } else {
      console.log('Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        hasWs: !!ws,
        wsState: ws ? ws.readyState : 'no ws'
      })
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!isConnected || !nameSet) {
        handleSetName()
      } else {
        handleSendMessage()
      }
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatContainer}>
        <h1 className={styles.title}>Chat App</h1>
        
        {!isConnected || !nameSet ? (
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
                disabled={!userName.trim()}
              >
                Join Chat
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.chat}>
            <div className={styles.messages}>
              {messages.map((msg, index) => (
                <div key={index} className={styles.message}>
                  {msg.type === 'message' ? (
                    <div className={styles.userMessage}>
                      <span className={styles.userName}>{msg.name}</span>
                      <span className={styles.messageText}>{msg.message}</span>
                      <span className={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                    </div>
                  ) : (
                    <div className={styles.systemMessage}>
                      {msg.message}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
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
                disabled={!newMessage.trim()}
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