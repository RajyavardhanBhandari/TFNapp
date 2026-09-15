import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { TfnLogo } from '../../src/components/TfnLogo';
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { PROFILE_INTERESTS, PROFILE_ROLES, type Profile, type ProfileGender, type ProfileRole } from '../../src/user/types';

const GENDERS: ProfileGender[] = ['Male', 'Female', 'Prefer not to say'];
const TEXT_FIELDS = [
  ['phone_number', 'Phone number'],
  ['company_name', 'Company name'],
  ['job_title', 'Job title'],
  ['industry', 'Industry'],
  ['location', 'Location'],
  ['website', 'Website'],
  ['linkedin_url', 'LinkedIn URL'],
  ['instagram_url', 'Instagram URL'],
] as const;

type ChoiceProps = { label: string; selected: boolean; onPress: () => void; colors: ReturnType<typeof useAppTheme>['colors']; };

function Choice({ label, selected, onPress, colors }: ChoiceProps) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPressIn={() => Animated.spring(scale, { toValue: 0.965, useNativeDriver: true, speed: 24, bounciness: 5 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 5 }).start()}
    >
      <Animated.View style={[styles.choice, { transform: [{ scale }], backgroundColor: selected ? colors.accent : colors.background, borderColor: selected ? colors.accent : colors.border }]}>
        {selected ? <View style={[styles.choiceDot, { backgroundColor: colors.inverseText }]} /> : null}
        <Text style={[styles.choiceText, { color: selected ? colors.inverseText : colors.text }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function Field({ label, value, placeholder, onChangeText, colors, keyboardType = 'default', autoCapitalize = 'sentences', multiline = false }: { label: string; value: string; placeholder: string; onChangeText: (value: string) => void; colors: ReturnType<typeof useAppTheme>['colors']; keyboardType?: any; autoCapitalize?: any; multiline?: boolean }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[multiline ? styles.textarea : styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
      />
    </View>
  );
}

export default function EditProfile() {
  const theme = useAppTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const entrance = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        const row = data as Profile & { roles?: ProfileRole[] };
        setProfile({ ...row, roles: row.roles?.length ? row.roles : row.role ? [row.role] : [] });
      }
    })();
  }, []);
  useEffect(() => { Animated.timing(entrance, { toValue: 1, duration: 480, useNativeDriver: true }).start(); }, [entrance]);

  if (!profile) return <Screen><AppHeader title="Edit profile" back /><View style={styles.loadingWrap}><TfnLogo compact /><Text style={[styles.loadingTitle, { color: theme.colors.text }]}>Preparing your profile</Text><Text style={[styles.loadingBody, { color: theme.colors.mutedText }]}>Just a moment.</Text></View></Screen>;

  function update(field: keyof Profile, value: unknown) { setProfile((current) => current ? { ...current, [field]: value } : current); }
  function toggleRole(role: ProfileRole) { const roles = profile.roles ?? []; const next = roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role]; update('roles', next); update('role', next[0] ?? null); }
  async function save() {
    if (!supabase || !profile) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setBusy(true); setMessage('');
    const { error } = await supabase.from('profiles').update({ ...profile, roles: profile.roles ?? [], role: profile.roles?.[0] ?? null, updated_at: new Date().toISOString() }).eq('id', user.id);
    setBusy(false);
    setMessage(error ? 'Could not save your profile. Please try again.' : 'Your profile has been saved.');
  }

  const roles = profile.roles ?? (profile.role ? [profile.role] : []);
  const interests = profile.interests ?? [];
  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <Screen>
      <AppHeader title="Edit profile" back />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: entrance, transform: [{ translateY }] }}>
            <View style={[styles.masthead, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.mastheadLogo}><TfnLogo compact /></View>
              <View style={styles.mastheadCopy}>
                <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>PROFILE SETTINGS</Text>
                <Text style={[styles.heading, { color: theme.colors.text }]}>Make it yours.</Text>
                <Text style={[styles.subheading, { color: theme.colors.mutedText }]}>A clear profile helps TFN understand your place in the startup ecosystem.</Text>
              </View>
            </View>

            <View style={styles.stepRow}><View style={[styles.stepDot, { backgroundColor: theme.colors.accent }]} /><View style={[styles.stepLine, { backgroundColor: theme.colors.border }]} /><Text style={[styles.stepText, { color: theme.colors.mutedText }]}>Identity · Professional · Interests</Text></View>

            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.sectionHeadingRow}><View><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Identity</Text><Text style={[styles.sectionDescription, { color: theme.colors.mutedText }]}>The basics people see first.</Text></View><Text style={[styles.sectionNumber, { color: theme.colors.accent }]}>01</Text></View>
              <Field label="Name" value={profile.display_name ?? ''} onChangeText={(value) => update('display_name', value)} placeholder="Your full name" colors={theme.colors} />
              <Text style={[styles.label, { color: theme.colors.text }]}>Gender</Text>
              <View style={styles.choiceGrid}>{GENDERS.map((item) => <Choice key={item} label={item} selected={profile.gender === item} onPress={() => update('gender', item)} colors={theme.colors} />)}</View>
              <Text style={[styles.label, { color: theme.colors.text }]}>Roles <Text style={{ color: theme.colors.mutedText, fontWeight: '500' }}>Select all that apply</Text></Text>
              <View style={styles.choiceGrid}>{PROFILE_ROLES.map((item) => <Choice key={item} label={item} selected={roles.includes(item)} onPress={() => toggleRole(item)} colors={theme.colors} />)}</View>
              <Text style={[styles.selectionHint, { color: theme.colors.mutedText }]}>{roles.length ? `${roles.length} role${roles.length === 1 ? '' : 's'} selected` : 'Choose at least one role'}</Text>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.sectionHeadingRow}><View><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Professional</Text><Text style={[styles.sectionDescription, { color: theme.colors.mutedText }]}>Help other founders understand what you do.</Text></View><Text style={[styles.sectionNumber, { color: theme.colors.accent }]}>02</Text></View>
              {TEXT_FIELDS.map(([field, label]) => <Field key={field} label={label} value={String(profile[field] ?? '')} onChangeText={(value) => update(field, value)} placeholder={label} colors={theme.colors} autoCapitalize={field.includes('url') ? 'none' : 'sentences'} keyboardType={field === 'phone_number' ? 'phone-pad' : field.includes('url') ? 'url' : 'default'} />)}
              <Field label="About you" value={profile.bio ?? ''} onChangeText={(value) => update('bio', value)} placeholder="A short introduction about you" colors={theme.colors} multiline />
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <View style={styles.sectionHeadingRow}><View><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Interests</Text><Text style={[styles.sectionDescription, { color: theme.colors.mutedText }]}>Tune what TFN should surface for you.</Text></View><Text style={[styles.sectionNumber, { color: theme.colors.accent }]}>03</Text></View>
              <View style={styles.choiceGrid}>{PROFILE_INTERESTS.map((item) => <Choice key={item} label={item} selected={interests.includes(item)} onPress={() => update('interests', interests.includes(item) ? interests.filter((value) => value !== item) : [...interests, item])} colors={theme.colors} />)}</View>
              <Text style={[styles.selectionHint, { color: theme.colors.mutedText }]}>{interests.length} interest{interests.length === 1 ? '' : 's'} selected</Text>
            </View>

            {message ? <View style={[styles.messageCard, { backgroundColor: theme.colors.accentSoft }]}><Text style={[styles.messageText, { color: message.startsWith('Your') ? theme.colors.accent : '#C62828' }]}>{message}</Text></View> : null}
            <View style={styles.footerActions}>
              <Pressable disabled={busy} onPress={save} style={({ pressed }) => [styles.saveButton, { backgroundColor: theme.colors.accent, opacity: busy ? 0.6 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}><Text style={[styles.saveText, { color: theme.colors.inverseText }]}>{busy ? 'Saving…' : 'Save changes'}</Text></Pressable>
              <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.cancelButton, { borderColor: theme.colors.border, opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.cancelText, { color: theme.colors.text }]}>Cancel</Text></Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingBottom: 72 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingTitle: { fontSize: 22, fontWeight: '900' }, loadingBody: { fontSize: 15 },
  masthead: { borderWidth: 1, borderRadius: 26, padding: 22, flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 18 },
  mastheadLogo: { width: 76, alignItems: 'center' }, mastheadCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5 }, heading: { fontSize: 32, lineHeight: 36, fontWeight: '900', marginTop: 5 },
  subheading: { fontSize: 15, lineHeight: 22, marginTop: 7, maxWidth: 560 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, paddingHorizontal: 4 }, stepDot: { width: 9, height: 9, borderRadius: 5 }, stepLine: { width: 28, height: 1, marginHorizontal: 7 }, stepText: { fontSize: 12, fontWeight: '700' },
  sectionCard: { borderWidth: 1, borderRadius: 24, padding: 20, marginBottom: 18 },
  sectionHeadingRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 3 }, sectionTitle: { fontSize: 22, fontWeight: '900' }, sectionDescription: { fontSize: 14, lineHeight: 20, marginTop: 4 }, sectionNumber: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  fieldBlock: { marginTop: 14 }, label: { fontSize: 13, fontWeight: '800', marginBottom: 7 }, input: { minHeight: 54, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 16 }, textarea: { minHeight: 126, borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16 },
  choiceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, choice: { minHeight: 44, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, choiceDot: { width: 7, height: 7, borderRadius: 4 }, choiceText: { fontSize: 14, fontWeight: '800' },
  selectionHint: { fontSize: 12, marginTop: 12 }, messageCard: { borderRadius: 16, padding: 14, marginBottom: 14 }, messageText: { fontSize: 14, fontWeight: '800' },
  footerActions: { gap: 10, paddingTop: 4 }, saveButton: { minHeight: 58, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, saveText: { fontSize: 16, fontWeight: '900' },
  cancelButton: { minHeight: 52, borderWidth: 1, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, cancelText: { fontSize: 15, fontWeight: '800' },
});
