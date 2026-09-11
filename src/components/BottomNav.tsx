import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useAppTheme } from '../theme';

const items = [
  { path: '/home', label: 'Home', icon: '⌂' },
  { path: '/quick', label: 'Quick', icon: '↔' },
  { path: '/discover', label: 'Discover', icon: '◉' },
  { path: '/radar', label: 'Radar', icon: '◎' },
  { path: '/profile', label: 'Profile', icon: '○' },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useAppTheme();
  return (
    <View style={[styles.bar, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
      {items.map((item) => {
        const active = pathname === item.path || (item.path === '/home' && pathname === '/');
        return (
          <Pressable key={item.path} accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={item.label} onPress={() => { if (!active) router.replace(item.path as never); }} style={styles.item}>
            <View style={[styles.activePill, active && { backgroundColor: theme.colors.accentSoft }]}>
              <Text style={[styles.icon, { color: active ? theme.colors.accent : theme.colors.mutedText }]}>{item.icon}</Text>
            </View>
            <Text style={[styles.label, { color: active ? theme.colors.accent : theme.colors.mutedText }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { minHeight: 68, paddingBottom: 6, paddingTop: 5, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row' },
  item: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  activePill: { minWidth: 38, minHeight: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  icon: { fontSize: 20, lineHeight: 24 },
  label: { marginTop: 2, fontSize: 11, fontWeight: '700' },
});
