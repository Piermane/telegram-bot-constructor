import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Card,
  CardHeader,
  CardBody,
  Badge,
  useColorModeValue,
  Grid,
  GridItem,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  IconButton,
  Switch,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { 
  FiArrowLeft, 
  FiSettings, 
  FiLayers, 
  FiSmartphone, 
  FiShoppingBag, 
  FiDatabase, 
  FiLink, 
  FiBarChart2, 
  FiEye,
  FiCpu,
  FiRefreshCw,
  FiSend
} from 'react-icons/fi';

interface BotButton {
  text: string;
  action: 'message' | 'url' | 'callback' | 'contact' | 'location';
  value: string;
}

interface BotScene {
  id: string;
  name: string;
  trigger: string;
  message: string;
  buttons: BotButton[];
  nextScene?: string;
  conditions?: {
    field: string;
    operator: 'equals' | 'contains' | 'not_equals';
    value: string;
    trueScene: string;
    falseScene: string;
  };
}

interface BotDatabase {
  users: {
    saveContacts: boolean;
    saveMessages: boolean;
    saveLocation: boolean;
  };
  customFields: {
    name: string;
    type: 'text' | 'number' | 'date' | 'boolean';
    required: boolean;
  }[];
}

interface BotIntegrations {
  webhook: {
    enabled: boolean;
    url: string;
    events: string[];
  };
  googleSheets: {
    enabled: boolean;
    sheetId: string;
    credentials: string;
  };
  payment: {
    enabled: boolean;
    provider: 'yoomoney' | 'stripe' | 'paypal';
    token: string;
  };
  notifications: {
    adminChat: string;
    onNewUser: boolean;
    onOrder: boolean;
    onError: boolean;
  };
}

interface BotSettings {
  name: string;
  token: string;
  description: string;
  category: 'business' | 'ecommerce' | 'events' | 'support' | 'education' | 'other' | 'restaurant_delivery' | 'medical_clinic' | 'fitness_club' | 'electronics_store';
  scenes: BotScene[];
  database: BotDatabase;
  integrations: BotIntegrations;
  features: {
    multiLanguage: boolean;
    analytics: boolean;
    scheduling: boolean;
    fileUpload: boolean;
    voiceMessages: boolean;
    webApp: boolean;
    payments: boolean;
    geolocation: boolean;
    notifications: boolean;
    polls: boolean;
    broadcasts: boolean;
    qrCodes: boolean;
  };
  webAppUrl?: string;
  adminUsers?: number[];  // Telegram IDs администраторов
  webAppContent?: {
    theme?: string;  // Цветовая схема WebApp
    products?: Array<{
      id: string;
      name: string;
      price: number;
      emoji: string;
      description: string;
    }>;
    surveys?: Array<{
      id: string;
      title: string;
      maxPoints: number;
      emoji: string;
      description: string;
    }>;
    activities?: Array<{
      id: string;
      name: string;
      points: number;
      emoji: string;
      description: string;
    }>;
    schedule?: Array<{
      id: string;
      title: string;
      speaker: string;
      startTime: string;
      endTime: string;
    }>;
    locations?: Array<{
      id: string;
      name: string;
      address: string;
      emoji: string;
      description: string;
    }>;
    qrEnabled?: boolean;
    qrText?: string;
    qrReward?: number;
    pages?: {
      shop?: boolean;
      surveys?: boolean;
      activities?: boolean;
      schedule?: boolean;
      qr?: boolean;
      admin?: boolean;
    };
  };
}

const BotBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template');
  const isEditing = !!id;

  const [botSettings, setBotSettings] = useState<BotSettings>({
    name: '',
    token: '',
    description: '',
    category: 'business',
    scenes: [
      {
        id: 'start',
        name: 'Старт',
        trigger: '/start',
        message: 'Добро пожаловать! 🎉\n\nЯ помогу вам с:\n\n• Информацией о мероприятии\n• Регистрацией на событие\n• Ответами на вопросы\n\nВыберите действие:',
        buttons: [
          { text: '📅 О мероприятии', action: 'callback', value: 'about_event' },
          { text: '📝 Регистрация', action: 'callback', value: 'registration' },
          { text: '❓ Помощь', action: 'callback', value: 'help' },
          { text: '📞 Контакты', action: 'callback', value: 'contacts' }
        ]
      }
    ],
    database: {
      users: {
        saveContacts: true,
        saveMessages: false,
        saveLocation: false,
      },
      customFields: [
        { name: 'full_name', type: 'text', required: true },
        { name: 'email', type: 'text', required: true },
        { name: 'phone', type: 'text', required: false },
        { name: 'company', type: 'text', required: false }
      ]
    },
    integrations: {
      webhook: {
        enabled: false,
        url: '',
        events: ['new_user', 'registration', 'payment']
      },
      googleSheets: {
        enabled: false,
        sheetId: '',
        credentials: ''
      },
      payment: {
        enabled: false,
        provider: 'yoomoney',
        token: ''
      },
      notifications: {
        adminChat: '',
        onNewUser: true,
        onOrder: true,
        onError: true
      }
    },
    features: {
      multiLanguage: false,
      analytics: true,
      scheduling: false,
      fileUpload: false,
      voiceMessages: false,
      webApp: false,
      payments: false,
      geolocation: false,
      notifications: false,
      polls: false,
      broadcasts: false,
      qrCodes: false
    }
  });

  const [selectedScene, setSelectedScene] = useState<BotScene | null>(null);
  const [newButton, setNewButton] = useState<BotButton>({ text: '', action: 'message', value: '' });
  const { isOpen: isSceneModalOpen, onOpen: onSceneModalOpen, onClose: onSceneModalClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const botTemplates = {
    business: {
      name: 'Бизнес-бот',
      scenes: [
        { id: 'services', name: 'Услуги', trigger: 'services', message: 'Наши услуги:\n\n• Консультации\n• Аудит\n• Внедрение\n\nВыберите интересующую услугу:', buttons: [] },
        { id: 'contacts', name: 'Контакты', trigger: 'contacts', message: '📞 Связаться с нами:\n\n• Телефон: +7 (999) 123-45-67\n• Email: info@company.ru\n• Сайт: www.company.ru', buttons: [] }
      ]
    },
    events: {
      name: 'Бот мероприятий',
      scenes: [
        { id: 'registration', name: 'Регистрация', trigger: 'registration', message: '📝 Регистрация на мероприятие\n\nДля участия заполните данные:', buttons: [] },
        { id: 'schedule', name: 'Программа', trigger: 'schedule', message: '📅 Программа мероприятия:\n\n10:00 - Регистрация\n11:00 - Открытие\n12:00 - Доклады\n15:00 - Нетворкинг', buttons: [] }
      ]
    },
    ecommerce: {
      name: 'Интернет-магазин',
      scenes: [
        { id: 'catalog', name: 'Каталог', trigger: 'catalog', message: '🛍️ Наш каталог:\n\nВыберите категорию товаров:', buttons: [] },
        { id: 'cart', name: 'Корзина', trigger: 'cart', message: '🛒 Ваша корзина пуста\n\nДобавьте товары из каталога', buttons: [] }
      ]
    }
  };

  const addScene = () => {
    const newScene: BotScene = {
      id: `scene_${Date.now()}`,
      name: 'Новая сцена',
      trigger: '/new_scene',  // ✅ ВСЕГДА НАЧИНАЕТСЯ С /
      message: 'Введите сообщение для этой сцены...',
      buttons: []
    };
    
    setBotSettings(prev => ({
      ...prev,
      scenes: [...prev.scenes, newScene]
    }));
  };

  const editScene = (scene: BotScene) => {
    setSelectedScene({ ...scene });
    onSceneModalOpen();
  };

  const saveScene = () => {
    if (!selectedScene) return;
    
    setBotSettings(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene => 
        scene.id === selectedScene.id ? selectedScene : scene
      )
    }));
    onSceneModalClose();
  };

  const deleteScene = (sceneId: string) => {
    if (sceneId === 'start') {
      alert('Нельзя удалить стартовую сцену!');
      return;
    }
    setBotSettings(prev => ({
      ...prev,
      scenes: prev.scenes.filter(scene => scene.id !== sceneId)
    }));
  };

  const addButtonToScene = () => {
    if (!selectedScene || !newButton.text || !newButton.value) {
      alert('Заполните все поля кнопки!');
      return;
    }

    setSelectedScene(prev => prev ? {
      ...prev,
      buttons: [...prev.buttons, { ...newButton }]
    } : null);

    setNewButton({ text: '', action: 'message', value: '' });
  };

  const removeButtonFromScene = (buttonIndex: number) => {
    if (!selectedScene) return;
    
    setSelectedScene(prev => prev ? {
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== buttonIndex)
    } : null);
  };

  const loadBuiltinTemplate = (category: keyof typeof botTemplates) => {
    const template = botTemplates[category];
    setBotSettings(prev => ({
      ...prev,
      category,
      name: template.name,
      scenes: [
        ...prev.scenes,
        ...template.scenes.map(scene => ({
          ...scene,
          id: `${scene.id}_${Date.now()}`,
          buttons: []
        }))
      ]
    }));
  };


  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<any>(null);

  // Загрузка шаблона или существующего бота при монтировании
  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId);
    } else if (isEditing && id) {
      loadExistingBot(id);
    }
  }, [templateId, isEditing, id]);

  const loadTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      const data = await response.json();
      
      if (data.success && data.template) {
        const template = data.template;
        setBotSettings({
          name: template.name || '',
          token: '',
          description: template.description || '',
          category: (template.category as 'business' | 'ecommerce' | 'events' | 'support' | 'education' | 'other' | 'restaurant_delivery' | 'medical_clinic' | 'fitness_club' | 'electronics_store') || 'other',
          scenes: template.scenes || [],
          database: template.database || {
            users: { saveContacts: false, saveMessages: false, saveLocation: false },
            customFields: []
          },
          integrations: template.integrations || {
            webhook: { enabled: false, url: '', events: [] },
            googleSheets: { enabled: false, sheetId: '', credentials: '' },
            payment: { enabled: false, provider: 'yoomoney', token: '' },
            notifications: { adminChat: '', onNewUser: false, onOrder: false, onError: false }
          },
          features: template.features || {
            multiLanguage: false,
            analytics: false,
            scheduling: false,
            fileUpload: false,
            voiceMessages: false,
            webApp: false,
            payments: false,
            geolocation: false,
            notifications: false,
            polls: false,
            broadcasts: false,
            qrCodes: false
          }
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки шаблона:', error);
    }
  };

  const loadExistingBot = async (botId: string) => {
    try {
      console.log('[BotBuilder] 🔄 Loading bot settings for:', botId);
      const response = await axios.get(`/api/deploy/${botId}/settings`);
      console.log('[BotBuilder] ✅ Got settings:', response.data);
      
      if (response.data.success && response.data.settings) {
        setBotSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Ошибка загрузки бота:', error);
    }
  };

  const handleSaveBot = async () => {
    if (!botSettings.name || !botSettings.token) {
      alert('Заполните название бота и токен!');
      return;
    }

    setIsDeploying(true);
    
    try {
      console.log(isEditing ? '🔄 Обновляем бота:' : '🚀 Развертываем бота:', botSettings);
      
      let response;
      
      if (isEditing && id) {
        // Обновление существующего бота
        console.log('[BotBuilder] 🔄 Updating bot:', id);
        response = await axios.put(`/api/deploy/${id}/update`, {
          botSettings: botSettings
        });
      } else {
        // Создание нового бота
        console.log('[BotBuilder] 🚀 Creating bot...');
        response = await axios.post(`/api/deploy/create`, {
          botSettings: botSettings
        });
      }

      const result = response.data;
      
      if (result.success) {
        setDeployResult(result.bot);
        const action = isEditing ? 'ОБНОВЛЁН' : 'ЗАПУЩЕН';
        alert(`🎉 БОТ ${action}!\n\n✅ "${botSettings.name}" работает в Telegram!\n🔗 Ссылка: ${result.bot.url}\n\n🎯 Функционал:\n• ${botSettings.scenes.length} сценариев\n• База данных SQLite\n• Аналитика и статистика\n• Интерактивные кнопки\n• ${isEditing ? 'Горячее обновление' : 'Автоматическое развертывание'}\n\n🚀 Ваш бот УЖЕ ПРИНИМАЕТ сообщения!`);
        
        if (isEditing) {
          // После обновления остаемся на той же странице
        } else {
          // После создания можно перейти к списку ботов
          setTimeout(() => navigate('/bots'), 2000);
        }
      } else {
        throw new Error(result.message || 'Ошибка при обработке бота');
      }
      
    } catch (error) {
      console.error('Ошибка при обработке бота:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`❌ Ошибка при ${isEditing ? 'обновлении' : 'создании'} бота:\n\n${errorMessage}\n\nПроверьте:\n• Правильность токена\n• Интернет-соединение\n• Настройки бота`);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {isEditing ? `Редактирование: ${botSettings.name}` : 'Создать бота'} - Telegram Bot Constructor
        </title>
      </Helmet>

      <Box p={6} maxW="1400px" mx="auto">
        {/* Header */}
        <VStack spacing={4} align="start" mb={6}>
          <HStack spacing={4} w="full" justify="space-between">
            <HStack spacing={4}>
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                onClick={() => navigate('/bots')}
              >
                Назад
              </Button>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="white" textShadow="0 2px 8px rgba(0, 0, 0, 0.3)">
                  {isEditing ? 'Редактирование бота' : 'Конструктор ботов'}
                </Heading>
                <Text color="white" fontSize="sm" textShadow="0 1px 4px rgba(0, 0, 0, 0.25)">
                  {isEditing ? 'Изменяйте настройки бота и применяйте обновления без остановки' : 'Создавайте ботов с кнопками, сценариями, базой данных и интеграциями'}
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={3}>
              <Button
                onClick={handleSaveBot}
                colorScheme="purple"
                leftIcon={isEditing ? <FiRefreshCw /> : <FiSend />}
                isDisabled={!botSettings.name || !botSettings.token}
                isLoading={isDeploying}
                loadingText={isEditing ? "Обновляем..." : "Запускаем..."}
                size="lg"
                h="56px"
                px={8}
                fontWeight="bold"
                borderRadius="xl"
                _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              >
                {isEditing ? 'Обновить бота' : 'Запустить бота'}
              </Button>
            </HStack>
          </HStack>

          <Alert status="info" borderRadius="xl" borderWidth="1px" bg="blue.50" borderColor="blue.200">
            <AlertIcon color="blue.500" />
            <Box>
              <AlertTitle fontWeight="semibold">Конструктор Telegram ботов</AlertTitle>
              <AlertDescription fontSize="sm" color="gray.700">
                Создавайте ботов для мероприятий, бизнеса, магазинов с полным функционалом: кнопки, база данных, аналитика, интеграции
              </AlertDescription>
            </Box>
          </Alert>

          {deployResult && (
            <Alert status="success" borderRadius="xl" borderWidth="1px" bg="green.50" borderColor="green.200">
              <AlertIcon color="green.500" />
              <Box w="full">
                <AlertTitle fontWeight="semibold">Бот успешно запущен</AlertTitle>
                <AlertDescription>
                  <VStack align="start" spacing={2} mt={2}>
                    <HStack>
                      <Text fontWeight="medium" fontSize="sm">Название:</Text>
                      <Text fontSize="sm">{deployResult.name}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium" fontSize="sm">Статус:</Text>
                      <Badge colorScheme="green">{deployResult.status}</Badge>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium" fontSize="sm">Ссылка:</Text>
                      <Text color="blue.600" fontSize="sm">{deployResult.url}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      Ваш бот работает и принимает сообщения в Telegram
                    </Text>
                  </VStack>
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </VStack>

        <Tabs colorScheme="purple" variant="soft-rounded">
          <TabList flexWrap="wrap" gap={2}>
            <Tab 
              gap={2}
              bg="whiteAlpha.200"
              color="white"
              fontWeight="600"
              _selected={{
                bg: 'white',
                color: 'gray.800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              _hover={{
                bg: 'whiteAlpha.300'
              }}
            ><FiSettings /> Основные</Tab>
            <Tab 
              gap={2}
              bg="whiteAlpha.200"
              color="white"
              fontWeight="600"
              _selected={{
                bg: 'white',
                color: 'gray.800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              _hover={{
                bg: 'whiteAlpha.300'
              }}
            ><FiLayers /> Сценарии</Tab>
            <Tab 
              gap={2}
              bg="whiteAlpha.200"
              color="white"
              fontWeight="600"
              _selected={{
                bg: 'white',
                color: 'gray.800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              _hover={{
                bg: 'whiteAlpha.300'
              }}
            ><FiSmartphone /> WebApp</Tab>
            <Tab 
              gap={2}
              bg="whiteAlpha.200"
              color="white"
              fontWeight="600"
              _selected={{
                bg: 'white',
                color: 'gray.800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              _hover={{
                bg: 'whiteAlpha.300'
              }}
            ><FiShoppingBag /> Контент</Tab>
            <Tab 
              gap={2}
              bg="whiteAlpha.200"
              color="white"
              fontWeight="600"
              _selected={{
                bg: 'white',
                color: 'gray.800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              _hover={{
                bg: 'whiteAlpha.300'
              }}
            ><FiDatabase /> База данных</Tab>
            <Tab 
              gap={2}
              bg="whiteAlpha.200"
              color="white"
              fontWeight="600"
              _selected={{
                bg: 'white',
                color: 'gray.800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              _hover={{
                bg: 'whiteAlpha.300'
              }}
            ><FiLink /> Интеграции</Tab>
            <Tab 
              gap={2}
              bg="whiteAlpha.200"
              color="white"
              fontWeight="600"
              _selected={{
                bg: 'white',
                color: 'gray.800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              _hover={{
                bg: 'whiteAlpha.300'
              }}
            ><FiBarChart2 /> Функции</Tab>
            <Tab 
              gap={2}
              bg="whiteAlpha.200"
              color="white"
              fontWeight="600"
              _selected={{
                bg: 'white',
                color: 'gray.800',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              _hover={{
                bg: 'whiteAlpha.300'
              }}
            ><FiEye /> Предпросмотр</Tab>
          </TabList>

          <TabPanels>
            {/* Основные настройки */}
            <TabPanel>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                <GridItem>
                  <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
                    <CardHeader>
                      <HStack>
                        <FiCpu />
                        <Heading size="md">Информация о боте</Heading>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                          <FormLabel>Название бота</FormLabel>
                          <Input
                            value={botSettings.name}
                            onChange={(e) => setBotSettings(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Бот мероприятия 2024"
                            size="lg"
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel>Категория</FormLabel>
                          <Select
                            value={botSettings.category}
                            onChange={(e) => setBotSettings(prev => ({ ...prev, category: e.target.value as any }))}
                            size="lg"
                          >
                            <option value="business">🏢 Бизнес</option>
                            <option value="events">🎉 Мероприятия</option>
                            <option value="ecommerce">🛍️ Интернет-магазин</option>
                            <option value="support">🎧 Техподдержка</option>
                            <option value="education">📚 Образование</option>
                            <option value="other">🔧 Другое</option>
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel>Описание</FormLabel>
                          <Textarea
                            value={botSettings.description}
                            onChange={(e) => setBotSettings(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Бот для регистрации на конференцию..."
                            rows={3}
                          />
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem>
                  <VStack spacing={4} align="stretch">
                    <Card bg={cardBg} border="1px" borderColor={borderColor} borderRadius="xl">
                      <CardHeader>
                        <Heading size="md">Токен бота</Heading>
                      </CardHeader>
                      <CardBody>
                        <FormControl isRequired>
                          <FormLabel fontWeight="medium">Bot Token от @BotFather</FormLabel>
                          <Input
                            value={botSettings.token}
                            onChange={(e) => setBotSettings(prev => ({ ...prev, token: e.target.value }))}
                            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                            type="password"
                            size="lg"
                            borderRadius="lg"
                          />
                        </FormControl>
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader>
                        <Heading size="md">Быстрый старт</Heading>
                      </CardHeader>
                      <CardBody>
                        <Text fontSize="sm" mb={3}>Загрузить готовый шаблон:</Text>
                        <VStack spacing={2} align="stretch">
                          <Button size="sm" variant="outline" onClick={() => loadBuiltinTemplate('events')}>
                            🎉 Мероприятие
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => loadBuiltinTemplate('business')}>
                            🏢 Бизнес
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => loadBuiltinTemplate('ecommerce')}>
                            🛍️ Магазин
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  </VStack>
                </GridItem>
              </Grid>
            </TabPanel>

            {/* Сценарии и кнопки */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Сценарии бота</Heading>
                  <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={addScene}>
                    Добавить сценарий
                  </Button>
                </HStack>

                <SimpleGrid columns={1} spacing={4}>
                  {botSettings.scenes.map((scene, index) => (
                    <Card key={scene.id} bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <HStack>
                              <Badge colorScheme="blue">#{index + 1}</Badge>
                              <Heading size="sm">{scene.name}</Heading>
                              <Badge variant="outline">{scene.trigger}</Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.600">
                              {scene.buttons.length} кнопок
                            </Text>
                          </VStack>
                          <HStack>
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              aria-label="Редактировать"
                              onClick={() => editScene(scene)}
                            />
                            {scene.id !== 'start' && (
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                aria-label="Удалить"
                                onClick={() => deleteScene(scene.id)}
                              />
                            )}
                          </HStack>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Text fontSize="sm" noOfLines={2} mb={3}>
                          {scene.message}
                        </Text>
                        {scene.buttons.length > 0 && (
                          <HStack spacing={2} flexWrap="wrap">
                            {scene.buttons.map((button, btnIndex) => (
                              <Badge key={btnIndex} colorScheme="green" fontSize="xs">
                                {button.text}
                              </Badge>
                            ))}
                          </HStack>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* WebApp конструктор */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Heading size="md">WebApp конструктор</Heading>
                      <Badge colorScheme={botSettings.features.webApp ? 'green' : 'gray'}>
                        {botSettings.features.webApp ? 'Включен' : 'Отключен'}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="enable-webapp" mb="0">
                          Включить WebApp для бота
                        </FormLabel>
                        <Switch
                          id="enable-webapp"
                          isChecked={botSettings.features.webApp}
                          onChange={(e) => setBotSettings(prev => ({
                            ...prev,
                            features: { ...prev.features, webApp: e.target.checked }
                          }))}
                        />
                      </FormControl>

                      {botSettings.features.webApp && (
                        <Alert status="info" borderRadius="lg">
                          <AlertIcon />
                          <Box>
                            <AlertTitle>📱 WebApp активен!</AlertTitle>
                            <AlertDescription>
                              Ваш бот будет включать интерактивное веб-приложение с каталогом, корзиной и полным функционалом для {botSettings.category === 'ecommerce' ? 'интернет-магазина' : botSettings.category === 'medical_clinic' ? 'медицинской клиники' : botSettings.category === 'fitness_club' ? 'фитнес-клуба' : 'вашего бизнеса'}.
                            </AlertDescription>
                          </Box>
                        </Alert>
                      )}

                      {botSettings.features.webApp && (
                        <VStack spacing={6} align="stretch">
                          <FormControl>
                            <FormLabel>
                              🌐 URL WebApp сервера 
                              <Badge ml={2} colorScheme="green" fontSize="xs">Автоматически</Badge>
                            </FormLabel>
                            <Input
                              placeholder="Оставьте пустым для автоопределения"
                              value={botSettings.webAppUrl || ''}
                              onChange={(e) => setBotSettings(prev => ({
                                ...prev,
                                webAppUrl: e.target.value
                              }))}
                              isDisabled
                              bg="gray.50"
                            />
                            <Text fontSize="sm" color="gray.600" mt={1}>
                              ℹ️ URL определяется автоматически из переменной SERVER_URL
                            </Text>
                          </FormControl>
                          
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                          <Card bg="blue.50" p={4}>
                            <VStack align="start" spacing={3}>
                              <Heading size="sm">🎨 Дизайн WebApp</Heading>
                              <Text fontSize="sm" color="gray.600">
                                ✅ Адаптивный дизайн под мобильные устройства
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                ✅ Telegram тема (светлая/темная)
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                ✅ Интерактивные элементы и анимации
                              </Text>
                            </VStack>
                          </Card>

                          <Card bg="green.50" p={4}>
                            <VStack align="start" spacing={3}>
                              <Heading size="sm">⚡ Функционал</Heading>
                              <Text fontSize="sm" color="gray.600">
                                ✅ Корзина с подсчетом суммы
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                ✅ Каталог товаров/услуг
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                ✅ Обратная связь с ботом
                              </Text>
                            </VStack>
                          </Card>
                        </SimpleGrid>
                        </VStack>
                      )}

                      {botSettings.features.webApp && (
                        <Box>
                          <Heading size="sm" mb={3}>📋 Предпросмотр WebApp</Heading>
                          <Box
                            bg="gray.100"
                            p={4}
                            borderRadius="lg"
                            border="2px dashed"
                            borderColor="gray.300"
                            textAlign="center"
                          >
                            <VStack spacing={3}>
                              <Text fontSize="6xl">📱</Text>
                              <Heading size="md">{botSettings.name}</Heading>
                              <Text color="gray.600">{botSettings.description}</Text>
                              
                              {botSettings.category === 'restaurant_delivery' && (
                                <VStack spacing={2}>
                                  <Text fontWeight="bold">🍕 Меню ресторана:</Text>
                                  <Text fontSize="sm">• Пицца Маргарита - 890₽</Text>
                                  <Text fontSize="sm">• Паста Карбонара - 790₽</Text>
                                  <Text fontSize="sm">• Кола - 190₽</Text>
                                </VStack>
                              )}
                              
                              {botSettings.category === 'electronics_store' && (
                                <VStack spacing={2}>
                                  <Text fontWeight="bold">📱 Каталог электроники:</Text>
                                  <Text fontSize="sm">• iPhone 15 - 79990₽</Text>
                                  <Text fontSize="sm">• MacBook Air - 129990₽</Text>
                                  <Text fontSize="sm">• AirPods Pro - 24990₽</Text>
                                </VStack>
                              )}
                              
                              <Badge colorScheme="blue">
                                Полноценный WebApp будет автоматически создан при запуске бота
                              </Badge>
                            </VStack>
                          </Box>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Контент WebApp */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Управление контентом WebApp</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={6} align="stretch">
                      <FormControl>
                        <FormLabel fontWeight="semibold">Товары/Услуги</FormLabel>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Добавьте товары или услуги для вашего WebApp магазина
                        </Text>
                        <VStack spacing={3} align="stretch">
                          {(botSettings.webAppContent?.products || []).map((product: any, index: number) => (
                            <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                              <HStack justify="space-between" mb={2}>
                                <Text fontWeight="bold">{product.name || 'Новый товар'}</Text>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    const newProducts = [...(botSettings.webAppContent?.products || [])];
                                    newProducts.splice(index, 1);
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, products: newProducts }
                                    }));
                                  }}
                                >
                                  Удалить
                                </Button>
                              </HStack>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                <Input
                                  placeholder="Название товара"
                                  value={product.name || ''}
                                  onChange={(e) => {
                                    const newProducts = [...(botSettings.webAppContent?.products || [])];
                                    newProducts[index] = { ...newProducts[index], name: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, products: newProducts }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Цена (₽)"
                                  type="number"
                                  value={product.price || ''}
                                  onChange={(e) => {
                                    const newProducts = [...(botSettings.webAppContent?.products || [])];
                                    newProducts[index] = { ...newProducts[index], price: parseInt(e.target.value) || 0 };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, products: newProducts }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Эмодзи"
                                  value={product.emoji || ''}
                                  onChange={(e) => {
                                    const newProducts = [...(botSettings.webAppContent?.products || [])];
                                    newProducts[index] = { ...newProducts[index], emoji: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, products: newProducts }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Описание"
                                  value={product.description || ''}
                                  onChange={(e) => {
                                    const newProducts = [...(botSettings.webAppContent?.products || [])];
                                    newProducts[index] = { ...newProducts[index], description: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, products: newProducts }
                                    }));
                                  }}
                                />
                              </SimpleGrid>
                            </Box>
                          ))}
                          <Button
                            leftIcon={<span>➕</span>}
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => {
                              const newProduct = {
                                id: Date.now().toString(),
                                name: '',
                                price: 0,
                                emoji: '⭐',
                                description: ''
                              };
                              setBotSettings(prev => ({
                                ...prev,
                                webAppContent: {
                                  ...prev.webAppContent,
                                  products: [...(prev.webAppContent?.products || []), newProduct]
                                }
                              }));
                            }}
                          >
                            Добавить товар
                          </Button>
                        </VStack>
                      </FormControl>

                      <FormControl>
                        <FormLabel>📊 Опросы и викторины</FormLabel>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Создайте интерактивные опросы с вопросами и баллами
                        </Text>
                        <VStack spacing={3} align="stretch">
                          {(botSettings.webAppContent?.surveys || []).map((survey: any, index: number) => (
                            <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                              <HStack justify="space-between" mb={2}>
                                <Text fontWeight="bold">{survey.title || 'Новый опрос'}</Text>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    const newSurveys = [...(botSettings.webAppContent?.surveys || [])];
                                    newSurveys.splice(index, 1);
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, surveys: newSurveys }
                                    }));
                                  }}
                                >
                                  Удалить
                                </Button>
                              </HStack>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                <Input
                                  placeholder="Название опроса"
                                  value={survey.title || ''}
                                  onChange={(e) => {
                                    const newSurveys = [...(botSettings.webAppContent?.surveys || [])];
                                    newSurveys[index] = { ...newSurveys[index], title: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, surveys: newSurveys }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Максимум баллов"
                                  type="number"
                                  value={survey.maxPoints || ''}
                                  onChange={(e) => {
                                    const newSurveys = [...(botSettings.webAppContent?.surveys || [])];
                                    newSurveys[index] = { ...newSurveys[index], maxPoints: parseInt(e.target.value) || 0 };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, surveys: newSurveys }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Эмодзи"
                                  value={survey.emoji || ''}
                                  onChange={(e) => {
                                    const newSurveys = [...(botSettings.webAppContent?.surveys || [])];
                                    newSurveys[index] = { ...newSurveys[index], emoji: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, surveys: newSurveys }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Описание"
                                  value={survey.description || ''}
                                  onChange={(e) => {
                                    const newSurveys = [...(botSettings.webAppContent?.surveys || [])];
                                    newSurveys[index] = { ...newSurveys[index], description: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, surveys: newSurveys }
                                    }));
                                  }}
                                />
                              </SimpleGrid>
                            </Box>
                          ))}
                          <Button
                            leftIcon={<span>➕</span>}
                            colorScheme="purple"
                            variant="outline"
                            onClick={() => {
                              const newSurvey = {
                                id: Date.now().toString(),
                                title: '',
                                maxPoints: 100,
                                emoji: '📊',
                                description: ''
                              };
                              setBotSettings(prev => ({
                                ...prev,
                                webAppContent: {
                                  ...prev.webAppContent,
                                  surveys: [...(prev.webAppContent?.surveys || []), newSurvey]
                                }
                              }));
                            }}
                          >
                            Добавить опрос
                          </Button>
                        </VStack>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="semibold">Активности и задания</FormLabel>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Создайте задания с баллами за выполнение
                        </Text>
                        <VStack spacing={3} align="stretch">
                          {(botSettings.webAppContent?.activities || []).map((activity: any, index: number) => (
                            <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                              <HStack justify="space-between" mb={2}>
                                <Text fontWeight="bold">{activity.name || 'Новая активность'}</Text>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    const newActivities = [...(botSettings.webAppContent?.activities || [])];
                                    newActivities.splice(index, 1);
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, activities: newActivities }
                                    }));
                                  }}
                                >
                                  Удалить
                                </Button>
                              </HStack>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                <Input
                                  placeholder="Название активности"
                                  value={activity.name || ''}
                                  onChange={(e) => {
                                    const newActivities = [...(botSettings.webAppContent?.activities || [])];
                                    newActivities[index] = { ...newActivities[index], name: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, activities: newActivities }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Баллы за выполнение"
                                  type="number"
                                  value={activity.points || ''}
                                  onChange={(e) => {
                                    const newActivities = [...(botSettings.webAppContent?.activities || [])];
                                    newActivities[index] = { ...newActivities[index], points: parseInt(e.target.value) || 0 };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, activities: newActivities }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Эмодзи"
                                  value={activity.emoji || ''}
                                  onChange={(e) => {
                                    const newActivities = [...(botSettings.webAppContent?.activities || [])];
                                    newActivities[index] = { ...newActivities[index], emoji: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, activities: newActivities }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Описание"
                                  value={activity.description || ''}
                                  onChange={(e) => {
                                    const newActivities = [...(botSettings.webAppContent?.activities || [])];
                                    newActivities[index] = { ...newActivities[index], description: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, activities: newActivities }
                                    }));
                                  }}
                                />
                              </SimpleGrid>
                            </Box>
                          ))}
                          <Button
                            leftIcon={<span>➕</span>}
                            colorScheme="orange"
                            variant="outline"
                            onClick={() => {
                              const newActivity = {
                                id: Date.now().toString(),
                                name: '',
                                points: 10,
                                emoji: '🎯',
                                description: ''
                              };
                              setBotSettings(prev => ({
                                ...prev,
                                webAppContent: {
                                  ...prev.webAppContent,
                                  activities: [...(prev.webAppContent?.activities || []), newActivity]
                                }
                              }));
                            }}
                          >
                            Добавить активность
                          </Button>
                        </VStack>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="semibold">Расписание и мероприятия</FormLabel>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Добавьте лекции, встречи и события
                        </Text>
                        <VStack spacing={3} align="stretch">
                          {(botSettings.webAppContent?.schedule || []).map((event: any, index: number) => (
                            <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                              <HStack justify="space-between" mb={2}>
                                <Text fontWeight="bold">{event.title || 'Новое мероприятие'}</Text>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    const newSchedule = [...(botSettings.webAppContent?.schedule || [])];
                                    newSchedule.splice(index, 1);
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, schedule: newSchedule }
                                    }));
                                  }}
                                >
                                  Удалить
                                </Button>
                              </HStack>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                <Input
                                  placeholder="Название события"
                                  value={event.title || ''}
                                  onChange={(e) => {
                                    const newSchedule = [...(botSettings.webAppContent?.schedule || [])];
                                    newSchedule[index] = { ...newSchedule[index], title: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, schedule: newSchedule }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Спикер"
                                  value={event.speaker || ''}
                                  onChange={(e) => {
                                    const newSchedule = [...(botSettings.webAppContent?.schedule || [])];
                                    newSchedule[index] = { ...newSchedule[index], speaker: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, schedule: newSchedule }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Время начала"
                                  type="datetime-local"
                                  value={event.startTime || ''}
                                  onChange={(e) => {
                                    const newSchedule = [...(botSettings.webAppContent?.schedule || [])];
                                    newSchedule[index] = { ...newSchedule[index], startTime: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, schedule: newSchedule }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Время окончания"
                                  type="datetime-local"
                                  value={event.endTime || ''}
                                  onChange={(e) => {
                                    const newSchedule = [...(botSettings.webAppContent?.schedule || [])];
                                    newSchedule[index] = { ...newSchedule[index], endTime: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, schedule: newSchedule }
                                    }));
                                  }}
                                />
                              </SimpleGrid>
                            </Box>
                          ))}
                          <Button
                            leftIcon={<span>➕</span>}
                            colorScheme="green"
                            variant="outline"
                            onClick={() => {
                              const newEvent = {
                                id: Date.now().toString(),
                                title: '',
                                speaker: '',
                                startTime: '',
                                endTime: ''
                              };
                              setBotSettings(prev => ({
                                ...prev,
                                webAppContent: {
                                  ...prev.webAppContent,
                                  schedule: [...(prev.webAppContent?.schedule || []), newEvent]
                                }
                              }));
                            }}
                          >
                            Добавить событие
                          </Button>
                        </VStack>
                      </FormControl>

                      <FormControl>
                        <FormLabel>📱 QR коды и проверки</FormLabel>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Настройте QR-коды для участников и проверки
                        </Text>
                        <VStack spacing={3} align="stretch">
                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="enable-qr" mb="0">
                              Включить QR-коды для участников
                            </FormLabel>
                            <Switch
                              id="enable-qr"
                              isChecked={botSettings.webAppContent?.qrEnabled || false}
                              onChange={(e) => setBotSettings(prev => ({
                                ...prev,
                                webAppContent: { 
                                  ...prev.webAppContent, 
                                  qrEnabled: e.target.checked 
                                }
                              }))}
                            />
                          </FormControl>
                          
                          {botSettings.webAppContent?.qrEnabled && (
                            <VStack spacing={3} align="stretch">
                              <Input
                                placeholder="Текст на QR-коде"
                                value={botSettings.webAppContent?.qrText || ''}
                                onChange={(e) => setBotSettings(prev => ({
                                  ...prev,
                                  webAppContent: { 
                                    ...prev.webAppContent, 
                                    qrText: e.target.value 
                                  }
                                }))}
                              />
                              <Input
                                placeholder="Награда за сканирование (баллы)"
                                type="number"
                                value={botSettings.webAppContent?.qrReward || ''}
                                onChange={(e) => setBotSettings(prev => ({
                                  ...prev,
                                  webAppContent: { 
                                    ...prev.webAppContent, 
                                    qrReward: parseInt(e.target.value) || 10 
                                  }
                                }))}
                              />
                            </VStack>
                          )}
                        </VStack>
                      </FormControl>

                      <FormControl>
                        <FormLabel>📍 Локации и места</FormLabel>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Добавьте места проведения мероприятий
                        </Text>
                        <VStack spacing={3} align="stretch">
                          {(botSettings.webAppContent?.locations || []).map((location: any, index: number) => (
                            <Box key={index} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                              <HStack justify="space-between" mb={2}>
                                <Text fontWeight="bold">{location.name || 'Новая локация'}</Text>
                                <Button
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    const newLocations = [...(botSettings.webAppContent?.locations || [])];
                                    newLocations.splice(index, 1);
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, locations: newLocations }
                                    }));
                                  }}
                                >
                                  Удалить
                                </Button>
                              </HStack>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                                <Input
                                  placeholder="Название локации"
                                  value={location.name || ''}
                                  onChange={(e) => {
                                    const newLocations = [...(botSettings.webAppContent?.locations || [])];
                                    newLocations[index] = { ...newLocations[index], name: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, locations: newLocations }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Адрес"
                                  value={location.address || ''}
                                  onChange={(e) => {
                                    const newLocations = [...(botSettings.webAppContent?.locations || [])];
                                    newLocations[index] = { ...newLocations[index], address: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, locations: newLocations }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Эмодзи"
                                  value={location.emoji || ''}
                                  onChange={(e) => {
                                    const newLocations = [...(botSettings.webAppContent?.locations || [])];
                                    newLocations[index] = { ...newLocations[index], emoji: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, locations: newLocations }
                                    }));
                                  }}
                                />
                                <Input
                                  placeholder="Описание"
                                  value={location.description || ''}
                                  onChange={(e) => {
                                    const newLocations = [...(botSettings.webAppContent?.locations || [])];
                                    newLocations[index] = { ...newLocations[index], description: e.target.value };
                                    setBotSettings(prev => ({
                                      ...prev,
                                      webAppContent: { ...prev.webAppContent, locations: newLocations }
                                    }));
                                  }}
                                />
                              </SimpleGrid>
                            </Box>
                          ))}
                          <Button
                            leftIcon={<span>➕</span>}
                            colorScheme="teal"
                            variant="outline"
                            onClick={() => {
                              const newLocation = {
                                id: Date.now().toString(),
                                name: '',
                                address: '',
                                emoji: '📍',
                                description: ''
                              };
                              setBotSettings(prev => ({
                                ...prev,
                                webAppContent: {
                                  ...prev.webAppContent,
                                  locations: [...(prev.webAppContent?.locations || []), newLocation]
                                }
                              }));
                            }}
                          >
                            Добавить локацию
                          </Button>
                        </VStack>
                      </FormControl>

                      <FormControl mb={6}>
                        <FormLabel>🎨 Цветовая схема WebApp</FormLabel>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Выберите стиль оформления вашего WebApp
                        </Text>
                        <Select
                          value={botSettings.webAppContent?.theme || 'purple'}
                          onChange={(e) => setBotSettings(prev => ({
                            ...prev,
                            webAppContent: {
                              ...prev.webAppContent,
                              theme: e.target.value
                            }
                          }))}
                        >
                          <option value="purple">💜 Фиолетовый (по умолчанию)</option>
                          <option value="blue">💙 Синий</option>
                          <option value="green">💚 Зеленый</option>
                          <option value="orange">🧡 Оранжевый</option>
                          <option value="pink">💗 Розовый</option>
                          <option value="dark">🖤 Темный</option>
                        </Select>
                      </FormControl>

                      <FormControl mb={6}>
                        <FormLabel>👨‍💼 Администраторы бота</FormLabel>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Укажите Telegram ID пользователей, которые будут иметь доступ к команде /admin
                          <br />
                          <Text as="span" fontSize="xs" color="blue.500">
                            💡 Чтобы узнать свой Telegram ID, напишите боту @userinfobot
                          </Text>
                        </Text>
                        <Input
                          placeholder="Например: 123456789, 987654321"
                          value={(botSettings.adminUsers || []).join(', ')}
                          onChange={(e) => {
                            const ids = e.target.value
                              .split(',')
                              .map(id => parseInt(id.trim()))
                              .filter(id => !isNaN(id));
                            setBotSettings(prev => ({
                              ...prev,
                              adminUsers: ids
                            }));
                          }}
                        />
                        {botSettings.adminUsers && botSettings.adminUsers.length > 0 && (
                          <HStack mt={2} spacing={2} flexWrap="wrap">
                            {botSettings.adminUsers.map((id, index) => (
                              <Badge key={index} colorScheme="purple" px={3} py={1} borderRadius="full">
                                🆔 {id}
                                <IconButton
                                  aria-label="Удалить"
                                  icon={<DeleteIcon />}
                                  size="xs"
                                  ml={2}
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => {
                                    const newAdmins = [...(botSettings.adminUsers || [])];
                                    newAdmins.splice(index, 1);
                                    setBotSettings(prev => ({
                                      ...prev,
                                      adminUsers: newAdmins
                                    }));
                                  }}
                                />
                              </Badge>
                            ))}
                          </HStack>
                        )}
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel fontWeight="semibold">Настройки страниц WebApp</FormLabel>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Выберите какие страницы показывать в WebApp
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="show-shop" mb="0">
                              🛒 Магазин
                            </FormLabel>
                            <Switch
                              id="show-shop"
                              isChecked={botSettings.webAppContent?.pages?.shop || false}
                              onChange={(e) => setBotSettings(prev => ({
                                ...prev,
                                webAppContent: { 
                                  ...prev.webAppContent, 
                                  pages: { 
                                    ...prev.webAppContent?.pages, 
                                    shop: e.target.checked 
                                  }
                                }
                              }))}
                            />
                          </FormControl>
                          
                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="show-surveys" mb="0">
                              📊 Опросы
                            </FormLabel>
                            <Switch
                              id="show-surveys"
                              isChecked={botSettings.webAppContent?.pages?.surveys || false}
                              onChange={(e) => setBotSettings(prev => ({
                                ...prev,
                                webAppContent: { 
                                  ...prev.webAppContent, 
                                  pages: { 
                                    ...prev.webAppContent?.pages, 
                                    surveys: e.target.checked 
                                  }
                                }
                              }))}
                            />
                          </FormControl>
                          
                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="show-activities" mb="0">
                              🎯 Активности
                            </FormLabel>
                            <Switch
                              id="show-activities"
                              isChecked={botSettings.webAppContent?.pages?.activities || false}
                              onChange={(e) => setBotSettings(prev => ({
                                ...prev,
                                webAppContent: { 
                                  ...prev.webAppContent, 
                                  pages: { 
                                    ...prev.webAppContent?.pages, 
                                    activities: e.target.checked 
                                  }
                                }
                              }))}
                            />
                          </FormControl>
                          
                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="show-schedule" mb="0">
                              📅 Расписание
                            </FormLabel>
                            <Switch
                              id="show-schedule"
                              isChecked={botSettings.webAppContent?.pages?.schedule || false}
                              onChange={(e) => setBotSettings(prev => ({
                                ...prev,
                                webAppContent: { 
                                  ...prev.webAppContent, 
                                  pages: { 
                                    ...prev.webAppContent?.pages, 
                                    schedule: e.target.checked 
                                  }
                                }
                              }))}
                            />
                          </FormControl>
                          
                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="show-qr" mb="0">
                              📱 QR-коды
                            </FormLabel>
                            <Switch
                              id="show-qr"
                              isChecked={botSettings.webAppContent?.pages?.qr || false}
                              onChange={(e) => setBotSettings(prev => ({
                                ...prev,
                                webAppContent: { 
                                  ...prev.webAppContent, 
                                  pages: { 
                                    ...prev.webAppContent?.pages, 
                                    qr: e.target.checked 
                                  }
                                }
                              }))}
                            />
                          </FormControl>
                          
                          <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="show-admin" mb="0">
                              🔧 Админ-панель
                            </FormLabel>
                            <Switch
                              id="show-admin"
                              isChecked={botSettings.webAppContent?.pages?.admin || false}
                              onChange={(e) => setBotSettings(prev => ({
                                ...prev,
                                webAppContent: { 
                                  ...prev.webAppContent, 
                                  pages: { 
                                    ...prev.webAppContent?.pages, 
                                    admin: e.target.checked 
                                  }
                                }
                              }))}
                            />
                          </FormControl>
                        </SimpleGrid>
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* База данных */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Настройки базы данных</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="save-contacts" mb="0" fontSize="sm">
                          Сохранять контакты
                        </FormLabel>
                        <Switch
                          id="save-contacts"
                          isChecked={botSettings.database.users.saveContacts}
                          onChange={(e) => setBotSettings(prev => ({
                            ...prev,
                            database: {
                              ...prev.database,
                              users: { ...prev.database.users, saveContacts: e.target.checked }
                            }
                          }))}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="save-messages" mb="0" fontSize="sm">
                          Сохранять сообщения
                        </FormLabel>
                        <Switch
                          id="save-messages"
                          isChecked={botSettings.database.users.saveMessages}
                          onChange={(e) => setBotSettings(prev => ({
                            ...prev,
                            database: {
                              ...prev.database,
                              users: { ...prev.database.users, saveMessages: e.target.checked }
                            }
                          }))}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel htmlFor="save-location" mb="0" fontSize="sm">
                          Сохранять геолокацию
                        </FormLabel>
                        <Switch
                          id="save-location"
                          isChecked={botSettings.database.users.saveLocation}
                          onChange={(e) => setBotSettings(prev => ({
                            ...prev,
                            database: {
                              ...prev.database,
                              users: { ...prev.database.users, saveLocation: e.target.checked }
                            }
                          }))}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Пользовательские поля</Heading>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Название поля</Th>
                            <Th>Тип</Th>
                            <Th>Обязательное</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {botSettings.database.customFields.map((field, index) => (
                            <Tr key={index}>
                              <Td>{field.name}</Td>
                              <Td>
                                <Badge colorScheme="blue">{field.type}</Badge>
                              </Td>
                              <Td>
                                <Badge colorScheme={field.required ? 'red' : 'gray'}>
                                  {field.required ? 'Да' : 'Нет'}
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Интеграции */}
            <TabPanel>
              <SimpleGrid columns={1} spacing={4}>
                <Card bg={cardBg} border="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Уведомления администратору</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>ID чата администратора</FormLabel>
                        <Input
                          value={botSettings.integrations.notifications.adminChat}
                          onChange={(e) => setBotSettings(prev => ({
                            ...prev,
                            integrations: {
                              ...prev.integrations,
                              notifications: { ...prev.integrations.notifications, adminChat: e.target.value }
                            }
                          }))}
                          placeholder="123456789"
                        />
                        <Text fontSize="xs" color="gray.500">
                          Отправьте /start боту и найдите ваш ID в логах
                        </Text>
                      </FormControl>

                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="notify-new-user" mb="0" fontSize="sm">
                            Новые пользователи
                          </FormLabel>
                          <Switch
                            id="notify-new-user"
                            isChecked={botSettings.integrations.notifications.onNewUser}
                            onChange={(e) => setBotSettings(prev => ({
                              ...prev,
                              integrations: {
                                ...prev.integrations,
                                notifications: { ...prev.integrations.notifications, onNewUser: e.target.checked }
                              }
                            }))}
                          />
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="notify-orders" mb="0" fontSize="sm">
                            Заказы/регистрации
                          </FormLabel>
                          <Switch
                            id="notify-orders"
                            isChecked={botSettings.integrations.notifications.onOrder}
                            onChange={(e) => setBotSettings(prev => ({
                              ...prev,
                              integrations: {
                                ...prev.integrations,
                                notifications: { ...prev.integrations.notifications, onOrder: e.target.checked }
                              }
                            }))}
                          />
                        </FormControl>

                        <FormControl display="flex" alignItems="center">
                          <FormLabel htmlFor="notify-errors" mb="0" fontSize="sm">
                            Ошибки бота
                          </FormLabel>
                          <Switch
                            id="notify-errors"
                            isChecked={botSettings.integrations.notifications.onError}
                            onChange={(e) => setBotSettings(prev => ({
                              ...prev,
                              integrations: {
                                ...prev.integrations,
                                notifications: { ...prev.integrations.notifications, onError: e.target.checked }
                              }
                            }))}
                          />
                        </FormControl>
                      </SimpleGrid>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Функции */}
            <TabPanel>
              <Card bg={cardBg} border="1px" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Дополнительные функции</Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="analytics" mb="0">
                        Аналитика и статистика
                      </FormLabel>
                      <Switch
                        id="analytics"
                        isChecked={botSettings.features.analytics}
                        onChange={(e) => setBotSettings(prev => ({
                          ...prev,
                          features: { ...prev.features, analytics: e.target.checked }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="multi-language" mb="0">
                        Многоязычность
                      </FormLabel>
                      <Switch
                        id="multi-language"
                        isChecked={botSettings.features.multiLanguage}
                        onChange={(e) => setBotSettings(prev => ({
                          ...prev,
                          features: { ...prev.features, multiLanguage: e.target.checked }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="file-upload" mb="0">
                        Загрузка файлов
                      </FormLabel>
                      <Switch
                        id="file-upload"
                        isChecked={botSettings.features.fileUpload}
                        onChange={(e) => setBotSettings(prev => ({
                          ...prev,
                          features: { ...prev.features, fileUpload: e.target.checked }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="voice-messages" mb="0">
                        Голосовые сообщения
                      </FormLabel>
                      <Switch
                        id="voice-messages"
                        isChecked={botSettings.features.voiceMessages}
                        onChange={(e) => setBotSettings(prev => ({
                          ...prev,
                          features: { ...prev.features, voiceMessages: e.target.checked }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="polls" mb="0">
                        📊 Опросы и голосования
                      </FormLabel>
                      <Switch
                        id="polls"
                        isChecked={botSettings.features.polls}
                        onChange={(e) => setBotSettings(prev => ({
                          ...prev,
                          features: { ...prev.features, polls: e.target.checked }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="broadcasts" mb="0">
                        📢 Массовые рассылки
                      </FormLabel>
                      <Switch
                        id="broadcasts"
                        isChecked={botSettings.features.broadcasts}
                        onChange={(e) => setBotSettings(prev => ({
                          ...prev,
                          features: { ...prev.features, broadcasts: e.target.checked }
                        }))}
                      />
                    </FormControl>

                    <FormControl display="flex" alignItems="center">
                      <FormLabel htmlFor="qr-codes" mb="0">
                        📱 QR коды
                      </FormLabel>
                      <Switch
                        id="qr-codes"
                        isChecked={botSettings.features.qrCodes}
                        onChange={(e) => setBotSettings(prev => ({
                          ...prev,
                          features: { ...prev.features, qrCodes: e.target.checked }
                        }))}
                      />
                    </FormControl>
                  </SimpleGrid>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Предпросмотр */}
            <TabPanel>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
                <GridItem>
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Предпросмотр бота</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box
                        bg="gray.50"
                        borderRadius="lg"
                        p={4}
                        border="1px"
                        borderColor="gray.200"
                        maxH="500px"
                        overflowY="auto"
                      >
                        <VStack align="start" spacing={4}>
                          <HStack>
                            <Badge colorScheme="green">BOT</Badge>
                            <Text fontWeight="bold">
                              {botSettings.name || 'Название бота'}
                            </Text>
                          </HStack>

                          {botSettings.scenes.map((scene, index) => (
                            <Box key={scene.id} w="full">
                              <Text fontSize="xs" color="gray.500" mb={2}>
                                Сценарий #{index + 1}: {scene.name}
                              </Text>
                              <Box bg="white" p={3} borderRadius="md" border="1px" borderColor="gray.200" mb={2}>
                                <Text fontSize="sm" whiteSpace="pre-line">
                                  {scene.message}
                                </Text>
                              </Box>
                              {scene.buttons.length > 0 && (
                                <VStack spacing={1} align="stretch" mb={3}>
                                  {scene.buttons.map((button, btnIndex) => (
                                    <Box
                                      key={btnIndex}
                                      bg="blue.50"
                                      p={2}
                                      borderRadius="md"
                                      border="1px"
                                      borderColor="blue.200"
                                      textAlign="center"
                                    >
                                      <Text fontSize="xs" fontWeight="bold">
                                        {button.text}
                                      </Text>
                                    </Box>
                                  ))}
                                </VStack>
                              )}
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    </CardBody>
                  </Card>
                </GridItem>

                <GridItem>
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Статистика проекта</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text>Категория:</Text>
                          <Badge colorScheme="purple">
                            {botSettings.category}
                          </Badge>
                        </HStack>

                        <HStack justify="space-between">
                          <Text>Сценариев:</Text>
                          <Badge colorScheme="blue">
                            {botSettings.scenes.length}
                          </Badge>
                        </HStack>

                        <HStack justify="space-between">
                          <Text>Кнопок всего:</Text>
                          <Badge colorScheme="green">
                            {botSettings.scenes.reduce((sum, scene) => sum + scene.buttons.length, 0)}
                          </Badge>
                        </HStack>

                        <HStack justify="space-between">
                          <Text>Полей БД:</Text>
                          <Badge colorScheme="orange">
                            {botSettings.database.customFields.length}
                          </Badge>
                        </HStack>

                        <HStack justify="space-between">
                          <Text>Функций включено:</Text>
                          <Badge colorScheme="purple">
                            {Object.values(botSettings.features).filter(Boolean).length}
                          </Badge>
                        </HStack>

                        <Divider />

                        <VStack spacing={3} align="start">
                          <Text fontWeight="bold">🚀 Готовность к созданию:</Text>
                          <VStack spacing={2} align="start" fontSize="sm">
                            <HStack>
                              <Text>Название:</Text>
                              <Badge colorScheme={botSettings.name ? 'green' : 'red'}>
                                {botSettings.name ? '✅' : '❌'}
                              </Badge>
                            </HStack>
                            <HStack>
                              <Text>Токен:</Text>
                              <Badge colorScheme={botSettings.token ? 'green' : 'red'}>
                                {botSettings.token ? '✅' : '❌'}
                              </Badge>
                            </HStack>
                            <HStack>
                              <Text>Сценарии:</Text>
                              <Badge colorScheme={botSettings.scenes.length > 0 ? 'green' : 'orange'}>
                                {botSettings.scenes.length > 0 ? '✅' : '⚠️'}
                              </Badge>
                            </HStack>
                          </VStack>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Modal для редактирования сценария */}
      <Modal isOpen={isSceneModalOpen} onClose={onSceneModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            ✏️ Редактирование сценария: {selectedScene?.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedScene && (
              <VStack spacing={4} align="stretch">
                <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                  <FormControl>
                    <FormLabel>Название сценария</FormLabel>
                    <Input
                      value={selectedScene.name}
                      onChange={(e) => setSelectedScene({
                        ...selectedScene,
                        name: e.target.value
                      })}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Триггер (команда)</FormLabel>
                    <Input
                      value={selectedScene.trigger}
                      onChange={(e) => setSelectedScene({
                        ...selectedScene,
                        trigger: e.target.value
                      })}
                      placeholder="menu"
                    />
                  </FormControl>
                </Grid>

                <FormControl>
                  <FormLabel>Сообщение</FormLabel>
                  <Textarea
                    value={selectedScene.message}
                    onChange={(e) => setSelectedScene({
                      ...selectedScene,
                      message: e.target.value
                    })}
                    rows={6}
                    placeholder="Текст сообщения для пользователя..."
                  />
                </FormControl>

                <Divider />

                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Heading size="sm">🔘 Кнопки</Heading>
                    <Badge>{selectedScene.buttons.length} кнопок</Badge>
                  </HStack>

                  {/* Добавить кнопку */}
                  <Card bg="gray.50" p={3}>
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" fontWeight="bold">Добавить кнопку:</Text>
                      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr 1fr' }} gap={2} alignItems="end">
                        <FormControl>
                          <FormLabel fontSize="xs">Текст кнопки</FormLabel>
                          <Input
                            size="sm"
                            value={newButton.text}
                            onChange={(e) => setNewButton(prev => ({ ...prev, text: e.target.value }))}
                            placeholder="📞 Контакты"
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="xs">Тип</FormLabel>
                          <Select
                            size="sm"
                            value={newButton.action}
                            onChange={(e) => setNewButton(prev => ({ ...prev, action: e.target.value as any }))}
                          >
                            <option value="callback">Действие</option>
                            <option value="url">Ссылка</option>
                            <option value="contact">Контакт</option>
                            <option value="location">Геолокация</option>
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="xs">Значение</FormLabel>
                          <Input
                            size="sm"
                            value={newButton.value}
                            onChange={(e) => setNewButton(prev => ({ ...prev, value: e.target.value }))}
                            placeholder={newButton.action === 'url' ? 'https://...' : 'contacts'}
                          />
                        </FormControl>

                        <Button size="sm" colorScheme="green" onClick={addButtonToScene}>
                          +
                        </Button>
                      </Grid>
                    </VStack>
                  </Card>

                  {/* Список кнопок */}
                  {selectedScene.buttons.map((button, index) => (
                    <HStack key={index} p={2} bg="white" borderRadius="md" border="1px" borderColor="gray.200">
                      <Text flex={1} fontSize="sm">{button.text}</Text>
                      <Badge colorScheme="blue" fontSize="xs">{button.action}</Badge>
                      <Text fontSize="xs" color="gray.600" maxW="150px" noOfLines={1}>
                        {button.value}
                      </Text>
                      <IconButton
                        icon={<DeleteIcon />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="Удалить кнопку"
                        onClick={() => removeButtonFromScene(index)}
                      />
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onSceneModalClose}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={saveScene}>
              Сохранить сценарий
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BotBuilderPage;