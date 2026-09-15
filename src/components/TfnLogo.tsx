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
  container: { width: 168, alignItems: 'flex-start', justifyContent: 'center' },
  compactContainer: { width: 68 },
  mark: { fontFamily: 'Georgia', fontSize: 52, lineHeight: 50, fontWeight: '700', letterSpacing: -4.8 },
  compactMark: { fontSize: 27, lineHeight: 27, letterSpacing: -2.5 },
  ruleRow: { width: 118, flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rule: { flex: 1, height: 5, borderRadius: 3 },
  compactRule: { height: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 5 },
  compactDot: { width: 4, height: 4, borderRadius: 2, marginLeft: 3 },
  tagline: { width: 118, fontSize: 7.6, lineHeight: 10, fontWeight: '800', letterSpacing: 1.65, marginTop: 5, textAlign: 'center' },
  compactTagline: { width: 48, fontSize: 3.6, lineHeight: 5, letterSpacing: 0.65, marginTop: 2, textAlign: 'center' },
});
