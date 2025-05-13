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

// CREAR USUARIO
export const users_create = async (userData) => {
  try {
    const response = await api.post("/usuarios/createUser", userData);
    return {
      success: true,
      message: "Usuario creado exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message || "Ocurrió un error al crear el usuario";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

// ACTUALIZAR USUARIO
export const users_update = async (userData) => {
  try {
    const response = await api.put(
      `/usuarios/updateUser/${userData.id}`,
      userData
    );
    return {
      success: true,
      message: "Usuario actualizado exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al actualizar el usuario";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
