import React, { useState, useEffect } from 'react';
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

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadAnalytics();
  }, [botId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics/${botId}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить аналитику',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'users' | 'analytics' | 'webapp' | 'all') => {
    try {
      const response = await fetch(`/api/analytics/${botId}/export/${type}`);
      const blob = await response.blob();
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
              variant="ghost"
            >
              Назад
            </Button>
            <Box>
              <Heading
                size="lg"
                bgGradient="linear(to-r, purple.400, pink.400)"
                bgClip="text"
              >
                📊 Аналитика бота
              </Heading>
              <Text color="gray.600" mt={1}>
                @{analytics.botInfo.username} • {analytics.botInfo.name}
              </Text>
            </Box>
          </HStack>

          <HStack spacing={2}>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="purple"
              variant="outline"
              onClick={() => handleExport('all')}
              size="sm"
            >
              Экспорт всех данных
            </Button>
            <Button
              colorScheme="purple"
              onClick={loadAnalytics}
              size="sm"
            >
              🔄 Обновить
            </Button>
          </HStack>
        </HStack>

        {/* Основные метрики */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Всего пользователей</StatLabel>
                <StatNumber color="purple.500">{analytics.stats.total_users}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {analytics.stats.active_today} сегодня
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Активных за неделю</StatLabel>
                <StatNumber color="blue.500">{analytics.stats.active_week}</StatNumber>
                <StatHelpText>
                  {((analytics.stats.active_week / analytics.stats.total_users) * 100).toFixed(1)}% от всех
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Всего сообщений</StatLabel>
                <StatNumber color="green.500">{analytics.stats.total_messages}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {analytics.stats.messages_today} сегодня
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Действий WebApp</StatLabel>
                <StatNumber color="orange.500">{analytics.webapp_data.length}</StatNumber>
                <StatHelpText>Всего записей</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={bgColor} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>События аналитики</StatLabel>
                <StatNumber color="pink.500">{analytics.analytics_events.length}</StatNumber>
                <StatHelpText>Всего событий</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Вкладки с графиками и данными */}
        <Tabs colorScheme="purple" variant="enclosed">
          <TabList overflowX="auto" overflowY="hidden">
            <Tab>📈 Активность</Tab>
            <Tab>🎯 Команды</Tab>
            <Tab>📱 WebApp</Tab>
            <Tab>🎟️ Регистрации</Tab>
            <Tab>📝 Опросы</Tab>
            <Tab>👥 Пользователи</Tab>
            <Tab>📊 События</Tab>
          </TabList>

          <TabPanels>
            {/* Вкладка: Активность */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Активность за последние дни</Heading>
                  <Select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    w="200px"
                  >
                    <option value="7">7 дней</option>
                    <option value="14">14 дней</option>
                    <option value="30">30 дней</option>
                  </Select>
                </HStack>

                <Card bg={bgColor}>
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
                <Heading size="md">Популярные команды и сцены</Heading>

                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <Card bg={bgColor}>
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

                  <Card bg={bgColor}>
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
                    <Card bg={bgColor}>
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

                    <Card bg={bgColor}>
                      <CardHeader>
                        <Heading size="sm">История действий</Heading>
                      </CardHeader>
                      <CardBody>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>ID пользователя</Th>
                              <Th>Действие</Th>
                              <Th>Данные</Th>
                              <Th>Дата</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {analytics.webapp_data.slice(0, 50).map((item) => (
                              <Tr key={item.id}>
                                <Td>{item.user_id}</Td>
                                <Td>
                                  <Badge colorScheme="green">{item.action}</Badge>
                                </Td>
                                <Td fontSize="xs" maxW="300px" isTruncated>
                                  {item.data}
                                </Td>
                                <Td fontSize="xs">
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
                  <Card bg={bgColor}>
                    <CardBody>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>ID пользователя</Th>
                            <Th>Активность</Th>
                            <Th>Дата регистрации</Th>
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
                                  <Td fontWeight="bold">{item.user_id}</Td>
                                  <Td>
                                    <Badge colorScheme="purple">{activityName}</Badge>
                                  </Td>
                                  <Td fontSize="sm">
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
                  <Card bg={bgColor}>
                    <CardBody>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>ID пользователя</Th>
                            <Th>Опрос</Th>
                            <Th>Тип</Th>
                            <Th>Дата</Th>
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
                                  <Td fontWeight="bold">{item.user_id}</Td>
                                  <Td fontSize="sm">{surveyTitle}</Td>
                                  <Td>
                                    <Badge colorScheme={item.action === 'start_survey' ? 'blue' : 'green'}>
                                      {item.action === 'start_survey' ? 'Начат' : 'Ответ'}
                                    </Badge>
                                  </Td>
                                  <Td fontSize="sm">
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

                <Card bg={bgColor}>
                  <CardBody>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>ID</Th>
                          <Th>Имя</Th>
                          <Th>Username</Th>
                          <Th>Регистрация</Th>
                          <Th>Последняя активность</Th>
                          <Th>Действия</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.map((user) => (
                          <Tr key={user.id}>
                            <Td fontWeight="bold">{user.id}</Td>
                            <Td>{user.first_name}</Td>
                            <Td>
                              {user.username ? (
                                <Badge colorScheme="blue">@{user.username}</Badge>
                              ) : (
                                <Text color="gray.500" fontSize="sm">—</Text>
                              )}
                            </Td>
                            <Td fontSize="sm">
                              {new Date(user.created_at).toLocaleDateString('ru-RU')}
                            </Td>
                            <Td fontSize="sm">
                              {user.last_active
                                ? new Date(user.last_active).toLocaleString('ru-RU')
                                : '—'}
                            </Td>
                            <Td>
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

                <Card bg={bgColor}>
                  <CardBody>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Тип события</Th>
                          <Th>ID пользователя</Th>
                          <Th>Сцена/Команда</Th>
                          <Th>Данные</Th>
                          <Th>Дата</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {analytics.analytics_events.slice(0, 100).map((event) => (
                          <Tr key={event.id}>
                            <Td>
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
                            <Td>{event.user_id}</Td>
                            <Td fontSize="xs">{event.scene_id || '—'}</Td>
                            <Td fontSize="xs" maxW="200px" isTruncated>
                              {event.data || '—'}
                            </Td>
                            <Td fontSize="xs">
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

