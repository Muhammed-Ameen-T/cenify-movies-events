import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Vendor/Sidebar';
import Navbar from '../components/Vendor/Navbar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    console.log('Toggling sidebar, current state:', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  console.log('Rendering Layout, sidebarOpen:', sidebarOpen);

  return (
    <div className="flex h-screen bg-[#1E1E2D]">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarOpen ? '256px' : '64px',
          width: sidebarOpen ? 'calc(100% - 256px)' : 'calc(100% - 64px)',
        }}
      >
        <Navbar sidebarOpen={sidebarOpen} />

        <main className="flex-1 overflow-y-auto bg-[#1E1E2D] p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;