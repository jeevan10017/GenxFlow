const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const userRoutes = require('./routes/userRoutes');
const canvasRoutes = require('./routes/canvasRoutes');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app); 

// Attach Socket.IO to the server
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Add connection configuration
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e8 // 100MB for large canvas data
});

// Store room information and user data
const rooms = new Map();
const userRooms = new Map(); // Track which room each user is in

// Helper function to safely serialize canvas data
const sanitizeCanvasData = (data) => {
  if (!data) return data;
  
  try {
    // If elements array exists, clean it
    if (data.elements && Array.isArray(data.elements)) {
      data.elements = data.elements.map(element => {
        const cleanElement = { ...element };
        
        // Remove non-serializable properties
        if (cleanElement.path && typeof cleanElement.path === 'object') {
          delete cleanElement.path;
        }
        
        // Ensure stroke and fill are strings
        if (typeof cleanElement.stroke === 'object') {
          cleanElement.stroke = '#000000';
        }
        if (typeof cleanElement.fill === 'object') {
          cleanElement.fill = 'transparent';
        }
        
        return cleanElement;
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error sanitizing canvas data:', error);
    return { ...data, elements: [] }; // Return safe fallback
  }
};

// Helper function to get room users
const getRoomUsers = (roomId) => {
  const room = rooms.get(roomId);
  return room ? Array.from(room.users.values()) : [];
};

// Helper function to add user to room
const addUserToRoom = (roomId, socketId, userData = {}) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      lastActivity: Date.now(),
      lastCanvasUpdate: null // Track last canvas state
    });
  }
  
  const room = rooms.get(roomId);
  room.users.set(socketId, {
    id: socketId,
    joinTime: Date.now(),
    ...userData
  });
  room.lastActivity = Date.now();
  
  userRooms.set(socketId, roomId);
};

// Helper function to remove user from room
const removeUserFromRoom = (roomId, socketId) => {
  if (rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.users.delete(socketId);
    
    // Clean up empty rooms
    if (room.users.size === 0) {
      rooms.delete(roomId);
    } else {
      room.lastActivity = Date.now();
    }
  }
  
  userRooms.delete(socketId);
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle joining a canvas room
  socket.on('joinRoom', (roomId) => {
    try {
      // Validate roomId
      if (!roomId || typeof roomId !== 'string') {
        socket.emit('error', { message: 'Invalid room ID' });
        return;
      }

      // Leave previous room if any
      const previousRoom = userRooms.get(socket.id);
      if (previousRoom && previousRoom !== roomId) {
        socket.leave(previousRoom);
        removeUserFromRoom(previousRoom, socket.id);
        
        // Notify previous room about user leaving
        socket.to(previousRoom).emit('userLeft', {
          userId: socket.id,
          timestamp: Date.now()
        });
      }

      // Join new room
      socket.join(roomId);
      addUserToRoom(roomId, socket.id, {
        userName: `User-${socket.id.slice(-6)}` // Generate a simple username
      });

      console.log(`User ${socket.id} joined room ${roomId}`);

      // Send current room users to the joining user
      const roomUsers = getRoomUsers(roomId);
      socket.emit('roomUsers', roomUsers);

      // Send last canvas state if available
      const room = rooms.get(roomId);
      if (room && room.lastCanvasUpdate) {
        socket.emit('canvasUpdate', sanitizeCanvasData(room.lastCanvasUpdate));
      }

      // Notify other users in the room about the new user
      socket.to(roomId).emit('userJoined', {
        userId: socket.id,
        userName: `User-${socket.id.slice(-6)}`,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Handle leaving a room
  socket.on('leaveRoom', (roomId) => {
    try {
      if (!roomId) return;
      
      socket.leave(roomId);
      removeUserFromRoom(roomId, socket.id);

      console.log(`User ${socket.id} left room ${roomId}`);

      // Notify other users in the room
      socket.to(roomId).emit('userLeft', {
        userId: socket.id,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Handle canvas updates
  socket.on('canvasUpdate', (data) => {
    try {
      const { roomId, type, elements, timestamp, ...updateData } = data;
      
      if (!roomId) {
        console.error('No roomId provided for canvas update');
        return;
      }

      // Sanitize the canvas data before broadcasting
      const sanitizedData = sanitizeCanvasData({
        type,
        elements,
        timestamp: timestamp || Date.now(),
        userId: socket.id,
        ...updateData
      });

      // Update room activity and store last canvas state
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.lastActivity = Date.now();
        
        // Store the last complete canvas state for new users
        if (elements && Array.isArray(elements) && elements.length > 0) {
          room.lastCanvasUpdate = sanitizedData;
        }
      }

      // Broadcast to all others in the room (excluding sender)
      socket.to(roomId).emit('canvasUpdate', sanitizedData);

      console.log(`Canvas update in room ${roomId}: ${type} (${elements ? elements.length : 0} elements)`);

    } catch (error) {
      console.error('Error handling canvas update:', error);
      // Send error back to client
      socket.emit('error', { 
        message: 'Failed to process canvas update',
        details: error.message 
      });
    }
  });

  // Handle user cursor movements
  socket.on('userCursor', (data) => {
    try {
      const { roomId, x, y, action, timestamp } = data;
      
      if (!roomId) {
        console.error('No roomId provided for cursor update');
        return;
      }

      // Validate cursor data
      if (typeof x !== 'number' || typeof y !== 'number') {
        return; // Ignore invalid cursor data
      }

      // Broadcast cursor position to others in the room
      socket.to(roomId).emit('userCursor', {
        userId: socket.id,
        x: Math.round(x), // Round to reduce data size
        y: Math.round(y),
        action,
        timestamp: timestamp || Date.now()
      });

    } catch (error) {
      console.error('Error handling cursor update:', error);
    }
  });

  // Handle user disconnect
  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, 'Reason:', reason);
    
    // Clean up user from any rooms
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      removeUserFromRoom(roomId, socket.id);
      
      // Notify room about user leaving
      socket.to(roomId).emit('userLeft', {
        userId: socket.id,
        timestamp: Date.now()
      });
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error for user', socket.id, ':', error);
  });

  // Handle ping/pong for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  // Handle client errors
  socket.on('clientError', (error) => {
    console.error('Client error reported by', socket.id, ':', error);
  });
});

// Optional: Clean up inactive rooms periodically
setInterval(() => {
  const now = Date.now();
  const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  for (const [roomId, room] of rooms.entries()) {
    if (now - room.lastActivity > INACTIVE_TIMEOUT && room.users.size === 0) {
      rooms.delete(roomId);
      console.log(`Cleaned up inactive room: ${roomId}`);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/canvas', canvasRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running', 
    timestamp: new Date(),
    activeRooms: rooms.size,
    totalConnections: io.engine.clientsCount
  });
});

// Socket.IO status endpoint
app.get('/api/socket-status', (req, res) => {
  const roomStats = Array.from(rooms.entries()).map(([roomId, room]) => ({
    roomId,
    userCount: room.users.size,
    lastActivity: new Date(room.lastActivity),
    hasCanvasData: !!room.lastCanvasUpdate,
    users: Array.from(room.users.values()).map(user => ({
      id: user.id,
      joinTime: new Date(user.joinTime),
      userName: user.userName
    }))
  }));

  res.status(200).json({
    totalRooms: rooms.size,
    totalConnections: io.engine.clientsCount,
    rooms: roomStats
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route2 not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Socket.IO server initialized for real-time collaboration');
});