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
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('dev@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const cardBg = useColorModeValue('white', 'gray.800');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Вход - TelegramBot Constructor</title>
      </Helmet>

      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
        p={4}
      >
        <Box maxW="md" w="full">
          <VStack spacing={8} align="center">
            {/* Logo */}
            <VStack spacing={2}>
              <Text fontSize="4xl">🤖</Text>
              <Heading size="lg" textAlign="center">
                TelegramBot Constructor
              </Heading>
              <Text color="gray.600" textAlign="center">
                DEV Environment
              </Text>
            </VStack>

            {/* Login Form */}
            <Card bg={cardBg} w="full" shadow="lg">
              <CardBody p={8}>
                <VStack spacing={6}>
                  <Heading size="md" textAlign="center">
                    Вход в систему
                  </Heading>

                  {error && (
                    <Alert status="error" borderRadius="md">
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  <Box
                    as="form"
                    onSubmit={handleSubmit}
                    w="full"
                  >
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="dev@example.com"
                          required
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Пароль</FormLabel>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="password123"
                          required
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme="brand"
                        size="lg"
                        w="full"
                        isLoading={isLoading}
                        loadingText="Вход..."
                      >
                        Войти
                      </Button>
                    </VStack>
                  </Box>

                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Нет аккаунта?{' '}
                    <Link as={RouterLink} to="/register" color="brand.500">
                      Зарегистрироваться
                    </Link>
                  </Text>

                  {/* Dev credentials info */}
                  <Box
                    p={3}
                    bg="green.50"
                    borderRadius="md"
                    w="full"
                    fontSize="sm"
                  >
                    <Text fontWeight="bold" color="green.800" mb={1}>
                      💼 Система для администраторов
                    </Text>
                    <Text color="green.700">Доступ только по приглашению</Text>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;
