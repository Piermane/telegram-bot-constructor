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
                Создайте аккаунт
              </Text>
            </VStack>

            {/* Register Form */}
            <Card bg={cardBg} w="full" shadow="lg">
              <CardBody p={8}>
                <VStack spacing={6}>
                  <Heading size="md" textAlign="center">
                    Регистрация
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
                      <HStack spacing={4} w="full">
                        <FormControl>
                          <FormLabel>Имя</FormLabel>
                          <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Иван"
                            required
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Фамилия</FormLabel>
                          <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Иванов"
                            required
                          />
                        </FormControl>
                      </HStack>

                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          required
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Пароль</FormLabel>
                        <Input
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Минимум 6 символов"
                          required
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Подтвердите пароль</FormLabel>
                        <Input
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Повторите пароль"
                          required
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme="brand"
                        size="lg"
                        w="full"
                        isLoading={isLoading}
                        loadingText="Регистрация..."
                      >
                        Зарегистрироваться
                      </Button>
                    </VStack>
                  </Box>

                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Уже есть аккаунт?{' '}
                    <Link as={RouterLink} to="/login" color="brand.500">
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
