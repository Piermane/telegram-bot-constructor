import React, { useState, useEffect } from 'react';
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

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadBots();
    // Обновляем список каждые 30 секунд
    const interval = setInterval(loadBots, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadBots = async () => {
    try {
      const response = await fetch('/api/deploy/list');
      const data = await response.json();
      
      if (data.success) {
        setBots(data.bots || []);
      } else {
        setError('Ошибка загрузки ботов');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Ошибка загрузки ботов:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopBot = async (botId: string) => {
    setActionLoading(botId);
    try {
      const response = await fetch(`/api/deploy/stop/${botId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Бот остановлен',
          description: data.message,
          status: 'success',
          duration: 3000,
        });
        loadBots(); // Перезагружаем список
      } else {
        toast({
          title: 'Ошибка остановки бота',
          description: data.message || 'Неизвестная ошибка',
          status: 'error',
          duration: 5000,
        });
      }
    } catch (err) {
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
      const response = await fetch(`/api/deploy/delete/${botId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Бот удален',
          description: data.message,
          status: 'success',
          duration: 3000,
        });
        loadBots(); // Перезагружаем список
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось остановить бота',
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
                bgGradient="linear(to-r, blue.600, purple.600)" 
                bgClip="text"
                letterSpacing="tight"
              >
                Мои боты
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Управляйте своими Telegram ботами
              </Text>
            </VStack>
            
            <HStack spacing={3}>
              <Button
                size="lg"
                variant="outline"
                leftIcon={<Icon as={FiRefreshCw} />}
                onClick={loadBots}
                isLoading={loading}
                colorScheme="gray"
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
              boxShadow="lg"
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
                  <Heading size="lg" fontWeight="bold">У вас пока нет ботов</Heading>
                  <Text color="gray.600" fontSize="lg" maxW="md">
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
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <CardHeader pb={2}>
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Heading size="md">{bot.name}</Heading>
                        <Text fontSize="sm" color="gray.500">
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
                        <MenuList>
                          <MenuItem
                            icon={<ExternalLinkIcon />}
                            as="a"
                            href={bot.url}
                            target="_blank"
                          >
                            Открыть в Telegram
                          </MenuItem>
                          <MenuItem
                            icon={<EditIcon />}
                            onClick={() => navigate(`/bots/edit/${bot.id}`)}
                          >
                            Редактировать
                          </MenuItem>
                          <MenuItem
                            icon={<Icon as={FiBarChart2} />}
                            onClick={() => navigate(`/bots/${bot.id}/analytics`)}
                          >
                            Аналитика
                          </MenuItem>
                          {bot.status === 'running' && (
                            <MenuItem
                              icon={<Icon as={FiPause} />}
                              onClick={() => handleStopBot(bot.id)}
                            >
                              Остановить
                            </MenuItem>
                          )}
                          <MenuItem
                            icon={<DeleteIcon />}
                            color="red.500"
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
                    <VStack align="start" spacing={3}>
                      
                      {/* Статус */}
                      <HStack>
                        {getStatusBadge(bot.status)}
                        {bot.pid && (
                          <Text fontSize="xs" color="gray.500">
                            PID: {bot.pid}
                          </Text>
                        )}
                      </HStack>

                      {/* Информация */}
                      <VStack align="start" spacing={1} fontSize="sm">
                        <HStack>
                          <Text color="gray.600">Сценариев:</Text>
                          <Text fontWeight="bold">{bot.scenes}</Text>
                        </HStack>
                        <HStack>
                          <Text color="gray.600">Запущен:</Text>
                          <Text>{formatDate(bot.startedAt)}</Text>
                        </HStack>
                      </VStack>

                      {/* Кнопки действий */}
                      <HStack w="100%" spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          flex={1}
                          as="a"
                          href={bot.url}
                          target="_blank"
                          leftIcon={<ExternalLinkIcon />}
                        >
                          Открыть
                        </Button>
                        <IconButton
                          size="sm"
                          colorScheme="gray"
                          variant="outline"
                          aria-label="Настройки"
                          icon={<SettingsIcon />}
                          onClick={() => navigate(`/bots/edit/${bot.id}`)}
                        />
                      </HStack>

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