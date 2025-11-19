# Invitation Maker Magic 🎉

Etkinlik davetiye ve kayıt yönetim sistemi - Modern, güvenli ve ölçeklenebilir.

## 🚀 Özellikler

- ✅ **Multi-Event Management** - Birden fazla etkinlik yönetimi
- ✅ **JWT Authentication** - Güvenli admin girişi
- ✅ **CDN Image Storage** - Supabase Storage ile optimize edilmiş görsel yönetimi
- ✅ **Event Editing** - Tüm etkinlik bilgilerini düzenleme
- ✅ **Email Notifications** - Otomatik kayıt onay e-postaları
- ✅ **RLS Security** - Database seviyesinde güvenlik
- ✅ **Responsive Design** - Mobil uyumlu tasarım
- ✅ **Real-time Updates** - Anlık veri senkronizasyonu

## 🛠️ Teknolojiler

- **Frontend:** React 18.3, TypeScript 5.8, Vite 5.4
- **UI:** Shadcn/ui, Tailwind CSS, Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **State Management:** TanStack Query, localStorage
- **Routing:** React Router 6.30

## 📦 Kurulum

```bash
# Repository'yi klonla
git clone https://github.com/bcilak/invitation-maker-magic.git

# Dizine gir
cd invitation-maker-magic

# Bağımlılıkları yükle
npm install

# Environment variables ayarla
cp .env.example .env.local
# .env.local dosyasını Supabase bilgilerinizle doldurun

# Development server'ı başlat
npm run dev
```

## 🌐 Canlıya Alma (Ücretsiz Hosting)

### Hızlı Deploy - Vercel (Önerilen)
```bash
# Vercel CLI kur
npm install -g vercel

# Deploy
vercel
```

**Detaylı rehber için:** [HOSTING_GUIDE.md](./HOSTING_GUIDE.md)

### Alternatif Platformlar:
- **Vercel** - ⭐ Önerilen (Sınırsız bandwidth)
- **Netlify** - 100GB/ay bandwidth
- **Cloudflare Pages** - Sınırsız bandwidth

## 🔐 Admin Kurulumu

### 1. Database Migration'larını Çalıştır
Supabase Dashboard > SQL Editor'da sırayla çalıştır:
```sql
-- 1. supabase/migrations/20251112180000_secure_rls_policies.sql
-- 2. supabase/migrations/20251112190000_setup_admin_authentication.sql
-- 3. supabase/migrations/20251112200000_setup_storage_buckets.sql
-- 4. supabase/migrations/20251112210000_setup_email_notifications.sql
```

### 2. Admin Kullanıcı Oluştur
```
1. Supabase Dashboard > Authentication > Users > Add User
2. Email ve şifre belirle
3. Auto Confirm User: ✅
4. User ID'yi kopyala
```

### 3. Admin Profile Ekle
```sql
INSERT INTO public.admin_profiles (id, full_name, role)
VALUES ('USER_ID_BURAYA', 'Admin İsim', 'super_admin');
```

**Detaylı kurulum:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📚 Proje Yapısı

```
invitation-maker-magic/
├── src/
│   ├── components/        # React componentleri
│   │   ├── ui/           # Shadcn UI componentleri (42 adet)
│   │   ├── EventEditor.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ...
│   ├── pages/            # Sayfa componentleri
│   │   ├── AdminDashboard.tsx  # Ana admin paneli
│   │   ├── AdminLogin.tsx      # JWT authentication
│   │   ├── Events.tsx          # Etkinlik listesi
│   │   └── ...
│   ├── lib/              # Utility fonksiyonlar
│   │   ├── emailService.ts
│   │   └── utils.ts
│   └── integrations/     # Supabase entegrasyonu
│       └── supabase/
├── supabase/
│   └── migrations/       # Database migration'ları (7 dosya)
├── DEPLOYMENT_GUIDE.md   # Deployment rehberi
├── HOSTING_GUIDE.md      # Ücretsiz hosting rehberi
└── KRITIK_GOREVLER_RAPORU.md  # Teknik dokümantasyon
```

## 🎯 Kullanım

### Public (Ziyaretçi):
- Etkinlikleri görüntüleme
- Etkinlik detaylarını inceleme
- Etkinliklere kayıt olma

### Admin:
- **Events Tab:** Etkinlik oluşturma, düzenleme, silme
- **Registrations Tab:** Katılımcı listesi, CSV export
- **Page Builder:** Sayfa bölümlerini yönetme
- **Invitation Creator:** Davetiye şablonları
- **Settings:** Etkinlik ayarları

## 🔒 Güvenlik

- ✅ Row Level Security (RLS) aktif
- ✅ JWT-based authentication
- ✅ Protected routes
- ✅ Admin-only operations
- ✅ Input validation
- ✅ SQL injection prevention

## 📊 Database Şeması

**Tablolar:**
- `events` - Etkinlik bilgileri
- `registrations` - Katılımcı kayıtları
- `page_sections` - Sayfa bölümleri
- `admin_profiles` - Admin kullanıcı profilleri
- `email_notifications` - Email log'ları
- `email_templates` - Email şablonları

**Detaylı şema:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🧪 Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## 📞 Destek & Dokümantasyon

- **Deployment:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Hosting:** [HOSTING_GUIDE.md](./HOSTING_GUIDE.md)
- **Teknik Rapor:** [KRITIK_GOREVLER_RAPORU.md](./KRITIK_GOREVLER_RAPORU.md)

## 📝 License

MIT License - İstediğiniz gibi kullanabilirsiniz!

## 🙏 Credits

Built with ❤️ using:
- [Supabase](https://supabase.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Lovable.dev](https://lovable.dev)

---

**🚀 Başarılı projeler dileriz!**
