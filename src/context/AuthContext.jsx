import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import { auth_login } from "../services/auth/login";
import { auth_me, auth_refresh } from "../services/auth/auth";

import { users_create, users_getByAccount } from "../services/users/users";
import {
  resetPassword_requestPasswordReset,
  resetPassword_verifyResetCode,
  resetPassword_setNewPassword,
} from "../services/auth/password";
import { performLogout } from "../utils/authUtils";
import { guardarRefreshToken, guardarToken } from "../utils/encryptToken";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const navigate = useNavigate();

  // Función auxiliar para enmascarar el email
  const maskEmail = (email) => {
    if (!email) return "";
    let maskedEmail = "";

    if (Array.isArray(email)) {
      maskedEmail = email.map((e) => {
        // Dividir en usuario y dominio
        const [username, domain] = e.split("@");

        // Para el usuario, mostrar primera letra y asteriscos
        const maskedUsername =
          username.charAt(0) + "*".repeat(Math.max(2, username.length - 2));

        // Para el dominio, extraer la primera parte y la extensión de manera más robusta
        const domainParts = domain.split(".");
        const domainName = domainParts[0];
        // Unir todas las partes de la extensión (.com, .co.uk, .com.ec, etc.)
        const extension = domainParts.slice(1).join(".");

        const maskedDomain =
          domainName.charAt(0) + "*".repeat(Math.max(2, domainName.length - 2));

        return `${maskedUsername}@${maskedDomain}.${extension}`;
      });
    } else {
      // Dividir en usuario y dominio
      const [username, domain] = email.split("@");

      // Para el usuario, mostrar primera letra y asteriscos
      const maskedUsername =
        username.charAt(0) + "*".repeat(Math.max(2, username.length - 2));

      // Para el dominio, extraer la primera parte y la extensión de manera más robusta
      const domainParts = domain.split(".");
      const domainName = domainParts[0];
      // Unir todas las partes de la extensión (.com, .co.uk, .com.ec, etc.)
      const extension = domainParts.slice(1).join(".");

      const maskedDomain =
        domainName.charAt(0) + "*".repeat(Math.max(2, domainName.length - 2));

      maskedEmail = [`${maskedUsername}@${maskedDomain}.${extension}`];
    }

    return maskedEmail;
  };

  // ========== FUNCIONES REDIRECCIONAMIENTO ==========

  const getHomeRouteByRole = (user) => {
    if (!user) return ROUTES.AUTH.LOGIN;

    if (user.ROLE_NAME === ROLES.COORDINADOR) {
      return ROUTES.COORDINADOR.PEDIDOS;
    } else if (user.ROLE_NAME === ROLES.ADMIN) {
      return ROUTES.ADMIN.DASHBOARD_ADMIN;
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

      if (response.success) {
        const userData = response.data.user;

        // Guardar tokens si están en la respuesta
        if (response.data.accessToken) {
          guardarToken(response.data.accessToken);
        }

        if (response.data.refreshToken) {
          guardarRefreshToken(response.data.refreshToken);
        }

        localStorage.setItem("auth", "true");

        // Actualizar el estado
        setUser(userData);
        setIsAuthenticated(true);
        setIsClient(userData.ROLE_NAME === ROLES.CLIENTE);

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

  const limpiarDatosUsuario = () => {
    performLogout();
    // Limpiar estado
    setUser(null);
    setIsAuthenticated(false);
    // Redireccionar a login
    navigate(ROUTES.AUTH.LOGIN);
  };

  const logout = async () => {
    try {
      limpiarDatosUsuario();

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

      if (response.success && response.data.length > 0) {
        if (response.data) {
          // Usuario existente - extraer el primer usuario asociado a la cuenta
          const user = response.data[0];

          // Enmascarar el email para mostrarlo parcialmente por seguridad
          const maskedEmail = maskEmail(user.CORREOS);

          // Filtrar para obtener las empresas disponibles (no ocupadas)
          const userCompanies = user.EMPRESAS || [];
          const availableCompanies = ALL_COMPANIES.filter(
            (company) => !userCompanies.includes(company)
          );

          return {
            success: true,
            userExists: true,
            emails: user.CORREOS || [],
            maskedEmails: maskedEmail,
            availableCompanies: availableCompanies, // Solo empresas NO ocupadas
            userCompanies: userCompanies, // Opcionalmente, incluir las ya asignadas
            userId: user.ID_USER,
            userName: user.NOMBRE_SOCIO || "USUARIO SIN NOMBRE",
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

  const registerUser = async (userData) => {
    try {
      const response = await users_create(userData);

      if (response.success) {
        return {
          success: true,
          message: response.message || "Usuario registrado correctamente",
        };
      } else {
        return {
          success: false,
          message: response.message || "Error al registrar el usuario",
        };
      }
    } catch (error) {
      console.error("Error al registrar usuario: ", error);
      return {
        success: false,
        message: "Error al registrar el usuario",
      };
    }
  };

  // ========== FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ==========

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
      localStorage.removeItem("resetToken");

      if (response.success) {
        // El resetToken ya se guarda en localStorage en verifyResetCode si es necesario
        localStorage.setItem("resetToken", response.resetToken);
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
      // Si no hay token almacenado, no hacer nada
      if (!localStorage.getItem("accessToken")) {
        console.log("No hay token disponible");
        setLoading(false);
        return;
      }

      try {
        // Primer intento: verificar el token actual
        const response = await auth_me();

        if (response && response.user) {
          // Token válido, establecer usuario
          setUser(response.user);
          setIsClient(response.user.ROLE_NAME === ROLES.CLIENTE);
          setIsAuthenticated(true);
          localStorage.setItem("auth", "true");
        }
      } catch (error) {
        console.error("Error con token actual:", error);

        // Si el token actual falló, intentar refrescarlo
        try {
          const refreshResponse = await auth_refresh();

          if (refreshResponse && refreshResponse.token) {
            // Segundo intento: verificar con el token refrescado
            try {
              const newResponse = await auth_me();

              if (newResponse && newResponse.user) {
                // Token refrescado válido, establecer usuario
                setUser(newResponse.user);
                setIsClient(newResponse.user.ROLE_NAME === ROLES.CLIENTE);
                setIsAuthenticated(true);
                localStorage.setItem("auth", "true");
              } else {
                throw new Error("Verificación fallida con token refrescado");
              }
            } catch (secondError) {
              console.error("Error con token refrescado:", secondError);
              // Limpiar estado si incluso el token refrescado falla
              setUser(null);
              setIsAuthenticated(false);
              localStorage.removeItem("auth");
              localStorage.removeItem("user");
            }
          } else {
            throw new Error("No se pudo obtener un nuevo token");
          }
        } catch (refreshError) {
          console.error("Error al refrescar token:", refreshError);
          // Limpiar estado de autenticación si el refresco falla
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("auth");
          localStorage.removeItem("user");
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []); // Dependencias vacías

  // Proveedor de contexto
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        isAuthenticated,
        isClient,
        // Registro
        verifyIdentification,
        registerUser,
        // Recuperación de contraseña
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
