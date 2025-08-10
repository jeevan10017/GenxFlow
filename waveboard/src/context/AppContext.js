import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../api/auth.service';
import canvasService from '../api/canvas.service';
import { jwtDecode } from "jwt-decode";

const AppContext = createContext();

export const useApi = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    if (token) {
      try {
        const res = await authService.getUserProfile();
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to load user', error);
        logout(); // Token is invalid or expired
      }
    }
    setLoading(false);
  }, [token]);

  const googleLogin = async (credentialResponse, localCanvasData) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const { name, email, sub: googleId } = decoded;

    const res = await authService.googleLogin(
      name,
      email,
      googleId,
      localCanvasData
    );
    const newToken = res.data.token;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    await loadUser();
    navigate("/");
    return res;
  };

  const migrateCanvas = async (localCanvasData) => {
    try {
      await authService.migrateCanvas(localCanvasData);
      // Optionally show a success message
    } catch (error) {
      console.error("Failed to migrate canvas", error);
    }
  };

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    await loadUser(); // Fetch user profile after login
    navigate('/');
    return res;
  };

  const register = (name, email, password) => {
    return authService.register(name, email, password);
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    canvasService, 
    authService,
    googleLogin,
    migrateCanvas,
  };

  return (
    <AppContext.Provider value={value}>
      {!loading && children}
    </AppContext.Provider>
  );
};