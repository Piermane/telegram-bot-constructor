import React from 'react';
import {
  Box,
  HStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { ChevronDownIcon, BellIcon } from '@chakra-ui/icons';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    // Берем ТОЛЬКО первую букву имени и первую букву фамилии (не первые 2 буквы каждого!)
    const firstInitial = firstName?.[0] || '';
    const lastInitial = lastName?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  return (
    <Box
      h="16"
      bg="transparent"
      px={6}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      {/* Left side */}
      <Box />

      {/* Right side - user menu (Stripe style) */}
      <HStack spacing={4}>
        {/* Notifications */}
        <IconButton
          aria-label="Notifications"
          icon={<BellIcon />}
          variant="ghost"
          size="md"
          color="gray.600"
          _hover={{ bg: 'gray.100' }}
        />

        {/* User Menu */}
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            size="md"
            rightIcon={<ChevronDownIcon />}
            _hover={{ bg: 'gray.100' }}
            px={3}
          >
            <HStack spacing={3}>
              <Avatar
                size="sm"
                bg="#6772e5"
                color="white"
                fontWeight="600"
                fontSize="sm"
              >
                {getInitials(user?.firstName, user?.lastName)}
              </Avatar>
              <Text fontSize="sm" fontWeight="500" color="gray.700">
                {user?.firstName} {user?.lastName}
              </Text>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => navigate('/settings')}>
              Настройки
            </MenuItem>
            <MenuItem onClick={() => navigate('/profile')}>
              Профиль
            </MenuItem>
            <MenuItem>
              Документация
            </MenuItem>
            <MenuItem>
              Поддержка
            </MenuItem>
            <MenuItem onClick={handleLogout} color="red.500" fontWeight="medium">
              Выйти
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Box>
  );
};

export default Header;
