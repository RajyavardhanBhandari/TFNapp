import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>TFN</Text>
      <Text style={styles.title}>The Founder Nation</Text>
      <Text style={styles.subtitle}>Phase 1 content engine</Text>
      <Link href="/content-test" style={styles.link}>Test real TFN content →</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  brand: { fontSize: 32, fontWeight: '800', letterSpacing: 2 },
  title: { marginTop: 12, fontSize: 24, fontWeight: '700' },
  subtitle: { marginTop: 8, fontSize: 16, opacity: 0.65, textAlign: 'center' },
  link: { marginTop: 24, fontSize: 16, fontWeight: '700' },
});
