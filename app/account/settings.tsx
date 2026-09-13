import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
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
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user || !supabase) return;

    const currentUser = user;
    const client = supabase;

    async function loadSettings() {
      const { data, error } = await client
        .from('profiles')
        .select('personalization_consent, phone_number')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.log('LOAD SETTINGS ERROR:', error);
        return;
      }

      if (data) {
        setConsent(Boolean(data.personalization_consent));
        setPhone(data.phone_number ?? '');
      }
    }

    loadSettings();
  }, [user]);

  async function saveConsent(next: boolean) {
    const previousValue = consent;
    setConsent(next);

    if (!supabase || !user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        personalization_consent: next,
      })
      .eq('id', user.id);

    if (error) {
      console.log('SAVE CONSENT ERROR:', error);
      setConsent(previousValue);

      Alert.alert(
        'Could not save preference',
        'Please try again.',
      );
    }
  }

  async function handleSignOut() {
    if (isSigningOut || isDeleting) return;

    setIsSigningOut(true);

    try {
      await signOut();
      router.replace('/home');
    } catch (error) {
      console.log('SIGN OUT ERROR:', error);

      Alert.alert(
        'Sign out failed',
        'We could not sign you out. Please try again.',
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete your TFN account?',
      'This permanently removes your TFN account and associated profile data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!supabase || !user || isDeleting) return;

            const client = supabase;
            setIsDeleting(true);

            try {
              const { data, error } = await client.functions.invoke(
                'delete-account',
              );

              if (error) {
                console.log('DELETE ACCOUNT ERROR:', error);
                console.log('DELETE ACCOUNT DATA:', data);

                Alert.alert(
                  'Delete failed',
                  error.message || 'The account could not be deleted.',
                );

                return;
              }

              console.log('DELETE ACCOUNT SUCCESS:', data);

              await signOut();
              router.replace('/home');
            } catch (error) {
              console.log('DELETE ACCOUNT EXCEPTION:', error);

              Alert.alert(
                'Could not delete account',
                'We could not complete secure account deletion. Please try again.',
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <AppHeader title="Account & privacy" back />

      <View style={styles.wrap}>
        <Text style={[styles.heading, { color: theme.colors.text }]}>
          Account information
        </Text>

        <Text style={[styles.body, { color: theme.colors.mutedText }]}>
          Email
        </Text>

        <Text style={[styles.value, { color: theme.colors.text }]}>
          {user?.email || 'Not available'}
        </Text>

        {phone ? (
          <>
            <Text
              style={[
                styles.body,
                {
                  color: theme.colors.mutedText,
                  marginTop: 12,
                },
              ]}
            >
              Phone
            </Text>

            <Text style={[styles.value, { color: theme.colors.text }]}>
              {phone}
            </Text>
          </>
        ) : null}

        <Text style={[styles.heading, { color: theme.colors.text }]}>
          Privacy
        </Text>

        <Text style={[styles.body, { color: theme.colors.mutedText }]}>
          Your profile information is used to provide the TFN account features
          you choose. Behavioral personalization remains controlled separately.
        </Text>

        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={[styles.rowTitle, { color: theme.colors.text }]}>
              Personalization
            </Text>

            <Text style={[styles.body, { color: theme.colors.mutedText }]}>
              Allow TFN to use your declared preferences and future preference
              signals to personalize content.
            </Text>
          </View>

          <Switch
            value={consent}
            onValueChange={saveConsent}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.accent,
            }}
          />
        </View>

        <Text style={[styles.heading, { color: theme.colors.text }]}>
          Account
        </Text>

        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut || isDeleting}
          style={[
            styles.secondary,
            {
              borderColor: theme.colors.border,
              opacity: isSigningOut || isDeleting ? 0.6 : 1,
            },
          ]}
        >
          <Text style={{ color: theme.colors.text, fontWeight: '800' }}>
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </Text>
        </Pressable>

        <Pressable
          onPress={confirmDelete}
          disabled={isSigningOut || isDeleting}
          style={[
            styles.delete,
            {
              opacity: isSigningOut || isDeleting ? 0.6 : 1,
            },
          ]}
        >
          <Text style={{ color: '#C62828', fontWeight: '800' }}>
            {isDeleting ? 'Deleting account...' : 'Delete account'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D0D0D0',
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  secondary: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  delete: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 12,
  },
});