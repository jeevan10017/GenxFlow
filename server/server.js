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

// Improved CORS configuration for production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://virtual-canvas.vercel.app',
  'https://virtual-canvas.vercel.app/', // Handle trailing slash
  'http://localhost:3000', // For local development
  'http://localhost:3001'
].filter(Boolean); // Remove undefined values

// Attach Socket.IO to the server with optimized settings for Render
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      // Remove trailing slash for comparison
      const normalizedOrigin = origin.replace(/\/$/, '');
      const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ''));
      
      if (normalizedAllowed.includes(normalizedOrigin)) {
        return callback(null, true);
      }
      
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Optimized settings for Render free tier
  pingTimeout: 30000, // Reduced from 60000
  pingInterval: 15000, // Reduced from 25000
  maxHttpBufferSize: 5e6, // Reduced to 5MB from 100MB
  transports: ['websocket', 'polling'], // Prefer websocket
  upgradeTimeout: 30000, // 30 seconds to upgrade
  allowEIO3: true, // Allow Engine.IO v3 clients
  // Add compression for better performance on limited bandwidth
  compression: true,
  // Reduce memory usage
  perMessageDeflate: {
    threshold: 1024,
    concurrencyLimit: 10,
    serverMaxWindowBits: 13
  }
});

// Store room information and user data with memory optimization
const rooms = new Map();
const userRooms = new Map();
const MAX_ROOMS = 50; // Limit rooms to prevent memory issues
const MAX_ELEMENTS_PER_CANVAS = 1000; // Limit canvas elements

// Enhanced helper function to safely serialize canvas data
const sanitizeCanvasData = (data) => {
  if (!data) return data;
  
  try {
    let cleanData = { ...data };
    
    // If elements array exists, clean and limit it
    if (cleanData.elements && Array.isArray(cleanData.elements)) {
      // Limit number of elements to prevent memory issues
      if (cleanData.elements.length > MAX_ELEMENTS_PER_CANVAS) {
        cleanData.elements = cleanData.elements.slice(-MAX_ELEMENTS_PER_CANVAS);
        console.warn(`Canvas elements limited to ${MAX_ELEMENTS_PER_CANVAS} for memory optimization`);
      }
      
      cleanData.elements = cleanData.elements.map(element => {
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
        
        // Remove unnecessary properties to reduce payload size
        delete cleanElement.seed;
        delete cleanElement.versionNonce;
        
        return cleanElement;
      });
    }
    
    return cleanData;
  } catch (error) {
    console.error('Error sanitizing canvas data:', error);
    return { ...data, elements: [] };
  }
};

