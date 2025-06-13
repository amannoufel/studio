-- RLS policies for complaints table
alter table if exists public.complaints enable row level security;

-- Allow authenticated users to view their own complaints (tenants)
create policy "Users can view their own complaints"
on public.complaints for select
to authenticated
using (
  auth.uid()::text = tenant_id
);

-- Allow admins to view all complaints
create policy "Admins can view all complaints"
on public.complaints for select
to authenticated
using (
  auth.jwt()->>'role' = 'admin'
);

-- Allow authenticated users to insert their own complaints
create policy "Users can insert their own complaints"
on public.complaints for insert
to authenticated
with check (
  auth.uid()::text = tenant_id
);

-- Allow admins to update any complaint
create policy "Admins can update any complaint"
on public.complaints for update
to authenticated
using (
  auth.jwt()->>'role' = 'admin'
)
with check (
  auth.jwt()->>'role' = 'admin'
);

-- Allow admins to delete any complaint
create policy "Admins can delete any complaint"
on public.complaints for delete
to authenticated
using (
  auth.jwt()->>'role' = 'admin'
);
