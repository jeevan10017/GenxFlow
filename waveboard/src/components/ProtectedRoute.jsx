import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApi } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useApi();

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;