import { Stack } from 'expo-router';
import { AuthProvider } from '../src/user/auth';

export default function RootLayout() {
  return <AuthProvider><Stack screenOptions={{ headerShown: false }} /></AuthProvider>;
}
