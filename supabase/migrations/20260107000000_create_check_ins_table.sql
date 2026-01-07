-- Create check_ins table for tracking event attendance
CREATE TABLE IF NOT EXISTS check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    check_in_by TEXT, -- Staff member who processed check-in
    check_out_by TEXT, -- Staff member who processed check-out
    qr_code_data TEXT NOT NULL UNIQUE, -- Encrypted/hashed QR code data
    is_valid BOOLEAN DEFAULT true, -- Can be used to invalidate QR codes
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_check_ins_registration_id ON check_ins(registration_id);
CREATE INDEX idx_check_ins_event_id ON check_ins(event_id);
CREATE INDEX idx_check_ins_qr_code ON check_ins(qr_code_data);
CREATE INDEX idx_check_ins_check_in_time ON check_ins(check_in_time);

-- Add RLS policies
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- Admin can view all check-ins
CREATE POLICY "Admins can view all check-ins"
    ON check_ins FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admin can insert check-ins
CREATE POLICY "Admins can insert check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Admin can update check-ins
CREATE POLICY "Admins can update check-ins"
    ON check_ins FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_check_ins_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_check_ins_updated_at
    BEFORE UPDATE ON check_ins
    FOR EACH ROW
    EXECUTE FUNCTION update_check_ins_updated_at();

-- Add comment
COMMENT ON TABLE check_ins IS 'Tracks event check-ins and check-outs using QR codes';
