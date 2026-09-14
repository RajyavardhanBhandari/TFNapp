import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';

export function TfnLogo() {
  const theme = useAppTheme();
  const markColor = theme.mode === 'dark' ? '#FFFFFF' : '#111111';

  return (
    <View accessibilityLabel="The Founder Nation" style={styles.container}>
      <Text style={[styles.mark, { color: markColor }]}>TFN</Text>
      <View style={styles.ruleRow}>
        <View style={[styles.rule, { backgroundColor: theme.colors.accent }]} />
        <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
        <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
      </View>
      <Text style={[styles.tagline, { color: theme.colors.text }]}>THE FOUNDER NATION</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 154, justifyContent: 'center' },
  mark: { fontFamily: 'Georgia', fontSize: 48, lineHeight: 48, fontWeight: '700', letterSpacing: -4.2 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  rule: { flex: 1, height: 5, borderRadius: 3 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 5 },
  tagline: { fontSize: 7.4, lineHeight: 10, fontWeight: '800', letterSpacing: 1.65, marginTop: 5 },
});
