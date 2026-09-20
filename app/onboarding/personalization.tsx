import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { saveMyInterests, skipPersonalization, TFN_INTERESTS, type TfnInterest } from '../../src/user/interests';

export default function PersonalizationOnboarding() {
  const theme = useAppTheme(); const router = useRouter();
  const [selected, setSelected] = useState<TfnInterest[]>([]); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  function toggle(item: TfnInterest) { setError(''); setSelected((current) => current.some((x) => x.key === item.key && x.type === item.type) ? current.filter((x) => !(x.key === item.key && x.type === item.type)) : [...current, item]); }
  async function finish() { if (selected.length < 3) { setError('Choose at least 3 interests to continue.'); return; } setBusy(true); setError(''); try { await saveMyInterests(selected); router.replace('/'); } catch { setError('We could not save your preferences. Please try again.'); } finally { setBusy(false); } }
  async function skip() { setBusy(true); setError(''); try { await skipPersonalization(); router.replace('/'); } catch { setError('We could not save that choice. Please try again.'); } finally { setBusy(false); } }
  return <Screen><ScrollView contentContainerStyle={styles.wrap}>
    <Text style={[styles.eyebrow, { color: theme.colors.mutedText }]}>PERSONALIZE YOUR TFN</Text>
    <Text style={[styles.title, { color: theme.colors.text }]}>Tell us what you want to discover.</Text>
    <Text style={[styles.sub, { color: theme.colors.mutedText }]}>Choose the topics, industries and startup stories you care about. Your choices are private and can be changed anytime.</Text>
    <Text style={[styles.count, { color: theme.colors.mutedText }]}>{selected.length} selected · Minimum 3</Text>
    <View style={styles.chips}>{TFN_INTERESTS.map((item) => { const active = selected.some((x) => x.key === item.key && x.type === item.type); return <Pressable key={`${item.type}:${item.key}`} onPress={() => toggle(item)} accessibilityRole="checkbox" accessibilityState={{ checked: active }} accessibilityLabel={`${item.label}, ${active ? 'selected' : 'not selected'}`} style={[styles.chip, { borderColor: active ? theme.colors.accent : theme.colors.border, backgroundColor: active ? theme.colors.accent : theme.colors.surface }]}><Text style={{ color: active ? theme.colors.inverseText : theme.colors.text, fontWeight: '700' }}>{active ? '✓ ' : ''}{item.label}</Text></Pressable>; })}</View>
    {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
    <Pressable disabled={busy} onPress={finish} style={[styles.button, { backgroundColor: theme.colors.accent, opacity: busy ? 0.65 : 1 }]}><Text style={{ color: theme.colors.inverseText, fontWeight: '800' }}>{busy ? 'Saving…' : 'Continue to TFN'}</Text></Pressable>
    <Pressable disabled={busy} onPress={skip} accessibilityRole="button" style={styles.skip}><Text style={{ color: theme.colors.text, fontWeight: '700' }}>Skip for now</Text></Pressable>
  </ScrollView></Screen>;
}
const styles = StyleSheet.create({ wrap: { maxWidth: 620, width: '100%', alignSelf: 'center', padding: 20, paddingTop: 44, paddingBottom: 56 }, eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5 }, title: { fontSize: 34, lineHeight: 40, fontWeight: '800', marginTop: 10 }, sub: { fontSize: 16, lineHeight: 24, marginTop: 10, marginBottom: 18 }, count: { fontSize: 13, fontWeight: '700', marginBottom: 16 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 44, paddingHorizontal: 13, paddingVertical: 11, borderWidth: 1, borderRadius: 22, justifyContent: 'center' }, button: { height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 28 }, skip: { alignItems: 'center', padding: 18 }, error: { marginTop: 14, lineHeight: 20 } });
