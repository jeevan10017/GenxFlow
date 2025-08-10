import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApi } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useApi();

  if (loading) {
    // Optional: show a loading spinner while checking auth
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;