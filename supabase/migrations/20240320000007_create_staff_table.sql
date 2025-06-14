-- Create staff table
create table if not exists public.staff (
  id text primary key,
  name text not null,
  designation text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.staff enable row level security;

-- Allow anyone to read staff data
create policy "Anyone can read staff"
  on public.staff
  for select
  using (true);

-- Only admins can modify staff
create policy "Only admins can insert staff"
  on public.staff
  for insert
  to authenticated
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can update staff"
  on public.staff
  for update
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can delete staff"
  on public.staff
  for delete
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin');

-- Insert initial staff data
insert into public.staff (id, name, designation) values
  ('MAINT001', 'John Smith', 'Electrical Technician'),
  ('MAINT002', 'David Wilson', 'Plumbing Specialist'),
  ('MAINT003', 'Sarah Johnson', 'AC Technician'),
  ('MAINT004', 'Mike Brown', 'General Maintenance'),
  ('MAINT005', 'Robert Taylor', 'Electrical Technician')
on conflict (id) do update set 
  name = EXCLUDED.name,
  designation = EXCLUDED.designation;
