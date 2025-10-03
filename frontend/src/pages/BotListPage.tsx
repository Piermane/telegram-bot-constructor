import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Container,
  Alert,
  AlertIcon,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Box,
  Flex,
  Icon
} from '@chakra-ui/react';
import { AddIcon, ExternalLinkIcon, EditIcon, DeleteIcon, SettingsIcon } from '@chakra-ui/icons';
import { FiMoreVertical, FiRefreshCw, FiPlay, FiPause, FiAlertCircle, FiBarChart2, FiActivity } from 'react-icons/fi';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { BotListSkeleton } from '../components/UI/SkeletonLoader';

interface Bot {
  id: string;
  name: string;
  username: string;
  status: 'running' | 'stopped' | 'error';
  url: string;
  startedAt: string;
  pid?: number;
  scenes: number;
}

const BotListPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const cardBg = 'rgba(255, 255, 255, 0.12)';
  const borderColor = 'rgba(255, 255, 255, 0.25)';
  const cardStyle = {
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    borderWidth: '1px',
    borderStyle: 'solid',
    color: 'white',
  };

  useEffect(() => {
    loadBots();
    // Обновляем список каждые 30 секунд
    const interval = setInterval(loadBots, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadBots = async () => {
    try {
      console.log('[BotList] 🔄 Loading bots...');
      const response = await axios.get('/api/deploy/list');
      console.log('[BotList] ✅ Got response:', response.data);
      
      if (response.data.success) {
        setBots(response.data.bots || []);
      } else {
        setError('Ошибка загрузки ботов');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('[BotList] ❌ Ошибка загрузки ботов:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartBot = async (botId: string) => {
    setActionLoading(botId);
    try {
      console.log('[BotList] ▶️ Starting bot:', botId);
      const response = await axios.post(`/api/deploy/start/${botId}`);
      
      if (response.data.success) {
        toast({
          title: 'Бот запущен',
          description: response.data.message,
          status: 'success',
          duration: 3000,
        });
        loadBots();
      } else {
        toast({
          title: 'Ошибка запуска бота',
          description: response.data.message || 'Неизвестная ошибка',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (err) {
      console.error('[BotList] ❌ Start error:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось запустить бота',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopBot = async (botId: string) => {
    setActionLoading(botId);
    try {
      console.log('[BotList] ⏸️ Stopping bot:', botId);
      const response = await axios.delete(`/api/deploy/stop/${botId}`);
      
      if (response.data.success) {
        toast({
          title: 'Бот остановлен',
          description: response.data.message,
          status: 'success',
          duration: 3000,
        });
        loadBots();
      } else {
        toast({
          title: 'Ошибка остановки бота',
          description: response.data.message || 'Неизвестная ошибка',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (err) {
      console.error('[BotList] ❌ Stop error:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось остановить бота',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    setActionLoading(botId);
    try {
      console.log('[BotList] 🗑️ Deleting bot:', botId);
      const response = await axios.delete(`/api/deploy/delete/${botId}`);
      
      if (response.data.success) {
        toast({
          title: 'Бот удален',
          description: response.data.message,
          status: 'success',
          duration: 3000,
        });
        loadBots();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('[BotList] ❌ Delete error:', err);
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось удалить бота',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': 
        return (
          <Badge colorScheme="green" px={3} py={1} borderRadius="full" display="flex" alignItems="center" gap={1}>
            <Icon as={FiPlay} boxSize={3} />
            Работает
          </Badge>
        );
      case 'stopped': 
        return (
          <Badge colorScheme="gray" px={3} py={1} borderRadius="full" display="flex" alignItems="center" gap={1}>
            <Icon as={FiPause} boxSize={3} />
            Остановлен
          </Badge>
        );
      case 'error': 
        return (
          <Badge colorScheme="red" px={3} py={1} borderRadius="full" display="flex" alignItems="center" gap={1}>
            <Icon as={FiAlertCircle} boxSize={3} />
            Ошибка
          </Badge>
        );
      default: 
        return (
          <Badge px={3} py={1} borderRadius="full">
            Неизвестно
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Н/Д';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Н/Д';
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Мои боты - TelegramBot Constructor</title>
        </Helmet>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header Skeleton */}
            <Box>
              <Heading size="xl" mb={2}>Мои боты</Heading>
              <Text color="gray.600">Управление вашими Telegram ботами</Text>
            </Box>
            
            {/* Loading Skeleton */}
            <BotListSkeleton count={6} />
          </VStack>
        </Container>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Мои боты - TelegramBot Constructor</title>
      </Helmet>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          
          {/* Заголовок */}
          <Flex 
            justify="space-between" 
            align="center"
            flexWrap="wrap"
            gap={4}
          >
            <VStack align="start" spacing={1}>
              <Heading 
                fontSize={{ base: '3xl', md: '4xl' }}
                fontWeight="extrabold"
                color="white"
                letterSpacing="tight"
                textShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
              >
                Мои боты
              </Heading>
              <Text color="white" fontSize="lg" textShadow="0 1px 4px rgba(0, 0, 0, 0.25)">
                Управляйте своими Telegram ботами
              </Text>
            </VStack>
            
            <HStack spacing={3}>
              <Button
                size="lg"
                variant="solid"
                leftIcon={<Icon as={FiRefreshCw} />}
                onClick={loadBots}
                isLoading={loading}
                bg="whiteAlpha.900"
                color="gray.800"
                fontWeight="600"
                _hover={{
                  bg: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
                }}
                boxShadow="0 4px 12px rgba(0,0,0,0.1)"
              >
                Обновить
              </Button>
              <Button
                as={RouterLink}
                to="/bots/new"
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="lg"
                bgGradient="linear(to-r, blue.500, purple.600)"
                _hover={{
                  bgGradient: "linear(to-r, blue.600, purple.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl"
                }}
                transition="all 0.2s"
              >
                Создать бота
              </Button>
            </HStack>
          </Flex>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Список ботов */}
          {bots.length === 0 ? (
            <Card 
              bg={cardBg} 
              borderColor={borderColor}
              borderRadius="2xl"
              borderWidth="1px"
              sx={cardStyle}
            >
              <CardBody textAlign="center" py={16}>
                <VStack spacing={6}>
                  <Flex
                    w={24}
                    h={24}
                    borderRadius="full"
                    bgGradient="linear(to-br, blue.400, purple.600)"
                    align="center"
                    justify="center"
                    mx="auto"
                  >
                    <Icon as={FiActivity} boxSize={12} color="white" />
                  </Flex>
                  <Heading size="lg" fontWeight="bold" color="white">У вас пока нет ботов</Heading>
                  <Text color="whiteAlpha.800" fontSize="lg" maxW="md">
                    Создайте своего первого бота для Telegram за несколько минут
                  </Text>
                  <Button
                    as={RouterLink}
                    to="/templates"
                    colorScheme="purple"
                    size="lg"
                    leftIcon={<AddIcon />}
                    borderRadius="xl"
                    px={8}
                    h="56px"
                    _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    Выбрать шаблон
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {bots.map((bot, index) => (
                <Card
                  key={bot.id}
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="2xl"
                  boxShadow="md"
                  _hover={{ 
                    shadow: '0 20px 40px rgba(0,0,0,0.12)',
                    transform: 'translateY(-6px)',
                    borderColor: bot.status === 'running' ? 'green.400' : 'purple.400'
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  position="relative"
                  overflow="hidden"
                  sx={{
                    ...cardStyle,
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <CardHeader pb={2}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Heading size="md" color="white">{bot.name}</Heading>
                        <Text fontSize="sm" color="whiteAlpha.700">
                          @{bot.username}
                        </Text>
                      </VStack>
                      
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList bg="rgba(255, 255, 255, 0.95)" backdropFilter="blur(20px)" borderColor="rgba(255, 255, 255, 0.3)">
                          <MenuItem
                            icon={<ExternalLinkIcon />}
                            as="a"
                            href={bot.url}
                            target="_blank"
                            color="gray.800"
                            _hover={{ bg: 'blue.50' }}
                          >
                            Открыть в Telegram
                          </MenuItem>
                          <MenuItem
                            icon={<Icon as={FiBarChart2} />}
                            onClick={() => navigate(`/bots/${bot.id}/analytics`)}
                            color="gray.800"
                            _hover={{ bg: 'blue.50' }}
                          >
                            Аналитика
                          </MenuItem>
                          <MenuItem
                            icon={<DeleteIcon />}
                            color="red.600"
                            _hover={{ bg: 'red.50' }}
                            onClick={() => {
                              if (window.confirm(`Удалить бота "${bot.name}"? Это действие необратимо!`)) {
                                handleDeleteBot(bot.id);
                              }
                            }}
                          >
                            Удалить
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  </CardHeader>

                  <CardBody pt={0}>
                    <VStack align="start" spacing={3} w="full">
                      
                      {/* Статус и инфо */}
                      <HStack w="full" justify="space-between">
                        {getStatusBadge(bot.status)}
                        <Text fontSize="xs" color="whiteAlpha.700">
                          {bot.scenes} сценариев
                        </Text>
                      </HStack>

                      {/* Дата запуска */}
                      <Text fontSize="xs" color="whiteAlpha.700">
                        {formatDate(bot.startedAt)}
                      </Text>

                      {/* ГЛАВНЫЕ КНОПКИ - ОДНА СТРОКА! */}
                      <SimpleGrid columns={bot.status === 'running' ? 2 : 3} spacing={2} w="full">
                        {bot.status === 'running' ? (
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleStopBot(bot.id)}
                            isLoading={actionLoading === bot.id}
                          >
                            Стоп
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            colorScheme="green"
                            onClick={() => handleStartBot(bot.id)}
                            isLoading={actionLoading === bot.id}
                          >
                            Пуск
                          </Button>
                        )}
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => navigate(`/bots/edit/${bot.id}`)}
                        >
                          Изменить
                        </Button>
                        {bot.status !== 'running' && (
                          <IconButton
                            size="sm"
                            colorScheme="gray"
                            variant="outline"
                            aria-label="Настройки"
                            icon={<SettingsIcon />}
                            onClick={() => navigate(`/bots/edit/${bot.id}`)}
                          />
                        )}
                      </SimpleGrid>

                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          )}

        </VStack>
      </Container>

    </>
  );
};

export default BotListPage;