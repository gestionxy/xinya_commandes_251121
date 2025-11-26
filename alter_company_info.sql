-- Create Company Info Table
create table if not exists public.company_info (
  id uuid default gen_random_uuid() primary key,
  name text,
  address text,
  postal_code text,
  email text,
  phone text,
  gst text,
  qst text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.company_info enable row level security;

-- Create Policy (Public Access)
create policy "Public company_info access" on public.company_info for all using (true) with check (true);

-- Insert default record if not exists
insert into public.company_info (name)
select 'My Company'
where not exists (select 1 from public.company_info);
