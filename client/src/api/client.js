/**
 * Axios instance pre-configured for the SchedViz API.
 * Automatically attaches the JWT Authorization header if a token is stored.
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('schedviz_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 errors (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalid/expired — clear storage (user must re-login)
      localStorage.removeItem('schedviz_token');
      localStorage.removeItem('schedviz_user');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
