alter table public.profiles
  add column if not exists roles text[] not null default '{}';

update public.profiles
set roles = case
  when role is null then '{}'
  when role = 'Founder' or role = 'Co-Founder' then array['Founder / Co-Founder']::text[]
  when role = 'Entrepreneur' then array['Startup Professional']::text[]
  else array[role]::text[]
end
where cardinality(roles) = 0;
