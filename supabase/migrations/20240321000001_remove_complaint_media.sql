-- Remove storage bucket and policies for complaint attachments
drop policy if exists "Enable upload for authenticated users" on storage.objects;
drop policy if exists "Tenants can view their own attachments" on storage.objects;
drop policy if exists "Allow delete own attachments" on storage.objects;
drop policy if exists "Tenants can update their own attachments" on storage.objects;
drop policy if exists "Public read access" on storage.objects;

do $$
begin
  -- Drop the bucket if it exists
  if exists (
    select 1
    from storage.buckets
    where id = 'complaint-attachments'
  ) then
    delete from storage.objects where bucket_id = 'complaint-attachments';
    delete from storage.buckets where id = 'complaint-attachments';
  end if;
end $$;

-- Drop media_url column from complaints table
alter table public.complaints drop column if exists media_url;

-- Drop any remaining storage policies that might have been missed
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN (
        SELECT pol.policyname
        FROM pg_policies pol
        JOIN pg_class cls ON pol.tablename = cls.relname
        JOIN pg_namespace ns ON cls.relnamespace = ns.oid
        WHERE ns.nspname = 'storage'
        AND pol.tablename = 'objects'
        AND pol.qual::text LIKE '%complaint-attachments%'
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
    END LOOP;
END $$;
