-- ====================================
-- SUPABASE STORAGE SETUP FOR IMAGES
-- Priority 3: Replace base64 with CDN storage
-- ====================================

-- Create storage bucket for event posters
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-posters',
  'event-posters',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for invitation templates
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invitation-templates',
  'invitation-templates',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ====================================
-- STORAGE POLICIES FOR event-posters
-- ====================================

-- Policy: Anyone can view event posters (public bucket)
CREATE POLICY "public_read_event_posters"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-posters');

-- Policy: Authenticated admins can upload posters
CREATE POLICY "admin_upload_event_posters"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-posters' AND
  public.is_admin()
);

-- Policy: Authenticated admins can update posters
CREATE POLICY "admin_update_event_posters"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-posters' AND
  public.is_admin()
)
WITH CHECK (
  bucket_id = 'event-posters' AND
  public.is_admin()
);

-- Policy: Authenticated admins can delete posters
CREATE POLICY "admin_delete_event_posters"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-posters' AND
  public.is_admin()
);

-- ====================================
-- STORAGE POLICIES FOR invitation-templates
-- ====================================

-- Policy: Anyone can view invitation templates (public bucket)
CREATE POLICY "public_read_invitation_templates"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'invitation-templates');

-- Policy: Authenticated admins can upload templates
CREATE POLICY "admin_upload_invitation_templates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invitation-templates' AND
  public.is_admin()
);

-- Policy: Authenticated admins can update templates
CREATE POLICY "admin_update_invitation_templates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'invitation-templates' AND
  public.is_admin()
)
WITH CHECK (
  bucket_id = 'invitation-templates' AND
  public.is_admin()
);

-- Policy: Authenticated admins can delete templates
CREATE POLICY "admin_delete_invitation_templates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'invitation-templates' AND
  public.is_admin()
);

-- ====================================
-- HELPER FUNCTIONS
-- ====================================

-- Function to get public URL for a file
CREATE OR REPLACE FUNCTION public.get_storage_url(bucket_name TEXT, file_path TEXT)
RETURNS TEXT AS $$
DECLARE
  base_url TEXT;
BEGIN
  -- Get Supabase project URL from settings
  base_url := current_setting('app.settings.supabase_url', true);
  IF base_url IS NULL THEN
    base_url := 'https://ijblhqbleqiuwmxclqfy.supabase.co';
  END IF;
  
  RETURN base_url || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_storage_url TO authenticated, anon;

-- ====================================
-- MIGRATION INSTRUCTIONS
-- ====================================

-- 1. Run this SQL in Supabase SQL Editor
-- 2. Go to Supabase Dashboard > Storage
-- 3. Verify buckets 'event-posters' and 'invitation-templates' exist
-- 4. Update frontend code to use storage.upload() instead of base64
-- 5. Migrate existing base64 posters to storage (optional)

COMMENT ON FUNCTION public.get_storage_url IS 'Helper function to generate public URLs for storage files';
