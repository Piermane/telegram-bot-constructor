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
import { FiTarget, FiZap, FiShield } from 'react-icons/fi';

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
        <title>Панель управления - TelegramBot Constructor PRO</title>
      </Helmet>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          
          {/* Приветствие и главная кнопка */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Flex direction={{ base: 'column', lg: 'row' }} align="center" gap={8}>
                <VStack align="start" spacing={4} flex={1}>
                  <Heading size="xl" color="blue.500">
                    🤖 TelegramBot Constructor PRO
                  </Heading>
                  <Text fontSize="lg" color="gray.600">
                    Создавайте профессиональных Telegram ботов без программирования. 
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