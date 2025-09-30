import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

const AnalyticsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Аналитика - TelegramBot Constructor</title>
      </Helmet>

      <Box p={6}>
        <VStack spacing={6} align="start">
          <Heading size="lg">Аналитика</Heading>
          
          <Text color="gray.600">
            Статистика и метрики ваших ботов
          </Text>
        </VStack>
      </Box>
    </>
  );
};

export default AnalyticsPage;
