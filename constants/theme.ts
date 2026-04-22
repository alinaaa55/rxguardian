import { Platform } from 'react-native';

export const palette = {
  primary: {
    main: '#1E3A8A',
    light: '#DBEAFE',
    accent: '#2563EB',
  },
  secondary: {
    main: '#EA580C',
    light: '#FFEDD5',
  },
  success: {
    main: '#15803D',
    light: '#DCFCE7',
    dot: '#22C55E',
  },
  danger: {
    main: '#B91C1C',
    light: '#FEE2E2',
    text: '#7F1D1D',
    accent: '#DC2626',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  white: '#FFFFFF',
  black: '#000000',
};

export const theme = {
  colors: {
    background: palette.slate[100],
    surface: palette.white,
    text: {
      primary: palette.slate[900],
      secondary: palette.slate[500],
      inverse: palette.white,
    },
    primary: palette.primary.main,
    primaryAccent: palette.primary.accent,
    primaryLight: palette.primary.light,
    secondary: palette.secondary.main,
    secondaryLight: palette.secondary.light,
    success: palette.success.main,
    successLight: palette.success.light,
    danger: palette.danger.accent,
    dangerLight: palette.danger.light,
    border: palette.slate[200],
    tabInactive: palette.slate[400],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 24,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 22,
      fontWeight: '700' as const,
    },
    h2: {
      fontSize: 17,
      fontWeight: '700' as const,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
    },
    button: {
      fontSize: 15,
      fontWeight: '600' as const,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: -2 },
      elevation: 10,
    },
    lg: {
      shadowColor: palette.primary.main,
      shadowOpacity: 0.45,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 14,
    },
  },
};

export const Colors = {
  light: {
    text: palette.slate[900],
    background: palette.white,
    tint: palette.primary.accent,
    icon: palette.slate[400],
    tabIconDefault: palette.slate[400],
    tabIconSelected: palette.primary.accent,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: palette.white,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: palette.white,
  },
};
