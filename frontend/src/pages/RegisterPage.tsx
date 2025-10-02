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
                Создайте аккаунт
              </Text>
            </VStack>

            {/* Register Form */}
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
                    Регистрация
                  </Heading>

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
