import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EventHero } from "@/components/EventHero";
import { Countdown } from "@/components/Countdown";
import { ProgramSchedule } from "@/components/ProgramSchedule";
import { RegistrationForm } from "@/components/RegistrationForm";
import { LocationMap } from "@/components/LocationMap";
import { EventFooter } from "@/components/EventFooter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageSection {
    id: string;
    section_key: string;
    section_title: string;
    is_visible: boolean;
    display_order: number;
    settings: any;
}

interface Event {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    tagline: string | null;
    description: string | null;
    event_date: string;
    event_location: string;
    event_location_detail: string | null;
    event_address: string | null;
    poster_url: string | null;
    status: string;
    max_attendees: number | null;
    settings: any;
}

const EventDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [sections, setSections] = useState<PageSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (slug) {
            fetchEvent();
        }
    }, [slug]);

    useEffect(() => {
        // Fetch sections after event is loaded
        if (event) {
            fetchPageSections();
        }
    }, [event]);

    const fetchEvent = async () => {
        try {
            let eventData: Event | null = null;

            // Try localStorage first
            const storedEvents = localStorage.getItem("events");
            if (storedEvents) {
                const localEvents: Event[] = JSON.parse(storedEvents);
                const foundEvent = localEvents.find(
                    (e) => e.slug === slug && e.status === "published"
                );
                if (foundEvent) {
                    eventData = foundEvent;
                }
            }

            // Try database
            try {
                const { data, error } = await supabase
                    .from("events")
                    .select("*")
                    .eq("slug", slug)
                    .eq("status", "published")
                    .maybeSingle();

                if (!error && data) {
                    eventData = data;
                }
            } catch (dbError) {
                console.log("Database fetch failed, using localStorage:", dbError);
            }

            if (!eventData) {
                setNotFound(true);
                setIsLoading(false);
                return;
            }

            setEvent(eventData);

            // Store event info in localStorage for components to use
            localStorage.setItem("current_event", JSON.stringify(eventData));
            localStorage.setItem("event_settings", JSON.stringify({
                event_title: eventData.title,
                event_subtitle: eventData.subtitle || "",
                event_tagline: eventData.tagline || "",
                event_date: eventData.event_date,
                event_location: eventData.event_location,
                event_location_detail: eventData.event_location_detail || "",
                event_address: eventData.event_address || "",
            }));

            // Store poster if exists
            if (eventData.poster_url) {
                localStorage.setItem("event_poster", JSON.stringify({
                    id: "active-poster",
                    poster_url: eventData.poster_url,
                    poster_name: `${eventData.slug}-poster`,
                    is_active: true,
                    uploaded_at: new Date().toISOString(),
                }));
            } else {
                // Clear poster if event doesn't have one
                localStorage.removeItem("event_poster");
            }

            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching event:", error);
            setNotFound(true);
            setIsLoading(false);
        }
    };

    const fetchPageSections = async () => {
        if (!event) return; // Wait for event to load first

        try {
            const { data, error } = await supabase
                .from("page_sections")
                .select("*")
                .eq("event_id", event.id) // FILTER BY EVENT ID
                .eq("is_visible", true)
                .order("display_order", { ascending: true });

            if (!error && data && data.length > 0) {
                setSections(data);
                console.log(`Loaded ${data.length} sections for event:`, event.id);
            } else {
                console.log("No sections found for event:", event.id);
                setSections([]);
            }
        } catch (error) {
            console.error("Error fetching sections:", error);
        }
    };

    const renderSection = (section: PageSection) => {
        switch (section.section_key) {
            case "hero":
                return <EventHero key={section.id} settings={section.settings} />;
            case "countdown":
                return <Countdown key={section.id} settings={section.settings} />;
            case "program":
                return <ProgramSchedule key={section.id} settings={section.settings} />;
            case "registration":
                return (
                    <section key={section.id} id="registration-section" className="py-20 px-4">
                        <RegistrationForm settings={section.settings} />
                    </section>
                );
            case "location":
                return <LocationMap key={section.id} settings={section.settings} />;
            case "footer":
                return <EventFooter key={section.id} settings={section.settings} />;
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Etkinlik yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (notFound || !event) {
        return (
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="text-center max-w-md">
                    <h1 className="text-4xl font-bold mb-4">Etkinlik Bulunamadı</h1>
                    <p className="text-muted-foreground mb-6">
                        Aradığınız etkinlik bulunamadı veya yayından kaldırılmış olabilir.
                    </p>
                    <Button onClick={() => navigate("/")}>
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Etkinliklere Dön
                    </Button>
                </div>
            </div>
        );
    }

    // Check if event is past
    const isPast = new Date() > new Date(new Date(event.event_date).getTime() + 24 * 60 * 60 * 1000);

    if (isPast) {
        return (
            <div className="min-h-screen">
                {/* Back to Events Button - Floating */}
                <div className="fixed top-4 left-4 z-50">
                    <Button
                        onClick={() => navigate("/")}
                        variant="secondary"
                        size="sm"
                        className="shadow-lg hover:shadow-xl transition-all"
                    >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        Etkinlik Takvimi
                    </Button>
                </div>

                <div className="bg-muted/50 py-4 px-4 text-center border-b">
                    <p className="text-sm font-medium">
                        Bu etkinlik sona ermiştir
                    </p>
                </div>
                {sections.length > 0 ? (
                    sections.map((section) => renderSection(section))
                ) : (
                    <>
                        <EventHero />
                        <Countdown />
                        <ProgramSchedule />
                        <LocationMap />
                        <EventFooter />
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Back to Events Button - Floating */}
            <div className="fixed top-4 left-4 z-50">
                <Button
                    onClick={() => navigate("/")}
                    variant="secondary"
                    size="sm"
                    className="shadow-lg hover:shadow-xl transition-all"
                >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Etkinlik Takvimi
                </Button>
            </div>

            {sections.length > 0 ? (
                sections.map((section) => renderSection(section))
            ) : (
                <>
                    <EventHero />
                    <Countdown />
                    <ProgramSchedule />
                    <section id="registration-section" className="py-20 px-4">
                        <RegistrationForm />
                    </section>
                    <LocationMap />
                    <EventFooter />
                </>
            )}
        </div>
    );
};

export default EventDetail;
