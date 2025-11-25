-- Create Profiles Table (for Clients)
create table public.profiles (
  id text primary key,
  email text,
  password text,
  company_name text,
  role text default 'client',
  phone text,
  address text,
  payment_method text,
  discount_rate float default 1.0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create Products Table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name_cn text,
  name_fr text,
  department text,
  price_unit float,
  price_case float,
  taxable boolean default false,
  image_url text,
  stock int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id text,
  user_name text,
  sub_total float,
  tax_tps float,
  tax_tvq float,
  total float,
  status text default 'pending',
  delivery_method text,
  delivery_time text,
  order_details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Create Policies (Permissive for Demo/B2B Context)
-- Allow public read/write access to all tables to ensure the demo works without complex auth setup
create policy "Public profiles access" on public.profiles for all using (true) with check (true);
create policy "Public products access" on public.products for all using (true) with check (true);
create policy "Public orders access" on public.orders for all using (true) with check (true);

-- Create Storage Bucket for Products (if not exists)
insert into storage.buckets (id, name, public) 
values ('products', 'products', true)
on conflict (id) do nothing;

-- Allow public access to storage
create policy "Public Access" on storage.objects for all using ( bucket_id = 'products' );
