import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface EventFooterProps {
  settings?: {
    footer_text?: string;
    show_social_media?: boolean;
    social_links?: any;
  };
}

export const EventFooter = ({ settings }: EventFooterProps) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminSession = localStorage.getItem("admin_session");
    setIsAdmin(!!adminSession);
  }, []);
  return (
    <footer className="py-12 px-4 bg-card border-t">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">
            Geleceği Birlikte <span className="text-primary">Şekillendirin</span>
          </h3>
          <p className="text-muted-foreground mb-6">
            Hemşirelikte inovasyonun öncüsü olun. Rutinleri kırma cesaretini göstererek,
            sağlık hizmetlerinin geleceğine katkıda bulunun.
          </p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">İletişim Bilgileri</p>
            <p>T.C. Sağlık Bakanlığı</p>
            <p>S.B.Ü Mehmet Akif İnan Eğitim ve Araştırma Hastanesi</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center">
          {/* Admin Button - Only visible to logged in admins */}
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/admin")}
              className="mb-4"
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin Panel
            </Button>
          )}
          <p className="text-sm text-muted-foreground">
            {settings?.footer_text || "© 2025 T.C. Sağlık Bakanlığı - Tüm hakları saklıdır."}
          </p>
        </div>
      </div>
    </footer>
  );
};
