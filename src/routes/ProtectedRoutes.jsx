// routes/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../constants/routes";

const ProtectedRoute = ({
  element,
  allowedRoles = [],
  isPublicRoute = false, // Nuevo parámetro para identificar rutas públicas como login
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation(); // Añadir useLocation para obtener la ruta actual
  
  // Si es una ruta pública (como login) y el usuario ya está autenticado
  // redirigirlo al home correspondiente según su rol
  if (isPublicRoute && isAuthenticated) {
    // Determinar la página de inicio según el rol del usuario
    if (user?.ROLES?.includes("COORDINADOR")) {
      return <Navigate to={ROUTES.COORDINADOR.HOME} replace />;
    } else if (user?.ROLES?.includes("ADMIN")) {
      return <Navigate to={ROUTES.ADMIN.USER_ADMIN} replace />;
    } else {
      // Usuario normal (cliente)
      return <Navigate to={ROUTES.ECOMMERCE.HOME} replace />;
    }
  }
  
  // Si NO está autenticado y la ruta requiere autenticación
  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to={ROUTES.AUTH.LOGIN} state={{ from: location.pathname }} replace />;
  }

  // Si se especifican roles y el usuario no tiene los permisos necesarios
  if (isAuthenticated && allowedRoles.length > 0 && !allowedRoles.some(role => user?.ROLES?.includes(role))) {
    // Si no tiene los permisos, mandarlo a NOT_FOUND o a su página HOME según configuración
    return <Navigate to={ROUTES.PUBLIC.NOT_FOUND} replace />;
  }

  // Si todas las condiciones se cumplen correctamente, mostrar el componente
  return element;
};

export default ProtectedRoute;
