# Overview - Chat App

A real-time chat application built with Next.js frontend and Node.js backend using WebSocket communication.

[Software Demo Video](http://youtube.link.goes.here)

## Features

- Real-time messaging using WebSocket
- User name registration
- Live user join/leave notifications
- Modern and responsive UI
- Message timestamps
- Auto-scroll to latest messages

## Project Structure

```
chatapp/
├── backend/           # Node.js WebSocket server
│   ├── package.json
│   └── server.js
├── frontend/          # Next.js React application
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── page.module.css
│   ├── package.json
│   └── next.config.js
├── package.json       # Root package.json for scripts
└── README.md
```

# Development Environment

- Node.js (version 16 or higher)
- npm

## Installation

1. Clone or download this project
2. Install all dependencies:

```bash
npm run install:all
```

This will install dependencies for:
- Root project (concurrently for running both servers)
- Backend (Express, WebSocket, CORS)
- Frontend (Next.js, React)

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`

### Running Separately

If you prefer to run them separately:

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Enter your name in the input field and click "Join Chat"
3. Start sending messages! All connected users will see your messages in real-time
4. You'll see notifications when other users join or leave the chat

## How It Works

### Backend (WebSocket Server)
- Runs on port 3001
- Handles WebSocket connections
- Manages user sessions and message broadcasting
- Provides REST endpoints for health checks

### Frontend (Next.js App)
- Modern React application with hooks
- Real-time WebSocket communication
- Responsive design with CSS modules
- Auto-scrolling message container

### Message Types
- `setName`: User registration
- `message`: Chat messages
- `userJoined`: User join notifications
- `userLeft`: User leave notifications

## API Endpoints

- `GET /health`: Health check endpoint
- `WebSocket ws://localhost:3001`: Real-time communication

## Technologies Used

- **Backend**: Node.js, Express, WebSocket (ws)
- **Frontend**: Next.js 14, React 18
- **Styling**: CSS Modules
- **Development**: Concurrently for running multiple servers

## Customization

You can customize the application by:

1. **Changing the WebSocket URL**: Update the WebSocket connection URL in `frontend/app/page.js`
2. **Modifying styles**: Edit `frontend/app/page.module.css`
3. **Adding features**: Extend the WebSocket message types in both frontend and backend
4. **Changing ports**: Update the port numbers in the respective configuration files

## Troubleshooting

- **WebSocket connection failed**: Make sure the backend server is running on port 3001
- **Frontend not loading**: Check if the Next.js development server is running on port 3000
- **Messages not appearing**: Verify WebSocket connection status in browser console


# Useful Websites

- [Websocket Library](https://github.com/websockets/ws)
- [NodeJS](https://nodejs.org/en)
- [NextJS](https://nextjs.org/)
- [ReactJS](https://react.dev/)
- [Javascript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)


# Future Work
- Improve styles.
- Add your own name in chat app.
- be able to send emojis.


## License

MIT License 