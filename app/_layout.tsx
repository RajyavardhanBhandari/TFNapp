import { Stack } from 'expo-router';
import { AuthProvider } from '../src/user/auth';
import { ThemeProvider } from '../src/theme';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </ThemeProvider>
  );
}
