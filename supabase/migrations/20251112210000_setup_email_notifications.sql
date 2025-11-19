-- ====================================
-- EMAIL NOTIFICATIONS SETUP
-- Priority 5: Send registration confirmations
-- ====================================

-- Create table to track email notifications
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES public.registrations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('registration_confirmation', 'event_reminder', 'event_update', 'event_cancellation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read email logs
CREATE POLICY "admin_read_email_notifications"
ON public.email_notifications FOR SELECT
TO authenticated
USING (public.is_admin());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_notifications_registration ON public.email_notifications(registration_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_event ON public.email_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_created ON public.email_notifications(created_at DESC);

-- Create trigger to update updated_at
CREATE TRIGGER update_email_notifications_updated_at
BEFORE UPDATE ON public.email_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- TRIGGER TO AUTO-SEND EMAIL ON REGISTRATION
-- ====================================

-- Function to queue email notification
CREATE OR REPLACE FUNCTION public.queue_registration_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert email notification record
  INSERT INTO public.email_notifications (
    registration_id,
    event_id,
    recipient_email,
    recipient_name,
    email_type,
    status
  ) VALUES (
    NEW.id,
    NEW.event_id,
    NEW.email,
    NEW.full_name,
    'registration_confirmation',
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on registrations insert
CREATE TRIGGER trigger_queue_registration_email
AFTER INSERT ON public.registrations
FOR EACH ROW
EXECUTE FUNCTION public.queue_registration_email();

-- ====================================
-- EMAIL TEMPLATE STORAGE
-- ====================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active templates
CREATE POLICY "public_read_active_templates"
ON public.email_templates FOR SELECT
TO authenticated, anon
USING (is_active = true);

-- Policy: Only admins can manage templates
CREATE POLICY "admin_manage_templates"
ON public.email_templates FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Insert default registration confirmation template
INSERT INTO public.email_templates (
  template_key,
  template_name,
  subject,
  html_body,
  text_body,
  variables
) VALUES (
  'registration_confirmation',
  'Kayıt Onay E-postası',
  '✅ {{event_title}} Etkinliğine Kayıt Onayınız',
  '<html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
        <h1 style="color: white; text-align: center;">Kayıt Onayı</h1>
      </div>
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: white;">
        <p>Merhaba <strong>{{full_name}}</strong>,</p>
        
        <p><strong>{{event_title}}</strong> etkinliğine kaydınız başarıyla alınmıştır! 🎉</p>
        
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #667eea;">Etkinlik Detayları</h2>
          <p style="margin: 10px 0;"><strong>📅 Tarih:</strong> {{event_date}}</p>
          <p style="margin: 10px 0;"><strong>📍 Konum:</strong> {{event_location}}</p>
          <p style="margin: 10px 0;"><strong>🏢 Adres:</strong> {{event_address}}</p>
        </div>
        
        <div style="background: #e6f3ff; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
          <p style="margin: 0;"><strong>Kayıt Bilgileriniz:</strong></p>
          <p style="margin: 5px 0;">Email: {{email}}</p>
          <p style="margin: 5px 0;">Telefon: {{phone}}</p>
          <p style="margin: 5px 0;">Kurum: {{institution}}</p>
          <p style="margin: 5px 0;">Pozisyon: {{position}}</p>
        </div>
        
        <p>Etkinlik hakkında daha fazla bilgi için <a href="{{event_url}}" style="color: #667eea;">etkinlik sayfasını</a> ziyaret edebilirsiniz.</p>
        
        <p>Görüşmek üzere!</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
          Bu e-posta {{event_title}} etkinliği için gönderilmiştir.<br>
          Sorularınız için lütfen bu e-postayı yanıtlamayın.
        </p>
      </div>
    </body>
  </html>',
  'Merhaba {{full_name}},

{{event_title}} etkinliğine kaydınız başarıyla alınmıştır!

Etkinlik Detayları:
📅 Tarih: {{event_date}}
📍 Konum: {{event_location}}
🏢 Adres: {{event_address}}

Kayıt Bilgileriniz:
Email: {{email}}
Telefon: {{phone}}
Kurum: {{institution}}
Pozisyon: {{position}}

Etkinlik hakkında daha fazla bilgi için: {{event_url}}

Görüşmek üzere!',
  '["full_name", "event_title", "event_date", "event_location", "event_address", "email", "phone", "institution", "position", "event_url"]'::jsonb
)
ON CONFLICT (template_key) DO NOTHING;

-- ====================================
-- EMAIL SENDING FUNCTION (PLACEHOLDER)
-- ====================================

-- This function should be replaced with actual email service integration
-- Options: 
-- 1. Supabase Edge Function with Resend/SendGrid
-- 2. Supabase Auth email hooks
-- 3. External webhook to email service

CREATE OR REPLACE FUNCTION public.send_pending_emails()
RETURNS INTEGER AS $$
DECLARE
  processed_count INTEGER := 0;
  notification_record RECORD;
  template_record RECORD;
BEGIN
  -- Loop through pending emails (limit 10 per run)
  FOR notification_record IN
    SELECT * FROM public.email_notifications
    WHERE status = 'pending' AND retry_count < 3
    ORDER BY created_at ASC
    LIMIT 10
  LOOP
    -- Get template
    SELECT * INTO template_record
    FROM public.email_templates
    WHERE template_key = notification_record.email_type AND is_active = true;

    IF template_record IS NOT NULL THEN
      -- TODO: Integrate with actual email service here
      -- For now, just mark as sent (simulation)
      
      UPDATE public.email_notifications
      SET 
        status = 'sent',
        sent_at = now(),
        updated_at = now()
      WHERE id = notification_record.id;
      
      processed_count := processed_count + 1;
    ELSE
      -- No template found, mark as failed
      UPDATE public.email_notifications
      SET 
        status = 'failed',
        error_message = 'Email template not found',
        updated_at = now()
      WHERE id = notification_record.id;
    END IF;
  END LOOP;

  RETURN processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.send_pending_emails() TO authenticated;

-- ====================================
-- SETUP INSTRUCTIONS
-- ====================================

-- 1. Run this migration SQL
-- 2. Set up Supabase Edge Function for actual email sending:
--    - Create edge function: supabase functions new send-email
--    - Integrate with Resend API (https://resend.com)
--    - Or use SendGrid/Mailgun/AWS SES
-- 3. Call send_pending_emails() function via cron or Edge Function
-- 4. Test by creating a registration and checking email_notifications table

COMMENT ON TABLE public.email_notifications IS 'Tracks all email notifications sent to users. Status: pending/sent/failed/bounced';
COMMENT ON TABLE public.email_templates IS 'Stores HTML email templates with variable placeholders like {{full_name}}';
COMMENT ON FUNCTION public.send_pending_emails() IS 'Processes pending email notifications. Should be called by cron job or Edge Function.';