// Enhanced room management with memory limits
const addUserToRoom = (roomId, socketId, userData = {}) => {
  // Limit number of rooms to prevent memory issues on free tier
  if (!rooms.has(roomId) && rooms.size >= MAX_ROOMS) {
    // Remove oldest inactive room
    const oldestRoom = Array.from(rooms.entries())
      .filter(([_, room]) => room.users.size === 0)
      .sort((a, b) => a[1].lastActivity - b[1].lastActivity)[0];
    
    if (oldestRoom) {
      rooms.delete(oldestRoom[0]);
      console.log(`Removed oldest inactive room: ${oldestRoom[0]}`);
    }
  }
  
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      lastActivity: Date.now(),
      lastCanvasUpdate: null,
      createdAt: Date.now()
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

const removeUserFromRoom = (roomId, socketId) => {
  if (rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.users.delete(socketId);
    
    // Clean up empty rooms immediately to save memory
    if (room.users.size === 0) {
      rooms.delete(roomId);
      console.log(`Cleaned up empty room: ${roomId}`);
    } else {
      room.lastActivity = Date.now();
    }
  }
  
  userRooms.delete(socketId);
};

const getRoomUsers = (roomId) => {
  const room = rooms.get(roomId);
  return room ? Array.from(room.users.values()) : [];
};

// Connection handling with enhanced error management
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle connection timeout for Render's limitations
  const connectionTimeout = setTimeout(() => {
    if (socket.connected) {
      socket.emit('serverMessage', { 
        type: 'warning', 
        message: 'Connection will be optimized for free tier limitations' 
      });
    }
  }, 1000);

  socket.on('joinRoom', (roomId) => {
    try {
      clearTimeout(connectionTimeout);
      
      if (!roomId || typeof roomId !== 'string' || roomId.length > 50) {
        socket.emit('error', { message: 'Invalid room ID' });
        return;
      }

      const previousRoom = userRooms.get(socket.id);
      if (previousRoom && previousRoom !== roomId) {
        socket.leave(previousRoom);
        removeUserFromRoom(previousRoom, socket.id);
        socket.to(previousRoom).emit('userLeft', {
          userId: socket.id,
          timestamp: Date.now()
        });
      }

      socket.join(roomId);
      addUserToRoom(roomId, socket.id, {
        userName: `User-${socket.id.slice(-6)}`
      });

      console.log(`User ${socket.id} joined room ${roomId}`);

      const roomUsers = getRoomUsers(roomId);
      socket.emit('roomUsers', roomUsers);

      const room = rooms.get(roomId);
      if (room && room.lastCanvasUpdate) {
        socket.emit('canvasUpdate', sanitizeCanvasData(room.lastCanvasUpdate));
      }

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

  socket.on('leaveRoom', (roomId) => {
    try {
      if (!roomId) return;
      
      socket.leave(roomId);
      removeUserFromRoom(roomId, socket.id);

      socket.to(roomId).emit('userLeft', {
        userId: socket.id,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error leaving room:', error);
    }
  });

  // Optimized canvas update handling with throttling
  let lastCanvasUpdate = 0;
  const CANVAS_UPDATE_THROTTLE = 50; // 50ms throttle

  socket.on('canvasUpdate', (data) => {
    try {
      const now = Date.now();
      if (now - lastCanvasUpdate < CANVAS_UPDATE_THROTTLE) {
        return; // Throttle updates to reduce server load
      }
      lastCanvasUpdate = now;

      const { roomId, type, elements, timestamp, ...updateData } = data;
      
      if (!roomId) {
        console.error('No roomId provided for canvas update');
        return;
      }

      const sanitizedData = sanitizeCanvasData({
        type,
        elements,
        timestamp: timestamp || Date.now(),
        userId: socket.id,
        ...updateData
      });

      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        room.lastActivity = Date.now();
        
        if (elements && Array.isArray(elements) && elements.length > 0) {
          room.lastCanvasUpdate = sanitizedData;
        }
      }

      socket.to(roomId).emit('canvasUpdate', sanitizedData);

    } catch (error) {
      console.error('Error handling canvas update:', error);
      socket.emit('error', { 
        message: 'Failed to process canvas update',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Update failed'
      });
    }
  });

  // Throttled cursor updates
  let lastCursorUpdate = 0;
  const CURSOR_UPDATE_THROTTLE = 100; // 100ms throttle

  socket.on('userCursor', (data) => {
    try {
      const now = Date.now();
      if (now - lastCursorUpdate < CURSOR_UPDATE_THROTTLE) {
        return;
      }
      lastCursorUpdate = now;

      const { roomId, x, y, action, timestamp } = data;
      
      if (!roomId || typeof x !== 'number' || typeof y !== 'number') {
        return;
      }

      socket.to(roomId).emit('userCursor', {
        userId: socket.id,
        x: Math.round(x),
        y: Math.round(y),
        action,
        timestamp: timestamp || Date.now()
      });

    } catch (error) {
      console.error('Error handling cursor update:', error);
    }
  });

  socket.on('disconnect', (reason) => {
    clearTimeout(connectionTimeout);
    console.log('User disconnected:', socket.id, 'Reason:', reason);
    
    const roomId = userRooms.get(socket.id);
    if (roomId) {
      removeUserFromRoom(roomId, socket.id);
      socket.to(roomId).emit('userLeft', {
        userId: socket.id,
        timestamp: Date.now()
      });
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error for user', socket.id, ':', error);
  });

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
});

// More aggressive cleanup for free tier
setInterval(() => {
  const now = Date.now();
  const INACTIVE_TIMEOUT = 10 * 60 * 1000; // Reduced to 10 minutes

  for (const [roomId, room] of rooms.entries()) {
    if (now - room.lastActivity > INACTIVE_TIMEOUT) {
      if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`Cleaned up inactive room: ${roomId}`);
      } else {
        // Clear canvas data for inactive rooms to save memory
        room.lastCanvasUpdate = null;
      }
    }
  }
  
  // Force garbage collection if available (for debugging)
  if (global.gc && rooms.size === 0) {
    global.gc();
  }
}, 2 * 60 * 1000); // Run every 2 minutes

// Enhanced CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ''));
    
    if (normalizedAllowed.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '5mb' })); // Reduced limit
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/canvas', canvasRoutes);

// Enhanced health check with memory info
app.get('/api/health', (req, res) => {
  const memUsage = process.memoryUsage();
  res.status(200).json({ 
    message: 'Server is running', 
    timestamp: new Date(),
    activeRooms: rooms.size,
    totalConnections: io.engine.clientsCount,
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
    },
    uptime: Math.round(process.uptime()) + 's'
  });
});

app.get('/api/socket-status', (req, res) => {
  const roomStats = Array.from(rooms.entries()).map(([roomId, room]) => ({
    roomId: roomId.length > 20 ? roomId.substring(0, 20) + '...' : roomId,
    userCount: room.users.size,
    lastActivity: new Date(room.lastActivity),
    hasCanvasData: !!room.lastCanvasUpdate,
    age: Math.round((Date.now() - room.createdAt) / 1000) + 's'
  }));

  res.status(200).json({
    totalRooms: rooms.size,
    totalConnections: io.engine.clientsCount,
    rooms: roomStats,
    serverStats: {
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }
  });
});

// Enhanced error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    message: 'Server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown handling for Render
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log('Socket.IO server optimized for Render free tier');
});