import { Appearance } from 'react-native';

import { colors, layout, radii, shadows, spacing, typography, type ThemeMode } from './tokens';

export type Theme = {
  mode: ThemeMode;
  colors: (typeof colors)[ThemeMode];
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
  layout: typeof layout;
};

export function resolveThemeMode(): ThemeMode {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export function createTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: colors[mode],
    spacing,
    radii,
    typography,
    shadows,
    layout,
  };
}

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

export { colors, layout, radii, shadows, spacing, typography } from './tokens';
