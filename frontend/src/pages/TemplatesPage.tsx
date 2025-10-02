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
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, blue.50)',
    'linear(to-br, gray.900, gray.800)'
  );

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

      {/* Hero Section */}
      <Box bgGradient={bgGradient} py={{ base: 16, md: 20 }} px={4}>
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Badge 
              colorScheme="purple" 
              fontSize="sm" 
              px={4} 
              py={2} 
              borderRadius="full"
              textTransform="uppercase"
              letterSpacing="wide"
              fontWeight="semibold"
            >
              Готовые решения
            </Badge>
            <Heading 
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              fontWeight="extrabold"
              bgGradient="linear(to-r, purple.600, blue.600)"
              bgClip="text"
              lineHeight="1.1"
              letterSpacing="tight"
            >
              Шаблоны Telegram ботов
            </Heading>
            <Text 
              color="gray.600" 
              fontSize={{ base: 'lg', md: 'xl' }}
              maxW="2xl"
              lineHeight="tall"
            >
              Готовые решения для бизнеса, запуск за минуты.
              Выберите шаблон и адаптируйте под свои задачи.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                h="56px"
                px={8}
                colorScheme="purple"
                rightIcon={<FiArrowRight />}
                onClick={() => navigate('/bots/new')}
                _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                borderRadius="xl"
                fontWeight="bold"
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