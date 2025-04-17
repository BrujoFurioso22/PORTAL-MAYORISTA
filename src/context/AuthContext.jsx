import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  eliminarTokens,
  guardarRefreshToken,
  guardarToken,
  obtenerRefreshToken,
  obtenerToken,
} from "../utils/encryptToken";
import { toast } from "react-toastify";
import { ROUTES } from "../constants/routes";
import api from "../constants/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado para verificar si el usuario está autenticado
  const navigate = useNavigate();

  // const logout = () => {
  //   eliminarTokens(); // Eliminar token del localStorage
  //   setUser(null);
  //   navigate(ROUTES.Auth.Login); // Redirigir a la página de inicio de sesión
  // };

  // const login = async (email, password) => {
  //   let res = await auth_login({ email, password });

  //   // const res = {
  //   //   success: true,
  //   //   data: {
  //   //     token: "1010",
  //   //     refresh_token: "2020",
  //   //     user: { name: "admin" },
  //   //   },
  //   //   message: "OK",
  //   // };

  //   if (res.success) {
  //     guardarToken(res.data.token); // Guardar token en localStorage
  //     guardarRefreshToken(res.data.refresh_token); // Guardar refresh token en localStorage
  //     setUser(res.data.user); // Guardar usuario en el estado

  //     toast.success(res.message);
  //     navigate("/"); // Redirigir a la página principal
  //   } else {
  //     toast.error(res.message);
  //   }
  //   return res;
  // };

  const login = async (email, password) => {
    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Credenciales de prueba
      if (email === "admin@mayorista.com" && password === "123456") {
        const userData = {
          CODIGO_USUARIO: 1,
          NOMBRE_USUARIO: "Administrador",
          ROLES: ["ADMIN"],
          EMAIL: email,
          // Acceso a todas las empresas
          BUSSINES_ACCESS: ["maxximundo", "stox", "ikonix"],
        };

        // Guardar en localStorage para persistencia
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", "mock-token-12345");
        localStorage.setItem("auth", "true"); // Añadir un flag de autenticación

        // Actualizar el estado
        setUser(userData);

        // IMPORTANTE: Añadir esta línea (falta en este caso)
        setIsAuthenticated(true);

        toast.success("Inicio de sesión exitoso");
        // IMPORTANTE: Pequeño retraso antes de navegar
        setTimeout(() => {
          navigate("/");
        }, 100);

        return {
          success: true,
          data: userData,
          message: "Inicio de sesión exitoso",
        };
      } else if (email === "vendedor@mayorista.com" && password === "123456") {
        const userData = {
          CODIGO_USUARIO: 2,
          NOMBRE_USUARIO: "Vendedor",
          ROLES: ["VENDEDOR"],
          EMAIL: email,
          // Acceso a solo algunas empresas
          BUSSINES_ACCESS: ["maxximundo", "stox"],
        };

        // Guardar en localStorage para persistencia
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", "mock-token-67890");

        // Actualizar el estado
        setUser(userData);
        setIsAuthenticated(true);

        toast.success("Inicio de sesión exitoso");
        // IMPORTANTE: Pequeño retraso antes de navegar
        setTimeout(() => {
          navigate("/");
        }, 100);

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
      toast.error("Error al iniciar sesión");
      return {
        success: false,
        message: "Error al iniciar sesión",
      };
    }
  };

  // const refreshToken = async () => {
  //   try {
  //     const refresh = obtenerRefreshToken();

  //     const res = await api.post("/auth/refreshToken", {
  //       refreshToken: refresh,
  //     });
  //     // const res = { data: { token: "1010" } };
  //     guardarToken(res.data.token); // Guardar nuevo token en localStorage
  //     return res.data.token; // Retornar el nuevo token
  //   } catch {
  //     logout(); // Si falla, cerrar sesión
  //   }
  // };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart"); // Limpiar el carrito también
    setUser(null);
    setIsAuthenticated(false);
    navigate("/auth/login");
    return { success: true };
  };

  // Verificar si hay un usuario en localStorage al cargar la aplicación
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        // Verificar de manera explícita el estado de autenticación
        const isAuthVal = localStorage.getItem("auth");

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          console.log("Usuario autenticado desde localStorage");
        } else {
          console.log("No hay usuario en localStorage");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error al verificar la autenticación:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        setIsAuthenticated(false);
      } finally {
        // Siempre establecer loading a false para mostrar la aplicación
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // useEffect(() => {
  //   const validateToken = async () => {
  //     const token = obtenerToken();

  //     if (!token) {
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const res = await api.get("/auth/me");
  //       // const res = { data: { user: { name: "admin" } } };
  //       setUser(res.data.user); // Establecer el usuario en el estado
  //     } catch (err) {
  //       console.log("Refrescando token...");
  //       if (err.response?.status === 401) {
  //         const newToken = await refreshToken(); // Intentar refrescar el token

  //         if (newToken) {
  //           try {
  //             const res = await api.get("/auth/me");
  //             setUser(res.data.user); // Establecer el usuario en el estado
  //           } catch {
  //             logout(); // Si no se puede refrescar, cerrar sesión
  //           }
  //         } else {
  //           logout(); // Si no se puede refrescar, cerrar sesión
  //         }
  //       } else {
  //         logout(); // Si no se puede refrescar, cerrar sesión
  //       }
  //     } finally {
  //       setLoading(false); // Cambiar el estado de carga
  //     }
  //   };
  //   validateToken(); // Validar el token al cargar el componente
  // }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
