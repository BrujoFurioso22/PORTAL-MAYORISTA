import axios from "axios";
import { obtenerToken } from "../utils/encryptToken";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // opcional: timeout de 10s
});

// Interceptor para agregar token si es necesario
api.interceptors.request.use(
  (config) => {
    const token = obtenerToken(); // aquí puedes desencriptarlo si está encriptado
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas (opcional para errores globales)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Puedes redirigir al login o mostrar mensaje
      console.warn("No autorizado");
    }
    return Promise.reject(error);
  }
);

export default api;
