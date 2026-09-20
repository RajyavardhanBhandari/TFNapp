import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { getMyInterests, saveMyInterests, TFN_INTERESTS, type TfnInterest } from '../../src/user/interests';

export default function Interests() {
  const theme = useAppTheme();
  const [selected, setSelected] = useState<TfnInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const intro = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setSelected(await getMyInterests());
      Animated.timing(intro, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    } catch {
      setError('Could not load your interests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [intro]);

  useEffect(() => { void load(); }, [load]);

  function toggle(item: TfnInterest) {
    setMessage('');
    setError('');
    setSelected((current) => current.some((x) => x.type === item.type && x.key === item.key)
      ? current.filter((x) => !(x.type === item.type && x.key === item.key))
      : current.length >= 15 ? current : [...current, item]);
  }

  async function save() {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await saveMyInterests(selected);
      setMessage('Saved. Your TFN preferences are up to date.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your interests. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function buttonPress(value: number) {
    Animated.spring(buttonScale, { toValue: value, useNativeDriver: true, speed: 28, bounciness: 5 }).start();
  }

  if (loading) {
    return (
      <Screen>
        <AppHeader title="Interests" back />
        <View style={styles.state}>
          <View style={[styles.loadingDot, { backgroundColor: theme.colors.accent }]} />
          <Text style={{ color: theme.colors.mutedText }}>Loading your preferences…</Text>
        </View>
      </Screen>
    );
  }

  const groups = [
    { title: 'Stories', items: TFN_INTERESTS.filter((item) => item.type === 'category') },
    { title: 'Topics', items: TFN_INTERESTS.filter((item) => item.type === 'topic') },
    { title: 'Sectors', items: TFN_INTERESTS.filter((item) => item.type === 'sector') },
  ];

  return (
    <Screen>
      <AppHeader title="Interests" back />
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>YOUR TFN SIGNALS</Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>Tune your feed.</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.badgeNumber, { color: theme.colors.text }]}>{selected.length}</Text>
              <Text style={[styles.badgeLabel, { color: theme.colors.mutedText }]}>/ 15</Text>
            </View>
          </View>
          <Text style={[styles.body, { color: theme.colors.mutedText }]}>Choose what you want more of. These preferences are private and can be changed whenever you want.</Text>

          {groups.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text style={[styles.groupTitle, { color: theme.colors.text }]}>{group.title}</Text>
              <View style={styles.chips}>
                {group.items.map((item) => {
                  const active = selected.some((x) => x.type === item.type && x.key === item.key);
                  return (
                    <Pressable
                      key={`${item.type}:${item.key}`}
                      onPress={() => toggle(item)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: active }}
                      style={[styles.chip, { borderColor: active ? theme.colors.accent : theme.colors.border, backgroundColor: active ? theme.colors.accent : theme.colors.surface }]}
                    >
                      <Text style={{ color: active ? theme.colors.inverseText : theme.colors.text, fontWeight: '800' }}>{active ? '✓ ' : ''}{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {selected.length >= 15 ? <Text style={[styles.limit, { color: theme.colors.mutedText }]}>You’ve reached the 15-interest limit.</Text> : null}
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          {message ? <Text style={[styles.message, { color: theme.colors.mutedText }]}>✓ {message}</Text> : null}

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable disabled={busy} onPressIn={() => buttonPress(0.98)} onPressOut={() => buttonPress(1)} onPress={save} style={[styles.button, { backgroundColor: theme.colors.accent, opacity: busy ? 0.6 : 1 }]}>
              <Text style={{ color: theme.colors.inverseText, fontWeight: '900', fontSize: 15 }}>{busy ? 'Saving…' : 'Save preferences'}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 700, width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '900', letterSpacing: -0.6, marginTop: 6 },
  body: { fontSize: 16, lineHeight: 24, marginTop: 10, marginBottom: 4 },
  badge: { minWidth: 70, borderWidth: 1, borderRadius: 16, paddingVertical: 9, paddingHorizontal: 10, alignItems: 'center' },
  badgeNumber: { fontSize: 22, fontWeight: '900' },
  badgeLabel: { fontSize: 11, fontWeight: '800' },
  group: { marginTop: 28 },
  groupTitle: { fontSize: 17, fontWeight: '900', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 46, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderRadius: 23, justifyContent: 'center' },
  limit: { fontSize: 12, marginTop: 14 },
  button: { minHeight: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 30 },
  message: { fontSize: 13, lineHeight: 20, marginTop: 14 },
  error: { color: '#C62828', fontSize: 13, lineHeight: 20, marginTop: 14 },
  state: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingDot: { width: 10, height: 10, borderRadius: 5 },
});
