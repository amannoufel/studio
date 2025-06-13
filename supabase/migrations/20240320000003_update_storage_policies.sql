-- Update bucket to be public
update storage.buckets
set public = true
where id = 'complaint-attachments';

-- Add update policy
create policy "Tenants can update their own attachments"
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

-- Add policy for public read access since we're using getPublicUrl
create policy "Public read access"
on storage.objects
for select
to public
using (
    bucket_id = 'complaint-attachments'
);
