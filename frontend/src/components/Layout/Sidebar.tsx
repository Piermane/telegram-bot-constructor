import React from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItemProps {
  children: React.ReactNode;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({ children, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('#6772e5', 'blue.200');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box
      as={NavLink}
      to={to}
      px={4}
      py={3}
      borderRadius="md"
      bg={isActive ? 'whiteAlpha.200' : 'transparent'}
      color="white"
      borderLeft="3px solid"
      borderLeftColor={isActive ? 'white' : 'transparent'}
      _hover={{
        bg: 'whiteAlpha.100',
        borderLeftColor: 'whiteAlpha.600',
        textDecoration: 'none',
      }}
      transition="all 0.2s ease"
      w="full"
      fontWeight={isActive ? '600' : '500'}
      fontSize="md"
    >
      {children}
    </Box>
  );
};

const Sidebar: React.FC = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      h="100vh"
      w="250px"
      bg="rgba(255, 255, 255, 0.12)"
      backdropFilter="blur(12px) saturate(180%)"
      p={4}
      zIndex={1000}
      display={{ base: 'none', md: 'block' }}
    >
      <VStack spacing={6} align="stretch" h="full">
        {/* Logo */}
        <VStack spacing={1} py={4}>
          <Text fontSize="xl" fontWeight="bold" color="white" textShadow="0 2px 8px rgba(0,0,0,0.3)">
            Bot Constructor
          </Text>
          <Text fontSize="xs" color="whiteAlpha.800" textAlign="center" fontWeight="medium">
            Production v1.0
          </Text>
        </VStack>

        <Divider opacity={0.2} />

        {/* Navigation */}
        <VStack spacing={1} align="stretch" flex={1}>
          <NavItem to="/dashboard">
            Dashboard
          </NavItem>
          <NavItem to="/bots">
            Мои боты
          </NavItem>
          <NavItem to="/templates">
            Шаблоны
          </NavItem>
          <NavItem to="/analytics">
            Аналитика
          </NavItem>
          <NavItem to="/settings">
            Настройки
          </NavItem>
        </VStack>

        <Divider opacity={0.2} />

        {/* Footer */}
        <VStack spacing={2}>
          <Text fontSize="xs" color="whiteAlpha.700" fontWeight="medium">
            v1.0.0
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Sidebar;
