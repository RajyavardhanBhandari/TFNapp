import { supabase } from '../lib/supabase';

export type QuickSignalType = 'right_swipe' | 'left_swipe' | 'article_opened';

export async function recordQuickSignal(contentId: number, signalType: QuickSignalType) {
  if (!supabase) return { recorded: false, reason: 'not_configured' as const };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { recorded: false, reason: 'guest' as const };
  const { error } = await supabase.from('user_content_signals').insert({ user_id: user.id, content_id: contentId, signal_type: signalType });
  if (error) return { recorded: false, reason: 'error' as const, error };
  return { recorded: true as const };
}

export async function undoQuickSignal(id: string) {
  if (!supabase) return false;
  const { error } = await supabase.from('user_content_signals').update({ is_active: false, undone_at: new Date().toISOString() }).eq('id', id);
  return !error;
}
