-- Add staff and store columns to complaints table
alter table public.complaints 
add column if not exists staff text default '',
add column if not exists store text default '';

-- Update any existing records to have empty strings for these fields
update public.complaints 
set staff = '', store = '' 
where staff is null or store is null;
