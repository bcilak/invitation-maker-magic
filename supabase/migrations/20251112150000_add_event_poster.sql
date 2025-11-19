-- Add event_poster column to page_sections for hero section
ALTER TABLE page_sections ADD COLUMN IF NOT EXISTS poster_url text;

-- Create event_posters table for managing event posters
CREATE TABLE IF NOT EXISTS event_posters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    poster_url text NOT NULL,
    poster_name text NOT NULL,
    is_active boolean DEFAULT true,
    uploaded_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Add index
CREATE INDEX IF NOT EXISTS idx_event_posters_active ON event_posters(is_active);

-- Insert sample poster URL (will be replaced with actual upload)
INSERT INTO event_posters (poster_url, poster_name, is_active)
VALUES ('https://placehold.co/800x1200/667eea/white?text=Event+Poster', 'default-poster.jpg', true)
ON CONFLICT DO NOTHING;
