import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/user/auth';

export default function Index() {
  const { user, state } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user || !supabase) {
      setOnboardingComplete(null);
      return;
    }
    supabase.from('profiles').select('onboarding_completed').eq('id', user.id).maybeSingle().then(({ data }) => {
      setOnboardingComplete(Boolean(data?.onboarding_completed));
    });
  }, [user]);

  if (state === 'loading') return null;
  if (user && onboardingComplete === false) return <Redirect href="/onboarding/profile" />;
  return <Redirect href="/home" />;
}
