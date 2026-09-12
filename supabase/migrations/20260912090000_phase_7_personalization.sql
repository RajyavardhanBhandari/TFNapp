create table if not exists public.user_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  interest_type text not null check (interest_type in ('topic','sector','category')),
  interest_key text not null,
  created_at timestamptz not null default now(),
  constraint user_interests_unique unique (user_id, interest_type, interest_key)
);

alter table public.profiles
  add column if not exists personalization_status text not null default 'not_started';

alter table public.profiles
  add constraint profiles_personalization_status_check
  check (personalization_status in ('not_started','completed','skipped'));

create index if not exists user_interests_user_id_idx on public.user_interests(user_id);
create index if not exists user_interests_type_key_idx on public.user_interests(interest_type, interest_key);

alter table public.user_interests enable row level security;

create policy "Users can read own interests"
on public.user_interests for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own interests"
on public.user_interests for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own interests"
on public.user_interests for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own interests"
on public.user_interests for delete to authenticated
using ((select auth.uid()) = user_id);

-- Phase 6 stored interests directly on profiles. Migrate those values once
-- into the normalized preference table before the app starts using it.
insert into public.user_interests (user_id, interest_type, interest_key)
select
  p.id,
  'topic',
  case lower(trim(value))
    when 'startups' then 'startup_news'
    when 'funding' then 'funding'
    when 'venture capital' then 'venture_capital'
    when 'ai' then 'artificial_intelligence'
    when 'technology' then 'technology'
    when 'saas' then 'saas'
    when 'fintech' then 'fintech'
    when 'founder stories' then 'founder_stories'
    when 'business' then 'business'
    when 'entrepreneurship' then 'entrepreneurship'
    when 'enterprise' then 'enterprise'
    when 'creator economy' then 'creator_economy'
    when 'impact' then 'impact'
    when 'consumer' then 'consumer'
    when 'd2c' then 'd2c'
    when 'deeptech' then 'deeptech'
    else regexp_replace(lower(trim(value)), '[^a-z0-9]+', '_', 'g')
  end
from public.profiles p
cross join lateral unnest(coalesce(p.interests, '{}'::text[])) as value
where cardinality(coalesce(p.interests, '{}'::text[])) > 0
on conflict (user_id, interest_type, interest_key) do nothing;

-- Existing Phase 6 users already completed their account/profile onboarding.
-- They should not be forced back through personalization.
update public.profiles
set personalization_status = case
  when cardinality(coalesce(interests, '{}'::text[])) > 0 then 'completed'
  else 'skipped'
end
where onboarding_completed = true and personalization_status = 'not_started';

-- Keep the old array temporarily for backwards compatibility with Phase 6
-- clients. Phase 7 is authoritative through user_interests.

create or replace function public.replace_my_interests(p_interests jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  item jsonb;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if jsonb_typeof(p_interests) <> 'array' then
    raise exception 'Interests must be a JSON array';
  end if;

  delete from public.user_interests where user_id = current_user_id;

  for item in select * from jsonb_array_elements(p_interests)
  loop
    insert into public.user_interests (user_id, interest_type, interest_key)
    values (
      current_user_id,
      item->>'type',
      item->>'key'
    );
  end loop;

  update public.profiles
  set personalization_status = 'completed',
      interests = coalesce(
        array(select item->>'label' from jsonb_array_elements(p_interests) item),
        '{}'::text[]
      ),
      updated_at = now()
  where id = current_user_id;
end;
$$;

revoke all on function public.replace_my_interests(jsonb) from public;
grant execute on function public.replace_my_interests(jsonb) to authenticated;
