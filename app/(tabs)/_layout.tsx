import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BottomNav } from '../../src/components/BottomNav';
import { useAppTheme } from '../../src/theme';

export default function TabsLayout() {
  const theme = useAppTheme();
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, });
