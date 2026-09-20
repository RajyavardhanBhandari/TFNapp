import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';

export default function PhoneAuthScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function sendCode() {
    if (!supabase) return setError('Account services are not configured yet.');
    if (!phone.trim().startsWith('+')) return setError('Use your full phone number with country code, e.g. +91…');
    setBusy(true); setError('');
    const { error: e } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    setBusy(false);
    if (e) return setError('We could not send the verification code. Please try again.');
    setSent(true);
  }

  async function verifyCode() {
    if (!supabase) return setError('Account services are not configured yet.');
    if (code.trim().length < 4) return setError('Enter the verification code.');
    setBusy(true); setError('');
    const { error: e } = await supabase.auth.verifyOtp({ phone: phone.trim(), token: code.trim(), type: 'sms' });
    setBusy(false);
    if (e) return setError('That code is not valid. Please request a new code.');
    router.replace('/');
  }

  return (
    <Screen>
      <View style={styles.wrap}>
        <Text style={[styles.logo, { color: theme.colors.text }]}>TFN</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>Sign in with phone</Text>
        <Text style={[styles.sub, { color: theme.colors.mutedText }]}>Use a one-time verification code. Your phone number is only used for authentication.</Text>
        <TextInput keyboardType="phone-pad" placeholder="+91 98765 43210" placeholderTextColor={theme.colors.mutedText} value={phone} onChangeText={setPhone} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
        {sent ? <TextInput keyboardType="number-pad" placeholder="Verification code" placeholderTextColor={theme.colors.mutedText} value={code} onChangeText={setCode} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} /> : null}
        {error ? <Text style={[styles.error,{color:theme.colors.error}]}>{error}</Text> : null}
        <Pressable disabled={busy} onPress={sent ? verifyCode : sendCode} style={[styles.button, { backgroundColor: theme.colors.accent }]}>
          <Text style={{ color: theme.colors.inverseText, fontWeight: '800' }}>{busy ? 'Please wait…' : sent ? 'Verify code' : 'Send code'}</Text>
        </Pressable>
        <Link href="/auth/sign-in" style={[styles.link, { color: theme.colors.text }]}>Back to email sign in</Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 460, width: '100%', alignSelf: 'center', paddingTop: 48 },
  logo: { fontSize: 20, fontWeight: '900', letterSpacing: 3 },
  title: { fontSize: 34, fontWeight: '800', marginTop: 34 },
  sub: { fontSize: 16, lineHeight: 24, marginTop: 8, marginBottom: 28 },
  input: { height: 52, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, marginBottom: 12 },
  button: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  link: { fontWeight: '700', textAlign: 'center', marginTop: 18 },
  error: { marginBottom: 8 },
});
