create table if not exists public.materials (
  code text primary key,
  name text not null
);

-- Initial sample data
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
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name;

-- Add RLS policy
alter table public.materials enable row level security;

create policy "Materials are viewable by authenticated users" on public.materials
  for select
  to authenticated
  using (true);

create policy "Materials are editable by admin users" on public.materials
  for all
  to authenticated
  using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');
