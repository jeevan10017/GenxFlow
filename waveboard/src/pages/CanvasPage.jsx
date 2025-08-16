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
import RemoteCursor from '../components/RemoteCursor/RemoteCursor'; 
import { Palette, AlertTriangle, Frown } from "lucide-react";
import CallManager from '../components/VideoCall/CallManager';
import { loadModels } from '../ml/predict';
import './CanvasPage.css';

function CanvasPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canvasService, user } = useApi();
  const [canvas, setCanvas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [cursors, setCursors] = useState({}); // State for remote cursors
  const token = localStorage.getItem('token');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(prevMode => !prevMode);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const loadAndConnect = async () => {
      try {
        setLoading(true);
        const res = await canvasService.loadCanvas(id);
        setCanvas(res.data);

        // Socket Connection Logic
        socket.connect();

        socket.on('connect', () => {
          console.log('Connected to server:', socket.id);
          setIsConnected(true);
          // Emit with room ID and auth token
          socket.emit('joinRoom', { roomId: id, token });
        });

        socket.on('disconnect', () => {
          console.log('Disconnected from server');
          setIsConnected(false);
          setConnectedUsers([]);
          setCursors({}); // Clear cursors on disconnect
        });
        
        socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          setError('Could not connect to real-time service.');
          setIsConnected(false);
        });

        socket.on('canvasUpdate', (data) => {
          if (window.boardProviderHandlers && window.boardProviderHandlers[id]) {
            window.boardProviderHandlers[id].handleRemoteUpdate(data);
          }
        });
        
        // Listen for the full user list
        socket.on('roomUsers', (users) => {
          console.log('Room users updated:', users);
          setConnectedUsers(users);
        });

        // Listen for cursor movements from other users
        socket.on('userCursor', (data) => {
          if (data.userId !== socket.id) {
            setCursors(prev => ({ ...prev, [data.userId]: data }));
          }
        });

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load canvas');
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadAndConnect();

    return () => {
      if (socket.connected) {
        socket.emit('leaveRoom', id);
        socket.disconnect();
      }
      // Clean up all listeners
      socket.off(); 
      if (window.boardProviderHandlers) {
        delete window.boardProviderHandlers[id];
      }
    };
  }, [id, navigate, token, canvasService]);

  // Effect to clean up cursors of users who have left
  useEffect(() => {
    const activeUserIds = new Set(connectedUsers.map(u => u.id));
    setCursors(prevCursors => {
        const nextCursors = {};
        for (const userId in prevCursors) {
            if (activeUserIds.has(userId)) {
                nextCursors[userId] = prevCursors[userId];
            }
        }
        return nextCursors;
    });
  }, [connectedUsers]);

  const handleCanvasUpdate = useCallback((updateData) => {
    if (socket.connected) {
      socket.emit('canvasUpdate', { roomId: id, ...updateData });
    }
  }, [id]);

  const handleCursorMove = useCallback((cursorData) => {

    if (socket.connected && connectedUsers.length > 1) {
      socket.emit('userCursor', { roomId: id, ...cursorData });
    }
  }, [id, connectedUsers.length]);

useEffect(() => {
        loadModels();
    }, []);
    
  // Loading and Error states
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
      {/* Render Remote Cursors */}
      {/* Conditionally render only when more than 1 user is present */}
       {connectedUsers.length > 1 && Object.entries(cursors).map(([userId, data]) => (
        <RemoteCursor
          key={userId}
          x={data.x}
          y={data.y}
          color={data.color}
          email={data.email}
        />
      ))}
      
       <div className="absolute top-4 left-4 z-20 flex flex-col items-start gap-2">
           <img
    src={isDarkMode ? "/logo_dark_nobg.png" : "/logo_light_nobg.png"}
    alt="App Logo"
    className="h-10 w-auto mb-2 drop-shadow-md transition-opacity duration-300"
  />
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

       <RightSidebar
         canvas={canvas}
         navigate={navigate}
         connectedUsers={connectedUsers}
         isConnected={isConnected}
         isDarkMode={isDarkMode}
       />
       {isConnected && user && connectedUsers.length > 1 && (
         <CallManager 
                    roomId={id} 
                    currentUser={user} 
                    isDarkMode={isDarkMode} 
                />
      )}
       
    </div>
  );
}

export default CanvasPage;