-- =============================================================================
-- LinksMeet — Team Members Table & RLS Policies
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'Member' NOT NULL,
  status text DEFAULT 'Active' NOT NULL,
  department text DEFAULT 'Unassigned',
  phone text,
  workflow_progress integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Alter existing table to add new columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='department') THEN
    ALTER TABLE public.team_members ADD COLUMN department text DEFAULT 'Unassigned';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='phone') THEN
    ALTER TABLE public.team_members ADD COLUMN phone text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='team_members' AND column_name='workflow_progress') THEN
    ALTER TABLE public.team_members ADD COLUMN workflow_progress integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see all their own team members
DROP POLICY IF EXISTS "team_members_select_own" ON public.team_members;
CREATE POLICY "team_members_select_own" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own team members
DROP POLICY IF EXISTS "team_members_insert_own" ON public.team_members;
CREATE POLICY "team_members_insert_own" ON public.team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own team members
DROP POLICY IF EXISTS "team_members_update_own" ON public.team_members;
CREATE POLICY "team_members_update_own" ON public.team_members
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own team members
DROP POLICY IF EXISTS "team_members_delete_own" ON public.team_members;
CREATE POLICY "team_members_delete_own" ON public.team_members
  FOR DELETE USING (auth.uid() = user_id);
