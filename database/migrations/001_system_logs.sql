-- System logs table for HosFlow/Hova
-- Run this in your Supabase SQL editor to create the system_logs table.

create table if not exists public.system_logs (
  id          uuid        not null default gen_random_uuid() primary key,
  severity    text        not null default 'info'
                          check (severity in ('info', 'warn', 'error', 'critical')),
  module      text        not null default 'system',
  message     text        not null,
  details     jsonb,
  created_at  timestamptz not null default now()
);

-- Indexes for efficient filtering and ordering
create index if not exists idx_system_logs_created_at on public.system_logs (created_at desc);
create index if not exists idx_system_logs_severity   on public.system_logs (severity);
create index if not exists idx_system_logs_module     on public.system_logs (module);

-- Enable Row Level Security
alter table public.system_logs enable row level security;

-- Only super_admins can read; backend service role can write
create policy "super_admin_read_system_logs"
  on public.system_logs for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'super_admin'
    )
  );

create policy "service_role_write_system_logs"
  on public.system_logs for insert
  with check (true);

-- Enable Realtime for live log streaming
alter publication supabase_realtime add table public.system_logs;
