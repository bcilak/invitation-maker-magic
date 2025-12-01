-- Admin Seed Migration
-- Run this AFTER running 20251112190000_setup_admin_authentication.sql
-- This creates a default admin user for initial setup

-- IMPORTANT: This script creates the admin_profiles entry only.
-- You must FIRST create the user in Supabase Dashboard:
-- 1. Go to Authentication > Users > Add User
-- 2. Create user with email: admin@etkinlik.local and a secure password
-- 3. Copy the user's UUID
-- 4. Update the 'admin_user_id' variable below with the UUID
-- 5. Run this migration

-- Example admin setup (replace with actual UUID from Supabase Dashboard):
DO $$
DECLARE
    -- REPLACE THIS with the actual user UUID from Supabase Dashboard
    admin_user_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Only insert if the user exists and isn't already an admin
    IF admin_user_id != '00000000-0000-0000-0000-000000000000' THEN
        INSERT INTO public.admin_profiles (id, full_name, role, is_active)
        VALUES (
            admin_user_id,
            'Site Yöneticisi',
            'super_admin',
            true
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'super_admin',
            is_active = true,
            updated_at = NOW();
            
        RAISE NOTICE 'Admin profile created/updated for user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Please update admin_user_id with actual UUID from Supabase Dashboard';
    END IF;
END $$;

-- Alternative: If you want to create admin from an existing email
-- This requires the user to already exist in auth.users
/*
DO $$
DECLARE
    admin_email TEXT := 'your-admin@email.com';
    admin_uuid UUID;
BEGIN
    -- Find user by email
    SELECT id INTO admin_uuid FROM auth.users WHERE email = admin_email;
    
    IF admin_uuid IS NOT NULL THEN
        INSERT INTO public.admin_profiles (id, full_name, role, is_active)
        VALUES (
            admin_uuid,
            'Site Yöneticisi',
            'super_admin',
            true
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'super_admin',
            is_active = true,
            updated_at = NOW();
            
        RAISE NOTICE 'Admin profile created for: %', admin_email;
    ELSE
        RAISE NOTICE 'User not found: %', admin_email;
    END IF;
END $$;
*/

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.admin_profiles TO authenticated;

-- Verify admin creation
SELECT 
    ap.id,
    ap.full_name,
    ap.role,
    ap.is_active,
    ap.created_at
FROM public.admin_profiles ap
WHERE ap.role = 'super_admin';
