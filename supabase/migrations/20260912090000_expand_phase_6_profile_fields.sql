alter table public.profiles
  add column if not exists gender text,
  add column if not exists phone_number text,
  add column if not exists job_title text,
  add column if not exists industry text,
  add column if not exists location text,
  add column if not exists website text,
  add column if not exists linkedin_url text,
  add column if not exists instagram_url text,
  add column if not exists interests text[] not null default '{}',
  add column if not exists profile_visibility text not null default 'private';

alter table public.profiles
  add constraint profiles_gender_check check (gender is null or gender in ('Male','Female','Prefer not to say'));

alter table public.profiles
  add constraint profiles_visibility_check check (profile_visibility in ('private','public'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 1048576, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

create policy "TFN users can upload own avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.jwt()->>'sub')
);

create policy "TFN users can read own avatar"
on storage.objects for select to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid()::text)
);

create policy "TFN users can update own avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid()::text)
);

create policy "TFN users can delete own avatar"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid()::text)
);
