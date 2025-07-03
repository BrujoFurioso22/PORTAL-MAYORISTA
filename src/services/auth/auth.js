import api from "../../constants/api";
import {
  guardarRefreshToken,
  guardarToken,
  obtenerRefreshToken,
} from "../../utils/encryptToken";

/**
 * Refresca el token de acceso usando el refresh token
 * @param {string} refreshToken - Token de refresco
 * @returns {Promise<Object>} Respuesta con el nuevo token
 */
export const auth_refresh = async () => {
  try {
    const refreshToken = obtenerRefreshToken();
    const response = await api.post("/auth/refreshToken", { refreshToken });

    // Guardar los nuevos tokens
    if (response.data.accessToken) {
      guardarToken(response.data.accessToken);
    }

    if (response.data.refreshToken) {
      guardarRefreshToken(response.data.refreshToken);
    }

    return response.data;
  } catch (error) {
    console.error("Error al refrescar el token:", error);
    throw error; // Re-lanzar el error para manejarlo en el contexto de autenticación
  }
};

/**
 * Verifica el token actual y obtiene información del usuario
 * @returns {Promise<Object>} Respuesta con los datos del usuario
 */
export const auth_me = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    throw error; // Re-lanzar el error para manejarlo en el contexto de autenticación
  }
};
