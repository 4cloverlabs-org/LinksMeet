-- =============================================================================
-- SaleMail — Row Level Security (RLS) policies
-- =============================================================================
-- WHY THIS FILE EXISTS
-- Without RLS, the Supabase *anon* key (which ships inside the browser bundle and
-- is therefore PUBLIC) can read every row of every table. That means anyone could
-- dump all users' emails AND their Google OAuth tokens (google_tokens), giving them
-- persistent access to victims' Gmail/Calendar. RLS must be ENABLED on every table
-- in the `public` schema.
--
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor).
-- The backend (server/server.js) uses the SERVICE ROLE key, which bypasses RLS,
-- so server-side booking creation and token refresh keep working.
-- =============================================================================

-- ---- users ------------------------------------------------------------------
-- Contains email + google_tokens (refresh/access tokens). NEVER publicly readable.
alter table public.users enable row level security;

drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---- contacts ---------------------------------------------------------------
-- CRM leads (names, emails, phones). Private to the owning user only.
alter table public.contacts enable row level security;

drop policy if exists "contacts_all_own" on public.contacts;
create policy "contacts_all_own" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- bookings ---------------------------------------------------------------
-- Contains booker PII (booker_name, booker_email). Private to the owner.
-- Public bookings are inserted by the backend using the service role (bypasses RLS).
alter table public.bookings enable row level security;

drop policy if exists "bookings_all_own" on public.bookings;
create policy "bookings_all_own" on public.bookings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---- event_types ------------------------------------------------------------
-- Public booking pages need to read these anonymously, so SELECT is open.
-- They contain only non-sensitive scheduling info (title/description/duration).
-- Writes are restricted to the owning user.
alter table public.event_types enable row level security;

drop policy if exists "event_types_public_read" on public.event_types;
create policy "event_types_public_read" on public.event_types
  for select using (true);

drop policy if exists "event_types_insert_own" on public.event_types;
create policy "event_types_insert_own" on public.event_types
  for insert with check (auth.uid() = user_id);

drop policy if exists "event_types_update_own" on public.event_types;
create policy "event_types_update_own" on public.event_types
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "event_types_delete_own" on public.event_types;
create policy "event_types_delete_own" on public.event_types
  for delete using (auth.uid() = user_id);

-- =============================================================================
-- VERIFY: every table below should show rowsecurity = true
-- select tablename, rowsecurity from pg_tables where schemaname = 'public';
-- =============================================================================
