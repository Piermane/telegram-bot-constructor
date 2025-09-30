import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Icon,
  Spinner,
  Center,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiClock, FiUsers, FiShoppingBag, FiHeadphones, FiBookOpen, FiBriefcase, FiSettings } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  preview: string;
  features: string[];
  scenesCount: number;
  hasWebApp: boolean;
  hasPayment: boolean;
}

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const categories = [
    { id: 'all', name: 'Все шаблоны', icon: FiSettings },
    { id: 'events', name: 'Мероприятия', icon: FiClock },
    { id: 'ecommerce', name: 'Интернет-магазин', icon: FiShoppingBag },
    { id: 'support', name: 'Поддержка', icon: FiHeadphones },
    { id: 'education', name: 'Образование', icon: FiBookOpen },
    { id: 'business', name: 'Бизнес', icon: FiBriefcase },
    { id: 'other', name: 'Другое', icon: FiUsers }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
      } else {
        setError('Ошибка загрузки шаблонов');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
      console.error('Ошибка загрузки шаблонов:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = (template: Template) => {
    // Переходим к конструктору с предзаполненным шаблоном
    navigate(`/bots/new?template=${template.id}`);
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      events: 'purple',
      ecommerce: 'green',
      support: 'blue',
      education: 'orange',
      business: 'teal',
      other: 'gray'
    };
    return colors[category] || 'gray';
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Шаблоны ботов - TelegramBot Constructor</title>
        </Helmet>
        <Center h="400px">
          <VStack>
            <Spinner size="xl" color="blue.500" />
            <Text>Загружаем шаблоны...</Text>
          </VStack>
        </Center>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Шаблоны ботов - TelegramBot Constructor</title>
        </Helmet>
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Шаблоны ботов - TelegramBot Constructor</title>
      </Helmet>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          
          {/* Заголовок */}
          <Box textAlign="center">
            <Heading size="xl" mb={4}>🎯 Шаблоны ботов</Heading>
            <Text color="gray.600" fontSize="lg">
              Готовые решения для быстрого старта. Выберите подходящий шаблон и настройте под свои задачи.
            </Text>
          </Box>

          {/* Категории */}
          <Tabs 
            variant="soft-rounded" 
            colorScheme="blue"
            onChange={(index) => setSelectedCategory(categories[index].id)}
          >
            <TabList justifyContent="center" flexWrap="wrap">
              {categories.map((category) => (
                <Tab key={category.id} mr={2} mb={2}>
                  <HStack>
                    <Icon as={category.icon} />
                    <Text>{category.name}</Text>
                  </HStack>
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredTemplates.map((template) => (
                    <Card 
                      key={template.id}
                      bg={cardBg}
                      borderColor={borderColor}
                      borderWidth="1px"
                      _hover={{ 
                        transform: 'translateY(-4px)', 
                        shadow: 'lg',
                        borderColor: 'blue.300'
                      }}
                      transition="all 0.2s"
                    >
                      <CardHeader pb={2}>
                        <VStack align="start" spacing={2}>
                          <HStack justify="space-between" w="100%">
                            <Heading size="md">{template.name}</Heading>
                            <Badge colorScheme={getCategoryColor(template.category)}>
                              {template.category}
                            </Badge>
                          </HStack>
                          
                          <Text color="gray.600" fontSize="sm">
                            {template.description}
                          </Text>
                        </VStack>
                      </CardHeader>

                      <CardBody pt={0}>
                        <VStack align="start" spacing={4}>
                          
                          {/* Превью */}
                          <Box
                            p={3}
                            bg="gray.50"
                            borderRadius="md"
                            fontSize="sm"
                            w="100%"
                            fontFamily="monospace"
                            whiteSpace="pre-line"
                          >
                            {template.preview}
                          </Box>

                          {/* Характеристики */}
                          <VStack align="start" spacing={2} w="100%">
                            <HStack>
                              <Text fontSize="sm" color="gray.600">Сценариев:</Text>
                              <Badge>{template.scenesCount}</Badge>
                            </HStack>
                            
                            {template.hasWebApp && (
                              <Badge colorScheme="purple" size="sm">📱 Web App</Badge>
                            )}
                            
                            {template.hasPayment && (
                              <Badge colorScheme="green" size="sm">💳 Оплата</Badge>
                            )}
                          </VStack>

                          {/* Теги функций */}
                          <Box>
                            <Text fontSize="xs" color="gray.500" mb={1}>Функции:</Text>
                            <HStack flexWrap="wrap" spacing={1}>
                              {template.features.slice(0, 3).map((feature) => (
                                <Badge key={feature} size="sm" variant="outline">
                                  {feature}
                                </Badge>
                              ))}
                              {template.features.length > 3 && (
                                <Badge size="sm" variant="outline">
                                  +{template.features.length - 3}
                                </Badge>
                              )}
                            </HStack>
                          </Box>

                          {/* Кнопка использования */}
                          <Button
                            colorScheme="blue"
                            size="sm"
                            w="100%"
                            onClick={() => handleUseTemplate(template)}
                          >
                            🚀 Использовать шаблон
                          </Button>

                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Информация о создании с нуля */}
          <Box
            p={6}
            bg="blue.50"
            borderRadius="lg"
            border="1px"
            borderColor="blue.200"
            textAlign="center"
          >
            <Heading size="md" mb={2}>🛠️ Нужно что-то особенное?</Heading>
            <Text color="gray.600" mb={4}>
              Создайте уникального бота с нуля используя наш конструктор
            </Text>
            <Button
              colorScheme="blue"
              variant="outline"
              onClick={() => navigate('/bots/new')}
            >
              Создать с нуля
            </Button>
          </Box>

        </VStack>
      </Container>
    </>
  );
};

export default TemplatesPage;