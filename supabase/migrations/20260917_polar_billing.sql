-- Polar billing columns on profiles.
-- Safe to re-run. Does not drop existing columns.

do $$
declare
  cname text;
begin
  select conname into cname
  from pg_constraint
  where conrelid = 'public.profiles'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ~* 'plan';
  if cname is not null then
    execute format('alter table public.profiles drop constraint %I', cname);
  end if;
end $$;

update public.profiles set plan = 'pro' where plan = 'paid';

alter table public.profiles
  add column if not exists billing_interval text,
  add column if not exists polar_customer_id text,
  add column if not exists polar_subscription_id text,
  add column if not exists polar_product_id text,
  add column if not exists plan_status text,
  add column if not exists plan_current_period_end timestamptz;

alter table public.profiles
  drop constraint if exists profiles_plan_check,
  drop constraint if exists profiles_billing_interval_check,
  drop constraint if exists profiles_plan_status_check;

alter table public.profiles
  add constraint profiles_plan_check check (plan in ('free', 'pro')),
  add constraint profiles_billing_interval_check
    check (billing_interval is null or billing_interval in ('month', 'year')),
  add constraint profiles_plan_status_check
    check (plan_status is null or plan_status in ('active', 'canceled', 'past_due', 'revoked'));

create index if not exists profiles_polar_customer_id_idx
  on public.profiles (polar_customer_id);

create index if not exists profiles_polar_subscription_id_idx
  on public.profiles (polar_subscription_id);

-- Billing columns are readable with the existing public/select policy
-- (needed for public-page branding). Writes from the logged-in user are
-- blocked; only the service role (webhook) may change them.
create or replace function public.protect_profile_billing()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.role(), '') = 'service_role' or current_user = 'postgres' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.plan := 'free';
    new.billing_interval := null;
    new.polar_customer_id := null;
    new.polar_subscription_id := null;
    new.polar_product_id := null;
    new.plan_status := null;
    new.plan_current_period_end := null;
    return new;
  end if;

  new.plan := old.plan;
  new.billing_interval := old.billing_interval;
  new.polar_customer_id := old.polar_customer_id;
  new.polar_subscription_id := old.polar_subscription_id;
  new.polar_product_id := old.polar_product_id;
  new.plan_status := old.plan_status;
  new.plan_current_period_end := old.plan_current_period_end;
  return new;
end;
$$;

drop trigger if exists protect_profile_billing on public.profiles;
create trigger protect_profile_billing
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_billing();
