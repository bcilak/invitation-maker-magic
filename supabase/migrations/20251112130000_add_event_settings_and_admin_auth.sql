-- Create event_settings table to store dynamic event information
CREATE TABLE public.event_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_title TEXT NOT NULL DEFAULT 'Hemşirelikte İnovatif Yaklaşımlar',
  event_subtitle TEXT NOT NULL DEFAULT 'HEMŞIRELIKTE İNOVATIF YAKLAŞIMLAR',
  event_tagline TEXT NOT NULL DEFAULT 'Rutinleri Kırmaya Cesaretin Var mı?',
  event_date TIMESTAMPTZ NOT NULL DEFAULT '2025-11-19T09:00:00+03:00',
  event_location TEXT NOT NULL DEFAULT 'S.B.Ü Mehmet Akif İnan E.A.H',
  event_location_detail TEXT NOT NULL DEFAULT 'Ana Bina Konferans Salonu',
  event_address TEXT NOT NULL DEFAULT 'Şanlıurfa',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active event settings
CREATE POLICY "Anyone can read event settings"
ON public.event_settings
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Policy: Only authenticated users can update (for admin)
CREATE POLICY "Authenticated users can update event settings"
ON public.event_settings
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default event data
INSERT INTO public.event_settings (
  event_title,
  event_subtitle,
  event_tagline,
  event_date,
  event_location,
  event_location_detail,
  event_address
) VALUES (
  'Hemşirelikte İnovatif Yaklaşımlar',
  'HEMŞIRELIKTE İNOVATIF YAKLAŞIMLAR',
  'Rutinleri Kırmaya Cesaretin Var mı?',
  '2025-11-19T09:00:00+03:00',
  'S.B.Ü Mehmet Akif İnan E.A.H',
  'Ana Bina Konferans Salonu',
  'Şanlıurfa'
);

-- Create admin_users table for authentication
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read admin users
CREATE POLICY "Authenticated users can read admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- Create index for username lookups
CREATE INDEX idx_admin_users_username ON public.admin_users(username);
CREATE INDEX idx_event_settings_active ON public.event_settings(is_active);

-- Insert default admin user (password: admin123)
-- Note: In production, use proper password hashing with bcrypt
INSERT INTO public.admin_users (
  username,
  password_hash,
  full_name,
  email
) VALUES (
  'admin',
  '$2a$10$rX8L8EqKVJ1Kx5Z9X5Z9XO5Z9X5Z9X5Z9X5Z9X5Z9X5Z9X5Z9X5Z9X',
  'Sistem Yöneticisi',
  'admin@hospital.gov.tr'
);
