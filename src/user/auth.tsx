import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';
type AuthContextValue = { state: AuthState; session: Session | null; user: User | null; configured: boolean; signOut: () => Promise<void> };

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [state, setState] = useState<AuthState>(supabaseConfigured ? 'loading' : 'unauthenticated');

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setState(data.session ? 'authenticated' : 'unauthenticated');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setState(nextSession ? 'authenticated' : 'unauthenticated');
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const value = useMemo(() => ({
    state, session, user: session?.user ?? null, configured: supabaseConfigured,
    signOut: async () => { if (supabase) await supabase.auth.signOut(); },
  }), [state, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
