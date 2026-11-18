-- The Edit Society — self sign-up with a plan (no payment gateway yet).
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to re-run.
--
-- What it does:
--  • New customers can sign up and pick a plan; the plan starts right away and is marked "unpaid"
--    so the studio can invoice them and mark it paid in the admin dashboard (Clients → Edit plan).
--  • Adds paid/source columns to subscriptions.
--  • Adds choose_plan() for signed-in customers who don't have a plan yet.

alter table public.subscriptions add column if not exists paid   boolean not null default true;
alter table public.subscriptions add column if not exists source text    not null default 'admin';

-- Plan defaults used by sign-up and choose_plan().
create or replace function public.start_subscription(uid uuid, p_plan text, p_pack int) returns void
language plpgsql security definer set search_path = public as $$
declare pk int;
begin
  if p_plan not in ('simple', 'complex', 'premium') then return; end if;
  pk := case when p_pack in (4, 8, 12) then p_pack else 4 end;
  if p_plan = 'premium' then pk := greatest(pk, 12); end if;
  insert into public.subscriptions (user_id, plan, pack_size, credits_total, credits_used, max_active, max_revisions,
                                    status, valid_until, paid, source)
  values (uid, p_plan, pk, pk, 0,
          case when p_plan = 'premium' then 3 else 1 end,
          case when p_plan = 'premium' then 3 else 2 end,
          'active', now() + interval '60 days', false, 'signup');
end $$;
revoke all on function public.start_subscription(uuid, text, int) from public, anon, authenticated;

-- New login → profile (+ plan if one was chosen on the sign-up page).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, company, phone)
  values (new.id, new.email,
          coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
          nullif(new.raw_user_meta_data->>'company', ''),
          nullif(new.raw_user_meta_data->>'phone', ''))
  on conflict (id) do nothing;
  if new.raw_user_meta_data ? 'plan' then
    perform public.start_subscription(new.id, new.raw_user_meta_data->>'plan',
                                      case when (new.raw_user_meta_data->>'pack') ~ '^\d{1,2}$'
                                           then (new.raw_user_meta_data->>'pack')::int else 4 end);
  end if;
  return new;
end $$;

-- Signed-in customer without an active plan picks one from the dashboard.
create or replace function public.choose_plan(p_plan text, p_pack int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Please log in again.'; end if;
  if exists (select 1 from public.subscriptions where user_id = auth.uid() and status = 'active' and valid_until > now()) then
    raise exception 'You already have an active plan.';
  end if;
  if p_plan not in ('simple', 'complex', 'premium') then raise exception 'Choose Simple, Complex or Premium.'; end if;
  perform public.start_subscription(auth.uid(), p_plan, p_pack);
end $$;
grant execute on function public.choose_plan(text, int) to authenticated;
