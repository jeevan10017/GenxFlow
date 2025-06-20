import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Board from '../components/Board';
import Toolbar from '../components/Toolbar';
import Toolbox from '../components/Toolbox';
import BoardProvider from '../store/BoardProvider';
import ToolboxProvider from '../store/toolboxProvider';
import socket from '../utils/socket';
import RightSidebar from '../components/RightSidebar';

function CanvasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
      const BackendURL = process.env.REACT_APP_BACKEND_URL;
    // Socket.IO connection setup
    const connectSocket = () => {
      // Connect the socket
      socket.connect();

      // Socket event listeners
      socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
        setIsConnected(true);
        
        // Join the canvas room for real-time collaboration
        socket.emit('joinRoom', id);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        setConnectedUsers([]);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });
      // Listen for canvas updates from other users
      socket.on('canvasUpdate', (data) => {
        console.log('Received canvas update:', data);
        
        // Handle the canvas update using the BoardProvider's handler
        if (window.boardProviderHandlers && window.boardProviderHandlers[id]) {
          window.boardProviderHandlers[id].handleRemoteUpdate(data);
        }
      });

      // Listen for user cursor movements
      socket.on('userCursor', (data) => {
        console.log('User cursor update:', data);
        // You can implement cursor visualization here
        // For now, just log it
      });

      // Listen for user join/leave notifications
      socket.on('userJoined', (data) => {
        console.log('User joined:', data);
        setConnectedUsers(prev => {
          if (!prev.find(user => user.id === data.userId)) {
            return [...prev, { id: data.userId, name: data.userName || 'Anonymous' }];
          }
          return prev;
        });
      });

      socket.on('userLeft', (data) => {
        console.log('User left:', data);
        setConnectedUsers(prev => prev.filter(user => user.id !== data.userId));
      });

      // Listen for room users list (when joining)
      socket.on('roomUsers', (users) => {
        console.log('Room users:', users);
        setConnectedUsers(users);
      });
    };

    const loadCanvas = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${BackendURL}/api/canvas/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCanvas(res.data);
        
        // Connect socket after canvas is loaded
        connectSocket();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load canvas');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCanvas();

    // Cleanup function
    return () => {
      // Leave the room and disconnect socket when component unmounts
      if (socket.connected) {
        socket.emit('leaveRoom', id);
        socket.disconnect();
      }
      
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('canvasUpdate');
      socket.off('userCursor');
      socket.off('userJoined');
      socket.off('userLeft');
      socket.off('roomUsers');

      // Clean up global handlers
      if (window.boardProviderHandlers) {
        delete window.boardProviderHandlers[id];
      }
    };
  }, [id, token, navigate]);

  // Function to emit canvas updates to other users
  const handleCanvasUpdate = useCallback((updateData) => {
    if (socket.connected) {
      socket.emit('canvasUpdate', {
        roomId: id,
        userId: socket.id,
        timestamp: Date.now(),
        ...updateData
      });
    }
  }, [id]);

  // Function to emit cursor position
  const handleCursorMove = useCallback((cursorData) => {
    if (socket.connected) {
      socket.emit('userCursor', {
        roomId: id,
        userId: socket.id,
        timestamp: Date.now(),
        ...cursorData
      });
    }
  }, [id]);

  // Save canvas to server periodically or on significant changes
    const BackendURL = process.env.REACT_APP_BACKEND_URL;  const saveCanvasToServer = useCallback(async (elements) => {
    try {
      await axios.put(
        `${BackendURL}/api/canvas/${id}`,
        { elements },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Canvas saved to server');
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  }, [id, token]);

  // Auto-save every 10 seconds if there are changes
  useEffect(() => {
    if (!canvas || !isConnected) return;

    const autoSaveInterval = setInterval(() => {
      // Get current elements from BoardProvider
      if (window.boardProviderHandlers && window.boardProviderHandlers[id]) {

      }
    }, 10000);

    return () => clearInterval(autoSaveInterval);
  }, [canvas, isConnected, saveCanvasToServer, id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
         <div className="relative"> <svg className="w-8 h-8 animate-bounce" viewBox="0 0 24 24" fill="none"> <path d="M12 19l7-7 3 3-7 7-3-3z" fill="currentColor" className="text-yellow-400"/> <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" fill="currentColor" className="text-gray-600"/> </svg> <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"> <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div> </div> </div>
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Canvas</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Canvas not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 relative">
      {/* Connection Status and User Count */}
      <div className="absolute top-4 left-4 z-50 flex flex-col space-y-2">
        {/* Connection Status */}
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
          isConnected 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {/* Connected Users Count */}
        {isConnected && connectedUsers.length > 0 && (
          <div className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs">
            <span>{connectedUsers.length} user{connectedUsers.length !== 1 ? 's' : ''} online</span>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="h-full">
        <BoardProvider 
          canvasId={id} 
          initialElements={canvas.elements}
          onCanvasUpdate={handleCanvasUpdate}
          onCursorMove={handleCursorMove}
        >
          <ToolboxProvider>
            <Toolbar />
            <Board />
            <Toolbox />
          </ToolboxProvider>
        </BoardProvider>
      </div>

      {/* Right Sidebar - Positioned absolutely */}
      <RightSidebar 
        canvas={canvas} 
        navigate={navigate} 
        connectedUsers={connectedUsers}
        isConnected={isConnected}
      />
    </div>
  );
}

export default CanvasPage;