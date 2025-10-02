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
        <Box maxW="440px" w="full" position="relative" zIndex={1}>
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
                Войдите в свой аккаунт
              </Text>
            </VStack>

            {/* Login Form */}
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
                        <FormLabel fontWeight="500" fontSize="sm" color="#6b7c93" mb={2}>Email</FormLabel>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="dev@example.com"
                          h="44px"
                          fontSize="md"
                          bg="white"
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor="#e6ebf1"
                          color="#32325d"
                          _hover={{ borderColor: '#c2cbd6' }}
                          _focus={{ 
                            borderColor: '#6772e5', 
                            boxShadow: '0 0 0 1px #6772e5',
                            outline: 'none'
                          }}
                          _placeholder={{ color: '#8898aa' }}
                          required
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="500" fontSize="sm" color="#6b7c93" mb={2}>Пароль</FormLabel>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          h="44px"
                          fontSize="md"
                          bg="white"
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor="#e6ebf1"
                          color="#32325d"
                          _hover={{ borderColor: '#c2cbd6' }}
                          _focus={{ 
                            borderColor: '#6772e5', 
                            boxShadow: '0 0 0 1px #6772e5',
                            outline: 'none'
                          }}
                          _placeholder={{ color: '#8898aa' }}
                          required
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        w="full"
                        h="44px"
                        isLoading={isLoading}
                        loadingText="Вход..."
                        bg="#6772e5"
                        color="white"
                        fontSize="md"
                        fontWeight="600"
                        borderRadius="md"
                        _hover={{ 
                          bg: '#5469d4',
                          transform: 'translateY(-1px)', 
                          boxShadow: '0 7px 14px rgba(50,50,93,.1), 0 3px 6px rgba(0,0,0,.08)'
                        }}
                        _active={{ transform: 'translateY(0)', bg: '#5469d4' }}
                        transition="all 0.15s ease"
                        boxShadow="0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08)"
                      >
                        Войти
                      </Button>
                    </VStack>
                  </Box>

                  <Text fontSize="sm" color="#8898aa" textAlign="center">
                    Нет аккаунта?{' '}
                    <Link 
                      as={RouterLink} 
                      to="/register" 
                      color="#6772e5" 
                      fontWeight="500"
                      _hover={{ color: '#5469d4' }}
                      transition="color 0.15s ease"
                    >
                      Зарегистрироваться
                    </Link>
                  </Text>

                  {/* Dev credentials info */}
                  <Box
                    p={4}
                    bg="#f6f9fc"
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="#e6ebf1"
                    w="full"
                  >
                    <Text fontWeight="500" color="#6b7c93" fontSize="sm" mb={1}>
                      Система для администраторов
                    </Text>
                    <Text color="#8898aa" fontSize="xs">
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
