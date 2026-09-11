import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { createTheme, type Theme } from './index';

type ThemeContextValue = Theme;

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const mode = systemScheme === 'dark' ? 'dark' : 'light';
  const theme = useMemo(() => createTheme(mode), [mode]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const theme = useContext(ThemeContext);

  if (!theme) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return theme;
}
