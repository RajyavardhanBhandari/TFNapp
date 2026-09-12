import { supabase } from '../lib/supabase';

export type QuickSignalType = 'right_swipe' | 'left_swipe' | 'article_opened';

type RecordedSignal = { recorded: true; id: string } | { recorded: false; reason: 'not_configured' | 'guest' | 'error'; error?: unknown };

export async function recordQuickSignal(contentId: number, signalType: QuickSignalType): Promise<RecordedSignal> {
  if (!supabase) return { recorded: false, reason: 'not_configured' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { recorded: false, reason: 'guest' };
  const { data, error } = await supabase
    .from('user_content_signals')
    .insert({ user_id: user.id, content_id: contentId, signal_type: signalType })
    .select('id')
    .single();
  if (error || !data?.id) return { recorded: false, reason: 'error', error };
  return { recorded: true, id: data.id };
}

export async function undoQuickSignal(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase
    .from('user_content_signals')
    .update({ is_active: false, undone_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);
  return !error;
}
