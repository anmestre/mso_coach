-- Football Team Manager — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL editor to set up your database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- SEASONS
-- ============================================================
create table if not exists seasons (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  start_date date not null,
  end_date date not null,
  competitions text[] default '{}',
  is_current boolean not null default false,
  created_at timestamptz default now()
);

-- Ensure only one current season at a time
create unique index if not exists seasons_is_current_true
  on seasons (is_current) where is_current = true;

-- ============================================================
-- PLAYERS
-- ============================================================
create type if not exists position_enum as enum (
  'GK','RB','CB','LB','CDM','CM','CAM','RM','LM','RW','LW','ST','CF','SS'
);

create type if not exists squad_status_enum as enum (
  'active','injured','suspended','inactive'
);

create type if not exists preferred_foot_enum as enum (
  'left','right','both'
);

create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  nickname text,
  date_of_birth date not null,
  photo_url text,
  phone text,
  email text,
  primary_position position_enum not null,
  secondary_positions position_enum[] default '{}',
  preferred_foot preferred_foot_enum not null default 'right',
  jersey_number smallint,
  squad_status squad_status_enum not null default 'active',
  join_date date not null default current_date,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- PLAYER AVAILABILITY
-- ============================================================
create type if not exists availability_reason_enum as enum (
  'injury','suspension','personal','holiday','work'
);

create table if not exists player_availability (
  id uuid primary key default uuid_generate_v4(),
  player_id uuid not null references players(id) on delete cascade,
  from_date date not null,
  to_date date not null,
  reason availability_reason_enum not null,
  notes text,
  game_ids uuid[] default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- OPPONENTS
-- ============================================================
create table if not exists opponents (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  short_name text,
  logo_url text,
  home_ground text,
  usual_formation text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- SCOUTING REPORTS
-- ============================================================
create table if not exists scouting_reports (
  id uuid primary key default uuid_generate_v4(),
  opponent_id uuid not null references opponents(id) on delete cascade,
  date date not null default current_date,
  game_id uuid,
  analyst_notes text not null default '',
  strengths text[] default '{}',
  weaknesses text[] default '{}',
  key_players text[] default '{}',
  set_piece_notes text,
  recommended_strategy text,
  created_at timestamptz default now()
);

-- ============================================================
-- GAMES
-- ============================================================
create type if not exists game_type_enum as enum ('friendly','championship','cup');
create type if not exists home_away_enum as enum ('home','away','neutral');
create type if not exists game_status_enum as enum ('scheduled','completed','cancelled','postponed');
create type if not exists result_enum as enum ('win','draw','loss');

create table if not exists games (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid not null references seasons(id) on delete cascade,
  type game_type_enum not null default 'friendly',
  competition_name text,
  round text,
  home_away home_away_enum not null default 'home',
  opponent_id uuid not null references opponents(id),
  date timestamptz not null,
  venue text not null default '',
  status game_status_enum not null default 'scheduled',
  score_us smallint,
  score_them smallint,
  result result_enum,
  notes text,
  created_at timestamptz default now()
);

-- Auto-compute result from score
create or replace function compute_game_result()
returns trigger as $$
begin
  if new.score_us is not null and new.score_them is not null then
    if new.score_us > new.score_them then
      new.result := 'win';
    elsif new.score_us = new.score_them then
      new.result := 'draw';
    else
      new.result := 'loss';
    end if;
    new.status := 'completed';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger games_compute_result
  before insert or update on games
  for each row execute function compute_game_result();

-- ============================================================
-- MATCH DAY RECORDS
-- ============================================================
create table if not exists match_day_records (
  id uuid primary key default uuid_generate_v4(),
  game_id uuid not null unique references games(id) on delete cascade,
  formation text not null default '4-4-2',
  tactics_notes text,
  opponent_notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- SQUAD SLOTS (starting XI + bench)
-- ============================================================
create table if not exists squad_slots (
  id uuid primary key default uuid_generate_v4(),
  match_day_record_id uuid not null references match_day_records(id) on delete cascade,
  player_id uuid not null references players(id),
  position position_enum not null,
  slot_number smallint not null,  -- 1-11 starters, 12-18 bench
  unique(match_day_record_id, slot_number)
);

-- ============================================================
-- MATCH EVENTS
-- ============================================================
create type if not exists match_event_type_enum as enum (
  'goal','own_goal','yellow_card','red_card','substitution','injury',
  'penalty_scored','penalty_missed'
);

create table if not exists match_events (
  id uuid primary key default uuid_generate_v4(),
  match_day_record_id uuid not null references match_day_records(id) on delete cascade,
  type match_event_type_enum not null,
  minute smallint not null,
  player_id uuid not null references players(id),
  player_off_id uuid references players(id),
  assist_player_id uuid references players(id),
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- TRAINING SESSIONS
-- ============================================================
create type if not exists session_type_enum as enum (
  'technical','tactical','physical','recovery','set_pieces','scrimmage','mixed'
);

create table if not exists training_sessions (
  id uuid primary key default uuid_generate_v4(),
  season_id uuid not null references seasons(id) on delete cascade,
  date timestamptz not null,
  duration_minutes smallint not null default 90,
  location text not null default '',
  type session_type_enum not null default 'mixed',
  title text not null,
  description text,
  objectives text[] default '{}',
  created_at timestamptz default now()
);

-- ============================================================
-- DRILLS
-- ============================================================
create table if not exists drills (
  id uuid primary key default uuid_generate_v4(),
  training_session_id uuid references training_sessions(id) on delete cascade,
  name text not null,
  duration_minutes smallint not null default 15,
  category text not null default '',
  description text,
  diagram_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- TRAINING ATTENDANCE
-- ============================================================
create type if not exists attendance_status_enum as enum (
  'present','absent','late','excused'
);

create table if not exists training_attendance (
  id uuid primary key default uuid_generate_v4(),
  training_session_id uuid not null references training_sessions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  status attendance_status_enum not null default 'present',
  note text,
  unique(training_session_id, player_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (enable after setting up auth)
-- ============================================================
-- alter table players enable row level security;
-- alter table games enable row level security;
-- etc.

-- ============================================================
-- SEED: current season
-- ============================================================
insert into seasons (name, start_date, end_date, competitions, is_current)
values ('2025/26', '2025-08-01', '2026-05-31', array['Liga Distrital', 'Taça AF Lisboa'], true)
on conflict do nothing;
