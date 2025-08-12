import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../context/AppContext';
import Board from '../components/Board';
import Toolbar from '../components/Toolbar';
import Toolbox from '../components/Toolbox';
import BoardProvider from '../store/BoardProvider';
import ToolboxProvider from '../store/toolboxProvider';
import socket from '../utils/socket';
import RightSidebar from '../components/RightSidebar';
import { Palette, AlertTriangle, Frown } from "lucide-react";
import './CanvasPage.css'; 

function CanvasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canvasService } = useApi();
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const token = localStorage.getItem('token');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const connectSocket = () => {
      // Connect the socket
      socket.connect();

      // Socket event listeners
     socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
        setIsConnected(true);
        socket.emit('joinRoom', id);
      });

       socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        setConnectedUsers([]);
      });
      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        setIsConnected(false);
      });
      // Listen for canvas updates from other users
      socket.on('canvasUpdate', (data) => {
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
        const res = await canvasService.loadCanvas(id);
        setCanvas(res.data);
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
      if (window.boardProviderHandlers) {
        delete window.boardProviderHandlers[id];
      }
    };
  },[id, navigate, canvasService]);

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

  
    const saveCanvasToServer = useCallback(async (elements) => {
    try {
      await canvasService.updateCanvas(id, elements);
      console.log('Canvas saved to server');
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  }, [id, canvasService]);

  // Auto-save every 10 seconds if there are changes
  useEffect(() => {
    if (!canvas || !isConnected) return;

    const autoSaveInterval = setInterval(() => {
      if (window.boardProviderHandlers && window.boardProviderHandlers[id]) {

      }
    }, 10000);

    return () => clearInterval(autoSaveInterval);
  }, [canvas, isConnected, saveCanvasToServer, id]);

   if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-stone-100 text-stone-500">
        <Palette className="w-12 h-12 animate-spin mb-4" />
        <p className="font-semibold">Loading Canvas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-stone-100 p-6">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg border border-stone-200">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="font-serif text-2xl font-bold text-stone-800 mb-2">
            Error Loading Canvas
          </h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-stone-800 text-white font-bold rounded-lg hover:bg-stone-900 transition"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  if (!canvas) {
    return (
      <div className="flex justify-center items-center h-screen bg-stone-100 p-6">
        <div className="text-center bg-white p-10 rounded-xl shadow-lg border border-stone-200">
          <Frown className="mx-auto h-12 w-12 text-stone-500 mb-4" />
          <h2 className="font-serif text-2xl font-bold text-stone-800 mb-2">
            Canvas Not Found
          </h2>
          <p className="text-stone-600 mb-6">
            We couldn't find the canvas you're looking for.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-stone-800 text-white font-bold rounded-lg hover:bg-stone-900 transition"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen bg-stone-100 relative font-sans ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Left Info Panel */}
      <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
        {/* Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-full text-xs font-semibold text-stone-700 shadow-sm">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <span>{isConnected ? "Connected" : "Disconnected"}</span>
        </div>

        {/* User Count */}
        {isConnected && connectedUsers.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-full text-xs font-semibold text-stone-700 shadow-sm">
            <span>
              {connectedUsers.length} user{connectedUsers.length > 1 ? "s" : ""} online
            </span>
          </div>
        )}
      </div>

      {/* Canvas Workspace */}
      <div className="h-full">
        <BoardProvider
          canvasId={id}
          initialElements={canvas.elements}
          onCanvasUpdate={handleCanvasUpdate}
          onCursorMove={handleCursorMove}
        >
          <ToolboxProvider isDarkMode={isDarkMode}>
            <Toolbar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <Board isDarkMode={isDarkMode} />
            <Toolbox isDarkMode={isDarkMode} />
          </ToolboxProvider>
        </BoardProvider>
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        canvas={canvas}
        navigate={navigate}
        connectedUsers={connectedUsers}
        isConnected={isConnected}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}


export default CanvasPage;