import axios from "axios";
import { obtenerToken, guardarToken } from "../utils/encryptToken";
import { toast } from "react-toastify";
import { performLogout } from "../utils/authUtils";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // opcional: timeout de 10s
});

// Variable para controlar si hay un refresco de token en curso
let isRefreshing = false;
// Cola de peticiones pendientes que esperan por el nuevo token
let failedQueue = [];

// Función para procesar la cola de peticiones pendientes
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Función para refrescar el token
const refreshToken = async () => {
  try {
    const currentToken = obtenerToken();
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}auth/refresh-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      }
    );

    const newToken = response.data.token;
    guardarToken(newToken);
    return newToken;
  } catch (error) {
    return Promise.reject(error);
  }
};

// Interceptor simple para agregar token si es necesario
api.interceptors.request.use(
  (config) => {
    const token = obtenerToken(); // Desencriptarlo si está encriptado
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor mejorado para manejar errores y refresco de token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (No autorizado) y no es una petición de refresco de token
    // y además no hemos intentado ya reenviar esta petición
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("refresh-token")
    ) {
      // Marcamos que esta petición ya se ha intentado reenviar
      originalRequest._retry = true;

      // Si ya estamos refrescando el token, poner esta petición en cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Comenzar proceso de refresco
      isRefreshing = true;

      try {
        // Intentar refrescar el token
        const newToken = await refreshToken();

        // Actualizar el token en la petición original
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // Procesar la cola de peticiones pendientes
        processQueue(null, newToken);

        // Reintentar la petición original con el nuevo token
        return api(originalRequest);
      } catch (refreshError) {
        // Si falla el refresco del token, procesar la cola con error
        processQueue(refreshError, null);

        // Aquí podríamos implementar el logout automático
        console.error(
          "No se pudo refrescar el token. Se requiere nuevo inicio de sesión."
        );

        toast.error(
          "No se pudo refrescar el token. Por favor, inicia sesión nuevamente."
        );

        await performLogout()

        // Aquí podrías implementar una redirección al login o mostrar un mensaje al usuario
        return Promise.reject(refreshError);
      } finally {
        // Indicar que ya no estamos refrescando el token
        isRefreshing = false;
      }
    }

    // Para otros errores, simplemente los rechazamos
    return Promise.reject(error);
  }
);

export default api;
