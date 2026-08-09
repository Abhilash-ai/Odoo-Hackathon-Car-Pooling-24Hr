import axios from 'axios';

// Automatically detect local vs production environment
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const DEFAULT_RENDER_BACKEND = 'https://odoo-hackathon-car-pooling-24hr.onrender.com/api';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL 
  || (isLocalhost ? '/api' : DEFAULT_RENDER_BACKEND);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
