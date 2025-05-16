import api from "../../constants/api";

/**
 * Solicita un código de restablecimiento de contraseña
 * @param {string} email - Correo electrónico del usuario
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const resetPassword_requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/reset-password/request", { email });
    console.log(response);

    localStorage.setItem("resetToken", response.data.resetToken);
    return {
      success: true,
      message:
        response.data.message || "Código de verificación enviado correctamente",
      data: response.data.data || {},
    };
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Ocurrió un error al enviar el código de verificación";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Verifica el código de restablecimiento de contraseña
 * @param {string} token - Token de restablecimiento obtenido al solicitar el código
 * @param {string} code - Código de verificación
 * @returns {Promise<Object>} - Respuesta de la API incluyendo el token de reset
 */
export const resetPassword_verifyResetCode = async (token, otp) => {
  try {
    const response = await api.post("/reset-password/verify-otp", {
      token,
      otp,
    });

    return {
      success: true,
      message: response.data.message || "Código verificado correctamente",
      data: response.data.data || {},
      resetToken: response.data.resetToken || response.data.data?.resetToken,
    };
  } catch (error) {
    const message =
      error.response?.data?.message || "El código ingresado es incorrecto";

    return {
      success: false,
      message,
      error: error.response?.data || null,
    };
  }
};

/**
 * Establece una nueva contraseña
 * @param {string} resetToken - Token de restablecimiento obtenido al verificar el código
 * @param {string} newPassword - Nueva contraseña del usuario
 * @returns {Promise<Object>} - Respuesta de la API
 */
export const resetPassword_setNewPassword = async (resetToken, newPassword) => {
  try {
    console.log(resetToken, newPassword);
    
    const response = await api.post("/reset-password/resPss", {
      resetToken,
      newPassword,
    });
    console.log(response);
    
    localStorage.remove("resetToken");

    return {
      success: true,
      message: response.data.message || "Contraseña actualizada correctamente",
      data: response.data.data || {},
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
