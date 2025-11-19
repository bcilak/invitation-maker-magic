import { Calendar, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEventSettings } from "@/hooks/useEventSettings";
import { useEffect, useState } from "react";

interface EventHeroProps {
  settings?: {
    title?: string;
    subtitle?: string;
    tagline?: string;
    description?: string;
  };
}

export const EventHero = ({ settings: customSettings }: EventHeroProps) => {
  const defaultSettings = useEventSettings();
  const settings = customSettings ? { ...defaultSettings, ...customSettings } : defaultSettings;
  const [posterUrl, setPosterUrl] = useState<string>("");

  useEffect(() => {
    // Load poster from localStorage
    const loadPoster = () => {
      try {
        const stored = localStorage.getItem("event_poster");
        if (stored) {
          const posterData = JSON.parse(stored);
          if (posterData.poster_url) {
            setPosterUrl(posterData.poster_url);
          }
        }
      } catch (error) {
        console.error("Error loading poster:", error);
      }
    };

    loadPoster();

    // Listen for poster updates
    const handlePosterUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.poster_url) {
        setPosterUrl(customEvent.detail.poster_url);
      } else {
        setPosterUrl("");
      }
    };

    window.addEventListener("poster_updated", handlePosterUpdate);
    return () => {
      window.removeEventListener("poster_updated", handlePosterUpdate);
    };
  }, []);

  const scrollToRegistration = () => {
    const registrationSection = document.getElementById("registration-section");
    if (registrationSection) {
      registrationSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const eventDate = new Date(settings.event_date);
  const formattedDate = eventDate.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
  const formattedTime = eventDate.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="container max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Poster Column */}
          {posterUrl && (
            <div className="order-2 lg:order-1 animate-fade-in">
              <div className="relative">
                <img
                  src={posterUrl}
                  alt="Etkinlik Afişi"
                  className="w-full rounded-2xl shadow-2xl object-contain"
                  style={{ maxHeight: "700px" }}
                />
              </div>
            </div>
          )}

          {/* Content Column */}
          <div className={`order-1 lg:order-2 animate-fade-in ${!posterUrl ? 'lg:col-span-2 text-center' : ''}`}>
            <div className="inline-block mb-6 px-6 py-2 bg-accent/10 rounded-full border border-accent/20">
              <span className="text-accent font-semibold">{customSettings?.title || settings.event_title}</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {(customSettings?.tagline || settings.event_tagline).split(" ").slice(0, 2).join(" ")}{" "}
              <span className="text-primary">{(customSettings?.tagline || settings.event_tagline).split(" ").slice(2).join(" ")}</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-light">
              {customSettings?.subtitle || settings.event_subtitle}
            </p>

            {customSettings?.description && (
              <p className="text-lg text-muted-foreground mb-8">
                {customSettings.description}
              </p>
            )}

            <Card className="p-8 shadow-[var(--shadow-elegant)] bg-card/80 backdrop-blur">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{formattedDate}</span>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <span>Saat: {formattedTime}</span>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>{settings.event_location}</span>
                </div>

                <p className="text-sm text-muted-foreground pt-2">
                  {settings.event_location_detail}
                </p>
              </div>
            </Card>

            <div className="mt-8">
              <Button
                variant="hero"
                size="lg"
                className="text-lg px-8"
                onClick={scrollToRegistration}
              >
                Etkinliğe Katıl
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
