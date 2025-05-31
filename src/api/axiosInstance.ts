import axios from 'axios';

// URL base configurable desde .env o fallback a localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token JWT a cada request si existe
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta globalmente
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Evitar loops infinitos

      console.error("Error 401: No autorizado o token expirado. Cerrando sesión...");

      // Limpiar datos de autenticación
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');

      // Redirigir al login solo si no estamos ya en esa página
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(new Error('Sesión expirada o inválida. Por favor, inicie sesión de nuevo.'));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
