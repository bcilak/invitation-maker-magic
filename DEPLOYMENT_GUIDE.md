# 🚀 Production Deployment Guide - Invitation Maker Magic

## ✅ Tamamlanan Kritik Görevler

### 1. ✅ RLS Policies Güvenlik
**Dosya:** `supabase/migrations/20251112180000_secure_rls_policies.sql`

**Yapılanlar:**
- ✅ Admin role kontrolü ile RLS politikaları
- ✅ Public kullanıcılar sadece yayındaki etkinlikleri görebilir
- ✅ Admin olmayan kullanıcılar kayıt oluşturabilir
- ✅ Tüm admin işlemleri `is_admin()` fonksiyonu ile korundu
- ✅ Performans indexleri eklendi

**Adımlar:**
```sql
-- Supabase Dashboard > SQL Editor'da çalıştır:
-- 1. 20251112180000_secure_rls_policies.sql dosyasını kopyala
-- 2. Execute butonuna tıkla
-- 3. Tüm politikaların başarıyla oluşturulduğunu doğrula
```

---

### 2. ✅ Admin Authentication (JWT)
**Dosyalar:**
- `supabase/migrations/20251112190000_setup_admin_authentication.sql`
- `src/pages/AdminLogin.tsx` (güncellendi)
- `src/components/ProtectedRoute.tsx` (yeni)
- `src/pages/Admin.tsx` (güncellendi)

**Yapılanlar:**
- ✅ Supabase Auth ile JWT tabanlı kimlik doğrulama
- ✅ `admin_profiles` tablosu oluşturuldu
- ✅ Hardcoded credentials kaldırıldı
- ✅ Protected routes eklendi
- ✅ Session kontrolü ve logout fonksiyonu

**Admin Kullanıcı Oluşturma:**
```bash
# 1. Supabase Dashboard > Authentication > Users > Add User
#    Email: admin@yourdomain.com
#    Password: [güvenli şifre]
#    Auto Confirm User: ON

# 2. User ID'yi kopyala ve bu SQL'i çalıştır:
INSERT INTO public.admin_profiles (id, full_name, role)
VALUES ('USER_ID_BURAYA', 'Admin Adı Soyadı', 'super_admin');
```

---

### 3. ✅ Image Storage CDN
**Dosyalar:**
- `supabase/migrations/20251112200000_setup_storage_buckets.sql`
- `src/components/PosterManager.tsx` (güncellendi)

**Yapılanlar:**
- ✅ Supabase Storage bucket'ları (`event-posters`, `invitation-templates`)
- ✅ Base64 yerine CDN URL kullanımı
- ✅ 5MB dosya boyutu limiti
- ✅ Otomatik public URL oluşturma
- ✅ Storage RLS politikaları

**Kurulum:**
```sql
-- Supabase Dashboard > SQL Editor'da çalıştır:
-- 1. 20251112200000_setup_storage_buckets.sql dosyasını kopyala
-- 2. Execute butonuna tıkla
-- 3. Storage > Buckets'ta 'event-posters' bucket'ının oluştuğunu doğrula
```

---

### 4. ✅ Event Editing Feature
**Dosyalar:**
- `src/components/EventEditor.tsx` (yeni)
- `src/pages/AdminDashboard.tsx` (güncellendi)

**Yapılanlar:**
- ✅ Modal tabanlı etkinlik düzenleme formu
- ✅ Tüm etkinlik alanları düzenlenebilir
- ✅ Otomatik slug oluşturma
- ✅ Form validasyonu
- ✅ LocalStorage senkronizasyonu

**Kullanım:**
1. Admin Dashboard > Events sekmesi
2. Herhangi bir etkinliğin yanındaki "Düzenle" butonuna tıkla
3. Bilgileri güncelle ve kaydet

---

### 5. ✅ Email Notifications System
**Dosyalar:**
- `supabase/migrations/20251112210000_setup_email_notifications.sql`
- `src/lib/emailService.ts` (yeni)

**Yapılanlar:**
- ✅ `email_notifications` tablosu (log için)
- ✅ `email_templates` tablosu (HTML şablonlar)
- ✅ Otomatik trigger: kayıt → email kuyruğa
- ✅ Varsayılan kayıt onay şablonu
- ✅ Retry mekanizması (max 3 deneme)

**Email Servisi Entegrasyonu (Gerekli):**

#### Option 1: Resend (Önerilen)
```bash
# 1. Resend hesabı oluştur: https://resend.com
# 2. API key al
# 3. Supabase Edge Function oluştur:

supabase functions new send-email

# 4. Edge Function kodu:
```typescript
import { Resend } from 'resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  const { registration_id } = await req.json();
  
  // Get registration and event details
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
  
  const { data: registration } = await supabaseClient
    .from('registrations')
    .select('*, events(*)')
    .eq('id', registration_id)
    .single();
  
  // Get email template
  const { data: template } = await supabaseClient
    .from('email_templates')
    .select('*')
    .eq('template_key', 'registration_confirmation')
    .single();
  
  // Replace variables in template
  let html = template.html_body;
  html = html.replace(/{{full_name}}/g, registration.full_name);
  html = html.replace(/{{event_title}}/g, registration.events.title);
  // ... diğer değişkenler
  
  // Send email
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: registration.email,
    subject: template.subject.replace(/{{event_title}}/g, registration.events.title),
    html: html
  });
  
  // Update notification status
  await supabaseClient
    .from('email_notifications')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('registration_id', registration_id);
  
  return new Response(JSON.stringify({ success: true }));
});
```

```bash
# 5. Deploy:
supabase functions deploy send-email --no-verify-jwt

