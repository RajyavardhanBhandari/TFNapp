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
          <Text style={[styles.icon, { color: theme.colors.icon }]}>⌕</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8} onPress={() => router.push('/notifications')} style={styles.iconButton}>
          <Text style={[styles.icon, { color: theme.colors.icon }]}>♧</Text>
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
});
