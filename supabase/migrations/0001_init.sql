create extension if not exists "pgcrypto";

create table events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,
  player_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table buttons (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  code text not null unique,
  location_name text not null,
  status text not null default 'unused' check (status in ('unused','used')),
  used_by uuid references players(id),
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index buttons_event_id_idx on buttons(event_id);
create index buttons_code_idx on buttons(code);

create table scores (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  delta integer not null,
  reason text,
  admin_id uuid,
  created_at timestamptz not null default now()
);

create index scores_player_id_idx on scores(player_id);

create table admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null default 'admin'
);

create table event_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table events enable row level security;
alter table players enable row level security;
alter table buttons enable row level security;
alter table scores enable row level security;
alter table admins enable row level security;
alter table event_logs enable row level security;

create policy "public read events" on events for select using (true);
create policy "public read buttons" on buttons for select using (true);
create policy "public read players" on players for select using (true);
create policy "public read scores" on scores for select using (true);
