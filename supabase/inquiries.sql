create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  submitted_at timestamptz not null,
  status text not null default 'new',
  notes text not null default '',
  source text not null default 'artifice-site',
  name text not null,
  email text not null,
  event_type text not null,
  event_date text,
  location text,
  message text not null
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);
