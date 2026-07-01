-- USAXresearch Supabase Schema

-- profiles
create table if not exists public.profiles (
  id               uuid primary key references auth.users on delete cascade,
  email            text,
  display_name     text,
  avatar_url       text,
  plan             text not null default 'free', -- free | pro | elite
  trial_ends_at    timestamptz,
  trial_started_at timestamptz,
  trial_type       text,                          -- free_trial | referral | expired
  telegram_chat_id text,
  telegram_enabled boolean not null default false,
  referral_code    text unique,
  referred_by      text references public.profiles(referral_code),
  created_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "service can insert profiles" on public.profiles for insert with check (true);

-- payments
create table if not exists public.payments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references public.profiles(id) on delete cascade,
  plan         text not null,
  amount       integer,              -- สตางค์ หรือ บาทก็ได้ (ตามที่ส่งมา)
  method       text,                 -- promptpay | card
  slip_url     text,
  ai_verified  boolean,
  ai_result    jsonb,
  status       text not null default 'pending', -- pending | approved | rejected
  approved_at  timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.payments enable row level security;
create policy "users can read own payments" on public.payments for select using (auth.uid() = user_id);
create policy "service can insert payments" on public.payments for insert with check (true);
create policy "service can update payments" on public.payments for update using (true);

-- referrals
create table if not exists public.referrals (
  id           uuid primary key default gen_random_uuid(),
  referrer_id  uuid references public.profiles(id) on delete cascade,
  referred_id  uuid references public.profiles(id) on delete cascade,
  status       text not null default 'pending', -- pending | completed | rewarded
  created_at   timestamptz not null default now()
);

alter table public.referrals enable row level security;
create policy "users can read own referrals" on public.referrals for select using (auth.uid() = referrer_id);
create policy "service can insert referrals" on public.referrals for insert with check (true);
create policy "service can update referrals" on public.referrals for update using (true);

-- watchlists
create table if not exists public.user_watchlists (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  tickers       text[] not null default '{}',
  alert_tickers text[] not null default '{}',
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

alter table public.user_watchlists enable row level security;
create policy "users can read own watchlist" on public.user_watchlists for select using (auth.uid() = user_id);
create policy "users can insert own watchlist" on public.user_watchlists for insert with check (auth.uid() = user_id);
create policy "users can update own watchlist" on public.user_watchlists for update using (auth.uid() = user_id);
create policy "users can delete own watchlist" on public.user_watchlists for delete using (auth.uid() = user_id);

-- portfolios
create table if not exists public.user_portfolios (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  positions  jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.user_portfolios enable row level security;
create policy "users can read own portfolio" on public.user_portfolios for select using (auth.uid() = user_id);
create policy "users can insert own portfolio" on public.user_portfolios for insert with check (auth.uid() = user_id);
create policy "users can update own portfolio" on public.user_portfolios for update using (auth.uid() = user_id);
create policy "users can delete own portfolio" on public.user_portfolios for delete using (auth.uid() = user_id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
