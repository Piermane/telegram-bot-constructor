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
        bg={useColorModeValue('gray.50', 'gray.900')}
        p={4}
      >
        <Box maxW="md" w="full">
          <VStack spacing={8} align="stretch">
            {/* Logo */}
            <VStack spacing={3} textAlign="center">
              <Box
                bgGradient="linear(to-br, blue.500, purple.600)"
                borderRadius="xl"
                p={4}
                display="inline-flex"
                boxShadow="lg"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" opacity="0.9"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Box>
              <Heading 
                size="xl" 
                fontWeight="bold"
                bgGradient="linear(to-r, blue.600, purple.600)"
                bgClip="text"
                letterSpacing="tight"
              >
                Bot Constructor
              </Heading>
              <Text color="gray.600" fontSize="md">
                Создавайте ботов без кода
              </Text>
            </VStack>

            {/* Login Form */}
            <Card 
              bg={cardBg} 
              w="full" 
              boxShadow="xl"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <CardBody p={8}>
                <VStack spacing={6}>
                  <Heading size="md" fontWeight="semibold">
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
                    <VStack spacing={5}>
                      <FormControl>
                        <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Email</FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="dev@example.com"
                          size="lg"
                          borderRadius="lg"
                          _focus={{ borderColor: 'purple.500', boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)' }}
                          required
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" fontSize="sm" color="gray.700">Пароль</FormLabel>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                        loadingText="Вход..."
                        borderRadius="lg"
                        fontWeight="semibold"
                        _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                        transition="all 0.2s"
                      >
                        Войти
                      </Button>
                    </VStack>
                  </Box>

                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Нет аккаунта?{' '}
                    <Link as={RouterLink} to="/register" color="purple.600" fontWeight="medium" _hover={{ color: 'purple.700' }}>
                      Зарегистрироваться
                    </Link>
                  </Text>

                  {/* Dev credentials info */}
                  <Box
                    p={4}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={useColorModeValue('blue.200', 'blue.700')}
                    w="full"
                  >
                    <Text fontWeight="semibold" color={useColorModeValue('blue.900', 'blue.100')} fontSize="sm" mb={1}>
                      Система для администраторов
                    </Text>
                    <Text color={useColorModeValue('blue.700', 'blue.300')} fontSize="sm">
                      Доступ только по приглашению
                    </Text>
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
