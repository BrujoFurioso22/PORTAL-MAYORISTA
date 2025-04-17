import api from "../../constants/api";

export const auth_login = async ({ email, password }) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return {
      success: true,
      message: "Inicio de sesión exitoso",
      data: response.data,
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
