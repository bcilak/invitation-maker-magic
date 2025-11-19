-- Add unique constraint to email field to prevent duplicate registrations
ALTER TABLE public.registrations 
ADD CONSTRAINT unique_email UNIQUE (email);

-- Create a more informative index name
DROP INDEX IF EXISTS idx_registrations_email;
CREATE UNIQUE INDEX idx_registrations_email_unique ON public.registrations(email);
