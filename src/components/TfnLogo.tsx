import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';

type Props = { compact?: boolean };

export function TfnLogo({ compact = false }: Props) {
  const theme = useAppTheme();
  const markColor = theme.mode === 'dark' ? '#FFFFFF' : '#111111';

  return (
    <View accessibilityLabel="The Founder Nation" style={[styles.container, compact && styles.compactContainer]}>
      <Text style={[styles.mark, compact && styles.compactMark, { color: markColor }]}>TFN</Text>
      <View style={styles.ruleRow}>
        <View style={[styles.rule, compact && styles.compactRule, { backgroundColor: theme.colors.accent }]} />
        <View style={[styles.dot, compact && styles.compactDot, { backgroundColor: theme.colors.accent }]} />
        <View style={[styles.dot, compact && styles.compactDot, { backgroundColor: theme.colors.accent }]} />
      </View>
      <Text style={[styles.tagline, compact && styles.compactTagline, { color: theme.colors.text }]}>THE FOUNDER NATION</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 154, justifyContent: 'center' },
  compactContainer: { width: 62 },
  mark: { fontFamily: 'Georgia', fontSize: 48, lineHeight: 48, fontWeight: '700', letterSpacing: -4.2 },
  compactMark: { fontSize: 25, lineHeight: 25, letterSpacing: -2.2 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  rule: { flex: 1, height: 5, borderRadius: 3 },
  compactRule: { height: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 5 },
  compactDot: { width: 4, height: 4, borderRadius: 2, marginLeft: 3 },
  tagline: { fontSize: 7.4, lineHeight: 10, fontWeight: '800', letterSpacing: 1.65, marginTop: 5 },
  compactTagline: { fontSize: 3.4, lineHeight: 5, letterSpacing: 0.8, marginTop: 2 },
});
