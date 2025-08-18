import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect } from "react";
import { AppProvider, useApi } from "./context/AppContext";
import Profile from "./pages/Profile";
import CanvasPage from "./pages/CanvasPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GuestDashboard from "./pages/GuestDashboard"; 
import ProtectedRoute from "./components/ProtectedRoute";
import { ServerStatusProvider, useServerStatus } from './context/ServerStatusContext';
import ServerWakeupModal from './components/ServerWakeupModal';
import { setupResponseInterceptor } from './api/apiClient'; 

const AppInterceptors = () => {
  const { startWakeupProcess } = useServerStatus();

  useEffect(() => {
    setupResponseInterceptor(startWakeupProcess);
  }, [startWakeupProcess]);

  return null;
};


function AppContent() {
  const { isAuthenticated } = useApi();
 const { isWakingUp, countdown } = useServerStatus();
  return (
    <>
    <ServerWakeupModal isWakingUp={isWakingUp} countdown={countdown} />
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          ) : (
            <GuestDashboard />
          )
        }
      />
      <Route
        path="/canvas/:id"
        element={
          <ProtectedRoute>
            <CanvasPage />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/guest"
        element={isAuthenticated ? <Navigate to="/" /> : <GuestDashboard />}
      />
    </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <ServerStatusProvider>
          <AppInterceptors />
          <AppContent />
        </ServerStatusProvider>
      </AppProvider>
    </Router>
  );
}

export default App;