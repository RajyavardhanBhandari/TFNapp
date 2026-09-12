create table if not exists public.user_content_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id bigint not null,
  signal_type text not null check (signal_type in ('right_swipe','left_swipe','article_opened')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  undone_at timestamptz
);

create index if not exists user_content_signals_user_created_idx
  on public.user_content_signals(user_id, created_at desc);
create index if not exists user_content_signals_user_content_idx
  on public.user_content_signals(user_id, content_id, created_at desc);

alter table public.user_content_signals enable row level security;

create policy "Users can read own content signals"
on public.user_content_signals for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own content signals"
on public.user_content_signals for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own content signals"
on public.user_content_signals for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own content signals"
on public.user_content_signals for delete to authenticated
using ((select auth.uid()) = user_id);
