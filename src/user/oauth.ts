import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

function getRedirectUri() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/auth/callback`;
  }
  return Linking.createURL('auth/callback');
}

async function exchangeFromUrl(url: string) {
  if (!supabase) throw new Error('Account services are not configured yet.');

  const parsed = Linking.parse(url);
  const code = typeof parsed.queryParams?.code === 'string' ? parsed.queryParams.code : null;
  if (!code) {
    const error = typeof parsed.queryParams?.error_description === 'string'
      ? parsed.queryParams.error_description
      : null;
    if (error) throw new Error(error);
    return null;
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw error;
  return data.session;
}

export async function signInWithProvider(provider: Extract<Provider, 'google' | 'apple'>) {
  if (!supabase) throw new Error('Account services are not configured yet.');

  const redirectTo = getRedirectUri();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error('Authentication could not be started.');

  if (typeof window !== 'undefined') {
    window.location.assign(data.url);
    return;
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'success') {
    await exchangeFromUrl(result.url);
  }
}

export async function handleAuthCallback(url: string) {
  return exchangeFromUrl(url);
}
