create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text,
  company_name text,
  website text,
  industry text,
  startup_stage text,
  location text,
  team_size text,
  funding_status text,
  investor_type text,
  sectors_of_interest text[] not null default '{}',
  stages_of_interest text[] not null default '{}',
  college text,
  field_of_study text,
  graduation_year integer,
  job_title text,
  profile_visibility text not null default 'private' check (profile_visibility in ('private','public')),
  personalization_consent boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create or replace function public.set_profiles_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_profiles_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security invoker set search_path = public as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name')) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- No public profile reads are granted in V1. Future discoverable profiles must introduce an explicit public-safe projection and policy.
