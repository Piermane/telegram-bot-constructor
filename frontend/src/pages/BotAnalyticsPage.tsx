import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  Input,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBackIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BotAnalytics {
  botInfo: {
    id: string;
    name: string;
    username: string;
    status: string;
    created_at: string;
    config: any;
  };
  users: Array<{
    id: number;
    first_name: string;
    username: string;
    created_at: string;
    last_active: string;
  }>;
  analytics_events: Array<{
    id: number;
    event_type: string;
    user_id: number;
    scene_id: string;
    data: string;
    created_at: string;
  }>;
  webapp_data: Array<{
    id: number;
    user_id: number;
    action: string;
    data: string;
    created_at: string;
  }>;
  stats: {
    total_users: number;
    active_today: number;
    active_week: number;
    total_messages: number;
    messages_today: number;
  };
}

const BotAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { botId } = useParams<{ botId: string }>();
  const toast = useToast();

  const [analytics, setAnalytics] = useState<BotAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('7'); // дней назад
  const [searchTerm, setSearchTerm] = useState('');

  const bgColor = 'rgba(255, 255, 255, 0.12)';
  const borderColor = 'rgba(255, 255, 255, 0.25)';
  const cardStyle = {
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    borderWidth: '1px',
    borderStyle: 'solid',
    color: 'white',
  };

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[Analytics] 🔄 Loading analytics for bot:', botId);
      const response = await axios.get(`/api/analytics/${botId}`);
      console.log('[Analytics] ✅ Got data:', response.data);

      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      console.error('[Analytics] ❌ Error:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить аналитику',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  }, [botId, toast]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExport = async (type: 'users' | 'analytics' | 'webapp' | 'all') => {
    try {
      console.log('[Analytics] 📥 Exporting:', type);
      const response = await axios.get(`/api/analytics/${botId}/export/${type}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast({
        title: 'Экспорт завершен',
        description: 'Файл успешно загружен',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось экспортировать данные',
        status: 'error',
        duration: 5000,
      });
    }
  };

  // Подготовка данных для графика активности по дням
  const getActivityChartData = () => {
    if (!analytics) return [];

    const daysCount = parseInt(dateFilter);
    const now = new Date();
    const data = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];

      const usersCount = analytics.users.filter(u => {
        if (!u.created_at) return false;
        const userDate = new Date(u.created_at).toISOString().split('T')[0];
        return userDate === dateStr;
      }).length;

      const messagesCount = analytics.analytics_events.filter(e => {
        if (!e.created_at) return false;
        const eventDate = new Date(e.created_at).toISOString().split('T')[0];
        return eventDate === dateStr;
      }).length;

      data.push({
        date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
        users: usersCount,
        messages: messagesCount,
      });
    }

    return data;
  };

  // Подготовка данных для графика популярных команд
  const getCommandsChartData = () => {
    if (!analytics) return [];

    const commandCounts: { [key: string]: number } = {};

    analytics.analytics_events.forEach(e => {
      if (e.event_type === 'command_used' || e.event_type === 'scene_visited') {
        const command = e.scene_id || e.event_type;
        commandCounts[command] = (commandCounts[command] || 0) + 1;
      }
    });

    return Object.entries(commandCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // Подготовка данных для графика действий WebApp
  const getWebAppActionsData = () => {
    if (!analytics) return [];

    const actionCounts: { [key: string]: number } = {};

    analytics.webapp_data.forEach(d => {
      const action = d.action || 'unknown';
      actionCounts[action] = (actionCounts[action] || 0) + 1;
    });

    return Object.entries(actionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Фильтрация пользователей по поиску
  const filteredUsers = analytics?.users.filter(u =>
    u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  if (loading) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="xl" color="purple.500" thickness="4px" />
        <Text mt={4} fontSize="lg">Загрузка аналитики...</Text>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box py={20}>
        <Alert status="error">
          <AlertIcon />
          Не удалось загрузить данные аналитики
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>Аналитика: {analytics.botInfo.name} | Bot Constructor</title>
      </Helmet>

      <VStack spacing={6} align="stretch">
        {/* Заголовок */}
        <HStack justify="space-between" flexWrap="wrap">
          <HStack spacing={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={() => navigate('/bots')}
              bg="whiteAlpha.900"
              color="gray.800"
              _hover={{ bg: "white" }}
            >
              Назад
            </Button>
            <Box>
              <Heading
                size="lg"
                color="white"
                textShadow="0 2px 8px rgba(0, 0, 0, 0.3)"
              >
                Аналитика бота
              </Heading>
              <Text color="whiteAlpha.800" mt={1}>
                @{analytics.botInfo.username} • {analytics.botInfo.name}
              </Text>
            </Box>
          </HStack>

          <HStack spacing={2}>
            <Button
              leftIcon={<DownloadIcon />}
              bg="whiteAlpha.900"
              color="gray.800"
              _hover={{ bg: "white" }}
              onClick={() => handleExport('all')}
              size="sm"
            >
              Экспорт всех данных
            </Button>
            <Button
              bg="whiteAlpha.900"
              color="gray.800"
              _hover={{ bg: "white" }}
              onClick={loadAnalytics}
              size="sm"
            >
              Обновить
            </Button>
          </HStack>
        </HStack>

        {/* Основные метрики */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
          <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
            <CardBody>
              <Stat>
                <StatLabel color="white">Всего пользователей</StatLabel>
                <StatNumber color="white">{analytics.stats.total_users}</StatNumber>
                <StatHelpText color="white">
                  <StatArrow type="increase" />
                  {analytics.stats.active_today} сегодня
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
            <CardBody>
              <Stat>
                <StatLabel color="white">Активных за неделю</StatLabel>
                <StatNumber color="white">{analytics.stats.active_week}</StatNumber>
                <StatHelpText color="white">
                  {((analytics.stats.active_week / analytics.stats.total_users) * 100).toFixed(1)}% от всех
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
            <CardBody>
              <Stat>
                <StatLabel color="white">Всего сообщений</StatLabel>
                <StatNumber color="white">{analytics.stats.total_messages}</StatNumber>
                <StatHelpText color="white">
                  <StatArrow type="increase" />
                  {analytics.stats.messages_today} сегодня
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
            <CardBody>
              <Stat>
                <StatLabel color="white">Действий WebApp</StatLabel>
                <StatNumber color="white">{analytics.webapp_data.length}</StatNumber>
                <StatHelpText color="white">Всего записей</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
            <CardBody>
              <Stat>
                <StatLabel color="white">События аналитики</StatLabel>
                <StatNumber color="white">{analytics.analytics_events.length}</StatNumber>
                <StatHelpText color="white">Всего событий</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Вкладки с графиками и данными */}
        <Tabs colorScheme="purple" variant="enclosed">
          <TabList overflowX="auto" overflowY="hidden" bg="whiteAlpha.200" p={2} borderRadius="md">
            <Tab color="white" _selected={{ bg: "whiteAlpha.400", color: "white" }}>Активность</Tab>
            <Tab color="white" _selected={{ bg: "whiteAlpha.400", color: "white" }}>Команды</Tab>
            <Tab color="white" _selected={{ bg: "whiteAlpha.400", color: "white" }}>WebApp</Tab>
            <Tab color="white" _selected={{ bg: "whiteAlpha.400", color: "white" }}>Регистрации</Tab>
            <Tab color="white" _selected={{ bg: "whiteAlpha.400", color: "white" }}>Опросы</Tab>
            <Tab color="white" _selected={{ bg: "whiteAlpha.400", color: "white" }}>Пользователи</Tab>
            <Tab color="white" _selected={{ bg: "whiteAlpha.400", color: "white" }}>События</Tab>
          </TabList>

          <TabPanels>
            {/* Вкладка: Активность */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md" color="white">Активность за последние дни</Heading>
                  <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    w="200px"
                    bg="whiteAlpha.900"
                    color="gray.800"
                    borderColor="whiteAlpha.400"
                  >
                    <option value="7">7 дней</option>
                    <option value="14">14 дней</option>
                    <option value="30">30 дней</option>
                  </Select>
                </HStack>

                <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
                  <CardBody>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={getActivityChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="users"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          name="Новые пользователи"
                        />
                        <Line
                          type="monotone"
                          dataKey="messages"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          name="Сообщения"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Вкладка: Команды */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md" color="white">Популярные команды и сцены</Heading>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
                    <CardHeader>
                      <Heading size="sm">Топ-10 команд</Heading>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getCommandsChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
                    <CardHeader>
                      <Heading size="sm">Распределение по командам</Heading>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={getCommandsChartData().slice(0, 6)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => entry.name}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getCommandsChartData().slice(0, 6).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Вкладка: WebApp */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Действия в WebApp</Heading>
                  <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="purple"
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport('webapp')}
                  >
                    Экспорт
                  </Button>
                </HStack>

                {analytics.webapp_data.length > 0 ? (
                  <>
                    <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
                      <CardHeader>
                        <Heading size="sm">Популярные действия</Heading>
                      </CardHeader>
                      <CardBody>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={getWebAppActionsData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardBody>
                    </Card>

                    <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
                      <CardHeader>
                        <Heading size="sm">История действий</Heading>
                      </CardHeader>
                      <CardBody>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th color="white">ID пользователя</Th>
                              <Th color="white">Действие</Th>
                              <Th color="white">Данные</Th>
                              <Th color="white">Дата</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {analytics.webapp_data.slice(0, 50).map((item) => (
                              <Tr key={item.id}>
                                <Td color="white">{item.user_id}</Td>
                                <Td color="white">
                                  <Badge colorScheme="green">{item.action}</Badge>
                                </Td>
                                <Td color="white" fontSize="xs" maxW="300px" isTruncated>
                                  {item.data}
                                </Td>
                                <Td color="white" fontSize="xs">
                                  {new Date(item.created_at).toLocaleString('ru-RU')}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </CardBody>
                    </Card>
                  </>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    Пока нет данных из WebApp
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* Вкладка: Регистрации на активности */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Регистрации на активности</Heading>

                {analytics.webapp_data.filter(d => d.action === 'register_activity').length > 0 ? (
                  <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
                    <CardBody>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th color="white">ID пользователя</Th>
                            <Th color="white">Активность</Th>
                            <Th color="white">Дата регистрации</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {analytics.webapp_data
                            .filter(d => d.action === 'register_activity')
                            .map((item) => {
                              let activityName = 'Неизвестно';
                              try {
                                const data = JSON.parse(item.data);
                                activityName = data.activityName || data.activity_name || 'Неизвестно';
                              } catch (e) {}
                              
                              return (
                                <Tr key={item.id}>
                                  <Td color="white" fontWeight="bold">{item.user_id}</Td>
                                  <Td color="white">
                                    <Badge colorScheme="purple">{activityName}</Badge>
                                  </Td>
                                  <Td color="white" fontSize="sm">
                                    {new Date(item.created_at).toLocaleString('ru-RU')}
                                  </Td>
                                </Tr>
                              );
                            })}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    Пока нет регистраций на активности
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* Вкладка: Опросы */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Ответы на опросы</Heading>

                {analytics.webapp_data.filter(d => d.action === 'start_survey' || d.action === 'survey_answer').length > 0 ? (
                  <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
                    <CardBody>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th color="white">ID пользователя</Th>
                            <Th color="white">Опрос</Th>
                            <Th color="white">Тип</Th>
                            <Th color="white">Дата</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {analytics.webapp_data
                            .filter(d => d.action === 'start_survey' || d.action === 'survey_answer')
                            .map((item) => {
                              let surveyTitle = 'Неизвестно';
                              try {
                                const data = JSON.parse(item.data);
                                surveyTitle = data.surveyTitle || data.survey_title || 'Неизвестно';
                              } catch (e) {}
                              
                              return (
                                <Tr key={item.id}>
                                  <Td color="white" fontWeight="bold">{item.user_id}</Td>
                                  <Td color="white" fontSize="sm">{surveyTitle}</Td>
                                  <Td color="white">
                                    <Badge colorScheme={item.action === 'start_survey' ? 'blue' : 'green'}>
                                      {item.action === 'start_survey' ? 'Начат' : 'Ответ'}
                                    </Badge>
                                  </Td>
                                  <Td color="white" fontSize="sm">
                                    {new Date(item.created_at).toLocaleString('ru-RU')}
                                  </Td>
                                </Tr>
                              );
                            })}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    Пока нет ответов на опросы
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* Вкладка: Пользователи */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Пользователи ({filteredUsers.length})</Heading>
                  <HStack>
                    <Input
                      placeholder="Поиск по имени или username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      w="300px"
                    />
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="purple"
                      size="sm"
                      variant="outline"
                      onClick={() => handleExport('users')}
                    >
                      Экспорт
                    </Button>
                  </HStack>
                </HStack>

                <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
                  <CardBody>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th color="white">ID</Th>
                          <Th color="white">Имя</Th>
                          <Th color="white">Username</Th>
                          <Th color="white">Регистрация</Th>
                          <Th color="white">Последняя активность</Th>
                          <Th color="white">Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.map((user) => (
                          <Tr key={user.id}>
                            <Td color="white" fontWeight="bold">{user.id}</Td>
                            <Td color="white">{user.first_name}</Td>
                            <Td color="white">
                              {user.username ? (
                                <Badge colorScheme="blue">@{user.username}</Badge>
                              ) : (
                                <Text color="white.500" fontSize="sm">—</Text>
                              )}
                            </Td>
                            <Td color="white" fontSize="sm">
                              {new Date(user.created_at).toLocaleDateString('ru-RU')}
                            </Td>
                            <Td color="white" fontSize="sm">
                              {user.last_active
                                ? new Date(user.last_active).toLocaleString('ru-RU')
                                : '—'}
                            </Td>
                            <Td color="white">
                              <HStack spacing={2}>
                                <Button
                                  size="xs"
                                  colorScheme="blue"
                                  variant="outline"
                                  onClick={() => {
                                    const link = user.username 
                                      ? `https://t.me/${user.username}`
                                      : `tg://user?id=${user.id}`;
                                    window.open(link, '_blank');
                                  }}
                                >
                                  Открыть
                                </Button>
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    if (window.confirm(`Заблокировать пользователя ${user.first_name}?`)) {
                                      toast({
                                        title: 'Функция в разработке',
                                        description: 'Скоро добавим бан пользователей',
                                        status: 'info',
                                        duration: 3000,
                                      });
                                    }
                                  }}
                                >
                                  Бан
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Вкладка: События */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">События аналитики</Heading>
                  <Button
                    leftIcon={<DownloadIcon />}
                    colorScheme="purple"
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport('analytics')}
                  >
                    Экспорт
                  </Button>
                </HStack>

                <Card bg={bgColor} borderColor={borderColor} sx={cardStyle}>
                  <CardBody>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th color="white">Тип события</Th>
                          <Th color="white">ID пользователя</Th>
                          <Th color="white">Сцена/Команда</Th>
                          <Th color="white">Данные</Th>
                          <Th color="white">Дата</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {analytics.analytics_events.slice(0, 100).map((event) => (
                          <Tr key={event.id}>
                            <Td color="white">
                              <Badge
                                colorScheme={
                                  event.event_type === 'command_used' ? 'purple' :
                                  event.event_type === 'scene_visited' ? 'blue' :
                                  'gray'
                                }
                              >
                                {event.event_type}
                              </Badge>
                            </Td>
                            <Td color="white">{event.user_id}</Td>
                            <Td color="white" fontSize="xs">{event.scene_id || '—'}</Td>
                            <Td color="white" fontSize="xs" maxW="200px" isTruncated>
                              {event.data || '—'}
                            </Td>
                            <Td color="white" fontSize="xs">
                              {new Date(event.created_at).toLocaleString('ru-RU')}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </>
  );
};

export default BotAnalyticsPage;

