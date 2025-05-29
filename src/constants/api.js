import axios from "axios";
import { toast } from "react-toastify";
import { performLogout } from "../utils/authUtils";
import {
  obtenerToken,
  guardarToken,
  obtenerRefreshToken,
  guardarRefreshToken,
} from "../utils/encryptToken";
import { auth_refresh } from "../services/auth/auth";

const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000, // opcional: timeout de 10s
  withCredentials: false, // Cambiamos a false ya que no usaremos cookies
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

// Interceptor para agregar token a las cabeceras
api.interceptors.request.use(
  (config) => {
    const token = obtenerToken();
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
      !originalRequest.url.includes("refreshToken")
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

      isRefreshing = true;

      try {
        // Obtener el refresh token
        const refreshToken = obtenerRefreshToken();

        if (!refreshToken) {
          throw new Error("No hay refresh token disponible");
        }

        // Intentar refrescar el token - ASEGÚRATE DE PASAR EL REFRESH TOKEN
        const response = await auth_refresh();

        // Verificar estructura de la respuesta y extraer tokens
        // Verifica los nombres exactos de las propiedades que usa tu API
        const newToken = response.accessToken;

        if (!newToken) {
          console.error(
            "Respuesta de refreshToken no contiene token:",
            response.data
          );
          throw new Error("La respuesta no contiene un token válido");
        }

        // Guardar el nuevo accessToken
        guardarToken(newToken);

        // Si también hay un nuevo refresh token, guardarlo
        if (response.refreshToken) {
          guardarRefreshToken(response.refreshToken);
        }

        // Actualizar el header de la petición original
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        // Procesar la cola de peticiones pendientes
        processQueue(null, newToken);

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Agregar log para depurar el error
        console.error("Error detallado al refrescar token:", refreshError);

        // Si falla el refresco del accessToken, procesar la cola con error
        processQueue(refreshError, null);

        console.error(
          "No se pudo refrescar el accessToken. Se requiere nuevo inicio de sesión."
        );

        toast.error(
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        );

        performLogout();
        // Opcional: Redireccionar al login
        window.location.href = "/auth/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Para otros errores, simplemente los rechazamos
    return Promise.reject(error);
  }
);

export default api;
