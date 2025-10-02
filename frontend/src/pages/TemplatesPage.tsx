import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
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
  AlertIcon,
  Flex,
  Stack
} from '@chakra-ui/react';
import { FiShoppingBag, FiHeadphones, FiBookOpen, FiBriefcase, FiCheck, FiArrowRight, FiCalendar, FiActivity, FiSettings, FiClock, FiUsers, FiZap } from 'react-icons/fi';
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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      events: FiCalendar,
      ecommerce: FiShoppingBag,
      support: FiHeadphones,
      education: FiBookOpen,
      business: FiBriefcase,
      other: FiActivity
    };
    return icons[category] || FiActivity;
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
        <title>Шаблоны ботов - Telegram Bot Constructor</title>
      </Helmet>

      {/* Hero Section - НАСТОЯЩИЙ Stripe с ВОЛНАМИ */}
      <Box 
        py={{ base: 20, md: 28 }} 
        px={4}
        position="relative"
        overflow="hidden"
        bgGradient="linear(135deg, #667eea 0%, #764ba2 35%, #f093fb 70%, #4facfe 100%)"
        sx={{
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(circle at 35% 45%, rgba(102, 126, 234, 0.4) 0%, transparent 50%), radial-gradient(circle at 65% 55%, rgba(240, 147, 251, 0.4) 0%, transparent 50%)',
            animation: 'gradientWave 14s ease-in-out infinite',
            filter: 'blur(70px)',
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
          '@keyframes gradientWave': {
            '0%, 100%': {
              opacity: 0.7,
              transform: 'translateX(0) scale(1)',
            },
            '50%': {
              opacity: 0.9,
              transform: 'translateX(3%) scale(1.03)',
            },
          },
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={2}>
          <VStack spacing={10} textAlign="center">
            <Badge 
              fontSize="sm" 
              px={4} 
              py={2} 
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wide"
              fontWeight="600"
              bg="rgba(255, 255, 255, 0.12)"
              backdropFilter="blur(12px)"
              color="white"
              borderWidth="1px"
              borderColor="rgba(255, 255, 255, 0.2)"
              boxShadow="0 2px 12px rgba(0,0,0,0.1)"
            >
              Готовые решения
            </Badge>
            <Heading 
              fontSize={{ base: '5xl', md: '6xl', lg: '8xl' }}
              fontWeight="700"
              color="white"
              lineHeight="1"
              letterSpacing="-0.025em"
            >
              Шаблоны Telegram ботов
            </Heading>
            <Text 
              color="rgba(255, 255, 255, 0.92)" 
              fontSize={{ base: 'xl', md: '2xl' }}
              maxW="700px"
              lineHeight="1.5"
              fontWeight="400"
            >
              Готовые решения для бизнеса, запуск за минуты.
              Выберите шаблон и адаптируйте под свои задачи.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                h="56px"
                px={8}
                bg="white"
                color="#764ba2"
                rightIcon={<FiArrowRight />}
                onClick={() => navigate('/bots/new')}
                _hover={{ 
                  transform: 'translateY(-2px)', 
                  shadow: '0 12px 24px rgba(255,255,255,0.35)',
                }}
                transition="all 0.2s ease"
                borderRadius="lg"
                fontWeight="600"
                fontSize="lg"
                boxShadow="0 6px 20px rgba(255,255,255,0.25)"
              >
                Создать с нуля
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={12}>
        <VStack spacing={12} align="stretch">

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
                  {filteredTemplates.map((template, index) => (
                    <Card 
                      key={template.id}
                      bg={cardBg}
                      borderWidth="1px"
                      borderColor={borderColor}
                      borderRadius="2xl"
                      overflow="hidden"
                      position="relative"
                      cursor="pointer"
                      boxShadow="md"
                      onClick={() => handleUseTemplate(template)}
                      _hover={{ 
                        transform: 'translateY(-8px)', 
                        shadow: '0 25px 50px rgba(0,0,0,0.15)',
                        borderColor: 'purple.400'
                      }}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        bgGradient: `linear(to-r, ${getCategoryColor(template.category)}.400, ${getCategoryColor(template.category)}.600)`,
                        opacity: 0,
                        transition: 'opacity 0.3s'
                      }}
                      _after={{
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '2xl',
                        padding: '1px',
                        background: `linear-gradient(135deg, ${getCategoryColor(template.category)}.400, ${getCategoryColor(template.category)}.600)`,
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        opacity: 0,
                        transition: 'opacity 0.3s'
                      }}
                      sx={{
                        '&:hover::before': { opacity: 1 },
                        '&:hover::after': { opacity: 0.5 },
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      {/* Premium Badge для сложных шаблонов */}
                      {template.features.length >= 5 && (
                        <Box
                          position="absolute"
                          top={3}
                          right={3}
                          zIndex={2}
                        >
                          <Badge
                            colorScheme="purple"
                            fontSize="xs"
                            px={2}
                            py={1}
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            bg="purple.500"
                            color="white"
                            boxShadow="sm"
                          >
                            <Icon as={FiZap} boxSize={3} />
                          </Badge>
                        </Box>
                      )}

                      <CardBody p={6}>
                        <VStack align="start" spacing={5}>
                          {/* Иконка и заголовок */}
                          <HStack spacing={3} w="full">
                            <Flex
                              w={12}
                              h={12}
                              borderRadius="xl"
                              bgGradient={`linear(to-br, ${getCategoryColor(template.category)}.400, ${getCategoryColor(template.category)}.600)`}
                              align="center"
                              justify="center"
                              fontSize="2xl"
                              flexShrink={0}
                              color="white"
                            >
                              <Icon as={getCategoryIcon(template.category)} boxSize={6} />
                            </Flex>
                            <VStack align="start" spacing={1} flex={1}>
                              <Heading size="md" fontWeight="bold">
                                {template.name.replace(/[🎪🍕🏥📱💪🤖]/g, '').trim()}
                              </Heading>
                              <Badge 
                                colorScheme={getCategoryColor(template.category)}
                                fontSize="xs"
                                textTransform="capitalize"
                              >
                                {template.category}
                              </Badge>
                            </VStack>
                          </HStack>

                          {/* Описание */}
                          <Text 
                            color="gray.600" 
                            fontSize="sm"
                            lineHeight="tall"
                            noOfLines={2}
                          >
                            {template.description}
                          </Text>

                          {/* Статистика */}
                          <Stack direction="row" spacing={4} w="full">
                            <HStack spacing={2}>
                              <Icon as={FiClock} color="gray.500" boxSize={4} />
                              <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                {template.scenesCount} сценариев
                              </Text>
                            </HStack>
                            <HStack spacing={2}>
                              <Icon as={FiCheck} color="green.500" boxSize={4} />
                              <Text fontSize="xs" color="gray.600" fontWeight="medium">
                                {template.features.length} функций
                              </Text>
                            </HStack>
                          </Stack>

                          {/* Ключевые функции */}
                          <VStack align="start" spacing={2} w="full">
                            {template.hasWebApp && (
                              <HStack spacing={2}>
                                <Box
                                  w={1.5}
                                  h={1.5}
                                  borderRadius="full"
                                  bg="purple.400"
                                />
                                <Text fontSize="xs" color="gray.700">Web приложение</Text>
                              </HStack>
                            )}
                            {template.hasPayment && (
                              <HStack spacing={2}>
                                <Box
                                  w={1.5}
                                  h={1.5}
                                  borderRadius="full"
                                  bg="green.400"
                                />
                                <Text fontSize="xs" color="gray.700">Приём платежей</Text>
                              </HStack>
                            )}
                            {template.features.slice(0, 1).map((feature) => (
                              <HStack key={feature} spacing={2}>
                                <Box
                                  w={1.5}
                                  h={1.5}
                                  borderRadius="full"
                                  bg="blue.400"
                                />
                                <Text fontSize="xs" color="gray.700" textTransform="capitalize">
                                  {feature}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>

                          {/* Кнопка действия */}
                          <Button
                            w="full"
                            size="md"
                            colorScheme={getCategoryColor(template.category)}
                            rightIcon={<FiArrowRight />}
                            fontWeight="semibold"
                            borderRadius="xl"
                            _hover={{ transform: 'translateX(4px)' }}
                            transition="all 0.2s"
                          >
                            Использовать
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* CTA Section */}
          <Box
            mt={8}
            p={12}
            bgGradient="linear(to-r, purple.500, blue.500)"
            borderRadius="3xl"
            textAlign="center"
            position="relative"
            overflow="hidden"
            _before={{
              content: '""',
              position: 'absolute',
              inset: 0,
              bgImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}
          >
            <VStack spacing={6} position="relative" zIndex={1}>
              <Icon as={FiZap} boxSize={12} color="white" />
              <Heading size="xl" color="white" fontWeight="bold">
                Нужно индивидуальное решение?
              </Heading>
              <Text color="whiteAlpha.900" fontSize="lg" maxW="2xl">
                Создайте уникального бота с нуля используя визуальный конструктор.
                Полный контроль над функционалом и дизайном.
              </Text>
              <HStack spacing={4} pt={4}>
                <Button
                  size="lg"
                  bg="white"
                  color="purple.600"
                  _hover={{ bg: 'whiteAlpha.900', transform: 'translateY(-2px)', shadow: 'xl' }}
                  onClick={() => navigate('/bots/new')}
                  rightIcon={<FiArrowRight />}
                  fontWeight="bold"
                  borderRadius="xl"
                  px={8}
                  transition="all 0.2s"
                >
                  Создать с нуля
                </Button>
              </HStack>
            </VStack>
          </Box>

        </VStack>
      </Container>
    </>
  );
};

export default TemplatesPage;