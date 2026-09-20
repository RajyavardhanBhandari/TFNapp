import { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { saveMyInterests, skipPersonalization, TFN_INTERESTS, type InterestType, type TfnInterest } from '../../src/user/interests';

const GROUPS: { type: InterestType; title: string; copy: string }[] = [
  { type: 'category', title: 'What you want to read', copy: 'Core TFN stories and founder-led coverage.' },
  { type: 'topic', title: 'What you want to understand', copy: 'Themes across the startup and business ecosystem.' },
  { type: 'sector', title: 'Where you want to go deeper', copy: 'Industries and markets you follow.' },
];

function ActionButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  const theme = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const press = (value: number) => Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 28, bounciness: 5 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable disabled={disabled} onPressIn={() => press(0.98)} onPressOut={() => press(1)} onPress={onPress} style={[styles.button, { backgroundColor: theme.colors.accent, opacity: disabled ? 0.6 : 1 }]}>
        <Text style={{ color: theme.colors.inverseText, fontWeight: '900', fontSize: 15 }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function PersonalizationOnboarding() {
  const theme = useAppTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<TfnInterest[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const intro = useRef(new Animated.Value(0)).current;
  const chipScales = useRef(new Map<string, Animated.Value>()).current;

  useMemo(() => {
    Animated.timing(intro, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [intro]);

  function toggle(item: TfnInterest) {
    setError('');
    const id = `${item.type}:${item.key}`;
    const active = selected.some((x) => x.key === item.key && x.type === item.type);
    const scale = chipScales.get(id) ?? new Animated.Value(1);
    chipScales.set(id, scale);
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 35, bounciness: 3 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 25, bounciness: 4 }),
    ]).start();
    setSelected((current) => active ? current.filter((x) => !(x.key === item.key && x.type === item.type)) : [...current, item]);
  }

  async function finish() {
    if (selected.length < 3) {
      setError(`Choose ${3 - selected.length} more interest${3 - selected.length === 1 ? '' : 's'} to continue.`);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await saveMyInterests(selected);
      router.replace('/');
    } catch {
      setError('We could not save your preferences. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function skip() {
    setBusy(true);
    setError('');
    try {
      await skipPersonalization();
      router.replace('/');
    } catch {
      setError('We could not save that choice. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.wrap} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: intro, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>ONE LAST STEP</Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>Make TFN feel like yours.</Text>
            </View>
            <View style={[styles.countBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.countNumber, { color: theme.colors.text }]}>{selected.length}</Text>
              <Text style={[styles.countLabel, { color: theme.colors.mutedText }]}>selected</Text>
            </View>
          </View>
          <Text style={[styles.sub, { color: theme.colors.mutedText }]}>Pick the topics, industries and stories you care about. We’ll use this as your starting point for personalization.</Text>

          <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.colors.accent, width: `${Math.min(selected.length / 3, 1) * 100}%` }]} />
          </View>
          <Text style={[styles.hint, { color: theme.colors.mutedText }]}>{selected.length < 3 ? `${3 - selected.length} more to unlock your feed` : 'You’re ready to go. You can change this anytime.'}</Text>

          {GROUPS.map((group) => {
            const items = TFN_INTERESTS.filter((item) => item.type === group.type);
            return (
              <View key={group.type} style={styles.group}>
                <Text style={[styles.groupTitle, { color: theme.colors.text }]}>{group.title}</Text>
                <Text style={[styles.groupCopy, { color: theme.colors.mutedText }]}>{group.copy}</Text>
                <View style={styles.chips}>
                  {items.map((item) => {
                    const active = selected.some((x) => x.type === item.type && x.key === item.key);
                    const id = `${item.type}:${item.key}`;
                    const scale = chipScales.get(id) ?? new Animated.Value(1);
                    chipScales.set(id, scale);
                    return (
                      <Animated.View key={id} style={{ transform: [{ scale }] }}>
                        <Pressable
                          onPress={() => toggle(item)}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: active }}
                          accessibilityLabel={`${item.label}, ${active ? 'selected' : 'not selected'}`}
                          style={[styles.chip, { borderColor: active ? theme.colors.accent : theme.colors.border, backgroundColor: active ? theme.colors.accent : theme.colors.surface }]}
                        >
                          <Text style={{ color: active ? theme.colors.inverseText : theme.colors.text, fontWeight: '750' as any }}>{active ? '✓ ' : ''}{item.label}</Text>
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <ActionButton label={busy ? 'Saving your preferences…' : 'Continue to TFN'} onPress={finish} disabled={busy} />
          <Pressable disabled={busy} onPress={skip} accessibilityRole="button" style={styles.skip}>
            <Text style={{ color: theme.colors.text, fontWeight: '800' }}>Skip for now</Text>
            <Text style={[styles.skipHint, { color: theme.colors.mutedText }]}>You can personalize later from Profile → Interests.</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 700, width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 70 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '900', letterSpacing: -0.8, marginTop: 7 },
  sub: { fontSize: 16, lineHeight: 24, marginTop: 12, marginBottom: 20 },
  countBadge: { minWidth: 70, borderWidth: 1, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 10, alignItems: 'center' },
  countNumber: { fontSize: 22, fontWeight: '900' },
  countLabel: { fontSize: 10, fontWeight: '800', marginTop: 1 },
  progressTrack: { height: 6, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  hint: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  group: { marginTop: 30 },
  groupTitle: { fontSize: 18, fontWeight: '900' },
  groupCopy: { fontSize: 13, lineHeight: 19, marginTop: 3, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 46, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 1, borderRadius: 23, justifyContent: 'center' },
  button: { minHeight: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 34 },
  skip: { alignItems: 'center', paddingVertical: 20, gap: 4 },
  skipHint: { fontSize: 12, textAlign: 'center' },
  error: { color: '#C62828', fontSize: 13, lineHeight: 20, marginTop: 16 },
});
