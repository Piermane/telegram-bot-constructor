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
        bgGradient="linear(to-br, blue.50, purple.50)"
        p={4}
        position="relative"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1), transparent 50%), radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1), transparent 50%)',
          pointerEvents: 'none'
        }}
      >
        <Box maxW="md" w="full" zIndex={1}>
          <VStack spacing={8} align="center">
            {/* Logo */}
            <VStack spacing={4}>
              <Box
                bgGradient="linear(to-br, blue.500, purple.600)"
                borderRadius="2xl"
                p={6}
                boxShadow="0 20px 60px rgba(99, 102, 241, 0.4)"
              >
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <VStack spacing={1}>
                <Heading 
                  size="2xl" 
                  textAlign="center"
                  fontWeight="bold"
                  bgGradient="linear(to-r, blue.600, purple.600)"
                  bgClip="text"
                  letterSpacing="tight"
                >
                  Bot Constructor
                </Heading>
                <Text color="gray.600" fontSize="lg" fontWeight="medium">
                  Создавайте ботов без кода
                </Text>
              </VStack>
            </VStack>

            {/* Login Form */}
            <Card 
              bg={cardBg} 
              w="full" 
              shadow="2xl"
              borderWidth="1px"
              borderColor={useColorModeValue('gray.200', 'gray.600')}
            >
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
