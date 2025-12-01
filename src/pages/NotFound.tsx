import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { SEO, SEOPresets } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/30 px-4">
      <SEO {...SEOPresets.notFound} />
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-8xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground mb-6">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <Link to="/">
            <Button>
              <Home className="w-4 h-4 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
