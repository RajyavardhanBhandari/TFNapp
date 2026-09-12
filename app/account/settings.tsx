import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/user/auth';

export default function Settings() {
  const theme = useAppTheme();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [consent, setConsent] = useState(false);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || !supabase) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('personalization_consent,phone_number')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setConsent(Boolean(data.personalization_consent));
        setPhone(data.phone_number ?? '');
      }
    })();
  }, [user]);

  async function saveConsent(next: boolean) {
    setConsent(next);
    if (!supabase || !user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ personalization_consent: next })
      .eq('id', user.id);
    if (error) setMessage(error.message);
    else setMessage('Privacy preference saved.');
  }

  async function doSignOut() {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await signOut();
      router.replace('/home');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not sign out.');
    } finally {
      setBusy(false);
    }
  }

  async function deleteAccount() {
    if (!supabase || busy) return;
    setBusy(true);
    setMessage('');
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // The account may already be invalidated by the server-side deletion.
      }
      router.replace('/home');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not delete account.');
    } finally {
      setBusy(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <Screen>
      <AppHeader title="Account & privacy" back />
      <View style={styles.wrap}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Account information</Text>
        <Text style={[styles.body, { color: theme.colors.mutedText }]}>Email</Text>
        <Text style={[styles.value, { color: theme.colors.text }]}>{user?.email || 'Not available'}</Text>
        {phone ? (
          <>
            <Text style={[styles.body, { color: theme.colors.mutedText, marginTop: 12 }]}>Phone</Text>
            <Text style={[styles.value, { color: theme.colors.text }]}>{phone}</Text>
          </>
        ) : null}

        <Text style={[styles.heading, { color: theme.colors.text }]}>Privacy</Text>
        <Text style={[styles.body, { color: theme.colors.mutedText }]}>Your profile information is used to provide the TFN account features you choose. Behavioral personalization remains controlled separately.</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Personalization</Text>
            <Text style={[styles.body, { color: theme.colors.mutedText }]}>Allow TFN to use your declared preferences and future preference signals to personalize content.</Text>
          </View>
          <Switch value={consent} onValueChange={saveConsent} />
        </View>

        <Text style={[styles.heading, { color: theme.colors.text }]}>Legal</Text>
        <Pressable onPress={() => router.push('/legal/privacy' as never)} style={styles.linkButton}>
          <Text style={[styles.linkText, { color: theme.colors.text }]}>Privacy policy</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/legal/terms' as never)} style={styles.linkButton}>
          <Text style={[styles.linkText, { color: theme.colors.text }]}>Terms and conditions</Text>
        </Pressable>

        <Text style={[styles.heading, { color: theme.colors.text }]}>Account</Text>
        <Pressable disabled={busy} onPress={doSignOut} style={[styles.secondary, { borderColor: theme.colors.border, opacity: busy ? 0.6 : 1 }]}>
          <Text style={{ color: theme.colors.text, fontWeight: '800' }}>{busy ? 'Please wait…' : 'Sign out'}</Text>
        </Pressable>
        {!confirmingDelete ? (
          <Pressable disabled={busy} onPress={() => setConfirmingDelete(true)} style={[styles.delete, { opacity: busy ? 0.6 : 1 }]}>
            <Text style={{ color: '#C62828', fontWeight: '800' }}>Delete account</Text>
          </Pressable>
        ) : (
          <View style={[styles.confirmBox, { borderColor: theme.colors.border }]}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>Delete your TFN account?</Text>
            <Text style={[styles.body, { color: theme.colors.mutedText }]}>This permanently removes your TFN account and associated profile data. This action cannot be undone.</Text>
            <View style={styles.confirmActions}>
              <Pressable disabled={busy} onPress={() => setConfirmingDelete(false)} style={[styles.secondary, { flex: 1, borderColor: theme.colors.border }]}>
                <Text style={{ color: theme.colors.text, fontWeight: '800' }}>Cancel</Text>
              </Pressable>
              <Pressable disabled={busy} onPress={deleteAccount} style={[styles.dangerButton, { flex: 1, opacity: busy ? 0.6 : 1 }]}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>{busy ? 'Deleting…' : 'Confirm delete'}</Text>
              </Pressable>
            </View>
          </View>
        )}
        {message ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.colors.mutedText }]}>{message}</Text> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 600, width: '100%', alignSelf: 'center', padding: 20 },
  heading: { fontSize: 22, fontWeight: '800', marginTop: 12, marginBottom: 10 },
  body: { fontSize: 15, lineHeight: 22 },
  value: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#D0D0D0' },
  rowTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  secondary: { minHeight: 52, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, paddingHorizontal: 14 },
  delete: { alignItems: 'center', padding: 20, marginTop: 12 },
  confirmBox: { borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 12, gap: 10 },
  confirmActions: { flexDirection: 'row', gap: 10 },
  dangerButton: { minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C62828', paddingHorizontal: 12, marginTop: 10 },
  linkButton: { paddingVertical: 12 },
  linkText: { fontSize: 16, fontWeight: '700' },
  message: { marginTop: 16, fontSize: 14, lineHeight: 20 },
});
