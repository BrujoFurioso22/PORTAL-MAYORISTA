import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import { useState } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import {
  adminRoutes,
  ecommerceRoutes,
  coordinadorRoutes,
  publicRoutes,
} from "./routes/routes";
import { createGlobalStyle } from "styled-components";
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./routes/ProtectedRoutes";
import Layout from "./components/layout/Layout";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import MainContent from "./components/layout/MainContent";
import CleanLayout from "./components/layout/CleanLayout";
import Login from "./pages/auth/Login";
import NotFound from "./pages/NotFound";
import { ROUTES } from "./constants/routes";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    font-family: "Quicksand", sans-serif !important;
    font-optical-sizing: auto !important;
    font-weight: 400;
    font-style: normal;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  html, body, #root {
    max-width: 100vw;
    overflow-x: hidden;
    transition: background-color 0.3s ease, color 0.3s ease;
    height: 100%;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
  
  // Añadir transición para todos los elementos que usan colores temáticos
  button, a, input, select, textarea, div, span, p, h1, h2, h3, h4, h5, h6 {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
`;

const App = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isEcommercePage = true; // Temporalmente true para todas las páginas

  // Determinar si estamos en una página de catálogo
  // const isEcommercePage =
  //   location.pathname === "/" ||
  //   location.pathname.startsWith("/catalogo") ||
  //   location.pathname.startsWith("/productos") ||
  //   location.pathname.startsWith("/carrito");

  // Toggle sidebar
  const toggleSidebar = () => {
    if (!isEcommercePage) {
      setSidebarOpen((prev) => !prev);
    }
  };

  // Componente interno para manejar el layout con autenticación
  const AuthenticatedLayout = () => (
    <Layout>
      <Header
        onToggleSidebar={toggleSidebar}
        showSidebarToggle={!isEcommercePage}
      />
      <MainContent>
        {!isEcommercePage && (
          <Sidebar onToggleSidebar={toggleSidebar} open={sidebarOpen} />
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          {/* Este Outlet es clave - renderiza las rutas hijas */}
          <Outlet />
        </div>
      </MainContent>
    </Layout>
  );

  return (
    <>
      <GlobalStyle />

      <Routes>
        {/* Rutas con layout limpio (sin header ni sidebar) */}
        <Route element={<CleanLayout />}>
          <Route
            path={ROUTES.PUBLIC.LOGIN}
            element={
              isAuthenticated ? (
                <Navigate to={ROUTES.ECOMMERCE.HOME} />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path={ROUTES.AUTH.REGISTER}
            element={
              isAuthenticated ? (
                <Navigate to={ROUTES.ECOMMERCE.HOME} />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path={ROUTES.AUTH.FORGOT_PASSWORD}
            element={
              isAuthenticated ? (
                <Navigate to={ROUTES.ECOMMERCE.HOME} />
              ) : (
                <ForgotPassword />
              )
            }
          />
          <Route path={ROUTES.PUBLIC.NOT_FOUND} element={<NotFound />} />
        </Route>

        {/* Layout principal con rutas autenticadas */}
        {isAuthenticated ? (
          <Route element={<AuthenticatedLayout />}>
            {/* Rutas de E-commerce */}
            {ecommerceRoutes.map((route, idx) => (
              <Route
                key={`ecommerce-${idx}`}
                path={route.path}
                element={route.element}
                index={route.path === "/"}
              />
            ))}

            {/* Rutas públicas adicionales */}
            {publicRoutes.map((route, idx) => (
              <Route
                key={`public-${idx}`}
                path={route.path}
                element={route.element}
              />
            ))}

            {/* Rutas de administrador */}
            {adminRoutes.map((route, idx) => (
              <Route
                key={`admin-${idx}`}
                path={route.path}
                element={
                  <ProtectedRoute
                    allowedRoles={route.allowedRoles}
                    element={route.element}
                  />
                }
              />
            ))}

            {/* Rutas de coordinadora */}
            {coordinadorRoutes.map((route, idx) => (
              <Route
                key={`coordinadora-${idx}`}
                path={route.path}
                element={
                  <ProtectedRoute
                    allowedRoles={route.allowedRoles}
                    element={route.element}
                  />
                }
              />
            ))}

            {/* Ruta para 404 dentro del layout autenticado */}
            <Route
              path="*"
              element={<Navigate to={ROUTES.PUBLIC.NOT_FOUND} />}
            />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to={ROUTES.PUBLIC.LOGIN} />} />
        )}
      </Routes>

      <ToastContainer />
    </>
  );
};

export default App;
