import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <>
      {/* FIXED GRADIENT BACKGROUND - НЕ МОЖЕТ БЫТЬ ПЕРЕЗАПИСАН! */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={-1}
        background="linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 40%, #ff6b9d 60%, #ffc65c 80%, #f6d365 100%)"
        backgroundSize="400% 400%"
        sx={{
          animation: 'stripeGradientFlow 20s ease infinite',
        }}
      />
      
      {/* BLOB LAYER 1 */}
      <Box
        position="fixed"
        top="-50%"
        left="-50%"
        width="200%"
        height="200%"
        zIndex={-2}
        background="radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 107, 157, 0.4) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(240, 147, 251, 0.3) 0%, transparent 50%)"
        sx={{
          filter: 'blur(80px)',
          opacity: 0.7,
          animation: 'blobFloat 15s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      
      {/* BLOB LAYER 2 */}
      <Box
        position="fixed"
        top="-30%"
        left="-30%"
        width="160%"
        height="160%"
        zIndex={-1}
        background="radial-gradient(circle at 60% 40%, rgba(118, 75, 162, 0.3) 0%, transparent 50%), radial-gradient(circle at 30% 60%, rgba(255, 198, 92, 0.3) 0%, transparent 50%)"
        sx={{
          filter: 'blur(60px)',
          opacity: 0.6,
          animation: 'blobFloat2 18s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }}
      />
      
      <Flex minH="100vh" position="relative" bg="transparent">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <Box flex="1" ml={{ base: 0, md: '250px' }} bg="transparent">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <Box bg="transparent">
            <Outlet />
          </Box>
        </Box>
      </Flex>
    </>
  );
};

export default Layout;
