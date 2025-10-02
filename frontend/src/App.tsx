import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

import theme from './theme';
import { useAuthStore } from './store/authStore';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BotBuilderPage from './pages/BotBuilderPage';
import BotListPage from './pages/BotListPage';
import BotAnalyticsPage from './pages/BotAnalyticsPage';
import TemplatesPage from './pages/TemplatesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <ChakraProvider theme={theme}>
        <Box
          height="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.50"
        >
          <LoadingSpinner size="xl" />
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider theme={theme}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Box minHeight="100vh" bg="gray.50">
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#38A169',
                    },
                  },
                  error: {
                    style: {
                      background: '#E53E3E',
                    },
                  },
                }}
              />

              <Routes>
                {/* Public routes */}
                <Route
                  path="/login"
                  element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
                  }
                />
                <Route
                  path="/register"
                  element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="bots" element={<BotListPage />} />
                  <Route path="bots/new" element={<BotBuilderPage />} />
                  <Route path="bots/edit/:id" element={<BotBuilderPage />} />
                  <Route path="bots/:id/builder" element={<BotBuilderPage />} />
                  <Route path="bots/:botId/analytics" element={<BotAnalyticsPage />} />
                  <Route path="templates" element={<TemplatesPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Fallback route */}
                <Route
                  path="*"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
              </Routes>
            </Box>
          </Router>
        </QueryClientProvider>
      </HelmetProvider>
    </ChakraProvider>
  );
}

export default App;
