create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  created_at timestamptz default now()
);

create table if not exists ad_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  meta_account_id text not null,
  meta_access_token text not null,
  account_name text,
  created_at timestamptz default now()
);

create table if not exists ad_metrics (
  id uuid primary key default gen_random_uuid(),
  ad_account_id uuid references ad_accounts(id) on delete cascade,
  meta_ad_id text not null,
  ad_name text,
  frequency numeric,
  ctr numeric,
  cpm numeric,
  fatigue_score numeric,
  fatigue_state text,
  days_to_fatigue integer,
  checked_at timestamptz default now()
);

create index if not exists idx_ad_metrics_ad_account
  on ad_metrics (ad_account_id, checked_at desc);
