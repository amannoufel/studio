-- Add approved column to jobs table
alter table public.jobs add column if not exists approved boolean default false;

-- Allow anyone to read the approved status
create policy "Anyone can read job approval status"
  on public.jobs
  for select
  using (true);
