import api from "../../constants/api";
import { guardarRefreshToken, guardarToken } from "../../utils/encryptToken";

export const auth_login = async ({ email, password }) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    if (response.status === 200 || response.status === 201) {
      console.log(response.data);
      
      // Guardar tokens si existen
      if (response.data.accessToken) {
        guardarToken(response.data.accessToken);
      }
      
      if (response.data.refreshToken) {
        guardarRefreshToken(response.data.refreshToken);

      }
      
      return {
        success: true,
        data: response.data,
        message: "Login exitoso"
      };
    }
    return {
      success: false,
      message: response.data.message || "Error en la autenticación"
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al iniciar sesión";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
