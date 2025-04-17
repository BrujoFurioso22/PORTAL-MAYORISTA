export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
  },
  ADMIN: {
    USER_ADMIN: "/admin/user-admin",
  },
  COORDINADOR: {
    HOME: "/coordinador",
    PEDIDOS: "/coordinador/pedidos",
    DETALLE_PEDIDO: "/coordinador/pedidos/:orderId",
    EDITAR_PEDIDO: "/coordinador/pedidos/:orderId/editar",
    PRODUCTOS: "/coordinador/productos",
    DETALLE_PRODUCTO: "/coordinador/productos/:id",
  },
  ECOMMERCE: {
    HOME: "/",
    CATALOGO: "/catalogo/:empresaId",
    DETALLE_PRODUCTO: "/productos/:id",
    CARRITO: "/carrito",
    MIS_PEDIDOS: "/mis-pedidos",
    DETALLE_PEDIDO: "/mis-pedidos/:orderId",
    PERFIL: "/perfil",
    SEARCH: "/search",
  },
  PUBLIC: {
    NOT_FOUND: "/404",
    LOGIN: "/auth/login",
  },
};
