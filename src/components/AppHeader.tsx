import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TfnLogo } from './TfnLogo';
import { useAppTheme, useThemeMode } from '../theme';

type Props = { title?: string; back?: boolean };

function SearchIcon({ color }: { color: string }) {
  return <View style={styles.searchIcon}><View style={[styles.searchCircle, { borderColor: color }]} /><View style={[styles.searchHandle, { backgroundColor: color }]} /></View>;
}

function BellIcon({ color }: { color: string }) {
  return <View style={styles.bellIcon}><View style={[styles.bellBody, { borderColor: color }]} /><View style={[styles.bellClapper, { backgroundColor: color }]} /></View>;
}

export function AppHeader({ title, back = false }: Props) {
  const router = useRouter();
  const theme = useAppTheme();
  const { mode, toggleMode } = useThemeMode();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <View style={styles.left}>
        {back ? <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.iconButton}><Text style={[styles.backIcon, { color: theme.colors.icon }]}>‹</Text></Pressable> : null}
        {title ? <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text> : <TfnLogo />}
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Search" hitSlop={8} onPress={() => router.push('/search')} style={styles.iconButton}><SearchIcon color={theme.colors.icon} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8} onPress={() => router.push('/notifications')} style={styles.iconButton}><BellIcon color={theme.colors.icon} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} hitSlop={8} onPress={toggleMode} style={[styles.themeButton, { backgroundColor: theme.colors.accentSoft }]}><Text style={[styles.themeIcon, { color: theme.colors.accent }]}>{mode === 'dark' ? '☀' : '☾'}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 70, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: 0.2 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 30, lineHeight: 34, fontWeight: '400' },
  searchIcon: { width: 20, height: 20, position: 'relative' },
  searchCircle: { position: 'absolute', width: 11, height: 11, borderWidth: 2, borderRadius: 7, left: 1, top: 1 },
  searchHandle: { position: 'absolute', width: 8, height: 2, borderRadius: 2, transform: [{ rotate: '45deg' }], left: 11, top: 13 },
  bellIcon: { width: 19, height: 21, alignItems: 'center', justifyContent: 'flex-end' },
  bellBody: { width: 15, height: 15, borderWidth: 1.8, borderTopLeftRadius: 9, borderTopRightRadius: 9, borderBottomWidth: 0, marginBottom: 3 },
  bellClapper: { width: 5, height: 2.5, borderRadius: 2, marginBottom: 0 },
  themeButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginLeft: 3 },
  themeIcon: { fontSize: 18, lineHeight: 20, fontWeight: '700' },
});
