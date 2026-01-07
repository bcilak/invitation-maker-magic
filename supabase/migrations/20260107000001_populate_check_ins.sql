-- Populate check_ins table with existing registrations
-- This migration creates check-in records for all existing registrations

DO $$
DECLARE
    reg RECORD;
    qr_data TEXT;
BEGIN
    -- Loop through all registrations that don't have a check-in record yet
    FOR reg IN
        SELECT r.id, r.event_id, r.email, r.full_name, r.created_at
        FROM registrations r
        LEFT JOIN check_ins c ON c.registration_id = r.id
        WHERE c.id IS NULL
    LOOP
        -- Create QR code data (same format as in PersonalInvitation.tsx)
        qr_data := json_build_object(
            'registrationId', reg.id,
            'eventId', reg.event_id,
            'email', reg.email,
            'fullName', reg.full_name,
            'timestamp', reg.created_at
        )::text;

        -- Insert check-in record
        INSERT INTO check_ins (
            registration_id,
            event_id,
            qr_code_data,
            is_valid,
            created_at
        ) VALUES (
            reg.id,
            reg.event_id,
            qr_data,
            true,
            reg.created_at
        )
        ON CONFLICT (qr_code_data) DO NOTHING;
    END LOOP;

    RAISE NOTICE 'Successfully populated check_ins table';
END $$;
