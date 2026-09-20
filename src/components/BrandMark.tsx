import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';

type Props = { compact?: boolean };

// Canonical TFN brand mark. Keep this component asset-free so web bundling cannot depend on missing logo files.

export function BrandMark({ compact = false }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.tfn, { color: theme.colors.text }]}>TFN</Text>
      <View style={styles.brandLineRow}>
        <View style={[styles.brandLine, { backgroundColor: theme.colors.brandAccent }]} />
        <View style={[styles.brandDot, { backgroundColor: theme.colors.brandAccent }]} />
      </View>
      {!compact ? (
        <Text style={[styles.name, { color: theme.colors.text }]}>THE FOUNDER NATION</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start', justifyContent: 'center' },
  tfn: {
    fontFamily: 'Georgia',
    fontSize: 27,
    lineHeight: 29,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  brandLineRow: { flexDirection: 'row', alignItems: 'center', height: 4, marginTop: 1 },
  brandLine: { width: 26, height: 2 },
  brandDot: { width: 3, height: 3, borderRadius: 2, marginLeft: 2 },
  name: { fontSize: 7, lineHeight: 9, fontWeight: '800', letterSpacing: 1.1, marginTop: 1 },
});
