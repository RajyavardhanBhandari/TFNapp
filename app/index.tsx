import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/user/auth';
import { useAppTheme } from '../src/theme';

type PersonalizationStatus = 'not_started' | 'completed' | 'skipped';

export default function Index() {
  const { user, state } = useAuth();
  const theme = useAppTheme();
  const [status, setStatus] = useState<PersonalizationStatus | null>(null);

  useEffect(() => {
    let active = true;
    if (!user || !supabase) {
      setStatus(null);
      return () => { active = false; };
    }
    setStatus(null);
    supabase
      .from('profiles')
      .select('onboarding_completed, personalization_status')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (!data?.onboarding_completed) {
          setStatus('not_started');
          return;
        }
        setStatus((data.personalization_status as PersonalizationStatus | null) ?? 'not_started');
      });
    return () => { active = false; };
  }, [user]);

  if (state === 'loading' || (user && status === null)) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}><ActivityIndicator color={theme.colors.accent} /></View>;
  }
  if (user && status === 'not_started') return <Redirect href="/onboarding/profile" />;
  return <Redirect href="/home" />;
}
