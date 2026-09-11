import { StyleSheet, View } from 'react-native';

import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { useTheme } from '@/src/theme/ThemeProvider';

export default function FoundationScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={[styles.eyebrow, { color: theme.colors.mutedText }]}>TFN · FOUNDATION</Text>
        <Text style={styles.brand}>The Founder Nation</Text>
        <Text style={[styles.subtitle, { color: theme.colors.mutedText }]}>Mobile foundation ready for Phase 1.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  brand: {
    marginTop: 12,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
  },
});
