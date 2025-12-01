import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "event";
  eventDate?: string;
  eventLocation?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = "Etkinlik Yönetim Sistemi";
const DEFAULT_DESCRIPTION = "Profesyonel etkinlik davetiye ve kayıt yönetim sistemi. Etkinliklerinizi kolayca oluşturun, yönetin ve katılımcılarınızı takip edin.";
const DEFAULT_IMAGE = "/og-image.png";
const SITE_NAME = "Etkinlik Yönetimi";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "etkinlik, davetiye, kayıt, organizasyon, konferans, seminer",
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  eventDate,
  eventLocation,
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {currentUrl && <link rel="canonical" href={currentUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Event-specific meta tags */}
      {type === "event" && eventDate && (
        <>
          <meta property="event:start_time" content={eventDate} />
          {eventLocation && <meta property="event:location" content={eventLocation} />}
        </>
      )}

      {/* Theme Color */}
      <meta name="theme-color" content="#6366f1" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="format-detection" content="telephone=no" />
    </Helmet>
  );
}

// Pre-defined SEO configurations for common pages
export const SEOPresets = {
  home: {
    title: "Etkinlikler",
    description: "Yaklaşan etkinliklerimizi keşfedin ve hemen kayıt olun. Profesyonel gelişim etkinlikleri, konferanslar ve seminerler.",
  },
  adminLogin: {
    title: "Admin Girişi",
    description: "Etkinlik yönetim paneline giriş yapın.",
    noindex: true,
  },
  adminDashboard: {
    title: "Admin Panel",
    description: "Etkinlik yönetim paneli - Kayıtları görüntüleyin ve etkinliklerinizi yönetin.",
    noindex: true,
  },
  createEvent: {
    title: "Yeni Etkinlik Oluştur",
    description: "Yeni bir etkinlik oluşturun ve yayınlayın.",
    noindex: true,
  },
  notFound: {
    title: "Sayfa Bulunamadı",
    description: "Aradığınız sayfa bulunamadı.",
    noindex: true,
  },
};

export default SEO;
