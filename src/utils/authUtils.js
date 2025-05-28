import { eliminarTokens } from "./encryptToken";

// Variable para almacenar la función de logout
let logoutFunction = null;

// Función para establecer la referencia al logout
export const setLogoutFunction = (fn) => {
  logoutFunction = fn;
};

// Función para llamar al logout desde cualquier parte de la aplicación
export const performLogout = async () => {
  if (logoutFunction) {
    return await logoutFunction();
  } else {
    // Fallback básico si no se ha establecido la función
    eliminarTokens();
    localStorage.removeItem("user");
    localStorage.removeItem("auth");
    localStorage.removeItem("cart");
    window.location.href = "/auth/login";
    return { success: true };
  }
};
