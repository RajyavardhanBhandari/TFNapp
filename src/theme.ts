import { ColorSchemeName, useColorScheme } from 'react-native';
import { createContext, createElement, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    surfaceElevated: string;
    text: string;
    mutedText: string;
    border: string;
    accent: string;
    accentSoft: string;
    brand: string;
    icon: string;
    inverseText: string;
  };
};

const light: Theme = {
  mode: 'light',
  colors: {
    background: '#FAFAF8', surface: '#FFFFFF', surfaceElevated: '#FFFFFF', text: '#111111', mutedText: '#6B6B70',
    border: '#E5E5E1', accent: '#D99A2B', accentSoft: '#FFF3D8', brand: '#172554', icon: '#172554', inverseText: '#FFFFFF',
  },
};

const dark: Theme = {
  mode: 'dark',
  colors: {
    background: '#090D18', surface: '#111827', surfaceElevated: '#182235', text: '#F7F7F5', mutedText: '#A8AFBE',
    border: '#283246', accent: '#F0B23E', accentSoft: '#332711', brand: '#FFFFFF', icon: '#F7F7F5', inverseText: '#090D18',
  },
};

const ThemeModeContext = createContext<{ mode: ThemeMode; toggleMode: () => void } | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const value = useMemo(() => ({ mode, toggleMode: () => setMode((current) => (current === 'dark' ? 'light' : 'dark')) }), [mode]);
  return createElement(ThemeModeContext.Provider, { value }, children);
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useThemeMode must be used inside ThemeProvider');
  return context;
}

export function getTheme(scheme: ColorSchemeName): Theme {
  return scheme === 'dark' ? dark : light;
}

export function useAppTheme(): Theme {
  const { mode } = useThemeMode();
  return mode === 'dark' ? dark : light;
}
