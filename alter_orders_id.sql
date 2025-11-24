-- Alter orders table to change id from UUID to TEXT
-- This is necessary because the application generates custom string IDs (e.g., ClientName_20241124...)
-- which are incompatible with the default UUID type.

-- First, we need to drop the default value which generates UUIDs
ALTER TABLE public.orders ALTER COLUMN id DROP DEFAULT;

-- Then we alter the column type to text
-- Note: If there are existing UUIDs, they will be cast to text automatically
ALTER TABLE public.orders ALTER COLUMN id TYPE text;

-- Optional: If you want to ensure the column is not null (it's a primary key so it should be implicitly)
ALTER TABLE public.orders ALTER COLUMN id SET NOT NULL;
