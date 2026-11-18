-- The Edit Society — database schema for the customer & admin dashboards.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (uses "if not exists" / "create or replace" where possible).

-- ============================================================
-- 1. Tables
-- ============================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  company     text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- A customer's active pack. One row per purchase/renewal; the newest active one is used.
create table if not exists public.subscriptions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  plan           text not null check (plan in ('simple', 'complex', 'premium')),
  pack_size      int  not null default 4,
  credits_total  int  not null default 4,     -- videos included in this pack
  credits_used   int  not null default 0,
  max_active     int  not null default 1,     -- requests in production at the same time
  max_revisions  int  not null default 2,     -- revision rounds per video
  status         text not null default 'active' check (status in ('active', 'paused', 'expired')),
  starts_at      timestamptz not null default now(),
  valid_until    timestamptz not null default (now() + interval '60 days'),
  created_at     timestamptz not null default now()
);
create index if not exists subscriptions_user_idx on public.subscriptions(user_id);

create table if not exists public.requests (
  id               uuid primary key default gen_random_uuid(),
  ref              bigint generated always as identity,          -- human-friendly number (#1042)
  user_id          uuid not null references public.profiles(id) on delete cascade,
  subscription_id  uuid references public.subscriptions(id) on delete set null,
  title            text not null,
  video_type       text not null,          -- reel, short, youtube, podcast, ad, motion, colour, brand-film
  tier             text not null check (tier in ('simple', 'complex', 'premium')),
  platform         text,
  aspect_ratio     text,
  length          text,
  brief            text,
  style_notes      text,
  reference_links  text,
  footage_links    text,
  captions         text,
  music            text,
  deadline         date,
  status           text not null default 'submitted'
                   check (status in ('submitted', 'in_progress', 'in_review', 'revision', 'completed', 'cancelled')),
  revision_count   int not null default 0,
  assignee         text,                   -- editor name shown to the client
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  completed_at     timestamptz
);
create index if not exists requests_user_idx on public.requests(user_id);
create index if not exists requests_status_idx on public.requests(status);

create table if not exists public.request_files (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.requests(id) on delete cascade,
  uploader_id  uuid references public.profiles(id) on delete set null,
  kind         text not null check (kind in ('raw', 'reference', 'deliverable')),
  path         text not null,              -- storage path inside the "files" bucket
  name         text not null,
  size         bigint,
  version      int not null default 1,     -- deliverable version (v1, v2 …)
  created_at   timestamptz not null default now()
);
create index if not exists request_files_req_idx on public.request_files(request_id);

create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.requests(id) on delete cascade,
  sender_id   uuid references public.profiles(id) on delete set null,
  body        text not null,
  kind        text not null default 'note' check (kind in ('note', 'revision', 'system')),
  created_at  timestamptz not null default now()
);
create index if not exists messages_req_idx on public.messages(request_id);

-- ============================================================
-- 2. Helpers & triggers
-- ============================================================

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.owns_request(rid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.requests where id = rid and user_id = auth.uid());
$$;

-- Create a profile row automatically for every new login.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists requests_touch on public.requests;
create trigger requests_touch before update on public.requests
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 3. Actions (all business rules live here, not in the browser)
-- ============================================================

