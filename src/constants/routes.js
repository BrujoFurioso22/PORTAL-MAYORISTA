export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
  },
  ADMIN: {
    DASHBOARD_ADMIN: "/admin/dashboard",
    USER_ADMIN: "/admin/usuarios",
    COORDINADOR_ADMIN: "/admin/coordinadores",
    // Otras rutas de admin...
  },
  COORDINADOR: {
    PEDIDOS: "/",
    DETALLE_PEDIDO: "/coordinador/pedidos/:orderId",
    EDITAR_PEDIDO: "/coordinador/pedidos/:orderId/editar",
    PRODUCTOS: "/coordinador/productos",
    DETALLE_PRODUCTO: "/coordinador/productos/:id",
  },
  ECOMMERCE: {
    HOME: "/",
    CATALOGO: "/catalogo/:empresaName",
    DETALLE_PRODUCTO: "/productos/:id",
    CARRITO: "/carrito",
    MIS_PEDIDOS: "/mis-pedidos",
    DETALLE_PEDIDO: "/mis-pedidos/:orderId",
    PERFIL: "/perfil",
    SEARCH: "/search",
  },
  PUBLIC: {
    NOT_FOUND: "/404",
  },
};
