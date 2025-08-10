import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApi } from "./context/AppContext";
import Profile from "./pages/Profile";
import CanvasPage from "./pages/CanvasPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GuestDashboard from "./pages/GuestDashboard"; 
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const { isAuthenticated } = useApi();

  return (
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
  );
}

function App() {
  return (
    <Router>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </Router>
  );
}

export default App;