-- Create materials table
create table if not exists public.materials (
  code text primary key,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies
alter table public.materials enable row level security;

-- Allow anyone to read materials (even without authentication)
create policy "Anyone can read materials"
  on public.materials
  for select
  using (true);

-- Only admins can modify materials
create policy "Only admins can insert materials"
  on public.materials
  for insert
  to authenticated
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can update materials"
  on public.materials
  for update
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Only admins can delete materials"
  on public.materials
  for delete
  to authenticated
  using (auth.jwt() ->> 'role' = 'admin');

-- Insert initial materials data
insert into public.materials (code, name) values
  ('E001', 'LED Bulb 10W'),
  ('E002', 'LED Tube Light 20W'),
  ('E003', 'MCB Single Pole'),
  ('E004', 'Fan Capacitor'),
  ('E005', 'Switch 6A'),
  ('P001', 'PVC Pipe 1/2 inch'),
  ('P002', 'Ball Valve 1/2 inch'),
  ('P003', 'Tank Float Valve'),
  ('P004', 'Sink Trap'),
  ('P005', 'Water Tap'),
  ('A001', 'AC Filter'),
  ('A002', 'AC Gas R22'),
  ('A003', 'AC Capacitor'),
  ('A004', 'AC Fan Motor'),
  ('A005', 'AC Remote Control')
on conflict (code) do update set name = EXCLUDED.name;
