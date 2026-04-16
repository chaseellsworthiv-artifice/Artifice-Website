create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  inquiry_id uuid references public.inquiries(id) on delete set null,
  status text not null default 'pending',
  notes text not null default '',
  contact_name text not null,
  contact_email text not null,
  event_type text not null,
  event_date text,
  location text,
  message text,
  selected_slot_start timestamptz,
  selected_slot_end timestamptz
);

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_inquiry_id_idx on public.bookings (inquiry_id);
