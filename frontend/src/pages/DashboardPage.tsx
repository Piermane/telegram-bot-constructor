import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      console.log('[Dashboard] 🔄 Loading dashboard data...');
      
      // Загружаем список ботов (ИСПОЛЬЗУЕМ AXIOS!)
      const response = await axios.get('/api/deploy/list');
      console.log('[Dashboard] ✅ Got response:', response.data);
      
      if (response.data.success) {
        const bots = response.data.bots || [];
        setStats({
          totalBots: bots.length,
          activeBots: bots.filter((bot: any) => bot.status === 'running').length,
          stoppedBots: bots.filter((bot: any) => bot.status === 'stopped').length,
          templatesAvailable: 7
        });
        setRecentBots(bots.slice(0, 3));
      }
    } catch (error) {
      console.error('[Dashboard] ❌ Ошибка загрузки данных:', error);
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

      {/* Hero Section - градиент теперь на всю страницу */}
      <Box 
        py={{ base: 20, md: 32 }}
        px={4}
        position="relative"
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