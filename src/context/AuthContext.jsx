import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import { auth_login } from "../services/auth/login";
import { auth_me, auth_refresh } from "../services/auth/auth";
import {
  eliminarTokens,
  guardarRefreshToken,
  guardarToken,
  obtenerToken,
  obtenerRefreshToken,
} from "../utils/encryptToken";
import { users_getByAccount } from "../services/users/users";
import {
  resetPassword_requestPasswordReset,
  resetPassword_verifyResetCode,
  resetPassword_setNewPassword,
} from "../services/auth/password";

// Constantes para simulación (idealmente estarían en un archivo separado)
const MOCK_USERS = {
  "admin@mayoreo.com": {
    password: "123456",
    data: {
      CODIGO_USUARIO: 1,
      NOMBRE_USUARIO: "Administrador",
      ROLES: ["ADMIN"],
      EMAIL: "admin@mayoreo.com",
      BUSSINES_ACCESS: ["maxximundo", "stox", "ikonix", "autollanta"],
    },
  },
  "vendedor@mayoreo.com": {
    password: "123456",
    data: {
      CODIGO_USUARIO: 2,
      NOMBRE_USUARIO: "Vendedor",
      ROLES: ["VENDEDOR"],
      EMAIL: "vendedor@mayoreo.com",
      BUSSINES_ACCESS: ["maxximundo", "stox"],
    },
  },
  "coordinadora@mayoreo.com": {
    password: "123456",
    data: {
      CODIGO_USUARIO: 3,
      NOMBRE_USUARIO: "Coordinadora",
      ROLES: ["COORDINATOR"],
      EMAIL: "coordinadora@mayoreo.com",
      BUSSINES_ACCESS: ["maxximundo", "autollanta"],
    },
  },
  "juan@example.com": {
    password: "123456",
    data: {
      CODIGO_USUARIO: 4,
      NOMBRE_USUARIO: "Juan Cliente",
      ROLES: ["CLIENT"],
      EMAIL: "juan@example.com",
      BUSSINES_ACCESS: ["maxximundo", "autollanta"],
    },
  },
};

const MOCK_IDENTIFICATIONS = {
  "0987654321001": {
    email: "juan@example.com",
    maskedEmail: "j***@e***le.com",
    availableCompanies: [
      {
        id: "maxximundo",
        name: "Maxximundo",
        status: "active",
        logo: "https://via.placeholder.com/50",
      },
      {
        id: "autollanta",
        name: "Autollanta",
        status: "pending",
        logo: "https://via.placeholder.com/50",
      },
      {
        id: "stox",
        name: "Stox",
        status: "inactive",
        logo: "https://via.placeholder.com/50",
      },
      {
        id: "ikonix",
        name: "Ikonix",
        status: "inactive",
        logo: "https://via.placeholder.com/50",
      },
    ],
  },
};

