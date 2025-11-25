-- Add delivery_method and delivery_time columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_method text,
ADD COLUMN IF NOT EXISTS delivery_time text;
