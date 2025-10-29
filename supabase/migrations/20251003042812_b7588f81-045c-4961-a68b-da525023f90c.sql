-- Fix function search paths for security
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- The other functions already have proper search_path set