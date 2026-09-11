import { Text as RNText, TextProps, StyleSheet } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

export function Text({ style, ...props }: TextProps) {
  const theme = useTheme();

  return <RNText {...props} style={[styles.base, { color: theme.colors.text }, style]} />;
}

const styles = StyleSheet.create({
  base: {
    fontSize: 16,
    lineHeight: 22,
  },
});
