import { ColorSchemeName, useColorScheme } from 'react-native';

export type Theme = {
  colors: {
    background: string;
    surface: string;
    text: string;
    mutedText: string;
    border: string;
    accent: string;
    icon: string;
    inverseText: string;
    error: string;
    error: string;
  };
};

const light: Theme = {
  colors: {
    background: '#FFFFFF', surface: '#F7F7F8', text: '#111111', mutedText: '#6B6B70',
    border: '#E7E7EA', accent: '#111111', icon: '#252529', inverseText: '#FFFFFF', error: '#B42318', error: '#B42318',
  },
};

const dark: Theme = {
  colors: {
    background: '#0B0B0C', surface: '#151517', text: '#F5F5F7', mutedText: '#A1A1A8',
    border: '#29292D', accent: '#FFFFFF', icon: '#F0F0F2', inverseText: '#111111', error: '#F97066', error: '#F97066',
  },
};

export function getTheme(scheme: ColorSchemeName): Theme {
  return scheme === 'dark' ? dark : light;
}

export function useAppTheme(): Theme {
  return getTheme(useColorScheme());
}
