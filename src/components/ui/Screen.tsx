import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '@/src/theme/ThemeProvider';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
}>;

export function Screen({ children, scroll = false }: ScreenProps) {
  const theme = useTheme();
  const content = <View style={[styles.container, { backgroundColor: theme.colors.background }]}>{children}</View>;

  if (scroll) {
    return <ScrollView contentContainerStyle={styles.scrollContent}>{content}</ScrollView>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
