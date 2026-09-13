import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { AppHeader } from '../../src/components/AppHeader';
import { Screen } from '../../src/components/Screen';
import { useAppTheme } from '../../src/theme';
import { useAuth } from '../../src/user/auth';
import { supabase } from '../../src/lib/supabase';
import type { Profile } from '../../src/user/types';

function Initials({ name, color }: { name: string; color: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'TFN';

  return <Text style={{ color, fontSize: 28, fontWeight: '900' }}>{initials}</Text>;
}

function InfoRow({ label, value, textColor, mutedColor }: { label: string; value: string; textColor: string; mutedColor: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: mutedColor }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { user, state, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user || !supabase) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.log('LOAD PROFILE ERROR:', error);
      return;
    }

    setProfile(data ? (data as Profile) : null);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  async function refresh() {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }

  if (state === 'loading') {
    return (
      <Screen>
        <AppHeader title="Profile" />
        <View style={styles.loadingWrap}>
          <Text style={[styles.body, { color: theme.colors.mutedText }]}>Restoring your account…</Text>
        </View>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <AppHeader title="Profile" />
        <View style={styles.center}>
          <View style={[styles.guestIcon, { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.border }]}>
            <Initials name="The Founder Nation" color={theme.colors.accent} />
          </View>
          <Text style={[styles.guestTitle, { color: theme.colors.text }]}>Your TFN account</Text>
          <Text style={[styles.guestBody, { color: theme.colors.mutedText }]}>Sign in to manage your profile, save your preferences, and get a more relevant TFN experience.</Text>
          <Pressable onPress={() => router.push('/auth/sign-in')} style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}>
            <Text style={{ color: theme.colors.inverseText, fontWeight: '900' }}>Sign in</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/auth/create-account')} style={[styles.secondaryButton, { borderColor: theme.colors.border }]}>
            <Text style={{ color: theme.colors.text, fontWeight: '900' }}>Create account</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const displayName = profile?.display_name?.trim() || 'TFN member';
  const roleLine = profile?.role || profile?.job_title || 'Founder ecosystem member';
  const companyLine = [profile?.company_name, profile?.job_title && profile.role ? profile.job_title : null].filter(Boolean).join(' · ');
  const topInterests = (profile?.interests ?? []).slice(0, 8);

  return (
    <Screen>
      <AppHeader title="Profile" />
      <ScrollView contentContainerStyle={styles.wrap} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.border }]}>
            <Initials name={displayName} color={theme.colors.accent} />
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>{displayName}</Text>
            <Text style={[styles.role, { color: theme.colors.mutedText }]}>{roleLine}</Text>
            {companyLine ? <Text style={[styles.company, { color: theme.colors.text }]}>{companyLine}</Text> : null}
            {profile?.location ? <Text style={[styles.meta, { color: theme.colors.mutedText }]}>{profile.location}</Text> : null}
          </View>
        </View>

        {profile?.bio ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
            <Text style={[styles.body, { color: theme.colors.mutedText }]}>{profile.bio}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Profile details</Text>
            <Pressable onPress={() => router.push('/account/edit-profile')} hitSlop={8}><Text style={[styles.editLink, { color: theme.colors.accent }]}>Edit</Text></Pressable>
          </View>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            {profile?.industry ? <InfoRow label="Industry" value={profile.industry} textColor={theme.colors.text} mutedColor={theme.colors.mutedText} /> : null}
            {profile?.startup_stage ? <InfoRow label="Stage" value={profile.startup_stage} textColor={theme.colors.text} mutedColor={theme.colors.mutedText} /> : null}
            {profile?.team_size ? <InfoRow label="Team" value={profile.team_size} textColor={theme.colors.text} mutedColor={theme.colors.mutedText} /> : null}
            {profile?.funding_status ? <InfoRow label="Funding" value={profile.funding_status} textColor={theme.colors.text} mutedColor={theme.colors.mutedText} /> : null}
            {profile?.college ? <InfoRow label="College" value={profile.college} textColor={theme.colors.text} mutedColor={theme.colors.mutedText} /> : null}
            {profile?.field_of_study ? <InfoRow label="Field" value={profile.field_of_study} textColor={theme.colors.text} mutedColor={theme.colors.mutedText} /> : null}
            {!profile?.industry && !profile?.startup_stage && !profile?.team_size && !profile?.funding_status && !profile?.college && !profile?.field_of_study ? <Text style={[styles.emptyText, { color: theme.colors.mutedText }]}>Add a few details so your profile better reflects what you do.</Text> : null}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your interests</Text>
            <Pressable onPress={() => router.push('/account/interests')} hitSlop={8}><Text style={[styles.editLink, { color: theme.colors.accent }]}>Manage</Text></Pressable>
          </View>
          {topInterests.length ? (
            <View style={styles.chips}>
              {topInterests.map((item) => <View key={item} style={[styles.chip, { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.border }]}><Text style={{ color: theme.colors.text, fontWeight: '800' }}>{item}</Text></View>)}
            </View>
          ) : (
            <Pressable onPress={() => router.push('/account/interests')} style={[styles.emptyAction, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.emptyActionTitle, { color: theme.colors.text }]}>Personalize your feed</Text>
              <Text style={[styles.emptyActionBody, { color: theme.colors.mutedText }]}>Choose the startup topics, sectors, and ideas you want TFN to surface.</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.actionsSection}>
          <Pressable onPress={() => router.push('/account/edit-profile')} style={[styles.primaryButton, { backgroundColor: theme.colors.accent }]}><Text style={{ color: theme.colors.inverseText, fontWeight: '900' }}>Edit profile</Text></Pressable>
          <Pressable onPress={() => router.push('/account/settings')} style={[styles.secondaryButton, { borderColor: theme.colors.border }]}><Text style={{ color: theme.colors.text, fontWeight: '900' }}>Account & privacy</Text></Pressable>
        </View>

        <Pressable onPress={signOut} style={styles.signout}><Text style={{ color: '#C62828', fontWeight: '900' }}>Sign out</Text></Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 680, width: '100%', alignSelf: 'center', padding: 20, paddingBottom: 56 },
  loadingWrap: { padding: 20 },
  center: { maxWidth: 560, width: '100%', alignSelf: 'center', padding: 24, paddingTop: 52, alignItems: 'center' },
  guestIcon: { width: 84, height: 84, borderRadius: 28, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  guestTitle: { fontSize: 30, fontWeight: '900', textAlign: 'center' },
  guestBody: { fontSize: 16, lineHeight: 24, marginTop: 10, textAlign: 'center', maxWidth: 500 },
  heroCard: { borderWidth: 1, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 76, height: 76, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  title: { fontSize: 28, lineHeight: 32, fontWeight: '900' },
  role: { fontSize: 15, lineHeight: 20, marginTop: 5, fontWeight: '600' },
  company: { fontSize: 15, lineHeight: 20, marginTop: 5, fontWeight: '800' },
  meta: { fontSize: 14, marginTop: 4 },
  section: { marginTop: 26 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '900' },
  editLink: { fontSize: 14, fontWeight: '900' },
  body: { fontSize: 15, lineHeight: 23 },
  infoCard: { borderWidth: 1, borderRadius: 18, padding: 16 },
  infoRow: { paddingVertical: 9 },
  infoLabel: { fontSize: 11, lineHeight: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.9 },
  infoValue: { fontSize: 15, lineHeight: 21, fontWeight: '700', marginTop: 3 },
  emptyText: { fontSize: 15, lineHeight: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderRadius: 18 },
  emptyAction: { borderWidth: 1, borderRadius: 18, padding: 16 },
  emptyActionTitle: { fontSize: 16, fontWeight: '900' },
  emptyActionBody: { fontSize: 14, lineHeight: 21, marginTop: 5 },
  actionsSection: { marginTop: 28, gap: 10 },
  primaryButton: { minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  secondaryButton: { minHeight: 52, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  signout: { alignItems: 'center', paddingVertical: 22 },
});
