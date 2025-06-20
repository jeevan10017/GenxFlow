// socket.js - Optimized Socket.IO client configuration
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Create socket connection with optimized settings
const socket = io(BACKEND_URL, {
  // Connection options optimized for Render free tier
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
  upgrade: true, // Allow transport upgrades
  rememberUpgrade: true,
  
  // Reconnection settings
  reconnection: true,
  reconnectionAttempts: 5, // Limit reconnection attempts
  reconnectionDelay: 1000, // Start with 1 second delay
  reconnectionDelayMax: 10000, // Max 10 seconds between attempts
  maxReconnectionAttempts: 5,
  
  // Timeout settings for slower connections
  timeout: 30000, // 30 seconds connection timeout
  forceNew: false, // Reuse existing connection if possible
  
  // Polling settings (fallback for websocket)
  polling: {
    extraHeaders: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  
  // Additional options for better performance
  autoConnect: false, // Don't auto-connect, we'll control this
  withCredentials: true, // Include credentials for CORS
  
  // Optimize for Render's free tier limitations
  pingTimeout: 25000, // Reduced ping timeout
  pingInterval: 10000, // More frequent pings to keep connection alive
});

// Connection event handlers
socket.on('connect', () => {
  console.log('Connected to server:', socket.id);
  // Clear any previous error states
  socket.emit('clientReady');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server:', reason);
  
  // Handle different disconnect reasons
  if (reason === 'io server disconnect') {
    // Server disconnected us, try to reconnect
    socket.connect();
  }
  // For other reasons, socket.io will automatically try to reconnect
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
  
  // Handle specific connection errors
  if (error.message.includes('CORS')) {
    console.error('CORS error - check server configuration');
  } else if (error.message.includes('timeout')) {
    console.error('Connection timeout - server may be sleeping');
  }
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect after maximum attempts');
  // You might want to show a user notification here
});

// Handle Render's free tier server sleeping
socket.on('serverMessage', (data) => {
  if (data.type === 'warning') {
    console.warn('Server message:', data.message);
  }
});

// Utility functions for better connection management
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const isSocketConnected = () => {
  return socket.connected;
};

// Throttled emit functions to reduce server load
let lastCanvasUpdate = 0;
const CANVAS_UPDATE_THROTTLE = 50; // 50ms

export const emitCanvasUpdate = (data) => {
  const now = Date.now();
  if (now - lastCanvasUpdate >= CANVAS_UPDATE_THROTTLE) {
    socket.emit('canvasUpdate', data);
    lastCanvasUpdate = now;
  }
};

let lastCursorUpdate = 0;
const CURSOR_UPDATE_THROTTLE = 100; // 100ms

export const emitCursorUpdate = (data) => {
  const now = Date.now();
  if (now - lastCursorUpdate >= CURSOR_UPDATE_THROTTLE) {
    socket.emit('userCursor', data);
    lastCursorUpdate = now;
  }
};

// Safe emit function with connection check
export const safeEmit = (event, data) => {
  if (socket.connected) {
    socket.emit(event, data);
  } else {
    console.warn(`Cannot emit ${event}: socket not connected`);
    // Optionally queue the event to send when reconnected
  }
};

export default socket;