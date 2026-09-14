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
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import {
  PROFILE_INTERESTS,
  PROFILE_ROLES,
  type Profile,
  type ProfileGender,
  type ProfileRole,
} from '../../src/user/types';

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

type ChoiceProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
};

function Choice({ label, selected, onPress, colors }: ChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.choice,
        {
          backgroundColor: selected ? colors.accent : colors.surface,
          borderColor: selected ? colors.accent : colors.border,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      <Text style={[styles.choiceText, { color: selected ? colors.inverseText : colors.text }]}>
        {selected ? '✓ ' : ''}{label}
      </Text>
    </Pressable>
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

  useEffect(() => {
    Animated.timing(entrance, { toValue: 1, duration: 420, useNativeDriver: true }).start();
  }, [entrance]);

  if (!profile) {
    return (
      <Screen>
        <AppHeader title="Edit profile" back />
        <View style={styles.loadingWrap}>
          <Text style={[styles.loadingTitle, { color: theme.colors.text }]}>Preparing your profile</Text>
          <Text style={[styles.loadingBody, { color: theme.colors.mutedText }]}>Just a moment…</Text>
        </View>
      </Screen>
    );
  }

  function update(field: keyof Profile, value: unknown) {
    setProfile((current) => current ? { ...current, [field]: value } : current);
  }

  function toggleRole(role: ProfileRole) {
    const roles = profile.roles ?? [];
    const nextRoles = roles.includes(role) ? roles.filter((item) => item !== role) : [...roles, role];
    update('roles', nextRoles);
    update('role', nextRoles[0] ?? null);
  }

  async function save() {
    if (!supabase || !profile) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setBusy(true);
    setMessage('');
    const { error } = await supabase
      .from('profiles')
      .update({ ...profile, roles: profile.roles ?? [], role: profile.roles?.[0] ?? null, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    setBusy(false);
    if (error) {
      setMessage('Could not save your profile. Please try again.');
      return;
    }
    setMessage('Your profile has been saved.');
  }

  const interests = profile.interests ?? [];
  const roles = profile.roles ?? (profile.role ? [profile.role] : []);
  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Screen>
      <AppHeader title="Edit profile" back />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: entrance, transform: [{ translateY }] }}>
            <View style={styles.intro}>
              <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>TFN MEMBER PROFILE</Text>
              <Text style={[styles.heading, { color: theme.colors.text }]}>Make your profile yours.</Text>
              <Text style={[styles.subheading, { color: theme.colors.mutedText }]}>Choose every role that describes your work in the founder ecosystem.</Text>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic information</Text>
              <Text style={[styles.sectionDescription, { color: theme.colors.mutedText }]}>Your name and professional identity.</Text>
              <Text style={[styles.label, { color: theme.colors.text }]}>Name</Text>
              <TextInput value={profile.display_name ?? ''} onChangeText={(value) => update('display_name', value)} placeholder="Your name" placeholderTextColor={theme.colors.mutedText} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
              <Text style={[styles.label, { color: theme.colors.text }]}>Gender</Text>
              <View style={styles.choices}>{GENDERS.map((item) => <Choice key={item} label={item} selected={profile.gender === item} onPress={() => update('gender', item)} colors={theme.colors} />)}</View>
              <Text style={[styles.label, { color: theme.colors.text }]}>Roles <Text style={{ color: theme.colors.mutedText, fontWeight: '500' }}>(select all that apply)</Text></Text>
              <View style={styles.choices}>{PROFILE_ROLES.map((item) => <Choice key={item} label={item} selected={roles.includes(item)} onPress={() => toggleRole(item)} colors={theme.colors} />)}</View>
              <Text style={[styles.selectionHint, { color: theme.colors.mutedText }]}>{roles.length} role{roles.length === 1 ? '' : 's'} selected</Text>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Professional details</Text>
              <Text style={[styles.sectionDescription, { color: theme.colors.mutedText }]}>Add context that makes your profile more useful.</Text>
              {TEXT_FIELDS.map(([field, label]) => <View key={field}><Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text><TextInput value={String(profile[field] ?? '')} onChangeText={(value) => update(field, value)} placeholder={label} placeholderTextColor={theme.colors.mutedText} autoCapitalize={field.includes('url') ? 'none' : 'sentences'} keyboardType={field === 'phone_number' ? 'phone-pad' : field.includes('url') ? 'url' : 'default'} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} /></View>)}
              <Text style={[styles.label, { color: theme.colors.text }]}>About you</Text>
              <TextInput value={profile.bio ?? ''} onChangeText={(value) => update('bio', value)} placeholder="A short introduction about you…" placeholderTextColor={theme.colors.mutedText} multiline textAlignVertical="top" style={[styles.textarea, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.background }]} />
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your interests</Text>
              <Text style={[styles.sectionDescription, { color: theme.colors.mutedText }]}>Choose topics you want to see more of across TFN.</Text>
              <View style={styles.choices}>{PROFILE_INTERESTS.map((item) => <Choice key={item} label={item} selected={interests.includes(item)} onPress={() => update('interests', interests.includes(item) ? interests.filter((value) => value !== item) : [...interests, item])} colors={theme.colors} />)}</View>
              <Text style={[styles.selectionHint, { color: theme.colors.mutedText }]}>{interests.length} interest{interests.length === 1 ? '' : 's'} selected</Text>
            </View>

            {message ? <Text style={[styles.message, { color: message.startsWith('Your') ? theme.colors.accent : '#C62828' }]}>{message}</Text> : null}
            <Pressable disabled={busy} onPress={save} style={({ pressed }) => [styles.saveButton, { backgroundColor: theme.colors.accent, opacity: busy ? 0.65 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}><Text style={[styles.saveText, { color: theme.colors.inverseText }]}>{busy ? 'Saving changes…' : 'Save changes'}</Text></Pressable>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.cancelText, { color: theme.colors.text }]}>Cancel</Text></Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, wrap: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 20, paddingBottom: 64 }, loadingWrap: { padding: 24, alignItems: 'center' }, loadingTitle: { fontSize: 20, fontWeight: '900' }, loadingBody: { marginTop: 8, fontSize: 15 }, intro: { marginBottom: 22 }, eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.4, marginBottom: 8 }, heading: { fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -0.7 }, subheading: { fontSize: 15, lineHeight: 23, marginTop: 9, maxWidth: 540 }, sectionCard: { borderWidth: 1, borderRadius: 22, padding: 18, marginBottom: 16 }, sectionTitle: { fontSize: 20, fontWeight: '900' }, sectionDescription: { fontSize: 14, lineHeight: 20, marginTop: 5, marginBottom: 12 }, label: { fontSize: 13, fontWeight: '800', marginTop: 12, marginBottom: 7 }, input: { minHeight: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, fontSize: 16 }, textarea: { minHeight: 118, borderWidth: 1, borderRadius: 14, padding: 15, fontSize: 16 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, choice: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 10 }, choiceText: { fontSize: 14, fontWeight: '800' }, selectionHint: { fontSize: 13, marginTop: 13 }, message: { fontSize: 14, fontWeight: '800', marginVertical: 8, lineHeight: 20 }, saveButton: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, saveText: { fontSize: 16, fontWeight: '900' }, cancelButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 18 }, cancelText: { fontSize: 15, fontWeight: '800' },
});
