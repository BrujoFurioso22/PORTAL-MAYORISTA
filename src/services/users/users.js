import api from "../../constants/api";

export const users_getAll = async () => {
  try {
    const response = await api.get("/usuarios/getUsers");
    // console.log(response);

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

// Actualizar SOLO el rol del usuario
export const users_updateRole = async (userId, roleId) => {
  try {
    const response = await api.put(`/user/${userId}/role`, {
      roleId: parseInt(roleId),
    });

    return {
      success: true,
      message: "Rol actualizado exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "Ocurrió un error al actualizar el rol";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

// Actualizar SOLO la contraseña del usuario
export const users_updatePassword = async (userId, password) => {
  try {
    const response = await api.put(`/user/${userId}/password`, { password });

    return {
      success: true,
      message: "Contraseña actualizada exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al actualizar la contraseña";
    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtiene usuarios asociados a una cuenta específica
 * @param {string|number} codigoSocio - ID de la cuenta a consultar
 * @returns {Promise<Object>} Objeto con información de éxito/error y datos
 */
export const users_getByAccount = async (codigoSocio) => {
  try {
    const response = await api.get(`/usuarios/getInfoAccount/${codigoSocio}`);

    return {
      success: true,
      message: "Usuarios de la cuenta obtenidos exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los usuarios de la cuenta";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Obtiene usuarios asociados a una cuenta específica
 * @param {string|number} email - correo de la cuenta a consultar
 * @returns {Promise<Object>} Objeto con información de éxito/error y datos
 */
export const users_getByEmail = async (email) => {
  try {
    const response = await api.get(`/usuarios/getUser/email/${email}`);

    return {
      success: true,
      message: "Usuarios de la cuenta obtenidos exitosamente",
      data: response.data.data,
    };
  } catch (error) {
    // Extraer mensaje si existe en la respuesta
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al obtener los usuarios de la cuenta";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};
