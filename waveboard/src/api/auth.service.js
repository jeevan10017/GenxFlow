import apiClient from './apiClient';

const API_URL = '/api/users';

const register = (name, email, password) => {
    return apiClient.post(`${API_URL}/register`, { name, email, password });
};

const login = (email, password) => {
    return apiClient.post(`${API_URL}/login`, { email, password });
};

const getUserProfile = () => {
    return apiClient.get(`${API_URL}/`);
};

const googleLogin = (name, email, googleId, localCanvasData) => {
    return apiClient.post(`${API_URL}/google-login`, {
        name,
        email,
        googleId,
        localCanvasData,
    });
};

const migrateCanvas = (localCanvasData) => {
    return apiClient.post(`${API_URL}/migrate-canvas`, { localCanvasData });
};

const authService = {
    register,
    login,
    getUserProfile,
    googleLogin,
    migrateCanvas,

};

export default authService;