import api from "../../constants/api";

export const users_getAll = async () => {
  try {
    const response = await api.get("/usuarios/getUsers");
    return {
      success: true,
      message: "Usuarios obtenidos exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al obtener usuarios";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
