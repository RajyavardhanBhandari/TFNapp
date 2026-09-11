import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { TfnLogo } from './TfnLogo';
import { useAppTheme, useThemeMode } from '../theme';

type Props = { title?: string; back?: boolean };

export function AppHeader({ title, back = false }: Props) {
  const router = useRouter();
  const theme = useAppTheme();
  const { mode, toggleMode } = useThemeMode();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
      <View style={styles.left}>
        {back ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={10} onPress={() => router.back()} style={styles.iconButton}>
            <Text style={[styles.icon, { color: theme.colors.icon }]}>‹</Text>
          </Pressable>
        ) : null}
        {title ? <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text> : <TfnLogo />}
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Search" hitSlop={8} onPress={() => router.push('/search')} style={styles.iconButton}>
          <Text style={[styles.icon, { color: theme.colors.icon }]}>⌕</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8} onPress={() => router.push('/notifications')} style={styles.iconButton}>
          <Text style={[styles.icon, { color: theme.colors.icon }]}>♧</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} hitSlop={8} onPress={toggleMode} style={[styles.themeButton, { backgroundColor: theme.colors.accentSoft }]}>
          <Text style={[styles.themeIcon, { color: theme.colors.accent }]}>{mode === 'dark' ? '☀' : '☾'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  title: { fontSize: 20, fontWeight: '800', letterSpacing: 0.2 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 26, fontWeight: '500' },
  themeButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginLeft: 3 },
  themeIcon: { fontSize: 18, lineHeight: 20, fontWeight: '700' },
});
