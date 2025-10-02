import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  HStack,
  VStack,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';

/**
 * Skeleton Loader для карточек ботов (как Airbnb, LinkedIn)
 */
export const BotCardSkeleton: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      overflow="hidden"
      _hover={{ transform: 'translateY(-4px)', shadow: 'xl' }}
      transition="all 0.3s"
    >
      <CardHeader pb={0}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2} flex={1}>
            <Skeleton height="24px" width="60%" borderRadius="md" />
            <Skeleton height="16px" width="40%" borderRadius="md" />
          </VStack>
          <SkeletonCircle size="10" />
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <SkeletonText noOfLines={2} spacing={2} />
          
          <HStack spacing={4}>
            <Skeleton height="32px" width="100px" borderRadius="xl" />
            <Skeleton height="32px" width="100px" borderRadius="xl" />
          </HStack>

          <HStack justify="space-between" pt={2}>
            <Skeleton height="20px" width="80px" borderRadius="md" />
            <HStack spacing={2}>
              <Skeleton height="32px" width="80px" borderRadius="lg" />
              <Skeleton height="32px" width="80px" borderRadius="lg" />
            </HStack>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Skeleton Loader для статистических карточек (как Stripe Dashboard)
 */
export const StatCardSkeleton: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Card
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      overflow="hidden"
    >
      <CardBody p={6}>
        <HStack spacing={4}>
          <SkeletonCircle size="12" />
          <VStack align="start" spacing={2} flex={1}>
            <Skeleton height="16px" width="60%" borderRadius="md" />
            <Skeleton height="32px" width="80px" borderRadius="md" />
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

/**
 * Skeleton Loader для списка ботов
 */
export const BotListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {Array.from({ length: count }).map((_, i) => (
        <BotCardSkeleton key={i} />
      ))}
    </SimpleGrid>
  );
};

/**
 * Skeleton Loader для Dashboard статистики
 */
export const DashboardStatsSkeleton: React.FC = () => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </SimpleGrid>
  );
};

/**
 * Skeleton Loader для таблицы (как Linear, Notion)
 */
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Stack spacing={4}>
      {/* Header */}
      <HStack spacing={4} pb={2} borderBottomWidth="1px" borderColor={borderColor}>
        <Skeleton height="20px" width="30%" borderRadius="md" />
        <Skeleton height="20px" width="20%" borderRadius="md" />
        <Skeleton height="20px" width="20%" borderRadius="md" />
        <Skeleton height="20px" width="30%" borderRadius="md" />
      </HStack>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <HStack key={i} spacing={4} py={2}>
          <Skeleton height="16px" width="30%" borderRadius="md" />
          <Skeleton height="16px" width="20%" borderRadius="md" />
          <Skeleton height="16px" width="20%" borderRadius="md" />
          <Skeleton height="16px" width="30%" borderRadius="md" />
        </HStack>
      ))}
    </Stack>
  );
};

/**
 * Skeleton Loader для страницы аналитики (как Vercel Analytics)
 */
export const AnalyticsSkeleton: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <VStack spacing={8} align="stretch">
      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={6}>
        {Array.from({ length: 5 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </SimpleGrid>

      {/* Chart */}
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="2xl">
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Skeleton height="24px" width="150px" borderRadius="md" />
              <HStack spacing={2}>
                <Skeleton height="32px" width="80px" borderRadius="lg" />
                <Skeleton height="32px" width="80px" borderRadius="lg" />
              </HStack>
            </HStack>
            <Skeleton height="300px" borderRadius="xl" />
          </VStack>
        </CardBody>
      </Card>

      {/* Table */}
      <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="2xl">
        <CardHeader>
          <Skeleton height="24px" width="200px" borderRadius="md" />
        </CardHeader>
        <CardBody>
          <TableSkeleton rows={8} />
        </CardBody>
      </Card>
    </VStack>
  );
};

/**
 * Skeleton Loader для конструктора бота (как Figma, Webflow)
 */
export const BotBuilderSkeleton: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Stack spacing={8}>
      {/* Header */}
      <Box>
        <Skeleton height="40px" width="300px" borderRadius="lg" mb={2} />
        <Skeleton height="20px" width="500px" borderRadius="md" />
      </Box>

      {/* Form Sections */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="2xl">
          <CardHeader>
            <Skeleton height="24px" width="200px" borderRadius="md" />
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Skeleton height="16px" width="100px" borderRadius="md" mb={2} />
                <Skeleton height="40px" width="100%" borderRadius="lg" />
              </Box>
              <Box>
                <Skeleton height="16px" width="120px" borderRadius="md" mb={2} />
                <Skeleton height="80px" width="100%" borderRadius="lg" />
              </Box>
            </VStack>
          </CardBody>
        </Card>
      ))}
    </Stack>
  );
};

