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
      py={2.5}
      borderRadius="md"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : 'gray.600'}
      _hover={{
        bg: isActive ? activeBg : hoverBg,
        textDecoration: 'none',
        color: isActive ? activeColor : 'gray.800',
      }}
      transition="all 0.15s ease"
      w="full"
      fontWeight={isActive ? '600' : '500'}
      fontSize="sm"
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
      bg="rgba(255, 255, 255, 0.15)"
      backdropFilter="blur(12px) saturate(180%)"
      borderRight="1px solid"
      borderRightColor="rgba(255, 255, 255, 0.2)"
      p={4}
      zIndex={1000}
      display={{ base: 'none', md: 'block' }}
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.15)"
    >
      <VStack spacing={6} align="stretch" h="full">
        {/* Logo */}
        <VStack spacing={1} py={4}>
          <Text fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, purple.600, blue.500)" bgClip="text">
            Bot Constructor
          </Text>
          <Text fontSize="xs" color="gray.500" textAlign="center" fontWeight="medium">
            Production v1.0
          </Text>
        </VStack>

        <Divider />

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

        <Divider />

        {/* Footer */}
        <VStack spacing={2}>
          <Text fontSize="xs" color="gray.400" fontWeight="medium">
            v1.0.0
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Sidebar;
