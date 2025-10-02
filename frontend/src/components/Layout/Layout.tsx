import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <Box
      minH="100vh"
      sx={{
        background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #ff6b9d, #ffc65c, #f6d365)',
        backgroundSize: '400% 400%',
        animation: 'stripeGradientFlow 20s ease infinite',
      }}
    >
      <Flex minH="100vh" position="relative">
        <Sidebar />
        
        <Box flex="1" ml={{ base: 0, md: '250px' }}>
          <Header />
          
          <Box>
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
