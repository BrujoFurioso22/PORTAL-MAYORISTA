import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './Layout';
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';

const AuthenticatedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Función para cambiar el estado del sidebar
  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  
  return (
    <Layout>
      <Header onToggleSidebar={toggleSidebar} showSidebarToggle={true} />
      <MainContent>
        {/* <Sidebar onToggleSidebar={toggleSidebar} open={sidebarOpen} /> */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
          <Outlet />
        </div>
      </MainContent>
    </Layout>
  );
};

export default AuthenticatedLayout;