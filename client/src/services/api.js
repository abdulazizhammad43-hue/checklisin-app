import axios from 'axios';

// Get API URL - supports production (Vercel) and development
const getApiUrl = () => {
  // Use environment variable if set (production)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development: If accessing from mobile (not localhost), use the current hostname
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return `http://${window.location.hostname}:5000/api`;
  }
  
  // Default: localhost development
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, password, role) => api.post('/auth/register', { username, password, role }),
  getMe: () => api.get('/auth/me'),
};

// Defects API calls
export const defectService = {
  getAll: () => api.get('/defects'),
  getById: (id) => api.get(`/defects/${id}`),
  create: (data) => api.post('/defects', data),
  update: (id, data) => api.put(`/defects/${id}`, data),
  updateStatus: (id, status) => api.patch(`/defects/${id}/status`, { status }),
  updateAfterPhoto: (id, after_photo) => api.patch(`/defects/${id}/after-photo`, { after_photo }),
  delete: (id) => api.delete(`/defects/${id}`),
  getPendingNotifications: () => api.get('/defects/notifications/pending'),
  markNotified: (id) => api.patch(`/defects/${id}/mark-notified`),
};

// Members API calls
export const memberService = {
  getAll: () => api.get('/members'),
  invite: (username) => api.post('/members/invite', { username }),
  delete: (id) => api.delete(`/members/${id}`),
};

// User API calls (for admin)
export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
