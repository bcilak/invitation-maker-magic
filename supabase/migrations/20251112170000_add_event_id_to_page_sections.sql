-- Add event_id column to page_sections table to make sections event-specific
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'page_sections' AND column_name = 'event_id'
    ) THEN
        -- Add event_id column
        ALTER TABLE page_sections 
        ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;
        
        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_page_sections_event_id ON page_sections(event_id);
        
        -- Update RLS policies to consider event_id
        DROP POLICY IF EXISTS "Enable read access for all users" ON page_sections;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON page_sections;
        DROP POLICY IF EXISTS "Enable update for authenticated users only" ON page_sections;
        DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON page_sections;
        
        -- New RLS policies
        CREATE POLICY "Enable read access for all users" ON page_sections
            FOR SELECT USING (true);
            
        CREATE POLICY "Enable insert for authenticated users only" ON page_sections
            FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
            
        CREATE POLICY "Enable update for authenticated users only" ON page_sections
            FOR UPDATE USING (auth.uid() IS NOT NULL);
            
        CREATE POLICY "Enable delete for authenticated users only" ON page_sections
            FOR DELETE USING (auth.uid() IS NOT NULL);
            
        RAISE NOTICE 'Successfully added event_id column to page_sections table';
    ELSE
        RAISE NOTICE 'event_id column already exists in page_sections table';
    END IF;
END $$;

-- Migrate existing sections to the first available event (if any)
DO $$
DECLARE
    first_event_id UUID;
BEGIN
    -- Get the first event ID
    SELECT id INTO first_event_id FROM events ORDER BY created_at ASC LIMIT 1;
    
    IF first_event_id IS NOT NULL THEN
        -- Update existing sections with NULL event_id to belong to the first event
        UPDATE page_sections 
        SET event_id = first_event_id 
        WHERE event_id IS NULL;
        
        RAISE NOTICE 'Migrated existing sections to event: %', first_event_id;
    ELSE
        RAISE NOTICE 'No events found, sections remain without event_id';
    END IF;
END $$;
