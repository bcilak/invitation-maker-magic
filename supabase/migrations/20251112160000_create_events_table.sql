-- Create events table for managing multiple events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  tagline TEXT,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_location TEXT NOT NULL,
  event_location_detail TEXT,
  event_address TEXT,
  poster_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'past', 'cancelled')),
  max_attendees INTEGER,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published events
CREATE POLICY "Anyone can view published events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Policy: Admins can manage all events
CREATE POLICY "Admins can manage events"
ON public.events
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add event_id to registrations table (only if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'registrations') THEN
    ALTER TABLE public.registrations
    ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;
    
    CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON public.registrations(event_id);
  END IF;
END $$;

-- Create indexes for faster queries
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_date ON public.events(event_date DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a default event (migration data)
INSERT INTO public.events (
  title,
  slug,
  subtitle,
  tagline,
  event_date,
  event_location,
  event_location_detail,
  event_address,
  status
) VALUES (
  'Hemşirelikte İnovatif Yaklaşımlar',
  'hemsirelikte-inovatif-yaklasimlar-2025',
  'HEMŞIRELIKTE İNOVATIF YAKLAŞIMLAR',
  'Rutinleri Kırmaya Cesaretin Var mı?',
  '2025-11-19T09:00:00+03:00',
  'S.B.Ü Mehmet Akif İnan E.A.H',
  'Ana Bina Konferans Salonu',
  'Şanlıurfa',
  'published'
);
