// routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  element,
  allowedRoles = [],
}) => {
  const { user, isAuthenticated } = useAuth();
  
  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles y el usuario no tiene los permisos
  if (allowedRoles.length > 0 && !allowedRoles.some(role => user?.ROLES?.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si está autenticado y tiene permisos, mostrar el componente
  return element;
};

export default ProtectedRoute;
