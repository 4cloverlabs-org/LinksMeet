ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS executed_workflows JSONB DEFAULT '[]'::jsonb;
