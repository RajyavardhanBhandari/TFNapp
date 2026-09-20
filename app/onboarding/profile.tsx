import { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { supabase } from '../../src/lib/supabase';
import { PROFILE_ROLES, type ProfileGender, type ProfileRole } from '../../src/user/types';
import { pickAndUploadAvatar } from '../../src/user/profile';

const GENDERS: ProfileGender[] = ['Male', 'Female', 'Prefer not to say'];
const STAGES = ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+', 'Bootstrapped', 'Not applicable'];

function ActionButton({ label, onPress, disabled, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  const theme = useAppTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const press = (value: number) => Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 28, bounciness: 5 }).start();
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        disabled={disabled}
        onPressIn={() => press(0.98)}
        onPressOut={() => press(1)}
        onPress={onPress}
        accessibilityRole="button"
        style={[
          styles.button,
          secondary
            ? { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1 }
            : { backgroundColor: theme.colors.accent },
          disabled && styles.disabled,
        ]}
      >
        <Text style={{ color: secondary ? theme.colors.text : theme.colors.inverseText, fontWeight: '800', fontSize: 15 }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function OnboardingProfile() {
  const theme = useAppTheme();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<ProfileGender | null>(null);
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<ProfileRole | null>(null);
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [startupStage, setStartupStage] = useState('');
  const [investorType, setInvestorType] = useState('');
  const [college, setCollege] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const roleFields = useMemo(() => {
    if (role === 'Founder' || role === 'Co-Founder') return 'founder';
    if (role === 'Investor' || role === 'VC Professional' || role === 'Angel Investor') return 'investor';
    if (role === 'Student') return 'student';
    return 'professional';
  }, [role]);

  function animateToStep(nextStep: number) {
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 12, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      slide.setValue(-12);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(slide, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 3 }),
      ]).start();
    });
  }

  async function chooseAvatar() {
    try {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!user) return;
      const path = await pickAndUploadAvatar(user.id);
      if (path) setAvatarPath(path);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profile photo could not be uploaded yet.');
    }
  }

  function next() {
    setError('');
    if (step === 1 && !name.trim()) {
      setError('Add your name to continue.');
      return;
    }
    if (step === 2 && !role) {
      setError('Choose the role that best describes you.');
      return;
    }
    animateToStep(2);
  }

  async function save() {
    if (!supabase) {
      setError('Account services are not configured yet.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }
    setBusy(true);
    setError('');
    const { error: e } = await supabase.from('profiles').upsert({
      id: user.id,
      display_name: name.trim() || null,
      gender,
      phone_number: phone.trim() || null,
      role,
      company_name: company.trim() || null,
      job_title: jobTitle.trim() || null,
      industry: industry.trim() || null,
      location: location.trim() || null,
      bio: bio.trim() || null,
      startup_stage: startupStage || null,
      investor_type: investorType.trim() || null,
      college: college.trim() || null,
      field_of_study: fieldOfStudy.trim() || null,
      avatar_url: avatarPath,
      onboarding_completed: true,
    }, { onConflict: 'id' });
    setBusy(false);
    if (e) {
      setError('Your profile could not be saved yet. Please try again.');
      return;
    }
    router.replace('/onboarding/personalization');
  }

  const progress = step / 2;

  return (
    <Screen scroll={false} padding={false}>
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <View style={styles.progressRow}>
          <View style={styles.progressCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>SET UP YOUR TFN</Text>
            <Text style={[styles.stepText, { color: theme.colors.mutedText }]}>Step {step} of 2</Text>
          </View>
          <Text style={[styles.percent, { color: theme.colors.mutedText }]}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
          <Animated.View style={[styles.progressFill, { backgroundColor: theme.colors.accent, width: `${progress * 100}%` }]} />
        </View>

        <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
          {step === 1 ? (
            <>
              <Text style={[styles.title, { color: theme.colors.text }]}>Build your profile.</Text>
              <Text style={[styles.sub, { color: theme.colors.mutedText }]}>A few details help TFN make your experience feel relevant from day one.</Text>

              <Pressable onPress={chooseAvatar} accessibilityRole="button" style={styles.avatarButton}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                  {avatarPath ? <Text style={[styles.avatarDone, { color: theme.colors.text }]}>✓</Text> : <Text style={[styles.avatarPlus, { color: theme.colors.text }]}>+</Text>}
                </View>
                <Text style={[styles.avatarLabel, { color: theme.colors.mutedText }]}>{avatarPath ? 'Photo added' : 'Add a profile photo'}</Text>
              </Pressable>

              <Text style={[styles.label, { color: theme.colors.text }]}>Name</Text>
              <TextInput autoCapitalize="words" placeholder="Your name" placeholderTextColor={theme.colors.mutedText} value={name} onChangeText={setName} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />

              <Text style={[styles.label, { color: theme.colors.text }]}>Gender <Text style={styles.optional}>optional</Text></Text>
              <View style={styles.chips}>
                {GENDERS.map((item) => {
                  const active = gender === item;
                  return <Pressable key={item} onPress={() => setGender(item)} style={[styles.chip, { borderColor: active ? theme.colors.accent : theme.colors.border, backgroundColor: active ? theme.colors.accent : theme.colors.surface }]}><Text style={{ color: active ? theme.colors.inverseText : theme.colors.text, fontWeight: '700' }}>{active ? '✓ ' : ''}{item}</Text></Pressable>;
                })}
              </View>

              <Text style={[styles.label, { color: theme.colors.text }]}>Phone <Text style={styles.optional}>optional</Text></Text>
              <TextInput keyboardType="phone-pad" placeholder="+91…" placeholderTextColor={theme.colors.mutedText} value={phone} onChangeText={setPhone} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: theme.colors.text }]}>Where do you fit in?</Text>
              <Text style={[styles.sub, { color: theme.colors.mutedText }]}>Choose a role so we can tailor the questions without making your profile feel like a form.</Text>

              <Text style={[styles.label, { color: theme.colors.text }]}>Your role</Text>
              <View style={styles.chips}>
                {PROFILE_ROLES.map((item) => {
                  const active = role === item;
                  return <Pressable key={item} onPress={() => setRole(item)} style={[styles.chip, { borderColor: active ? theme.colors.accent : theme.colors.border, backgroundColor: active ? theme.colors.accent : theme.colors.surface }]}><Text style={{ color: active ? theme.colors.inverseText : theme.colors.text, fontWeight: '700' }}>{active ? '✓ ' : ''}{item}</Text></Pressable>;
                })}
              </View>

              {roleFields !== 'student' ? (
                <>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Company / startup</Text>
                  <TextInput placeholder="Optional" placeholderTextColor={theme.colors.mutedText} value={company} onChangeText={setCompany} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
                  <Text style={[styles.label, { color: theme.colors.text }]}>Job title <Text style={styles.optional}>optional</Text></Text>
                  <TextInput placeholder="e.g. CEO, Partner, Product Manager" placeholderTextColor={theme.colors.mutedText} value={jobTitle} onChangeText={setJobTitle} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
                </>
              ) : (
                <>
                  <Text style={[styles.label, { color: theme.colors.text }]}>College</Text>
                  <TextInput placeholder="Your college / university" placeholderTextColor={theme.colors.mutedText} value={college} onChangeText={setCollege} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
                  <Text style={[styles.label, { color: theme.colors.text }]}>Field of study</Text>
                  <TextInput placeholder="e.g. Computer Science, Law" placeholderTextColor={theme.colors.mutedText} value={fieldOfStudy} onChangeText={setFieldOfStudy} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
                </>
              )}

              <Text style={[styles.label, { color: theme.colors.text }]}>Industry / sector <Text style={styles.optional}>optional</Text></Text>
              <TextInput placeholder="e.g. Fintech, SaaS, AI" placeholderTextColor={theme.colors.mutedText} value={industry} onChangeText={setIndustry} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />

              <Text style={[styles.label, { color: theme.colors.text }]}>Location <Text style={styles.optional}>optional</Text></Text>
              <TextInput placeholder="City, Country" placeholderTextColor={theme.colors.mutedText} value={location} onChangeText={setLocation} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />

              {roleFields === 'founder' ? (
                <>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Startup stage <Text style={styles.optional}>optional</Text></Text>
                  <View style={styles.chips}>
                    {STAGES.map((item) => {
                      const active = startupStage === item;
                      return <Pressable key={item} onPress={() => setStartupStage(item)} style={[styles.chip, { borderColor: active ? theme.colors.accent : theme.colors.border, backgroundColor: active ? theme.colors.accent : theme.colors.surface }]}><Text style={{ color: active ? theme.colors.inverseText : theme.colors.text, fontWeight: '700' }}>{active ? '✓ ' : ''}{item}</Text></Pressable>;
                    })}
                  </View>
                </>
              ) : null}

              {roleFields === 'investor' ? (
                <>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Investor / fund type <Text style={styles.optional}>optional</Text></Text>
                  <TextInput placeholder="VC, Angel, Family Office…" placeholderTextColor={theme.colors.mutedText} value={investorType} onChangeText={setInvestorType} style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
                </>
              ) : null}

              <Text style={[styles.label, { color: theme.colors.text }]}>Short bio <Text style={styles.optional}>optional</Text></Text>
              <TextInput multiline numberOfLines={4} placeholder="A sentence or two about you" placeholderTextColor={theme.colors.mutedText} value={bio} onChangeText={setBio} style={[styles.textarea, { color: theme.colors.text, borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]} />
              <View style={[styles.nextCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.nextTitle, { color: theme.colors.text }]}>Next: personalize your feed</Text>
                <Text style={[styles.nextCopy, { color: theme.colors.mutedText }]}>Pick at least 3 topics you want to discover. You can change them anytime.</Text>
              </View>
            </>
          )}
        </Animated.View>

        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

        <ActionButton label={busy ? 'Saving…' : step === 1 ? 'Continue' : 'Continue to personalization'} onPress={step === 1 ? next : save} disabled={busy} />
        {step === 2 ? <ActionButton label="Back" onPress={() => { setError(''); animateToStep(1); }} secondary /> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 640, width: '100%', alignSelf: 'center', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 64 },
  progressRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  progressCopy: { gap: 4 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  stepText: { fontSize: 12, fontWeight: '700' },
  percent: { fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 5, borderRadius: 999, overflow: 'hidden', marginTop: 10, marginBottom: 34 },
  progressFill: { height: '100%', borderRadius: 999 },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '900', letterSpacing: -0.8 },
  sub: { fontSize: 16, lineHeight: 24, marginTop: 10, marginBottom: 26 },
  avatarButton: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarPlus: { fontSize: 34, fontWeight: '300' },
  avatarDone: { fontSize: 30, fontWeight: '900' },
  avatarLabel: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 8, marginTop: 8 },
  optional: { fontWeight: '500', color: '#888888' },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 16, marginBottom: 12 },
  textarea: { minHeight: 112, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, textAlignVertical: 'top', marginBottom: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderRadius: 22, justifyContent: 'center' },
  nextCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 8 },
  nextTitle: { fontSize: 14, fontWeight: '900' },
  nextCopy: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  button: { minHeight: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  disabled: { opacity: 0.6 },
  error: { color: '#C62828', fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 4 },
});
