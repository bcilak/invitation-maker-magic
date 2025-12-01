import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { useEventSettings } from "@/hooks/useEventSettings";

interface LocationMapProps {
    settings?: {
        location_title?: string;
        location_name?: string;
        location_detail?: string;
        address?: string;
        map_embed_url?: string;
    };
}

export const LocationMap = ({ settings: customSettings }: LocationMapProps) => {
    const defaultSettings = useEventSettings();
    const settings = customSettings
        ? {
            ...defaultSettings,
            event_location: customSettings.location_name || defaultSettings.event_location,
            event_location_detail: customSettings.location_detail || defaultSettings.event_location_detail,
            event_address: customSettings.address || defaultSettings.event_address
        }
        : defaultSettings;

    // Google Maps coordinates
    const mapSrc = customSettings?.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3188.2773626886565!2d38.78884931526!3d37.16057607988!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1531e1e5e5e5e5e5%3A0x1e5e5e5e5e5e5e5!2sS.B.%C3%9C.%20Mehmet%20Akif%20%C4%B0nan%20E%C4%9Fitim%20ve%20Ara%C5%9Ft%C4%B1rma%20Hastanesi!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str";
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.event_location + ", " + settings.event_address)}`;

    return (
        <section
            className="py-20 px-4 bg-gradient-to-b from-secondary/30 to-background"
            aria-labelledby="location-title"
            id="location-section"
        >
            <div className="container max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 id="location-title" className="text-4xl md:text-5xl font-bold mb-4">
                        {customSettings?.location_title || "Etkinlik"} <span className="text-primary">Konumu</span>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-2">{settings.event_location}</p>
                    <p className="text-lg text-muted-foreground">{settings.event_location_detail}</p>
                </div>

                <Card className="overflow-hidden shadow-[var(--shadow-elegant)]">
                    <div className="aspect-video w-full">
                        <iframe
                            src={mapSrc}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`${settings.event_location} harita görünümü`}
                            aria-label="Google Haritalar - Etkinlik konumu"
                        />
                    </div>

                    <div className="p-6 bg-card">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-start gap-3 text-left">
                                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">{settings.event_location}</h3>
                                    <p className="text-muted-foreground">{settings.event_address}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {settings.event_location_detail}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="default"
                                size="lg"
                                onClick={() => window.open(directionsUrl, "_blank")}
                                className="flex-shrink-0"
                                aria-label={`${settings.event_location} için Google Haritalar'da yol tarifi al`}
                            >
                                <Navigation className="mr-2 h-4 w-4" aria-hidden="true" />
                                Yol Tarifi Al
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    );
};