-- Customer: submit a new edit request. Checks the active pack, credits and parallel-request limit.
create or replace function public.create_request(payload jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  sub public.subscriptions;
  active_count int;
  new_id uuid;
  t text;
begin
  if auth.uid() is null then raise exception 'Please log in again.'; end if;

  select * into sub from public.subscriptions
   where user_id = auth.uid() and status = 'active' and valid_until > now()
   order by created_at desc limit 1;
  if sub.id is null then raise exception 'You don''t have an active plan. Choose a plan to start a request.'; end if;
  if sub.credits_used >= sub.credits_total then raise exception 'You''ve used all videos in your pack. Top up to submit more.'; end if;

  select count(*) into active_count from public.requests
   where user_id = auth.uid() and status in ('submitted', 'in_progress', 'in_review', 'revision');
  if active_count >= sub.max_active then
    raise exception 'Your plan allows % active request(s) at a time. Approve a finished edit to start the next one.', sub.max_active;
  end if;

  -- Premium can choose simple/complex/premium; other plans edit at their own tier.
  t := case when sub.plan = 'premium' then coalesce(nullif(payload->>'tier', ''), 'premium') else sub.plan end;

  insert into public.requests (user_id, subscription_id, title, video_type, tier, platform, aspect_ratio, length,
                               brief, style_notes, reference_links, footage_links, captions, music, deadline)
  values (auth.uid(), sub.id, coalesce(nullif(payload->>'title', ''), 'Untitled request'), coalesce(payload->>'video_type', 'reel'), t,
          payload->>'platform', payload->>'aspect_ratio', payload->>'length', payload->>'brief', payload->>'style_notes',
          payload->>'reference_links', payload->>'footage_links', payload->>'captions', payload->>'music',
          nullif(payload->>'deadline', '')::date)
  returning id into new_id;

  update public.subscriptions set credits_used = credits_used + 1 where id = sub.id;
  insert into public.messages (request_id, sender_id, body, kind) values (new_id, auth.uid(), 'Request submitted.', 'system');
  return new_id;
end $$;

-- Customer: ask for changes on a delivered draft.
create or replace function public.request_revision(rid uuid, note text) returns void
language plpgsql security definer set search_path = public as $$
declare r public.requests; maxrev int;
begin
  select * into r from public.requests where id = rid and user_id = auth.uid();
  if r.id is null then raise exception 'Request not found.'; end if;
  if r.status <> 'in_review' then raise exception 'You can request changes once a draft is ready.'; end if;
  select coalesce(s.max_revisions, 2) into maxrev from public.subscriptions s where s.id = r.subscription_id;
  if r.revision_count >= coalesce(maxrev, 2) then
    raise exception 'All % revision rounds are used for this video. Message us for extra changes.', coalesce(maxrev, 2);
  end if;
  update public.requests set status = 'revision', revision_count = revision_count + 1 where id = rid;
  insert into public.messages (request_id, sender_id, body, kind) values (rid, auth.uid(), coalesce(nullif(trim(note), ''), 'Revision requested.'), 'revision');
end $$;

-- Customer: approve the latest draft.
create or replace function public.approve_request(rid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.requests set status = 'completed', completed_at = now()
   where id = rid and user_id = auth.uid() and status = 'in_review';
  if not found then raise exception 'Only a delivered draft can be approved.'; end if;
  insert into public.messages (request_id, sender_id, body, kind) values (rid, auth.uid(), 'Draft approved — project completed.', 'system');
end $$;

-- Admin: move a request to another status (with an optional system note).
create or replace function public.admin_set_status(rid uuid, new_status text, note text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only.'; end if;
  update public.requests set status = new_status,
         completed_at = case when new_status = 'completed' then now() else completed_at end
   where id = rid;
  insert into public.messages (request_id, sender_id, body, kind)
  values (rid, auth.uid(), coalesce(note, 'Status changed to ' || replace(new_status, '_', ' ') || '.'), 'system');
end $$;

-- ============================================================
-- 4. Row Level Security — customers see only their own data, admins see everything
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.subscriptions  enable row level security;
alter table public.requests       enable row level security;
alter table public.request_files  enable row level security;
alter table public.messages       enable row level security;

drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles update" on public.profiles;
-- customers can also see studio staff names (shown in message threads)
create policy "profiles read"   on public.profiles for select using (id = auth.uid() or public.is_admin() or role = 'admin');
create policy "profiles update" on public.profiles for update using (id = auth.uid() or public.is_admin());
-- Customers may only edit these columns (never their role).
revoke update on public.profiles from authenticated;
grant update (full_name, company, phone) on public.profiles to authenticated;

drop policy if exists "subs read"  on public.subscriptions;
drop policy if exists "subs admin" on public.subscriptions;
create policy "subs read"  on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy "subs admin" on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "requests read"  on public.requests;
drop policy if exists "requests admin" on public.requests;
create policy "requests read"  on public.requests for select using (user_id = auth.uid() or public.is_admin());
create policy "requests admin" on public.requests for update using (public.is_admin()) with check (public.is_admin());
-- (customers create requests only through create_request())

drop policy if exists "files read"   on public.request_files;
drop policy if exists "files insert" on public.request_files;
drop policy if exists "files delete" on public.request_files;
create policy "files read"   on public.request_files for select using (public.owns_request(request_id) or public.is_admin());
create policy "files insert" on public.request_files for insert with check (
  public.is_admin() or (uploader_id = auth.uid() and kind in ('raw', 'reference') and public.owns_request(request_id)));
create policy "files delete" on public.request_files for delete using (public.is_admin());

drop policy if exists "messages read"   on public.messages;
drop policy if exists "messages insert" on public.messages;
create policy "messages read"   on public.messages for select using (public.owns_request(request_id) or public.is_admin());
create policy "messages insert" on public.messages for insert with check (
  sender_id = auth.uid() and kind = 'note' and (public.owns_request(request_id) or public.is_admin()));

grant execute on function public.create_request(jsonb)                to authenticated;
grant execute on function public.request_revision(uuid, text)          to authenticated;
grant execute on function public.approve_request(uuid)                 to authenticated;
grant execute on function public.admin_set_status(uuid, text, text)    to authenticated;

-- ============================================================
-- 5. File storage — private bucket "files", one folder per request: <request_id>/<kind>/<file>
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('files', 'files', false, 52428800)          -- 50 MB per file (Supabase free plan limit)
on conflict (id) do update set public = false;

drop policy if exists "files bucket read"   on storage.objects;
drop policy if exists "files bucket upload" on storage.objects;
drop policy if exists "files bucket delete" on storage.objects;
create policy "files bucket read" on storage.objects for select using (
  bucket_id = 'files' and (public.is_admin() or public.owns_request(((storage.foldername(name))[1])::uuid)));
create policy "files bucket upload" on storage.objects for insert with check (
  bucket_id = 'files' and (
    public.is_admin()
    or (public.owns_request(((storage.foldername(name))[1])::uuid) and (storage.foldername(name))[2] in ('raw', 'reference'))));
create policy "files bucket delete" on storage.objects for delete using (bucket_id = 'files' and public.is_admin());
