-- Run this in Supabase: Dashboard -> SQL Editor -> New Query -> paste -> Run
-- This creates the 3 tables the app needs to work.

-- One row per person who signs up (linked to their Clerk account)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  created_at timestamptz default now()
);

-- One row per Meta ad account someone connects
create table if not exists ad_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  meta_account_id text not null,
  meta_access_token text not null, -- encrypted at rest by Supabase
  account_name text,
  created_at timestamptz default now()
);

-- One row per ad, per day it's checked — this is the history that
-- powers the fatigue score and the "days-to-fatigue" countdown
create table if not exists ad_metrics (
  id uuid primary key default gen_random_uuid(),
  ad_account_id uuid references ad_accounts(id) on delete cascade,
  meta_ad_id text not null,
  ad_name text,
  frequency numeric,
  ctr numeric,
  cpm numeric,
  fatigue_score numeric,        -- 0 (healthy) to 100 (fully fatigued)
  fatigue_state text,           -- 'green' | 'amber' | 'red'
  days_to_fatigue integer,      -- estimated days left before break-even
  checked_at timestamptz default now()
);

-- Speeds up "get the latest reading for each ad" queries
create index if not exists idx_ad_metrics_ad_account
  on ad_metrics (ad_account_id, checked_at desc);
