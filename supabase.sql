-- Quiet Revolutions collection schema.
-- Before running, create the owner's Auth user in Supabase, copy its UUID,
-- and replace OWNER_AUTH_USER_UUID below. Do not allow public sign-ups.
create extension if not exists pgcrypto;

create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  artist text not null check (length(trim(artist)) between 1 and 180),
  title text not null check (length(trim(title)) between 1 and 180),
  genre text not null check (length(trim(genre)) between 1 and 80),
  cover_path text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists albums_artist_title_unique
  on public.albums (lower(trim(artist)), lower(trim(title)));

alter table public.albums enable row level security;
grant select on public.albums to anon, authenticated;
grant insert, update, delete on public.albums to authenticated;

create policy "Anyone can read published albums" on public.albums
  for select to anon, authenticated using (published = true);
create policy "Owner can read all albums" on public.albums
  for select to authenticated using (auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);
create policy "Owner can add albums" on public.albums
  for insert to authenticated with check (auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);
create policy "Owner can edit albums" on public.albums
  for update to authenticated using (auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid)
  with check (auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);
create policy "Owner can remove albums" on public.albums
  for delete to authenticated using (auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('album-covers','album-covers',true,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=10485760,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

create policy "Anyone can view album covers" on storage.objects
  for select to anon, authenticated using (bucket_id='album-covers');
create policy "Owner can upload album covers" on storage.objects
  for insert to authenticated with check (bucket_id='album-covers' and auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);
create policy "Owner can update album covers" on storage.objects
  for update to authenticated using (bucket_id='album-covers' and auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid)
  with check (bucket_id='album-covers' and auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);
create policy "Owner can delete album covers" on storage.objects
  for delete to authenticated using (bucket_id='album-covers' and auth.uid() = 'OWNER_AUTH_USER_UUID'::uuid);
