import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <>
      {/* STRIPE MESH GRADIENT - FIXED BACKGROUND */}
      <div className="stripe-mesh-gradient">
        <div className="mesh-blob mesh-blob-1"></div>
        <div className="mesh-blob mesh-blob-2"></div>
        <div className="mesh-blob mesh-blob-3"></div>
        <div className="mesh-blob mesh-blob-4"></div>
      </div>

      {/* CONTENT OVER GRADIENT */}
      <Flex minH="100vh" position="relative" style={{ zIndex: 1 }}>
        <Sidebar />
        
        <Box flex="1" ml={{ base: 0, md: '250px' }}>
          <Header />
          
          <Box>
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </>
  );
};

export default Layout;
