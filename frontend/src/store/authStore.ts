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
          console.log('[Auth] Login attempt for:', email);
          const response = await axios.post('/api/auth/login', {
            email,
            password,
          });

          const { user, token } = response.data.data;
          console.log('[Auth] ✅ Login successful, token received:', token.substring(0, 20) + '...');

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // КРИТИЧНО: Ждем пока Zustand persist сохранит в localStorage
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Проверяем что токен реально сохранился
          const savedToken = useAuthStore.getState().token;
          console.log('[Auth] 🔍 Token after save:', savedToken ? savedToken.substring(0, 20) + '...' : 'MISSING!');
          console.log('[Auth] 🔍 localStorage:', localStorage.getItem('auth-storage'));

          toast.success('Добро пожаловать!');
        } catch (error: any) {
          console.error('[Auth] Login failed:', error);
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
          console.log('[Auth] checkAuth: No token found');
          set({ isLoading: false });
          return;
        }

        try {
          console.log('[Auth] checkAuth: Validating token...');
          // Set authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          const response = await axios.get('/api/auth/me');
          const { user } = response.data.data;

          console.log('[Auth] checkAuth: Token valid, user:', user.email);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('[Auth] checkAuth: Token invalid, clearing auth');
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
    
    // КРИТИЧНО: Убедиться что headers существует!
    if (!config.headers) {
      config.headers = {} as any;
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Auth] ✅ Request WITH token to:', config.url, 'Token:', token.substring(0, 20) + '...');
    } else {
      console.warn('[Auth] ❌ NO TOKEN for request to:', config.url);
      console.log('[Auth] Current store state:', useAuthStore.getState());
    }
    return config;
  },
  (error) => {
    console.error('[Auth] Request interceptor error:', error);
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
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Wait for Zustand persist to restore state, then check auth
setTimeout(() => {
  const { token } = useAuthStore.getState();
  console.log('[Auth] Initializing with token:', token ? 'EXISTS' : 'MISSING');
  if (token) {
    useAuthStore.getState().checkAuth();
  } else {
    useAuthStore.setState({ isLoading: false });
  }
}, 100);
