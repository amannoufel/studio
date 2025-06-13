-- Create a bucket for complaint attachments
select try_cast_double(value::text) into "size_limit"
from vault.decrypted_secrets
where key = 'MAX_ATTACHMENT_SIZE_MB';

do $$
begin  if not exists (
    select 1
    from storage.buckets
    where id = 'complaint-attachments'
  ) then
    insert into storage.buckets (id, name, public)
    values ('complaint-attachments', 'Complaint Attachments', true);
  end if;
end $$;

-- Drop existing policies if they exist
drop policy if exists "Users can upload complaint attachments" on storage.objects;
drop policy if exists "Users can view their own attachments" on storage.objects;
drop policy if exists "Admins can view all attachments" on storage.objects;

-- Create new policies
create policy "Enable upload for authenticated users"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'complaint-attachments' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Tenants can view their own attachments"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'complaint-attachments'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id::text = auth.uid()::text
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    )
);

create policy "Allow delete own attachments"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'complaint-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Allow update own attachments"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'complaint-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'complaint-attachments'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Enable read access for all users"
on storage.objects
for select
using (bucket_id = 'complaint-attachments' AND auth.uid() IS NOT NULL);

-- Add media_url column to complaints table
alter table if exists public.complaints
add column if not exists media_url text[];
