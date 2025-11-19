-- Create page_sections table for managing homepage sections
CREATE TABLE IF NOT EXISTS page_sections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key text UNIQUE NOT NULL,
    section_title text NOT NULL,
    is_visible boolean DEFAULT true,
    display_order integer NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Insert default sections
INSERT INTO page_sections (section_key, section_title, is_visible, display_order, settings) VALUES
('hero', 'Ana Banner (Hero)', true, 1, '{
    "title": "Hemşirelikte İnovatif Yaklaşımlar",
    "subtitle": "HEMŞİRELİKTE İNOVATİF YAKLAŞIMLAR",
    "tagline": "Rutinleri Kırmaya Cesaretin Var mı?",
    "description": "Hemşirelik mesleğinde yenilikçi yaklaşımları keşfedin ve geleceğin sağlık hizmetlerini şekillendirin."
}'::jsonb),

('countdown', 'Geri Sayım', true, 2, '{
    "show_countdown": true,
    "countdown_title": "Etkinliğe Kalan Süre"
}'::jsonb),

('program', 'Program Akışı', true, 3, '{
    "program_title": "Etkinlik Programı",
    "program_items": [
        {
            "time": "09:00 - 09:30",
            "title": "Kayıt ve Hoş Geldiniz Kahvaltısı",
            "description": "Katılımcı kayıtları ve networking"
        },
        {
            "time": "09:30 - 10:00",
            "title": "Açılış Konuşması",
            "description": "Etkinlik açılışı ve hoş geldiniz mesajı"
        },
        {
            "time": "10:00 - 11:30",
            "title": "Panel: İnovatif Hemşirelik Uygulamaları",
            "description": "Uzman konuşmacılar ile panel tartışması"
        },
        {
            "time": "11:30 - 11:45",
            "title": "Kahve Molası",
            "description": "Networking ve ikram"
        },
        {
            "time": "11:45 - 13:00",
            "title": "Atölye Çalışmaları",
            "description": "Paralel oturumlarda uygulamalı çalışmalar"
        },
        {
            "time": "13:00 - 14:00",
            "title": "Öğle Yemeği",
            "description": "Öğle yemeği ve networking"
        },
        {
            "time": "14:00 - 15:30",
            "title": "Vaka Sunumları",
            "description": "Başarılı hemşirelik uygulamaları"
        },
        {
            "time": "15:30 - 16:00",
            "title": "Kapanış ve Sertifika Töreni",
            "description": "Etkinlik değerlendirmesi ve sertifika dağıtımı"
        }
    ]
}'::jsonb),

('registration', 'Kayıt Formu', true, 4, '{
    "form_title": "Etkinliğe Kayıt Olun",
    "form_description": "Formu doldurarak etkinliğimize ücretsiz kayıt olabilirsiniz.",
    "show_phone": true,
    "show_institution": true,
    "show_position": true,
    "required_fields": ["full_name", "email", "phone", "institution", "position"]
}'::jsonb),

('location', 'Konum ve Harita', true, 5, '{
    "location_title": "Etkinlik Konumu",
    "location_name": "S.B.Ü Mehmet Akif İnan E.A.H",
    "location_detail": "Ana Bina Konferans Salonu",
    "address": "Şanlıurfa",
    "map_embed_url": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3195.5447217!2d38.7889!3d37.1591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzfCsDA5JzMyLjgiTiAzOMKwNDcnMjAuMCJF!5e0!3m2!1str!2str!4v1234567890"
}'::jsonb),

('footer', 'Alt Bilgi (Footer)', true, 6, '{
    "footer_text": "© 2025 Hemşirelikte İnovatif Yaklaşımlar. Tüm hakları saklıdır.",
    "show_social_media": false,
    "social_links": {}
}'::jsonb);

-- Add index for faster ordering queries
CREATE INDEX idx_page_sections_order ON page_sections(display_order);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_page_sections_updated_at 
    BEFORE UPDATE ON page_sections 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
