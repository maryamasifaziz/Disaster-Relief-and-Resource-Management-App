import { extendTheme } from 'native-base';

export const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
  colors: {
    primary: {
      50: '#e0f2ff',
      100: '#b9d9ff',
      200: '#8fc0ff',
      300: '#64a6ff',
      400: '#398cff',
      500: '#1f73e6',
      600: '#1359b4',
      700: '#083f82',
      800: '#002551',
      900: '#000c22',
    },
    card: '#FFFFFF',
    background: '#F5F7FA',
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
      },
      defaultProps: {
        colorScheme: 'primary',
      },
    },
    Input: {
      defaultProps: {
        variant: 'filled',
        borderRadius: 'lg',
        bg: 'gray.100',
        color: 'gray.900',
        placeholderTextColor: '#6B7280',
      },
    },
    Select: {
      defaultProps: {
        variant: 'filled',
        borderRadius: 'lg',
        bg: 'gray.100',
        color: 'gray.900',
      },
    },
  },
});

export type AppTheme = typeof theme;

