import axios from 'axios';

// Base URL del backend desde .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ====================
// Interceptor de request
// ====================
api.interceptors.request.use(
  (config) => {
    // Ejemplo: añadir token de autorización si existe
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ====================
// Interceptor de response
// ====================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      alert('No se pudo conectar con el servidor.');
    } else if (error.response.status === 401) {
      alert('Sesión expirada. Por favor inicia sesión nuevamente.');
      localStorage.removeItem('token');
      window.location.href = '/implac/login';
    } else if (error.response.data?.message) {
      alert(error.response.data.message);
    }
    return Promise.reject(error);
  }
);

export default api;
