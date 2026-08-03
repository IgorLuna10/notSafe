import axios from 'axios';

// 1. Create a centralized Axios instance
const api = axios.create({
  baseURL: '/api/v1', // This matches your Nginx/Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Auto-injects the Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. Response Interceptor: Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid -> Clear storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

