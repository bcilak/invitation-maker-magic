-- Create registrations table for event participants
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  institution TEXT NOT NULL,
  position TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert their own registration
CREATE POLICY "Anyone can register"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: Only admins can view all registrations (for future admin panel)
CREATE POLICY "Admins can view all registrations"
ON public.registrations
FOR SELECT
TO authenticated
USING (true);

-- Create index for email lookups
CREATE INDEX idx_registrations_email ON public.registrations(email);
CREATE INDEX idx_registrations_created_at ON public.registrations(created_at DESC);