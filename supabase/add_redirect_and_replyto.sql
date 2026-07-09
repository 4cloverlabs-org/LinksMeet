-- =============================================================================
-- LinksMeet — Update event_types table for Redirect and Reply-To Features
-- =============================================================================
-- Run this script in the Supabase SQL Editor to add the necessary columns.
-- =============================================================================

ALTER TABLE public.event_types 
  ADD COLUMN IF NOT EXISTS redirect_url TEXT,
  ADD COLUMN IF NOT EXISTS reply_to_email TEXT;
