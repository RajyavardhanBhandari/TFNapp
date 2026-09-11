import { ActivityIndicator } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

export function LoadingIndicator() {
  const theme = useTheme();
  return <ActivityIndicator accessibilityLabel="Loading" color={theme.colors.text} />;
}
