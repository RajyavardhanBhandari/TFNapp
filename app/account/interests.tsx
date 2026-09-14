import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { PROFILE_INTERESTS } from '../../src/user/types';

export default function Interests() {
  const theme = useAppTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 420, useNativeDriver: true }).start();
    let active = true;
    (async () => {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase.from('profiles').select('interests').eq('id', user.id).maybeSingle();
      if (active) { if (error) setMessage('Could not load your interests.'); setSelected(data?.interests ?? []); setLoading(false); }
    })();
    return () => { active = false; };
  }, [entrance]);

  function toggle(item: string) {
    setSelected((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  async function save() {
    if (!supabase || busy) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setBusy(true); setMessage('');
    const { error } = await supabase.from('profiles').update({ interests: selected, updated_at: new Date().toISOString() }).eq('id', user.id);
    setBusy(false);
    if (error) { setMessage('Could not save your interests. Please try again.'); return; }
    router.replace('/(tabs)/profile');
  }

  return <Screen><AppHeader title="Interests" back /><Animated.View style={[styles.animated, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }]}><ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
    <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>PERSONALIZE TFN</Text>
    <Text style={[styles.title, { color: theme.colors.text }]}>What do you want to follow?</Text>
    <Text style={[styles.body, { color: theme.colors.mutedText }]}>Choose the startup topics, sectors and ideas you want TFN to surface. You can change these anytime.</Text>
    {loading ? <View style={styles.loading}><ActivityIndicator color={theme.colors.accent} /><Text style={[styles.body, { color: theme.colors.mutedText }]}>Loading your interests…</Text></View> : <View style={styles.chips}>{PROFILE_INTERESTS.map((item) => { const active = selected.includes(item); return <Pressable key={item} onPress={() => toggle(item)} style={[styles.chip, { borderColor: active ? theme.colors.accent : theme.colors.border, backgroundColor: active ? theme.colors.accentSoft : theme.colors.surface, transform: [{ scale: active ? 1.02 : 1 }] }]}><Text style={{ color: theme.colors.text, fontWeight: '800' }}>{active ? '✓  ' : ''}{item}</Text></Pressable>; })}</View>}
    {message ? <Text style={[styles.message, { color: theme.colors.mutedText }]}>{message}</Text> : null}
    <Pressable disabled={loading || busy} onPress={save} style={[styles.button, { backgroundColor: theme.colors.accent, opacity: loading || busy ? 0.6 : 1 }]}><Text style={{ color: theme.colors.inverseText, fontWeight: '900' }}>{busy ? 'Saving…' : 'Save interests'}</Text></Pressable>
    <Pressable disabled={busy} onPress={() => router.back()} style={styles.cancel}><Text style={{ color: theme.colors.text, fontWeight: '800' }}>Cancel</Text></Pressable>
  </ScrollView></Animated.View></Screen>;
}

const styles = StyleSheet.create({ animated: { flex: 1 }, wrap: { maxWidth: 620, width: '100%', alignSelf: 'center', padding: 20, paddingBottom: 48 }, eyebrow: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 }, title: { fontSize: 32, lineHeight: 38, fontWeight: '900' }, body: { fontSize: 16, lineHeight: 24, marginTop: 10, marginBottom: 24 }, loading: { alignItems: 'center', gap: 12, paddingVertical: 32 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { paddingHorizontal: 13, paddingVertical: 11, borderWidth: 1, borderRadius: 20 }, button: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 28 }, cancel: { alignItems: 'center', padding: 18 }, message: { marginTop: 14, fontSize: 14, lineHeight: 20 }, });