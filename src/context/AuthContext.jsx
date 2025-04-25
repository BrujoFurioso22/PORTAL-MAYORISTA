import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/routes";
import api from "../constants/api";
import { ROLES } from "../constants/roles";

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

  // ========== FUNCIONES REDIRECCIONAMIENTO ==========

  const getHomeRouteByRole = (user) => {
    if (!user) return ROUTES.PUBLIC.LOGIN;

    if (user.ROLES.includes(ROLES.COORDINADOR)) {
      return ROUTES.COORDINADOR.PEDIDOS;
    } else if (user.ROLES.includes(ROLES.ADMIN)) {
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
      await simulateNetworkDelay();

      const mockUser = MOCK_USERS[email];

      if (mockUser && mockUser.password === password) {
        const userData = mockUser.data;

        // Guardar en localStorage para persistencia
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", `mock-token-${Date.now()}`);
        localStorage.setItem("auth", "true");

        // Actualizar el estado
        setUser(userData);
        setIsAuthenticated(true);

        toast.success("Inicio de sesión exitoso");

        // Redireccionar según el rol del usuario
        let redirectPath = getHomeRouteByRole(userData);
        console.log(redirectPath);

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
      localStorage.removeItem("token");
      localStorage.removeItem("auth");
      localStorage.removeItem("cart");

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

  const verifyIdentification = async (identification) => {
    try {
      await simulateNetworkDelay();

      const identityData = MOCK_IDENTIFICATIONS[identification];

      if (identityData) {
        return {
          success: true,
          userExists: true,
          maskedEmail: identityData.maskedEmail,
          availableCompanies: identityData.availableCompanies,
        };
      } else {
        return {
          success: true,
          userExists: false,
        };
      }
    } catch (error) {
      console.error("Error al verificar identificación:", error);
      return {
        success: false,
        message: "Error al verificar la identificación",
      };
    }
  };

  const verifyExistingEmail = async (identification, email) => {
    try {
      await simulateNetworkDelay();

      const identityData = MOCK_IDENTIFICATIONS[identification];

      if (identityData && identityData.email === email) {
        return {
          success: true,
          message: "Email verificado correctamente",
        };
      } else {
        return {
          success: false,
          message: "El correo electrónico no coincide con nuestros registros",
        };
      }
    } catch (error) {
      console.error("Error al verificar email:", error);
      return {
        success: false,
        message: "Error al verificar el email",
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
      await simulateNetworkDelay(1000);

      // En un caso real, aquí se enviaría un email con el código
      // Para simulación, siempre usamos el mismo código
      const CODE = "123456";
      console.log(`Código de verificación enviado a ${email}: ${CODE}`);

      // Guardar en sessionStorage porque es temporal
      sessionStorage.setItem("verificationCode", CODE);
      sessionStorage.setItem("verificationEmail", email);

      return {
        success: true,
        message: "Código de verificación enviado correctamente",
      };
    } catch (error) {
      console.error("Error al enviar código:", error);
      return {
        success: false,
        message: "Error al enviar el código de verificación",
      };
    }
  };

  const verifyCode = async (code) => {
    try {
      await simulateNetworkDelay(600);

      const storedCode = sessionStorage.getItem("verificationCode");
      const isValid = code === storedCode;

      return {
        success: true,
        isValid: isValid,
        message: isValid
          ? "Código verificado correctamente"
          : "El código ingresado es incorrecto",
      };
    } catch (error) {
      console.error("Error al verificar código:", error);
      return {
        success: false,
        message: "Error al verificar el código",
      };
    }
  };

  const resetPassword = async (newPassword) => {
    try {
      await simulateNetworkDelay(1000);

      const email = sessionStorage.getItem("verificationEmail");

      // Limpiar datos temporales
      sessionStorage.removeItem("verificationCode");
      sessionStorage.removeItem("verificationEmail");

      console.log(`Contraseña actualizada para ${email}: ${newPassword}`);

      return {
        success: true,
        message: "Contraseña actualizada correctamente",
      };
    } catch (error) {
      console.error("Error al resetear contraseña:", error);
      return {
        success: false,
        message: "Error al actualizar la contraseña",
      };
    }
  };

  // ========== INICIALIZACIÓN ==========

  // Verificar estado de autenticación al cargar
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        const isAuthVal = localStorage.getItem("auth");

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          console.log("Usuario autenticado desde localStorage");
        } else {
          console.log("No hay usuario en localStorage");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Error al verificar la autenticación:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
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
        verifyExistingEmail,
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
