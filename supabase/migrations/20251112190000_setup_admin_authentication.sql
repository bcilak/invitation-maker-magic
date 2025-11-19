-- ====================================
-- ADMIN AUTHENTICATION WITH SUPABASE AUTH
-- Priority 2: JWT-based secure authentication
-- ====================================

-- Drop old admin_users table (we'll use auth.users instead)
-- But keep it for reference and migrate to auth.users
-- Create admin_profiles table that extends auth.users

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read their own profile
CREATE POLICY "admin_read_own_profile"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy: Admins can update their own profile
CREATE POLICY "admin_update_own_profile"
ON public.admin_profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Create function to automatically update last_login
CREATE OR REPLACE FUNCTION public.update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.admin_profiles
  SET last_login = now()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating updated_at
CREATE OR REPLACE TRIGGER update_admin_profiles_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_profiles_id_active ON public.admin_profiles(id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);

-- ====================================
-- MIGRATE EXISTING ADMIN USERS TO AUTH
-- ====================================

-- Note: You need to manually create admin users via Supabase Dashboard or SQL
-- Example SQL to create admin user (run in Supabase SQL Editor):

-- Step 1: Create auth user (use Supabase Dashboard Authentication section)
-- Or use this function:

CREATE OR REPLACE FUNCTION public.create_admin_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_role TEXT DEFAULT 'admin'
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Note: This requires service_role key or must be run by superuser
  -- In production, create users via Supabase Dashboard
  
  -- Insert into auth.users (simplified - actual implementation varies)
  -- This is a placeholder - use Supabase Dashboard for creating users
  
  RAISE NOTICE 'Please create user via Supabase Dashboard Authentication section';
  RAISE NOTICE 'Email: %, Password: %, Then add to admin_profiles', p_email, p_password;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- UPDATE RLS POLICIES TO USE admin_profiles
-- ====================================

-- Drop old policies that check admin_users
DROP POLICY IF EXISTS "admin_read_all_events" ON public.events;
DROP POLICY IF EXISTS "admin_insert_events" ON public.events;
DROP POLICY IF EXISTS "admin_update_events" ON public.events;
DROP POLICY IF EXISTS "admin_delete_events" ON public.events;

DROP POLICY IF EXISTS "admin_read_registrations" ON public.registrations;
DROP POLICY IF EXISTS "admin_delete_registrations" ON public.registrations;

DROP POLICY IF EXISTS "admin_read_all_sections" ON public.page_sections;
DROP POLICY IF EXISTS "admin_insert_sections" ON public.page_sections;
DROP POLICY IF EXISTS "admin_update_sections" ON public.page_sections;
DROP POLICY IF EXISTS "admin_delete_sections" ON public.page_sections;

DROP POLICY IF EXISTS "admin_insert_settings" ON public.event_settings;
DROP POLICY IF EXISTS "admin_update_settings" ON public.event_settings;

-- Recreate with admin_profiles check

-- EVENTS
CREATE POLICY "admin_read_all_events"
ON public.events FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "admin_insert_events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_events"
ON public.events FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_events"
ON public.events FOR DELETE TO authenticated
USING (public.is_admin());

-- REGISTRATIONS
CREATE POLICY "admin_read_registrations"
ON public.registrations FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "admin_delete_registrations"
ON public.registrations FOR DELETE TO authenticated
USING (public.is_admin());

-- PAGE_SECTIONS
CREATE POLICY "admin_read_all_sections"
ON public.page_sections FOR SELECT TO authenticated
USING (public.is_admin());

CREATE POLICY "admin_insert_sections"
ON public.page_sections FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_sections"
ON public.page_sections FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "admin_delete_sections"
ON public.page_sections FOR DELETE TO authenticated
USING (public.is_admin());

-- EVENT_SETTINGS
CREATE POLICY "admin_insert_settings"
ON public.event_settings FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "admin_update_settings"
ON public.event_settings FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ====================================
-- INSTRUCTIONS FOR SETUP
-- ====================================

-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" and create admin user:
--    - Email: admin@yourdomain.com
--    - Password: (secure password)
--    - Auto Confirm User: ON
-- 3. Copy the User ID
-- 4. Run this SQL to add to admin_profiles:

-- INSERT INTO public.admin_profiles (id, full_name, role)
-- VALUES ('USER_ID_FROM_STEP_3', 'Admin Full Name', 'super_admin');

-- 5. Update AdminLogin.tsx to use Supabase auth

COMMENT ON TABLE public.admin_profiles IS 'Admin user profiles extending auth.users. Create users via Supabase Dashboard Authentication, then add profile here.';
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if current user is an active admin. Used in RLS policies.';
