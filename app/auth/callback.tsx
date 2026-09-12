import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { handleAuthCallback } from '../../src/user/oauth';

export default function AuthCallbackScreen() {
  const theme = useAppTheme();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) await handleAuthCallback(url);
        if (active) setDone(true);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Authentication could not be completed.');
      }
    };
    run();
    return () => { active = false; };
  }, []);

  if (done) return <Redirect href="/" />;

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Signing you in</Text>
        <Text style={[styles.body, { color: error ? '#C62828' : theme.colors.mutedText }]}>
          {error || 'Completing your secure TFN sign-in…'}
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 520, width: '100%', alignSelf: 'center', paddingTop: 80 },
  title: { fontSize: 32, fontWeight: '800' },
  body: { fontSize: 16, lineHeight: 24, marginTop: 10 },
});
