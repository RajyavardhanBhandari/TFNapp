import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';

export function TfnLogo() {
  const theme = useAppTheme();
  return (
    <View accessibilityLabel="The Founder Nation" style={styles.container}>
      <Text style={[styles.mark, { color: theme.colors.brand }]}>TFN</Text>
      <View style={styles.ruleRow}>
        <View style={[styles.rule, { backgroundColor: theme.colors.accent }]} />
        <View style={[styles.dot, { backgroundColor: theme.colors.accent }]} />
      </View>
      <Text style={[styles.tagline, { color: theme.colors.brand }]}>THE FOUNDER NATION</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 124, justifyContent: 'center' },
  mark: { fontFamily: 'Georgia', fontSize: 34, lineHeight: 34, fontWeight: '700', letterSpacing: -2.8 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 1 },
  rule: { flex: 1, height: 4, borderRadius: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, marginLeft: 4 },
  tagline: { fontSize: 6.2, lineHeight: 8, fontWeight: '800', letterSpacing: 1.35, marginTop: 2 },
});
