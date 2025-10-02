import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <Box
      position="relative"
      minH="100vh"
      overflow="hidden"
      sx={{
        background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
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
