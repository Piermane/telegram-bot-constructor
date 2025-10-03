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
          <Heading size="lg" color="white" textShadow="0 2px 8px rgba(0, 0, 0, 0.3)">Аналитика</Heading>
          
          <Text color="whiteAlpha.900" textShadow="0 1px 4px rgba(0, 0, 0, 0.25)">
            Статистика и метрики ваших ботов
          </Text>
        </VStack>
      </Box>
    </>
  );
};

export default AnalyticsPage;
