import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { ROUTES } from "../constants/routes";

const RootRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.ROLE === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN.USER_ADMIN);
      } else if (user.ROLE === ROLES.COORDINADOR) {
        navigate(ROUTES.COORDINADOR.PEDIDOS);
      } else {
        // CLIENTE o cualquier otro rol por defecto
        navigate(ROUTES.ECOMMERCE.HOME);
      }
    }
  }, [user, navigate]);

  // Este componente no renderiza nada visible
  return null;
};

export default RootRedirect;