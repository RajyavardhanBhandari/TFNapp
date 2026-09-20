import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';

type Props = { compact?: boolean };

export function BrandMark({ compact = false }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.mark, { backgroundColor: theme.colors.text }]}>
        <Text style={[styles.markText, { color: theme.colors.inverseText }]}>TFN</Text>
      </View>
      {!compact ? (
        <View style={styles.wordmark}>
          <Text style={[styles.name, { color: theme.colors.text }]}>THE FOUNDER NATION</Text>
          <Text style={[styles.caption, { color: theme.colors.mutedText }]}>STARTUP · BUSINESS · ECOSYSTEM</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  markText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  wordmark: { justifyContent: 'center' },
  name: { fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  caption: { fontSize: 7, fontWeight: '800', letterSpacing: 1, marginTop: 2 },
});
