-- =============================================================================
-- LinksMeet — Team Members RLS Policies Update
-- =============================================================================
-- Run this script in the Supabase SQL Editor to grant Team Members access
-- to the Workspace Owner's data based on their roles (Member vs Admin).
-- =============================================================================

-- 1. Helper functions to securely check roles
CREATE OR REPLACE FUNCTION is_team_member(workspace_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = workspace_id
      AND email = auth.jwt()->>'email'
      AND status = 'Active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_team_admin(workspace_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = workspace_id
      AND email = auth.jwt()->>'email'
      AND status = 'Active'
      AND role = 'Admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Apply Policies to Contacts
DROP POLICY IF EXISTS "contacts_team_read" ON public.contacts;
CREATE POLICY "contacts_team_read" ON public.contacts
  FOR SELECT USING (is_team_member(user_id));

DROP POLICY IF EXISTS "contacts_team_write" ON public.contacts;
CREATE POLICY "contacts_team_write" ON public.contacts
  FOR ALL USING (is_team_admin(user_id)) WITH CHECK (is_team_admin(user_id));

-- 3. Apply Policies to Bookings
DROP POLICY IF EXISTS "bookings_team_read" ON public.bookings;
CREATE POLICY "bookings_team_read" ON public.bookings
  FOR SELECT USING (is_team_member(user_id));

DROP POLICY IF EXISTS "bookings_team_write" ON public.bookings;
CREATE POLICY "bookings_team_write" ON public.bookings
  FOR ALL USING (is_team_admin(user_id)) WITH CHECK (is_team_admin(user_id));

-- 4. Apply Policies to Event Types
DROP POLICY IF EXISTS "event_types_team_read" ON public.event_types;
CREATE POLICY "event_types_team_read" ON public.event_types
  FOR SELECT USING (is_team_member(user_id));

DROP POLICY IF EXISTS "event_types_team_write" ON public.event_types;
CREATE POLICY "event_types_team_write" ON public.event_types
  FOR ALL USING (is_team_admin(user_id)) WITH CHECK (is_team_admin(user_id));

-- 5. Apply Policies to Campaigns (If campaigns table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') THEN
    DROP POLICY IF EXISTS "campaigns_team_read" ON public.campaigns;
    CREATE POLICY "campaigns_team_read" ON public.campaigns
      FOR SELECT USING (is_team_member(user_id));

    DROP POLICY IF EXISTS "campaigns_team_write" ON public.campaigns;
    CREATE POLICY "campaigns_team_write" ON public.campaigns
      FOR ALL USING (is_team_admin(user_id)) WITH CHECK (is_team_admin(user_id));
  END IF;
END
$$;

-- 6. Apply Policies to Team Members (Allow members to see who else is on the team)
DROP POLICY IF EXISTS "team_members_team_read" ON public.team_members;
CREATE POLICY "team_members_team_read" ON public.team_members
  FOR SELECT USING (is_team_member(user_id));
