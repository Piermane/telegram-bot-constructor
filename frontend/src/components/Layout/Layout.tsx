import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <>
      {/* STRIPE GRADIENT - НА ВСЮ СТРАНИЦУ! */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 40%, #ff6b9d 60%, #ffc65c 80%, #f6d365 100%)',
          backgroundSize: '400% 400%',
          animation: 'stripeGradientFlow 20s ease infinite',
        }}
      />

      <Flex minH="100vh" position="relative">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <Box flex="1" ml={{ base: 0, md: '250px' }}>
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <Box>
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </>
  );
};

export default Layout;
