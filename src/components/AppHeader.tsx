import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../theme';
import { BrandMark } from './BrandMark';

type Props = { title?: string; back?: boolean };

export function AppHeader({ title, back = false }: Props) {
  const router = useRouter();
  const theme = useAppTheme();
  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.left}>
        {back ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <Text style={[styles.icon, { color: theme.colors.icon }]}>‹</Text>
          </Pressable>
        ) : null}
        {title === 'TFN' || (!title && !back) ? <BrandMark compact /> : <Text style={[styles.brand, { color: theme.colors.text }]}>{title ?? 'TFN'}</Text>}
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Search" hitSlop={8} onPress={() => router.push('/search')} style={styles.iconButton}>
          <View style={styles.searchGlyph}><View style={[styles.searchCircle, { borderColor: theme.colors.icon }]} /><View style={[styles.searchHandle, { backgroundColor: theme.colors.icon }]} /></View>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8} onPress={() => router.push('/notifications')} style={styles.iconButton}>
          <View style={styles.bellGlyph}><View style={[styles.bellBody, { borderColor: theme.colors.icon }]} /><View style={[styles.bellClapper, { backgroundColor: theme.colors.icon }]} /></View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 60, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  brand: { fontSize: 20, fontWeight: '800', letterSpacing: 1.5 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 27, fontWeight: '500' },
  searchGlyph: { width: 22, height: 22, position: 'relative' },
  searchCircle: { position: 'absolute', width: 14, height: 14, borderWidth: 2, borderRadius: 7, left: 1, top: 1 },
  searchHandle: { position: 'absolute', width: 8, height: 2, borderRadius: 2, transform: [{ rotate: '45deg' }], left: 13, top: 15 },
  bellGlyph: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  bellBody: { width: 14, height: 15, borderWidth: 2, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomWidth: 0, marginTop: 2 },
  bellClapper: { width: 18, height: 2, borderRadius: 2, marginTop: -1 },
  bellDot: { width: 3, height: 3, borderRadius: 2, marginTop: 2 },
});
