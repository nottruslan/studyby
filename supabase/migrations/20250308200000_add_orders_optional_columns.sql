-- Optional columns for order details (text works vs tech works, extra context)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS originality integer,
  ADD COLUMN IF NOT EXISTS plagiarism_system text,
  ADD COLUMN IF NOT EXISTS volume text,
  ADD COLUMN IF NOT EXISTS university text,
  ADD COLUMN IF NOT EXISTS professor text;
