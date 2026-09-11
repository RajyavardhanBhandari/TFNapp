import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useAppTheme } from '../theme';

type Props = { children: ReactNode; scroll?: boolean; padding?: boolean };

export function Screen({ children, scroll = true, padding = true }: Props) {
  const theme = useAppTheme();
  const content = <View style={[styles.content, padding && styles.padding]}>{children}</View>;
  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safe, { backgroundColor: theme.colors.background }]}>
      {scroll ? <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1 }, scroll: { flexGrow: 1 }, content: { flex: 1 }, padding: { paddingHorizontal: 18, paddingVertical: 20 } },
);
