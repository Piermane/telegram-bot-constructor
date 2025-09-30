import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

const SettingsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Настройки - TelegramBot Constructor</title>
      </Helmet>

      <Box p={6}>
        <VStack spacing={6} align="start">
          <Heading size="lg">Настройки</Heading>
          
          <Text color="gray.600">
            Настройки пользователя и системы
          </Text>
        </VStack>
      </Box>
    </>
  );
};

export default SettingsPage;
