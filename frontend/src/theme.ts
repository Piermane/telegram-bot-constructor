import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Color palette
const colors = {
  brand: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3', // Primary brand color
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  telegram: {
    50: '#e8f4fd',
    100: '#bee1f9',
    200: '#93cef5',
    300: '#68bbf1',
    400: '#47acee',
    500: '#229ed9', // Telegram blue
    600: '#1e8bc6',
    700: '#1a76b3',
    800: '#1662a0',
    900: '#0f4d8d',
  },
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
};

// Typography
const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  mono: `'JetBrains Mono', SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`,
};

// Font sizes
const fontSizes = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  md: '1rem',      // 16px
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
  '7xl': '4.5rem',   // 72px
  '8xl': '6rem',     // 96px
  '9xl': '8rem',     // 128px
};

// Component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'semibold',
      borderRadius: 'lg',
      _focus: {
        boxShadow: 'outline',
      },
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          _disabled: {
            bg: 'brand.500',
          },
        },
        _active: {
          bg: 'brand.700',
        },
      },
      ghost: {
        _hover: {
          bg: 'gray.100',
        },
        _active: {
          bg: 'gray.200',
        },
      },
      outline: {
        borderColor: 'gray.300',
        _hover: {
          bg: 'gray.50',
          borderColor: 'gray.400',
        },
      },
    },
    sizes: {
      sm: {
        fontSize: 'sm',
        px: 4,
        py: 2,
      },
      md: {
        fontSize: 'md',
        px: 6,
        py: 3,
      },
      lg: {
        fontSize: 'lg',
        px: 8,
        py: 4,
      },
    },
    defaultProps: {
      size: 'md',
      variant: 'solid',
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'white',
        borderRadius: 'xl',
        boxShadow: 'sm',
        border: '1px solid',
        borderColor: 'gray.200',
        overflow: 'hidden',
      },
      header: {
        px: 6,
        py: 4,
        borderBottom: '1px solid',
        borderBottomColor: 'gray.200',
      },
      body: {
        px: 6,
        py: 4,
      },
      footer: {
        px: 6,
        py: 4,
        borderTop: '1px solid',
        borderTopColor: 'gray.200',
      },
    },
    variants: {
      elevated: {
        container: {
          boxShadow: 'lg',
        },
      },
      outline: {
        container: {
          boxShadow: 'none',
          border: '2px solid',
          borderColor: 'gray.200',
        },
      },
    },
    defaultProps: {
      variant: 'elevated',
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'lg',
        _focus: {
          borderColor: 'brand.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
        },
      },
    },
    variants: {
      outline: {
        field: {
          borderColor: 'gray.300',
          _hover: {
            borderColor: 'gray.400',
          },
        },
      },
    },
    defaultProps: {
      variant: 'outline',
    },
  },
  Badge: {
    baseStyle: {
      textTransform: 'none',
      fontWeight: 'medium',
      borderRadius: 'full',
      px: 3,
      py: 1,
    },
    variants: {
      solid: {
        bg: 'gray.100',
        color: 'gray.800',
      },
      success: {
        bg: 'success.100',
        color: 'success.800',
      },
      warning: {
        bg: 'warning.100',
        color: 'warning.800',
      },
      error: {
        bg: 'error.100',
        color: 'error.800',
      },
      brand: {
        bg: 'brand.100',
        color: 'brand.800',
      },
    },
    defaultProps: {
      variant: 'solid',
    },
  },
  Menu: {
    baseStyle: {
      list: {
        bg: 'white',
        border: '1px solid',
        borderColor: 'gray.200',
        borderRadius: 'lg',
        boxShadow: 'lg',
        py: 2,
      },
      item: {
        py: 2,
        px: 3,
        _hover: {
          bg: 'gray.50',
        },
        _focus: {
          bg: 'gray.100',
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'xl',
        boxShadow: 'xl',
      },
      header: {
        pb: 4,
        fontSize: 'xl',
        fontWeight: 'bold',
      },
    },
  },
  Tooltip: {
    baseStyle: {
      bg: 'gray.800',
      color: 'white',
      borderRadius: 'md',
      fontSize: 'sm',
      px: 3,
      py: 2,
    },
  },
};

// Global styles
const styles = {
  global: {
    'html, body': {
      fontFamily: 'body',
      color: 'gray.800',
      bg: 'gray.50',
      lineHeight: 'base',
    },
    '*::placeholder': {
      color: 'gray.400',
    },
    '*, *::before, &::after': {
      borderColor: 'gray.200',
      wordWrap: 'break-word',
    },
    // Custom scrollbar
    '::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'gray.100',
      borderRadius: 'md',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'gray.300',
      borderRadius: 'md',
      _hover: {
        bg: 'gray.400',
      },
    },
    // Animations
    '@keyframes fadeInUp': {
      from: {
        opacity: 0,
        transform: 'translateY(30px)',
      },
      to: {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
    '@keyframes fadeIn': {
      from: {
        opacity: 0,
      },
      to: {
        opacity: 1,
      },
    },
    '@keyframes slideInRight': {
      from: {
        opacity: 0,
        transform: 'translateX(30px)',
      },
      to: {
        opacity: 1,
        transform: 'translateX(0)',
      },
    },
    '@keyframes scaleIn': {
      from: {
        opacity: 0,
        transform: 'scale(0.9)',
      },
      to: {
        opacity: 1,
        transform: 'scale(1)',
      },
    },
  },
};

// Theme configuration
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Extended theme
const theme = extendTheme({
  config,
  colors,
  fonts,
  fontSizes,
  components,
  styles,
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
});

export default theme;
