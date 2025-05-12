import api from "../../constants/api";

/**
 * Refresca el token de acceso usando el refresh token
 * @param {string} refreshToken - Token de refresco
 * @returns {Promise<Object>} Respuesta con el nuevo token
 */
export const auth_refresh = async (refreshToken) => {
  const response = await api.post("/auth/refreshToken", { refreshToken });
  return response.data;
};

/**
 * Verifica el token actual y obtiene información del usuario
 * @returns {Promise<Object>} Respuesta con los datos del usuario
 */
export const auth_me = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};
