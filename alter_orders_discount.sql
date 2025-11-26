ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_rate float DEFAULT 1.0;
