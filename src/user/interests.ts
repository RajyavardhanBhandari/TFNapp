import { supabase } from '../lib/supabase';

export type InterestType = 'topic' | 'sector' | 'category';

export type TfnInterest = {
  type: InterestType;
  key: string;
  label: string;
};

export const TFN_INTERESTS: readonly TfnInterest[] = [
  { type: 'category', key: 'startup_news', label: 'Startup News' },
  { type: 'category', key: 'founder_stories', label: 'Founder Stories' },
  { type: 'topic', key: 'funding', label: 'Funding' },
  { type: 'topic', key: 'venture_capital', label: 'Venture Capital' },
  { type: 'topic', key: 'artificial_intelligence', label: 'Artificial Intelligence' },
  { type: 'topic', key: 'technology', label: 'Technology' },
  { type: 'sector', key: 'saas', label: 'SaaS' },
  { type: 'sector', key: 'fintech', label: 'Fintech' },
  { type: 'topic', key: 'business', label: 'Business' },
  { type: 'topic', key: 'entrepreneurship', label: 'Entrepreneurship' },
  { type: 'topic', key: 'enterprise', label: 'Enterprise' },
  { type: 'sector', key: 'creator_economy', label: 'Creator Economy' },
  { type: 'topic', key: 'impact', label: 'Impact' },
  { type: 'sector', key: 'consumer', label: 'Consumer' },
  { type: 'sector', key: 'd2c', label: 'D2C' },
  { type: 'sector', key: 'deeptech', label: 'DeepTech' },
];

export type PersonalizationStatus = 'not_started' | 'completed' | 'skipped';

function getInterest(key: string, type: InterestType, label?: string): TfnInterest {
  return TFN_INTERESTS.find((item) => item.key === key && item.type === type)
    ?? { key, type, label: label ?? key };
}

export async function getMyInterests(): Promise<TfnInterest[]> {
  if (!supabase) throw new Error('Account services are not configured yet.');
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('user_interests')
    .select('interest_type, interest_key')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: true });
  if (error) throw error;

  return (data ?? []).map((row) => getInterest(row.interest_key, row.interest_type as InterestType));
}

export async function getPersonalizationStatus(): Promise<PersonalizationStatus> {
  if (!supabase) return 'not_started';
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) return 'not_started';
  const { data, error } = await supabase
    .from('profiles')
    .select('personalization_status')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (error) throw error;
  return (data?.personalization_status as PersonalizationStatus | null) ?? 'not_started';
}

export async function saveMyInterests(interests: TfnInterest[]): Promise<void> {
  if (!supabase) throw new Error('Account services are not configured yet.');
  const unique = Array.from(new Map(interests.map((item) => [`${item.type}:${item.key}`, item])).values());
  if (unique.length > 15) throw new Error('Please choose no more than 15 interests.');

  const payload = unique.map((item) => ({ type: item.type, key: item.key, label: item.label }));
  const { error } = await supabase.rpc('replace_my_interests', { p_interests: payload });
  if (error) throw error;
}

export async function skipPersonalization(): Promise<void> {
  if (!supabase) throw new Error('Account services are not configured yet.');
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('You must be signed in to personalize TFN.');
  const { error } = await supabase
    .from('profiles')
    .update({ personalization_status: 'skipped' })
    .eq('id', userData.user.id);
  if (error) throw error;
}
