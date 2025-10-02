import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionPlan: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  checkAuth: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// API configuration
const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

// Configure axios defaults
axios.defaults.baseURL = API_URL;

// Axios interceptor will be set up AFTER store initialization
// to avoid race conditions with Zustand persist

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        try {
          const response = await axios.post('/api/auth/login', {
            email,
            password,
          });

          const { user, token } = response.data.data;

          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('Добро пожаловать!');
        } catch (error: any) {
          const message = error.response?.data?.error?.message || 'Ошибка входа';
          toast.error(message);
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          const response = await axios.post('/api/auth/register', userData);

          const { user, token } = response.data.data;

          // Set authorization header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          toast.success('Регистрация успешна!');
        } catch (error: any) {
          const message = error.response?.data?.error?.message || 'Ошибка регистрации';
          toast.error(message);
          throw error;
        }
      },

      logout: () => {
        // Remove authorization header
        delete axios.defaults.headers.common['Authorization'];

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });

        toast.success('Вы вышли из системы');
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearAuth: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          // Set authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          const response = await axios.get('/api/auth/me');
          const { user } = response.data.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          // Token is invalid, clear auth
          get().clearAuth();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

// Set up axios interceptor to use current token from store
axios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Set up axios response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear auth
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  }
);

// Initialize auth check on app start
useAuthStore.getState().checkAuth();
