-- =============================================================================
-- LinksMeet — Update event_types table for Calendar Layout Features
-- =============================================================================
-- Run this script in the Supabase SQL Editor to add the necessary columns.
-- =============================================================================

ALTER TABLE public.event_types 
  ADD COLUMN IF NOT EXISTS allowed_layouts TEXT,
  ADD COLUMN IF NOT EXISTS default_layout TEXT;
