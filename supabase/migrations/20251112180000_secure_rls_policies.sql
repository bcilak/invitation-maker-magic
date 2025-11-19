-- ====================================
-- SECURE RLS POLICIES FOR ALL TABLES
-- Priority 1: Production-ready security
-- ====================================

-- First, drop all existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view published events" ON public.events;
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Anyone can register" ON public.registrations;
DROP POLICY IF EXISTS "Admins can view all registrations" ON public.registrations;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.page_sections;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.page_sections;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.page_sections;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.page_sections;
DROP POLICY IF EXISTS "Anyone can read event settings" ON public.event_settings;
DROP POLICY IF EXISTS "Authenticated users can update event settings" ON public.event_settings;
DROP POLICY IF EXISTS "Authenticated users can read admin users" ON public.admin_users;

-- ====================================
-- EVENTS TABLE - Secure Policies
-- ====================================

-- Public can read ONLY published events
CREATE POLICY "public_read_published_events"
ON public.events
FOR SELECT
TO anon
USING (status = 'published');

-- Authenticated admins can read all events
CREATE POLICY "admin_read_all_events"
ON public.events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Only admins can insert events
CREATE POLICY "admin_insert_events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Only admins can update events
CREATE POLICY "admin_update_events"
ON public.events
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Only admins can delete events
CREATE POLICY "admin_delete_events"
ON public.events
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- ====================================
-- REGISTRATIONS TABLE - Secure Policies
-- ====================================

-- Anyone (anon) can insert registrations for published events
CREATE POLICY "public_insert_registrations"
ON public.registrations
FOR INSERT
TO anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND status = 'published'
  )
);

-- Authenticated users can insert registrations
CREATE POLICY "authenticated_insert_registrations"
ON public.registrations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only admins can read registrations
CREATE POLICY "admin_read_registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Only admins can delete registrations
CREATE POLICY "admin_delete_registrations"
ON public.registrations
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- ====================================
-- PAGE_SECTIONS TABLE - Secure Policies
-- ====================================

-- Public can read sections for published events only
CREATE POLICY "public_read_sections_published_events"
ON public.page_sections
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND status = 'published'
  )
);

-- Authenticated admins can read all sections
CREATE POLICY "admin_read_all_sections"
ON public.page_sections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Only admins can insert sections
CREATE POLICY "admin_insert_sections"
ON public.page_sections
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Only admins can update sections
CREATE POLICY "admin_update_sections"
ON public.page_sections
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Only admins can delete sections
CREATE POLICY "admin_delete_sections"
ON public.page_sections
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- ====================================
-- EVENT_SETTINGS TABLE - Secure Policies
-- ====================================

-- Public can read active event settings
CREATE POLICY "public_read_active_settings"
ON public.event_settings
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Only admins can insert settings
CREATE POLICY "admin_insert_settings"
ON public.event_settings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- Only admins can update settings
CREATE POLICY "admin_update_settings"
ON public.event_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- ====================================
-- ADMIN_USERS TABLE - Secure Policies
-- ====================================

-- Only authenticated admins can read admin_users
CREATE POLICY "admin_read_admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  )
);

-- No one can insert admin users via API (must be done by superuser)
-- This prevents unauthorized admin creation

-- Only admins can update their own profile
CREATE POLICY "admin_update_own_profile"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (id = auth.uid() AND is_active = true)
WITH CHECK (id = auth.uid());

-- ====================================
-- SECURITY FUNCTIONS
-- ====================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- ====================================
-- INDEXES FOR PERFORMANCE
-- ====================================

-- Add index on admin_users.id for faster policy checks
CREATE INDEX IF NOT EXISTS idx_admin_users_id_active ON public.admin_users(id) WHERE is_active = true;

-- Add index on events.status for public queries
CREATE INDEX IF NOT EXISTS idx_events_status_published ON public.events(status) WHERE status = 'published';

-- Add index on registrations.event_id for joins
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);

-- Add index on page_sections.event_id for joins
CREATE INDEX IF NOT EXISTS idx_page_sections_event_id_visible ON public.page_sections(event_id) WHERE is_visible = true;

-- ====================================
-- REVOKE PUBLIC ACCESS
-- ====================================

-- Revoke all default public access
REVOKE ALL ON public.events FROM PUBLIC;
REVOKE ALL ON public.registrations FROM PUBLIC;
REVOKE ALL ON public.page_sections FROM PUBLIC;
REVOKE ALL ON public.event_settings FROM PUBLIC;
REVOKE ALL ON public.admin_users FROM PUBLIC;

-- Grant specific access through RLS policies only
GRANT SELECT, INSERT ON public.registrations TO anon;
GRANT SELECT ON public.events TO anon;
GRANT SELECT ON public.page_sections TO anon;

GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.registrations TO authenticated;
GRANT ALL ON public.page_sections TO authenticated;
GRANT ALL ON public.event_settings TO authenticated;
GRANT SELECT, UPDATE ON public.admin_users TO authenticated;

-- ====================================
-- SECURITY NOTES
-- ====================================
-- 1. Admin users must be created by database superuser
-- 2. Admin users must have auth.uid() matching admin_users.id
-- 3. All policies check is_active = true for admin users
-- 4. Public users (anon) can only:
--    - Read published events
--    - Read sections for published events
--    - Insert registrations for published events
-- 5. Authenticated non-admin users have no special privileges
-- 6. All admin operations require valid JWT token with matching admin_users.id
