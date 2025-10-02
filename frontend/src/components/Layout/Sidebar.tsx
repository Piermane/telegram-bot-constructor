import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdSmartToy,
  MdApps,
  MdAnalytics,
  MdSettings,
  MdCode,
} from 'react-icons/md';

interface NavItemProps {
  icon: any;
  children: React.ReactNode;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      as={NavLink}
      to={to}
      p={3}
      borderRadius="lg"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : 'gray.600'}
      _hover={{
        bg: isActive ? activeBg : hoverBg,
        textDecoration: 'none',
      }}
      transition="all 0.2s"
      w="full"
    >
      <HStack spacing={3}>
        <Icon as={icon} boxSize={5} />
        <Text fontWeight={isActive ? 'semibold' : 'medium'}>
          {children}
        </Text>
      </HStack>
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
      bg={bg}
      borderRight="1px solid"
      borderRightColor={borderColor}
      p={4}
      zIndex={1000}
      display={{ base: 'none', md: 'block' }}
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
        <VStack spacing={2} align="stretch" flex={1}>
          <NavItem icon={MdDashboard} to="/dashboard">
            Dashboard
          </NavItem>
          <NavItem icon={MdSmartToy} to="/bots">
            Мои боты
          </NavItem>
          <NavItem icon={MdApps} to="/templates">
            Шаблоны
          </NavItem>
          <NavItem icon={MdAnalytics} to="/analytics">
            Аналитика
          </NavItem>
          <NavItem icon={MdSettings} to="/settings">
            Настройки
          </NavItem>
        </VStack>

        <Divider />

        {/* Footer */}
        <VStack spacing={2}>
          <HStack spacing={2} fontSize="xs" color="gray.500">
            <Icon as={MdCode} />
            <Text>v1.0.0-dev</Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Sidebar;
