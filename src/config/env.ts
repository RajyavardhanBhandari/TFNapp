const requiredPublicEnv = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  wordpressBaseUrl: process.env.EXPO_PUBLIC_WORDPRESS_BASE_URL,
} as const;

export const env = requiredPublicEnv;

export function validateEnv() {
  const missing = Object.entries(requiredPublicEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(`Missing optional Phase 0 environment variables: ${missing.join(', ')}`);
  }
}