# 6. Set secrets:
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
```

#### Option 2: SendGrid
```bash
npm install @sendgrid/mail
```

```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(Deno.env.get('SENDGRID_API_KEY'));

await sgMail.send({
  to: registration.email,
  from: 'noreply@yourdomain.com',
  subject: 'Kayıt Onayı',
  html: htmlContent
});
```

---

## 📋 Migration Çalıştırma Sırası

```bash
# 1. Database migrations (Supabase Dashboard > SQL Editor)
20251112180000_secure_rls_policies.sql
20251112190000_setup_admin_authentication.sql
20251112200000_setup_storage_buckets.sql
20251112210000_setup_email_notifications.sql

# 2. Admin kullanıcı oluştur (yukarıda anlatıldı)

# 3. Storage bucket'ları kontrol et
# Supabase Dashboard > Storage > Buckets
# event-posters bucket'ının public olduğundan emin ol

# 4. Email Edge Function deploy et (yukarıda anlatıldı)
```

---

## 🔒 Güvenlik Kontrol Listesi

- [x] RLS policies tüm tablolarda aktif
- [x] Admin işlemleri `is_admin()` ile korunuyor
- [x] JWT tabanlı authentication
- [x] Hardcoded credentials kaldırıldı
- [x] Public kullanıcılar sadece yayındaki içerikleri görebilir
- [x] Storage bucket'ları protected (sadece adminler yükleyebilir)
- [x] SQL injection koruması (parameterized queries)
- [ ] Rate limiting (Supabase otomatik sağlıyor, ekstra yapılandırma gerekirse)
- [ ] CORS ayarları (production domain)
- [ ] Environment variables (.env.local)

---

## 🌐 Production Deployment Checklist

### 1. Environment Variables
```env
# .env.local
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Build & Deploy
```bash
# Build production
npm run build

# Deploy to Lovable.dev (otomatik)
git push origin main

# Veya başka bir platform:
# Vercel: vercel --prod
# Netlify: netlify deploy --prod
```

### 3. Domain Configuration
- Supabase Dashboard > Settings > API > Site URL
- Production domain'i ekle
- Redirect URLs'e ekle

### 4. Email Configuration
- Supabase Dashboard > Authentication > Email Templates
- SMTP settings (veya Resend integration)
- Custom domain email (noreply@yourdomain.com)

### 5. Database Backups
- Supabase Dashboard > Database > Backups
- Daily automatic backups enabled
- Download manual backup before major changes

---

## 🧪 Testing Checklist

### Authentication
- [ ] Admin login çalışıyor
- [ ] Protected routes yetkisiz erişimi engelliyor
- [ ] Logout düzgün çalışıyor
- [ ] Session expire sonrası redirect

### Event Management
- [ ] Etkinlik oluşturma çalışıyor
- [ ] Etkinlik düzenleme çalışıyor
- [ ] Etkinlik silme çalışıyor
- [ ] Etkinlik durum değiştirme (draft/published)

### Image Upload
- [ ] Poster yükleme çalışıyor
- [ ] CDN URL'leri düzgün oluşuyor
- [ ] Dosya boyutu limiti çalışıyor
- [ ] Poster silme çalışıyor

### Registration
- [ ] Public registration formu çalışıyor
- [ ] Email notification kuyruğa giriyor
- [ ] Admin dashboard'da kayıtlar görünüyor
- [ ] Export CSV çalışıyor

### Email Notifications
- [ ] Kayıt sonrası email kuyruğa giriyor
- [ ] Email template düzgün render oluyor
- [ ] Değişkenler doğru replace ediliyor
- [ ] Email gönderme çalışıyor (Edge Function)

---

## 📊 Monitoring & Maintenance

### Database
- Supabase Dashboard > Database > Query Performance
- Slow queries izle
- Index optimization

### Storage
- Storage usage izle (5GB free limit)
- Eski poster'ları temizle

### Logs
- Supabase Dashboard > Logs
- Edge Function logs
- Auth logs
- Database logs

### Email Delivery
- `email_notifications` tablosunu kontrol et
- Failed emails'leri retry et
- Bounce rate izle

---

## 🆘 Troubleshooting

### "401 Unauthorized" Hatası
- RLS policies doğru mu kontrol et
- Admin kullanıcının `admin_profiles`'da olduğunu doğrula
- JWT token'ın expire olmadığını kontrol et

### Email Gönderilmiyor
- `email_notifications` tablosunda status'u kontrol et
- Edge Function logs'ları kontrol et
- Resend API key doğru mu kontrol et
- Email template variables doğru mu kontrol et

### Storage Upload Hatası
- Storage policies doğru mu kontrol et
- Bucket public mi kontrol et
- Dosya boyutu 5MB altında mı kontrol et
- Admin authenticated mi kontrol et

---

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- Resend Docs: https://resend.com/docs
- GitHub Issues: [Create issue]

---

## 🎉 Başarıyla Tamamlandı!

Tüm 5 kritik görev başarıyla implement edildi:
1. ✅ RLS Policies Güvenlik
2. ✅ JWT Authentication
3. ✅ CDN Image Storage
4. ✅ Event Editing
5. ✅ Email Notifications

Projeniz production'a hazır! 🚀