// Simulación de delay de red
const simulateNetworkDelay = (ms = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Función auxiliar para enmascarar el email
  const maskEmail = (email) => {
    if (!email) return "";

    const [username, domain] = email.split("@");
    const [domainName, extension] = domain.split(".");

    const maskedUsername = username.charAt(0) + "*".repeat(username.length - 1);
    const maskedDomain =
      domainName.charAt(0) + "*".repeat(domainName.length - 1);

    return `${maskedUsername}@${maskedDomain}.${extension}`;
  };

  // ========== FUNCIONES PARA LOS TOKENS ==========

  const refreshToken = async () => {
    try {
      const refreshToken = obtenerRefreshToken();
      if (!refreshToken) {
        throw new Error("No hay refresh token");
      }

      const response = await auth_refresh(refreshToken);

      if (response && response.token) {
        guardarToken(response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al refrescar token:", error);
      return false;
    }
  };

  const verifyToken = async () => {
    try {
      const token = obtenerToken();
      if (!token) return false;

      const response = await auth_me();

      if (response && response.user) {
        // Actualizar la información del usuario
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error al verificar token:", error);

      // Si el error es por token expirado, intentar refrescar
      if (error.response && error.response.status === 401) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
          return await verifyToken(); // Reintentar verificación con nuevo token
        }
      }
      return false;
    }
  };

  // ========== FUNCIONES REDIRECCIONAMIENTO ==========

  const getHomeRouteByRole = (user) => {
    if (!user) return ROUTES.AUTH.LOGIN;

    if (user.ROLE_NAME === ROLES.COORDINADOR) {
      return ROUTES.COORDINADOR.PEDIDOS;
    } else if (user.ROLE_NAME === ROLES.ADMIN) {
      return ROUTES.ADMIN.USER_ADMIN;
    } else {
      return ROUTES.ECOMMERCE.HOME;
    }
  };

  const navigateToHomeByRole = (userV) => {
    let userData = userV || user;
    const homeRoute = getHomeRouteByRole(userData);
    navigate(homeRoute);
  };

  // ========== FUNCIONES DE AUTENTICACIÓN ==========

  const login = async (email, password) => {
    try {
      const response = await auth_login({ email, password });
      console.log(response);

      if (response.success) {
        const userData = response.data.user;
        const token = response.data.token;
        const refreshToken = response.data.refresh_token;

        // Guardar datos de usuario en localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("auth", "true");

        // Usar funciones de encriptación para los tokens
        guardarToken(token);
        if (refreshToken) {
          guardarRefreshToken(refreshToken);
        }

        // Actualizar el estado
        setUser(userData);
        setIsAuthenticated(true);

        toast.success("Inicio de sesión exitoso");

        // Redireccionar según el rol del usuario
        let redirectPath = getHomeRouteByRole(userData);

        // Pequeño retraso antes de navegar para permitir que el estado se actualice
        setTimeout(() => navigate(redirectPath), 100);

        return {
          success: true,
          data: userData,
          message: "Inicio de sesión exitoso",
        };
      } else {
        toast.error("Credenciales incorrectas");
        return {
          success: false,
          message: "Credenciales incorrectas",
        };
      }
    } catch (error) {
      console.error("Error en login:", error);
      toast.error("Error al iniciar sesión");
      return {
        success: false,
        message: "Error al iniciar sesión",
      };
    }
  };

  const logout = () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("auth");
      localStorage.removeItem("cart");

      // Función para eliminar tokens encriptados
      eliminarTokens();

      // Actualizar estado
      setUser(null);
      setIsAuthenticated(false);

      // Navegar a login
      navigate(ROUTES.AUTH.LOGIN);

      return { success: true, message: "Sesión cerrada correctamente" };
    } catch (error) {
      console.error("Error en logout:", error);
      return { success: false, message: "Error al cerrar sesión" };
    }
  };

  // ========== FUNCIONES DE REGISTRO ==========

  // Lista completa de empresas disponibles en el sistema
  const ALL_COMPANIES = [
    "MAXXIMUNDO",
    "STOX",
    "AUTOLLANTA",
    "IKONIX",
    "AUTOMAX",
  ];

  const verifyIdentification = async (identification) => {
    try {
      // Llamar al servicio que verifica la identificación (RUC/cédula)
      const response = await users_getByAccount(identification);
      console.log(response);

      if (response.success) {
        if (response.data) {
          // Usuario existente - extraer el primer usuario asociado a la cuenta
          const user = response.data;

          // Enmascarar el email para mostrarlo parcialmente por seguridad
          const maskedEmail = maskEmail(user.EMAIL);

          // Filtrar para obtener las empresas disponibles (no ocupadas)
          const userCompanies = user.EMPRESAS || [];
          const availableCompanies = ALL_COMPANIES.filter(
            (company) => !userCompanies.includes(company)
          );

          return {
            success: true,
            userExists: true,
            email: user.EMAIL || "",
            maskedEmail: maskedEmail,
            availableCompanies: availableCompanies, // Solo empresas NO ocupadas
            userCompanies: userCompanies, // Opcionalmente, incluir las ya asignadas
            userId: user.ID_USER,
          };
        } else {
          // La identificación existe pero no tiene usuarios asociados
          // Todas las empresas están disponibles
          return {
            success: true,
            userExists: false,
            availableCompanies: ALL_COMPANIES,
          };
        }
      } else {
        // Error al consultar la API
        throw new Error(response.message);
      }
    } catch (error) {
      console.error("Error al verificar identificación:", error);
      return {
        success: false,
        message: error.message || "Error al verificar la identificación",
      };
    }
  };

  const requestAccess = async (requestData) => {
    try {
      await simulateNetworkDelay(1000);

      console.log("Datos de solicitud:", requestData);

      return {
        success: true,
        message: "Solicitud enviada correctamente",
      };
    } catch (error) {
      console.error("Error al solicitar acceso:", error);
      return {
        success: false,
        message: "Error al procesar la solicitud",
      };
    }
  };

  // ========== FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ==========

  const verifyEmailExists = async (email) => {
    try {
      await simulateNetworkDelay();

      const exists = Object.keys(MOCK_USERS).includes(email);

      return {
        success: true,
        exists: exists,
        message: exists
          ? "Email verificado"
          : "El email no está registrado en el sistema",
      };
    } catch (error) {
      console.error("Error al verificar email:", error);
      return {
        success: false,
        message: "Error al verificar el email",
      };
    }
  };

  const sendVerificationCode = async (email) => {
    try {
      const response = await resetPassword_requestPasswordReset(email);

      if (response.success) {
        // El token viene en la respuesta y ya se guarda en localStorage
        // en la implementación de requestPasswordReset
        return {
          success: true,
          message:
            response.message || "Código de verificación enviado correctamente",
        };
      } else {
        return {
          success: false,
          message:
            response.message || "Error al enviar el código de verificación",
        };
      }
    } catch (error) {
      console.error("Error al enviar código:", error);
      return {
        success: false,
        message: error.message || "Error al enviar el código de verificación",
      };
    }
  };

  const verifyCode = async (otp) => {
    try {
      // Obtener el token de localStorage (guardado en requestPasswordReset)
      const token = localStorage.getItem("resetToken");

      if (!token) {
        return {
          success: false,
          isValid: false,
          message: "No se encontró el token de restablecimiento",
        };
      }

      const response = await resetPassword_verifyResetCode(token, otp);

      if (response.success) {
        // El resetToken ya se guarda en localStorage en verifyResetCode si es necesario
        return {
          success: true,
          isValid: true,
          message: response.message || "Código verificado correctamente",
        };
      } else {
        return {
          success: false,
          isValid: false,
          message: response.message || "El código ingresado es incorrecto",
        };
      }
    } catch (error) {
      console.error("Error al verificar código:", error);
      return {
        success: false,
        isValid: false,
        message: error.message || "Error al verificar el código",
      };
    }
  };

  const resetPassword = async (newPassword) => {
    try {
      const resetToken = localStorage.getItem("resetToken");

      if (!resetToken) {
        return {
          success: false,
          message: "No se encontró el token de restablecimiento",
        };
      }

      const response = await resetPassword_setNewPassword(
        resetToken,
        newPassword
      );

      // setNewPassword ya elimina el resetToken de localStorage al completarse

      if (response.success) {
        return {
          success: true,
          message: response.message || "Contraseña actualizada correctamente",
        };
      } else {
        return {
          success: false,
          message: response.message || "Error al actualizar la contraseña",
        };
      }
    } catch (error) {
      console.error("Error al resetear contraseña:", error);
      return {
        success: false,
        message: error.message || "Error al actualizar la contraseña",
      };
    }
  };

  // ========== INICIALIZACIÓN ==========

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    const validateToken = async () => {
      const token = obtenerToken();

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Intentar verificar el token actual
        const response = await auth_me();
        console.log(response);

        if (response && response.user) {
          // Token válido, establecer usuario
          setUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(response.user));
          localStorage.setItem("auth", "true");
        }
      } catch (error) {
        // Si el error es de autorización (token expirado/inválido)
        if (error.response?.status === 401) {
          try {
            // Intentar refrescar el token
            const refreshToken = obtenerRefreshToken();
            if (!refreshToken) {
              throw new Error("No hay refresh token disponible");
            }

            const refreshResponse = await auth_refresh(refreshToken);

            if (refreshResponse && refreshResponse.token) {
              // Guardar el nuevo token
              guardarToken(refreshResponse.token);

              try {
                // Verificar nuevamente con el token refrescado
                const newResponse = await auth_me();

                if (newResponse && newResponse.user) {
                  // Token refrescado válido
                  setUser(newResponse.user);
                  setIsAuthenticated(true);
                  localStorage.setItem(
                    "user",
                    JSON.stringify(newResponse.user)
                  );
                  localStorage.setItem("auth", "true");
                  console.log("Usuario verificado con token refrescado");
                  navigateToHomeByRole(newResponse.user);
                } else {
                  throw new Error(
                    "Verificación fallida después de refrescar token"
                  );
                }
              } catch (secondError) {
                logout();
              }
            } else {
              throw new Error("Refresco de token fallido");
            }
          } catch (refreshError) {
            logout();
          }
        } else {
          // Cualquier otro tipo de error, cerrar sesión
          console.error("Error no relacionado con autorización:", error);
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // Proveedor de contexto
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated,
        // Registro
        verifyIdentification,
        requestAccess,
        // Recuperación de contraseña
        verifyEmailExists,
        sendVerificationCode,
        verifyCode,
        resetPassword,
        // Funciones de redirección
        getHomeRouteByRole,
        navigateToHomeByRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
