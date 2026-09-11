export const colors = {
  light: {
    background: '#F7F6F2',
    surface: '#FFFFFF',
    text: '#111111',
    mutedText: '#6B6B6B',
    border: '#E5E3DE',
    accent: '#111111',
    accentContrast: '#FFFFFF',
    danger: '#B42318',
  },
  dark: {
    background: '#111111',
    surface: '#1A1A1A',
    text: '#F7F6F2',
    mutedText: '#A8A6A0',
    border: '#2A2A2A',
    accent: '#F7F6F2',
    accentContrast: '#111111',
    danger: '#F04438',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.15,
    normal: 1.4,
    relaxed: 1.55,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

export const layout = {
  screenPadding: spacing.xl,
  contentMaxWidth: 760,
} as const;

export type ThemeMode = 'light' | 'dark';
