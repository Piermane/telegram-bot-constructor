import React, { useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Link,
  Alert,
  AlertIcon,
  useColorModeValue,
  HStack,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../store/authStore';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuthStore();
  const navigate = useNavigate();

  const cardBg = useColorModeValue('white', 'gray.800');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Регистрация - TelegramBot Constructor</title>
      </Helmet>

      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
        bgGradient="linear(135deg, #80d0ff 0%, #a0b4ff 25%, #c79fff 50%, #ff9acd 75%, #ffb380 100%)"
        p={4}
        sx={{
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(circle at 30% 40%, rgba(128, 208, 255, 0.5) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 179, 128, 0.5) 0%, transparent 50%)',
            animation: 'loginGradient 16s ease-in-out infinite',
            filter: 'blur(60px)',
          },
          '@keyframes loginGradient': {
            '0%, 100%': {
              opacity: 0.6,
              transform: 'translate(0, 0) scale(1)',
            },
            '50%': {
              opacity: 0.8,
              transform: 'translate(2%, 2%) scale(1.05)',
            },
          },
        }}
      >
        <Box maxW="md" w="full" position="relative" zIndex={1}>
          <VStack spacing={8} align="stretch">
            {/* Logo */}
            <VStack spacing={3} textAlign="center">
              <Heading 
                fontSize="2xl"
                fontWeight="600"
                color="white"
                letterSpacing="-0.01em"
              >
                Bot Constructor
              </Heading>
              <Text color="rgba(255, 255, 255, 0.9)" fontSize="md" fontWeight="normal">
                Создайте новый аккаунт
              </Text>
            </VStack>

            <Card 
              bg="white"
              w="full" 
              boxShadow="0 20px 50px rgba(0,0,0,0.15)"
              borderRadius="lg"
              borderWidth="0"
            >
              <CardBody p={10}>
                <VStack spacing={6}>

                  {error && (
                    <Alert status="error" borderRadius="lg">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  <Box
                    as="form"
                    onSubmit={handleSubmit}
                    w="full"
                  >
                    <VStack spacing={5}>
                      <HStack spacing={4} w="full">
                        <FormControl>
                          <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Имя</FormLabel>
                          <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Иван"
                            size="lg"
                            borderRadius="lg"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                            required
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Фамилия</FormLabel>
                          <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Иванов"
                            size="lg"
                            borderRadius="lg"
                            _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                            required
                          />
                        </FormControl>
                      </HStack>

                      <FormControl>
                        <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Email</FormLabel>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          size="lg"
                          borderRadius="lg"
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          required
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Пароль</FormLabel>
                        <Input
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          size="lg"
                          borderRadius="lg"
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          required
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Подтвердите пароль</FormLabel>
                        <Input
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                          size="lg"
                          borderRadius="lg"
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          required
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme="purple"
                        size="lg"
                        w="full"
                        isLoading={isLoading}
                        loadingText="Регистрация..."
                        borderRadius="lg"
                        fontWeight="semibold"
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                      >
                        Зарегистрироваться
                      </Button>
                    </VStack>
                  </Box>

                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Уже есть аккаунт?{' '}
                    <Link as={RouterLink} to="/login" color="purple.600" fontWeight="medium" _hover={{ color: 'purple.700' }}>
                      Войти
                    </Link>
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Box>
    </>
  );
};

export default RegisterPage;
