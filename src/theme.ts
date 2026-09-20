import AsyncStorage from '@react-native-async-storage/async-storage';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export type Theme = {
  colors: {
    background: string;
    surface: string;
    text: string;
    mutedText: string;
    border: string;
    accent: string;
    brandAccent: string;
    icon: string;
    inverseText: string;
    error: string;
  };
};

const light: Theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F7F7F8',
    text: '#111111',
    mutedText: '#6B6B70',
    border: '#E7E7EA',
    accent: '#111111',
    brandAccent: '#E4A245',
    icon: '#252529',
    inverseText: '#FFFFFF',
    error: '#B42318',
  },
};

const dark: Theme = {
  colors: {
    background: '#0B0B0C',
    surface: '#151517',
    text: '#F5F5F7',
    mutedText: '#A1A1A8',
    border: '#29292D',
    accent: '#FFFFFF',
    brandAccent: '#E4A245',
    icon: '#F0F0F2',
    inverseText: '#111111',
    error: '#F97066',
  },
};

const STORAGE_KEY = 'tfn:theme-mode';

type ThemePreference = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemePreferenceContext = createContext<ThemePreference | undefined>(undefined);

export function getTheme(scheme: ColorSchemeName): Theme {
  return scheme === 'dark' ? dark : light;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        setModeState(value);
      }
    });
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    void AsyncStorage.setItem(STORAGE_KEY, nextMode);
  };

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreference {
  const context = useContext(ThemePreferenceContext);
  if (!context) throw new Error('useThemePreference must be used inside ThemeProvider');
  return context;
}

export function useAppTheme(): Theme {
  const systemScheme = useColorScheme();
  const { mode } = useThemePreference();
  const scheme = mode === 'system' ? systemScheme : mode;
  return getTheme(scheme);
}
