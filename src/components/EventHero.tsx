import { Calendar, MapPin, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEventSettings } from "@/hooks/useEventSettings";
import { useSectionStyles } from "@/hooks/useSectionStyles";
import { useEffect, useState } from "react";

interface EventHeroProps {
  settings?: {
    title?: string;
    subtitle?: string;
    tagline?: string;
    description?: string;
    cta_text?: string;
    show_poster?: boolean;
    // Theme settings
    color_primary?: string;
    color_secondary?: string;
    color_accent?: string;
    gradient_style?: string;
    padding_y?: number;
    padding_x?: number;
    enter_animation?: string;
    animation_duration?: number;
    animation_delay?: number;
    hover_effects?: boolean;
    border_radius?: number;
    shadow_intensity?: number;
    custom_classes?: string;
    custom_css?: string;
  };
}

export const EventHero = ({ settings: customSettings }: EventHeroProps) => {
  const defaultSettings = useEventSettings();
  const settings = customSettings ? { ...defaultSettings, ...customSettings } : defaultSettings;
  const [posterUrl, setPosterUrl] = useState<string>("");

  // Apply theme styles
  const { style: sectionStyles, className, animationStyle, cardStyles, primaryColorStyle } = useSectionStyles(customSettings || {});

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
    <section
      className={`relative min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-secondary/30 section-themed ${className}`}
      style={sectionStyles}
      aria-labelledby="event-title"
      role="banner"
    >
      <div className="container max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Poster Column */}
          {posterUrl && customSettings?.show_poster !== false && (
            <div className="order-2 lg:order-1 animate-fade-in">
              <div className="relative">
                <img
                  src={posterUrl}
                  alt={`${customSettings?.title || settings.event_title} etkinlik afişi`}
                  className="w-full rounded-2xl shadow-2xl object-contain"
                  style={{ maxHeight: "700px", ...cardStyles }}
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Content Column */}
          <div className={`order-1 lg:order-2 animate-fade-in ${!posterUrl || customSettings?.show_poster === false ? 'lg:col-span-2 text-center' : ''}`}>
            <div
              className="inline-block mb-6 px-6 py-2 rounded-full border"
              style={{
                backgroundColor: customSettings?.color_accent ? `${customSettings.color_accent}15` : undefined,
                borderColor: customSettings?.color_accent ? `${customSettings.color_accent}30` : undefined,
              }}
            >
              <span
                className="font-semibold"
                style={customSettings?.color_accent ? { color: customSettings.color_accent } : { color: 'hsl(var(--accent))' }}
              >
                {customSettings?.title || settings.event_title}
              </span>
            </div>

            <h1 id="event-title" className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {(customSettings?.tagline || settings.event_tagline).split(" ").slice(0, 2).join(" ")}{" "}
              <span style={primaryColorStyle.color ? primaryColorStyle : { color: 'hsl(var(--primary))' }}>
                {(customSettings?.tagline || settings.event_tagline).split(" ").slice(2).join(" ")}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-light">
              {customSettings?.subtitle || settings.event_subtitle}
            </p>

            {customSettings?.description && (
              <p className="text-lg text-muted-foreground mb-8">
                {customSettings.description}
              </p>
            )}

            <Card
              className="p-8 shadow-[var(--shadow-elegant)] bg-card/80 backdrop-blur"
              style={cardStyles}
              role="region"
              aria-label="Etkinlik bilgileri"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-lg">
                  <Calendar className="w-5 h-5" style={primaryColorStyle} aria-hidden="true" />
                  <span className="font-semibold"><span className="sr-only">Tarih: </span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <Clock className="w-5 h-5" style={primaryColorStyle} aria-hidden="true" />
                  <span><span className="sr-only">Saat: </span>Saat: {formattedTime}</span>
                </div>

                <div className="flex items-center gap-3 text-lg">
                  <MapPin className="w-5 h-5" style={primaryColorStyle} aria-hidden="true" />
                  <span><span className="sr-only">Konum: </span>{settings.event_location}</span>
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
                style={customSettings?.color_primary ? { backgroundColor: customSettings.color_primary } : undefined}
                onClick={scrollToRegistration}
              >
                {customSettings?.cta_text || "Etkinliğe Katıl"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
