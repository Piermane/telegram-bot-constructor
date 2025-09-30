import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Icon,
  useColorModeValue,
  Container,
  Flex,
  Stack,
  Avatar,
  Progress
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AddIcon, ViewIcon, SettingsIcon, InfoIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FiTarget, FiZap, FiShield, FiTrendingUp, FiUsers, FiMessageSquare, FiActivity, FiArrowRight } from 'react-icons/fi';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [stats, setStats] = useState({
    totalBots: 0,
    activeBots: 0,
    totalUsers: 0,
    totalMessages: 0
  });

  const [recentBots, setRecentBots] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Загружаем список ботов
      const response = await fetch('/api/deploy/list');
      const data = await response.json();
      
      if (data.success) {
        const bots = data.bots || [];
        setStats({
          totalBots: bots.length,
          activeBots: bots.filter((bot: any) => bot.status === 'running').length,
          totalUsers: bots.reduce((sum: number, bot: any) => sum + (bot.users || 0), 0),
          totalMessages: bots.reduce((sum: number, bot: any) => sum + (bot.messages || 0), 0)
        });
        setRecentBots(bots.slice(0, 3));
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const handleCreateBot = () => {
    navigate('/templates');
  };

  const features = [
    {
      icon: FiZap,
      title: 'Быстрое создание',
      description: 'Создавайте ботов за несколько минут с помощью готовых шаблонов'
    },
    {
      icon: FiTarget,
      title: 'Готовые сценарии',
      description: 'Шаблоны для магазинов, поддержки, мероприятий и образования'
    },
    {
      icon: FiShield,
      title: 'Безопасность',
      description: 'Все боты работают в изолированной среде с проверкой токенов'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Панель управления - Telegram Bot Constructor</title>
      </Helmet>

      {/* Hero Section */}
      <Box 
        bgGradient="linear(135deg, purple.600 0%, blue.500 100%)"
        py={16}
        px={4}
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          bgImage: 'radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={6} align="start" color="white">
            <Badge 
              colorScheme="whiteAlpha" 
              fontSize="sm" 
              px={3} 
              py={1} 
              borderRadius="full"
              bg="whiteAlpha.300"
            >
              Панель управления
            </Badge>
            <Heading 
              size="2xl" 
              fontWeight="bold"
              maxW="3xl"
            >
              Добро пожаловать 👋
            </Heading>
            <Text fontSize="xl" maxW="2xl" color="whiteAlpha.900">
              Создавайте и управляйте Telegram ботами без программирования.
              Готово к запуску за несколько минут.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                bg="white"
                color="purple.600"
                _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'xl' }}
                rightIcon={<AddIcon />}
                onClick={handleCreateBot}
                fontWeight="bold"
                borderRadius="xl"
                px={8}
                transition="all 0.2s"
              >
                Создать бота
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="whiteAlpha.400"
                color="white"
                _hover={{ bg: 'whiteAlpha.200', borderColor: 'white' }}
                rightIcon={<ViewIcon />}
                onClick={() => navigate('/bots')}
                fontWeight="semibold"
                borderRadius="xl"
                px={8}
              >
                Мои боты
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={12}>
        <VStack spacing={12} align="stretch">
          
          {/* Статистика */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card 
              bg={cardBg} 
              borderWidth="1px" 
              borderColor={borderColor}
              borderRadius="2xl"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: 'xl', borderColor: 'purple.400' }}
              cursor="pointer"
              onClick={() => navigate('/bots')}
            >
              <CardBody p={6}>
                <HStack spacing={4}>
                  <Flex
                    w={12}
                    h={12}
                    borderRadius="xl"
                    bgGradient="linear(to-br, purple.400, purple.600)"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiActivity} boxSize={6} color="white" />
                  </Flex>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">Всего ботов</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold">{stats.totalBots}</StatNumber>
                  </Stat>
                </HStack>
              </CardBody>
            </Card>

            <Card 
              bg={cardBg} 
              borderWidth="1px" 
              borderColor={borderColor}
              borderRadius="2xl"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            >
              <CardBody p={6}>
                <HStack spacing={4}>
                  <Flex
                    w={12}
                    h={12}
                    borderRadius="xl"
                    bgGradient="linear(to-br, green.400, green.600)"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiZap} boxSize={6} color="white" />
                  </Flex>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">Активных</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold" color="green.500">{stats.activeBots}</StatNumber>
                  </Stat>
                </HStack>
              </CardBody>
            </Card>

            <Card 
              bg={cardBg} 
              borderWidth="1px" 
              borderColor={borderColor}
              borderRadius="2xl"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            >
              <CardBody p={6}>
                <HStack spacing={4}>
                  <Flex
                    w={12}
                    h={12}
                    borderRadius="xl"
                    bgGradient="linear(to-br, blue.400, blue.600)"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiUsers} boxSize={6} color="white" />
                  </Flex>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">Пользователей</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold">{stats.totalUsers}</StatNumber>
                  </Stat>
                </HStack>
              </CardBody>
            </Card>

            <Card 
              bg={cardBg} 
              borderWidth="1px" 
              borderColor={borderColor}
              borderRadius="2xl"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
            >
              <CardBody p={6}>
                <HStack spacing={4}>
                  <Flex
                    w={12}
                    h={12}
                    borderRadius="xl"
                    bgGradient="linear(to-br, orange.400, orange.600)"
                    align="center"
                    justify="center"
                  >
                    <Icon as={FiMessageSquare} boxSize={6} color="white" />
                  </Flex>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">Сообщений</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold">{stats.totalMessages}</StatNumber>
                  </Stat>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Остальной контент */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="2xl">
            <CardBody>
              <Flex direction={{ base: 'column', lg: 'row' }} align="center" gap={8}>
                <VStack align="start" spacing={4} flex={1}>
                  <Heading size="xl" color="blue.500">
                    🤖 Telegram Bot Constructor
                  </Heading>
                  <Text fontSize="lg" color="gray.600">
                    Создавайте Telegram ботов быстро и просто. 
                    Готовые шаблоны, автоматический деплой и полное управление.
                  </Text>
                  <HStack spacing={4}>
                    <Button
                      size="lg"
                      colorScheme="blue"
                      leftIcon={<AddIcon />}
                      onClick={handleCreateBot}
                    >
                      Создать бота
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      leftIcon={<ViewIcon />}
                      as={RouterLink}
                      to="/bots"
                    >
                      Мои боты
                    </Button>
                  </HStack>
                </VStack>
                
                <Box fontSize="8xl" opacity={0.1}>
                  🤖
                </Box>
              </Flex>
            </CardBody>
          </Card>

          {/* Статистика */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <Stat bg={statBg} p={4} borderRadius="lg">
              <StatLabel>Всего ботов</StatLabel>
              <StatNumber>{stats.totalBots}</StatNumber>
              <StatHelpText>Созданных ботов</StatHelpText>
            </Stat>
            
            <Stat bg={statBg} p={4} borderRadius="lg">
              <StatLabel>Активные боты</StatLabel>
              <StatNumber color="green.500">{stats.activeBots}</StatNumber>
              <StatHelpText>Работают сейчас</StatHelpText>
            </Stat>
            
            <Stat bg={statBg} p={4} borderRadius="lg">
              <StatLabel>Пользователи</StatLabel>
              <StatNumber>{stats.totalUsers}</StatNumber>
              <StatHelpText>Общее количество</StatHelpText>
            </Stat>
            
            <Stat bg={statBg} p={4} borderRadius="lg">
              <StatLabel>Сообщения</StatLabel>
              <StatNumber>{stats.totalMessages}</StatNumber>
              <StatHelpText>Обработано</StatHelpText>
            </Stat>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            
            {/* Последние боты */}
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">🤖 Последние боты</Heading>
                  <Button size="sm" variant="ghost" as={RouterLink} to="/bots">
                    Все боты
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                {recentBots.length === 0 ? (
                  <VStack py={8} spacing={4}>
                    <Text color="gray.500">У вас пока нет ботов</Text>
                    <Button size="sm" colorScheme="blue" onClick={handleCreateBot}>
                      Создать первого бота
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {recentBots.map((bot: any, index) => (
                      <Box key={index} p={3} bg={statBg} borderRadius="md">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{bot.name}</Text>
                            <Text fontSize="sm" color="gray.600">@{bot.username}</Text>
                          </VStack>
                          <Badge colorScheme={bot.status === 'running' ? 'green' : 'gray'}>
                            {bot.status === 'running' ? '🟢 Работает' : '⚪ Остановлен'}
                          </Badge>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Возможности платформы */}
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">⚡ Возможности платформы</Heading>
              </CardHeader>
              <CardBody pt={0}>
                <VStack spacing={4} align="stretch">
                  {features.map((feature, index) => (
                    <Box key={index} p={3} bg={statBg} borderRadius="md">
                      <HStack spacing={3}>
                        <Icon as={feature.icon} color="blue.500" boxSize={5} />
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{feature.title}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {feature.description}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>

          </SimpleGrid>

          {/* Быстрые действия */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md">🚀 Быстрые действия</Heading>
            </CardHeader>
            <CardBody pt={0}>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Button
                  size="lg"
                  variant="outline"
                  leftIcon={<Icon as={FiTarget} />}
                  onClick={handleCreateBot}
                  h="auto"
                  p={6}
                  flexDirection="column"
                >
                  <Text mb={2}>Выбрать шаблон</Text>
                  <Text fontSize="sm" color="gray.500">
                    Готовые решения
                  </Text>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  leftIcon={<SettingsIcon />}
                  onClick={() => navigate('/bots/new')}
                  h="auto"
                  p={6}
                  flexDirection="column"
                >
                  <Text mb={2}>Создать с нуля</Text>
                  <Text fontSize="sm" color="gray.500">
                    Полная настройка
                  </Text>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  leftIcon={<ViewIcon />}
                  as={RouterLink}
                  to="/bots"
                  h="auto"
                  p={6}
                  flexDirection="column"
                >
                  <Text mb={2}>Управление</Text>
                  <Text fontSize="sm" color="gray.500">
                    Мои боты
                  </Text>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  leftIcon={<InfoIcon />}
                  as={RouterLink}
                  to="/analytics"
                  h="auto"
                  p={6}
                  flexDirection="column"
                >
                  <Text mb={2}>Аналитика</Text>
                  <Text fontSize="sm" color="gray.500">
                    Статистика
                  </Text>
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>

        </VStack>
      </Container>
    </>
  );
};

export default DashboardPage;