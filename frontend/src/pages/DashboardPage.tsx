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
  Flex
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AddIcon, ViewIcon, SettingsIcon, InfoIcon } from '@chakra-ui/icons';
import { FiTarget, FiZap, FiShield, FiActivity } from 'react-icons/fi';
import { DashboardStatsSkeleton } from '../components/UI/SkeletonLoader';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const [stats, setStats] = useState({
    totalBots: 0,
    activeBots: 0,
    stoppedBots: 0,
    templatesAvailable: 7 // Статичное значение
  });

  const [recentBots, setRecentBots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Загружаем список ботов
      const response = await fetch('/api/deploy/list');
      const data = await response.json();
      
      if (data.success) {
        const bots = data.bots || [];
        setStats({
          totalBots: bots.length,
          activeBots: bots.filter((bot: any) => bot.status === 'running').length,
          stoppedBots: bots.filter((bot: any) => bot.status === 'stopped').length,
          templatesAvailable: 7
        });
        setRecentBots(bots.slice(0, 3));
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
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

      {/* Hero Section - НАСТОЯЩИЙ Stripe с ВОЛНАМИ */}
      <Box 
        py={{ base: 20, md: 32 }}
        px={4}
        position="relative"
        overflow="hidden"
        bgGradient="linear(135deg, #ff6b6b 0%, #ee5a6f 25%, #c44569 50%, #973a86 75%, #462446 100%)"
        sx={{
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(circle at 30% 40%, rgba(255, 107, 107, 0.4) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(151, 58, 134, 0.4) 0%, transparent 50%)',
            animation: 'gradientPulse 12s ease-in-out infinite',
            filter: 'blur(80px)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '-1px',
            left: 0,
            width: '100%',
            height: '100px',
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 120' preserveAspectRatio='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z' opacity='.25' fill='white'/%3E%3Cpath d='M0 0v15.81c13 21.11 27.64 41.05 47.69 56.24C99.41 111.27 165 111 224.58 91.58c31.15-10.15 60.09-26.07 89.67-39.8 40.92-19 84.73-46 130.83-49.67 36.26-2.85 70.9 9.42 98.6 31.56 31.77 25.39 62.32 62 103.63 73 40.44 10.79 81.35-6.69 119.13-24.28s75.16-39 116.92-43.05c59.73-5.85 113.28 22.88 168.9 38.84 30.2 8.66 59 6.17 87.09-7.5 22.43-10.89 48-26.93 60.65-49.24V0z' opacity='.5' fill='white'/%3E%3Cpath d='M0 0v5.63C149.93 59 314.09 71.32 475.83 42.57c43-7.64 84.23-20.12 127.61-26.46 59-8.63 112.48 12.24 165.56 35.4C827.93 77.22 886 95.24 951.2 90c86.53-7 172.46-45.71 248.8-84.81V0z' fill='white'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            zIndex: 1,
          },
          '@keyframes gradientPulse': {
            '0%, 100%': {
              opacity: 0.6,
              transform: 'scale(1)',
            },
            '50%': {
              opacity: 0.8,
              transform: 'scale(1.05)',
            },
          },
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={2}>
          <VStack spacing={10} align="center" textAlign="center" color="white">
            <Badge 
              fontSize="sm" 
              px={4} 
              py={2} 
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.12)"
              backdropFilter="blur(12px)"
              fontWeight="600"
              textTransform="none"
              color="white"
              borderWidth="1px"
              borderColor="rgba(255, 255, 255, 0.2)"
              boxShadow="0 2px 12px rgba(0,0,0,0.1)"
            >
              Production v2.0
            </Badge>
            <Heading 
              as="h1"
              fontSize={{ base: '5xl', md: '6xl', lg: '8xl' }}
              fontWeight="700"
              lineHeight="1"
              letterSpacing="-0.025em"
              maxW="1000px"
            >
              Создавайте ботов
              <br />
              без кода
            </Heading>
            <Text 
              fontSize={{ base: 'xl', md: '2xl' }} 
              maxW="700px" 
              color="rgba(255, 255, 255, 0.92)" 
              lineHeight="1.5"
              fontWeight="400"
            >
              Готовые шаблоны, автоматический деплой и полное управление. 
              Запустите первого бота за 5 минут.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                h="56px"
                px={8}
                bg="white"
                color="#c44569"
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  shadow: '0 12px 24px rgba(255,255,255,0.35)',
                }}
                rightIcon={<AddIcon />}
                onClick={handleCreateBot}
                fontWeight="600"
                borderRadius="lg"
                transition="all 0.2s ease"
                fontSize="lg"
                boxShadow="0 6px 20px rgba(255,255,255,0.25)"
              >
                Создать бота
              </Button>
              <Button
                size="lg"
                h="56px"
                px={8}
                bg="rgba(255, 255, 255, 0.08)"
                backdropFilter="blur(8px)"
                borderWidth="1px"
                borderColor="rgba(255, 255, 255, 0.2)"
                color="white"
                _hover={{ 
                  bg: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                }}
                rightIcon={<ViewIcon />}
                onClick={() => navigate('/bots')}
                fontWeight="600"
                borderRadius="lg"
                transition="all 0.2s ease"
                fontSize="lg"
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
          {loading ? (
            <DashboardStatsSkeleton />
          ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card 
              bg={cardBg} 
              borderWidth="1px" 
              borderColor={borderColor}
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="md"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{ 
                transform: 'translateY(-6px)', 
                shadow: '0 20px 40px rgba(0,0,0,0.12)', 
                borderColor: 'purple.400' 
              }}
              cursor="pointer"
              onClick={() => navigate('/bots')}
            >
              <CardBody p={6}>
                <HStack spacing={4}>
                  <Flex
                    w={14}
                    h={14}
                    borderRadius="xl"
                    bgGradient="linear(to-br, purple.400, purple.600)"
                    align="center"
                    justify="center"
                    boxShadow="0 8px 16px rgba(103, 58, 183, 0.3)"
                  >
                    <Icon as={FiActivity} boxSize={7} color="white" />
                  </Flex>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">Всего ботов</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="extrabold">{stats.totalBots}</StatNumber>
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
              boxShadow="md"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{ 
                transform: 'translateY(-6px)', 
                shadow: '0 20px 40px rgba(0,0,0,0.12)',
                borderColor: 'green.400'
              }}
            >
              <CardBody p={6}>
                <HStack spacing={4}>
                  <Flex
                    w={14}
                    h={14}
                    borderRadius="xl"
                    bgGradient="linear(to-br, green.400, green.600)"
                    align="center"
                    justify="center"
                    boxShadow="0 8px 16px rgba(72, 187, 120, 0.3)"
                  >
                    <Icon as={FiZap} boxSize={7} color="white" />
                  </Flex>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">Активных</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="extrabold" color="green.500">{stats.activeBots}</StatNumber>
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
              boxShadow="md"
              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{ 
                transform: 'translateY(-6px)', 
                shadow: '0 20px 40px rgba(0,0,0,0.12)',
                borderColor: 'red.400'
              }}
            >
              <CardBody p={6}>
                <HStack spacing={4}>
                  <Flex
                    w={14}
                    h={14}
                    borderRadius="xl"
                    bgGradient="linear(to-br, red.400, red.600)"
                    align="center"
                    justify="center"
                    boxShadow="0 8px 16px rgba(245, 101, 101, 0.3)"
                  >
                    <Icon as={FiShield} boxSize={7} color="white" />
                  </Flex>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm" fontWeight="medium">Остановлено</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="extrabold" color="red.500">{stats.stoppedBots}</StatNumber>
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
              _hover={{ transform: 'translateY(-4px)', shadow: 'xl', borderColor: 'blue.400' }}
              cursor="pointer"
              onClick={() => navigate('/templates')}
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
                    <Icon as={FiTarget} boxSize={6} color="white" />
                  </Flex>
                  <Stat>
                    <StatLabel color="gray.600" fontSize="sm">Шаблонов</StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="bold">{stats.templatesAvailable}</StatNumber>
                    <StatHelpText fontSize="xs" color="gray.500">Доступно для запуска</StatHelpText>
                  </Stat>
                </HStack>
              </CardBody>
            </Card>
          </SimpleGrid>
          )}

          {/* Остальной контент */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="2xl">
            <CardBody>
              <Flex direction={{ base: 'column', lg: 'row' }} align="center" gap={8}>
                <VStack align="start" spacing={4} flex={1}>
                  <Heading size="xl" bgGradient="linear(to-r, blue.600, purple.500)" bgClip="text">
                    Telegram Bot Constructor
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
                
                <Box fontSize="8xl" opacity={0.05} color="purple.500">
                  <Icon as={FiActivity} boxSize="150px" />
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
              <StatLabel>Остановленные</StatLabel>
              <StatNumber color="red.500">{stats.stoppedBots}</StatNumber>
              <StatHelpText>Не активны</StatHelpText>
            </Stat>
            
            <Stat bg={statBg} p={4} borderRadius="lg">
              <StatLabel>Шаблоны</StatLabel>
              <StatNumber>{stats.templatesAvailable}</StatNumber>
              <StatHelpText>Доступно</StatHelpText>
            </Stat>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            
            {/* Последние боты */}
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Последние боты</Heading>
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