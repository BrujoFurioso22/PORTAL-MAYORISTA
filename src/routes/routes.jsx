// src/routes/routes.js
import { ROUTES } from "../constants/routes";
import { ROLES } from "../constants/roles";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";

// Importaciones de páginas ecommerce
import Catalogo from "../pages/catalogo/Catalogo";
import DetalleProducto from "../pages/catalogo/DetalleProducto";
import Carrito from "../pages/compras/Carrito";
import MisPedidos from "../pages/compras/MisPedidos";
import DetallePedido from "../pages/compras/DetallePedido";
import Perfil from "../pages/usuario/Perfil";
import SearchResults from "../pages/busqueda/SearchResults";
import Login from "../pages/auth/Login";
import ListaPedidos from "../pages/coordinadora/ListaPedidos";
import DetallePedidoCoordinador from "../pages/coordinadora/DetallePedido";
import EditarPedidoCoordinador from "../pages/coordinadora/EditarPedido";

// Rutas de E-commerce (accesibles para todos los usuarios autenticados)
export const ecommerceRoutes = [
  {
    path: ROUTES.ECOMMERCE.HOME,
    element: <Home />,
    exact: true,
  },
  {
    path: ROUTES.ECOMMERCE.CATALOGO,
    element: <Catalogo />,
  },
  {
    path: ROUTES.ECOMMERCE.DETALLE_PRODUCTO,
    element: <DetalleProducto />,
  },
  {
    path: ROUTES.ECOMMERCE.CARRITO,
    element: <Carrito />,
  },
  {
    path: ROUTES.ECOMMERCE.MIS_PEDIDOS,
    element: <MisPedidos />,
  },
  {
    path: ROUTES.ECOMMERCE.DETALLE_PEDIDO,
    element: <DetallePedido />,
  },
  {
    path: ROUTES.ECOMMERCE.PERFIL,
    element: <Perfil />,
  },
  {
    path: ROUTES.ECOMMERCE.SEARCH,
    element: <SearchResults />,
  },
];

// Rutas para administradores
export const adminRoutes = [
  {
    path: ROUTES.ADMIN.USER_ADMIN,
    element: <></>,
    allowedRoles: [ROLES.ADMIN],
    exact: true,
  },
  // Otras rutas de administradores...
];

// Rutas para coordinadora
export const coordinadorRoutes = [
  {
    path: ROUTES.COORDINADOR.PEDIDOS,
    element: <ListaPedidos/>, // Reemplazar con el componente adecuado
    allowedRoles: [ROLES.COORDINADOR],
    exact: true,
  },
  {
    path: ROUTES.COORDINADOR.DETALLE_PEDIDO,
    element: <DetallePedidoCoordinador />, // Reemplazar con el componente adecuado
    allowedRoles: [ROLES.COORDINADOR],
  },
  {
    path: ROUTES.COORDINADOR.EDITAR_PEDIDO,
    element: <EditarPedidoCoordinador />, // Reemplazar con el componente adecuado
    allowedRoles: [ROLES.COORDINADOR],
  },
  // Otras rutas para coordinadora...
];
// Rutas para coordinadora
export const publicRoutes = [
  {
    path: ROUTES.PUBLIC.LOGIN,
    element: <Login />, 
    exact: true,
  },
  {
    path: ROUTES.PUBLIC.NOT_FOUND,
    element: <NotFound />,
  },
];
