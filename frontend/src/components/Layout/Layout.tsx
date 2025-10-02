import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <>
      {/* Diagonal mesh background (fixed, behind everything) */}
      <div className="mesh-bg">
        <div className="mesh-blob mesh-blob-1"></div>
        <div className="mesh-blob mesh-blob-2"></div>
        <div className="mesh-blob mesh-blob-3"></div>
        <div className="mesh-blob mesh-blob-4"></div>
      </div>

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
