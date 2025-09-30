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
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Box
      h="16"
      bg={bg}
      borderBottom="1px solid"
      borderBottomColor={borderColor}
      px={6}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      {/* Left side - can add breadcrumbs or page title here */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" color="gray.800">
          {/* Dynamic page title can go here */}
        </Text>
      </Box>

      {/* Right side - user menu */}
      <HStack spacing={4}>
        {/* Notifications */}
        <IconButton
          aria-label="Notifications"
          icon={<BellIcon />}
          variant="ghost"
          size="sm"
        />

        {/* User Menu */}
        <Menu>
          <MenuButton
            as={Button}
            variant="ghost"
            size="sm"
            rightIcon={<ChevronDownIcon />}
          >
            <HStack spacing={2}>
              <Avatar
                size="sm"
                name={`${user?.firstName} ${user?.lastName}`}
                bg="brand.500"
                color="white"
              >
                {getInitials(user?.firstName, user?.lastName)}
              </Avatar>
              <Text fontSize="sm" fontWeight="medium">
                {user?.firstName} {user?.lastName}
              </Text>
            </HStack>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => navigate('/settings')}>
              ⚙️ Настройки
            </MenuItem>
            <MenuItem onClick={() => navigate('/profile')}>
              👤 Профиль
            </MenuItem>
            <MenuItem>
              📚 Документация
            </MenuItem>
            <MenuItem>
              🆘 Поддержка
            </MenuItem>
            <MenuItem onClick={handleLogout} color="red.500">
              🚪 Выйти
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Box>
  );
};

export default Header;
