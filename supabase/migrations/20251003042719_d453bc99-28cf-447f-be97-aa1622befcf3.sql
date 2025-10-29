-- Add hostel details to orders table
ALTER TABLE public.orders
ADD COLUMN hostel_name TEXT,
ADD COLUMN room_number TEXT;

-- Remove automatic time-based pricing, prices will be admin-managed
-- Pricing rules table already exists for admin to set custom prices