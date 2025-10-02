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

      {/* Hero Section - REAL Stripe Style with CSS Animation */}
      <Box 
        py={{ base: 16, md: 24 }}
        px={4}
        position="relative"
        overflow="hidden"
        bg="#000"
        sx={{
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle at 20% 50%, #667eea 0%, transparent 50%), radial-gradient(circle at 80% 50%, #764ba2 0%, transparent 50%), radial-gradient(circle at 50% 50%, #f093fb 0%, transparent 50%)',
            animation: 'gradientRotate 20s ease infinite',
            filter: 'blur(40px)',
            opacity: 0.9,
          },
          '@keyframes gradientRotate': {
            '0%, 100%': {
              transform: 'translate(0, 0) rotate(0deg)',
            },
            '33%': {
              transform: 'translate(10%, -10%) rotate(120deg)',
            },
            '66%': {
              transform: 'translate(-10%, 10%) rotate(240deg)',
            },
          },
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            align="center" 
            justify="space-between"
            gap={12}
          >
            <VStack spacing={8} align="start" color="white" flex={1} maxW={{ base: 'full', md: '600px' }}>
              <Badge 
                fontSize="sm" 
                px={4} 
                py={2} 
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(20px)"
                fontWeight="semibold"
                textTransform="none"
                color="white"
                borderWidth="1px"
                borderColor="whiteAlpha.300"
                boxShadow="0 8px 32px rgba(0,0,0,0.2)"
              >
                Production v2.0
              </Badge>
              <Heading 
                fontSize={{ base: '4xl', md: '5xl', lg: '7xl' }}
                fontWeight="900"
                maxW="full"
                lineHeight="1"
                letterSpacing="-0.02em"
                textShadow="0 2px 40px rgba(0,0,0,0.3)"
              >
                Создавайте ботов
                <br />
                без кода
              </Heading>
              <Text 
                fontSize={{ base: 'lg', md: 'xl' }} 
                maxW="2xl" 
                color="rgba(255, 255, 255, 0.9)" 
                lineHeight="tall"
                fontWeight="normal"
              >
                Готовые шаблоны, автоматический деплой и полное управление. 
                Запустите первого бота за 5 минут.
              </Text>
              <HStack spacing={4} pt={4}>
                <Button
                  size="lg"
                  h="60px"
                  px={10}
                  bg="white"
                  color="#000"
                  _hover={{ 
                    transform: 'translateY(-4px)', 
                    shadow: '0 20px 60px rgba(255,255,255,0.3)',
                    bg: '#fff'
                  }}
                  rightIcon={<AddIcon />}
                  onClick={handleCreateBot}
                  fontWeight="bold"
                  borderRadius="full"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  fontSize="md"
                  boxShadow="0 10px 40px rgba(255,255,255,0.2)"
                >
                  Создать бота
                </Button>
                <Button
                  size="lg"
                  h="60px"
                  px={10}
                  bg="rgba(255, 255, 255, 0.1)"
                  backdropFilter="blur(20px)"
                  borderWidth="1px"
                  borderColor="whiteAlpha.300"
                  color="white"
                  _hover={{ 
                    bg: 'rgba(255, 255, 255, 0.2)',
                    borderColor: 'white',
                    transform: 'translateY(-2px)',
                    shadow: '0 10px 40px rgba(255,255,255,0.2)'
                  }}
                  rightIcon={<ViewIcon />}
                  onClick={() => navigate('/bots')}
                  fontWeight="semibold"
                  borderRadius="full"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  fontSize="md"
                >
                  Мои боты
                </Button>
              </HStack>
            </VStack>

            {/* Floating Icon with Glow */}
            <Box 
              display={{ base: 'none', md: 'flex' }}
              animation="float 6s ease-in-out infinite"
              w="300px"
              h="300px"
              position="relative"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                position="absolute"
                w="100%"
                h="100%"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.05)"
                filter="blur(60px)"
                animation="pulse 4s ease-in-out infinite"
              />
              <Icon 
                as={FiActivity} 
                boxSize="120px" 
                color="white"
                opacity={0.4}
                filter="drop-shadow(0 0 30px rgba(255,255,255,0.5))"
              />
            </Box>
          </Flex>
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