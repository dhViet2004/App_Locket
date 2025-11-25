import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach token to all authenticated requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Attach token for all API requests (except public endpoints like /api/auth/login)
    if (token && !config.url?.includes('/api/auth/login') && !config.url?.includes('/api/auth/register')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401/403 errors and connection errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle connection refused (backend not running)
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('❌ Cannot connect to backend server. Please ensure backend is running on http://localhost:4000');
      console.error('💡 Run: cd App_Locket/Backend && npm run dev');
      // Don't redirect on connection errors, just show error
      return Promise.reject(new Error('Backend server is not running. Please start the backend server first.'));
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

