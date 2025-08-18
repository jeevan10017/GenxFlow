import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000',
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// We will call this function from our main App component
export const setupResponseInterceptor = (startWakeupProcess) => {
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const isColdStartError = (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK');
      
      if (isColdStartError && !originalRequest._isRetry) {
        console.log('Server might be sleeping. Starting wakeup process...');
        originalRequest._isRetry = true; 
        await startWakeupProcess();
        
        console.log('Server should be awake. Retrying request...');
        return apiClient(originalRequest);
      }
      return Promise.reject(error);
    }
  );
};

export default apiClient;