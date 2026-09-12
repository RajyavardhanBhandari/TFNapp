import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../src/user/auth';

export default function Index() {
  const { user, state } = useAuth();
  const [status, setStatus] = useState<'not_started' | 'completed' | 'skipped' | null>(null);
  useEffect(() => {
    if (!user || !supabase) { setStatus(null); return; }
    supabase.from('profiles').select('onboarding_completed, personalization_status').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (!data?.onboarding_completed) setStatus('not_started');
      else setStatus((data.personalization_status as 'not_started' | 'completed' | 'skipped' | null) ?? 'not_started');
    });
  }, [user]);
  if (state === 'loading' || (user && status === null)) return null;
  if (user && status === 'not_started') return <Redirect href="/onboarding/profile" />;
  return <Redirect href="/home" />;
}
