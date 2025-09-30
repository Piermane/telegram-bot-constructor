import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <Flex minH="100vh" bg="gray.50">
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
  );
};

export default Layout;
