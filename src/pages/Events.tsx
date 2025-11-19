import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowRight, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Event {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    tagline: string | null;
    event_date: string;
    event_location: string;
    poster_url: string | null;
    status: string;
    max_attendees: number | null;
    _count?: {
        registrations: number;
    };
}

const Events = () => {
    const [activeEvents, setActiveEvents] = useState<Event[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [pastEvents, setPastEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetchEvents();
        checkAdminStatus();
    }, []);

    const checkAdminStatus = () => {
        const adminSession = localStorage.getItem("admin_session");
        setIsAdmin(!!adminSession);
    };

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const now = new Date();
            let allEvents: Event[] = [];

            // Try localStorage first
            const storedEvents = localStorage.getItem("events");
            if (storedEvents) {
                const localEvents = JSON.parse(storedEvents);
                allEvents = localEvents.filter((e: Event) => e.status === "published");
            }

            // Try to fetch from database
            try {
                const { data, error } = await supabase
                    .from("events")
                    .select("*")
                    .eq("status", "published")
                    .order("event_date", { ascending: true });

                if (!error && data && data.length > 0) {
                    allEvents = data;
                }
            } catch (dbError) {
                console.log("Database fetch failed, using localStorage:", dbError);
            }

            // Categorize events
            const active: Event[] = [];
            const upcoming: Event[] = [];
            const past: Event[] = [];

            allEvents.forEach((event) => {
                const eventDate = new Date(event.event_date);
                const eventEndDate = new Date(eventDate.getTime() + 24 * 60 * 60 * 1000); // +1 day

                if (eventDate <= now && now <= eventEndDate) {
                    active.push(event);
                } else if (eventDate > now) {
                    upcoming.push(event);
                } else {
                    past.push(event);
                }
            });

            setActiveEvents(active);
            setUpcomingEvents(upcoming);
            setPastEvents(past);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const EventCard = ({ event }: { event: Event }) => {
        const eventDate = new Date(event.event_date);
        const formattedDate = eventDate.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        const formattedTime = eventDate.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
        });

        const isPast = new Date() > new Date(eventDate.getTime() + 24 * 60 * 60 * 1000);

        return (
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="grid md:grid-cols-[300px_1fr] gap-0">
                    {/* Poster */}
                    <div className="relative h-64 md:h-auto bg-gradient-to-br from-primary/10 to-accent/10">
                        {event.poster_url ? (
                            <img
                                src={event.poster_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <Calendar className="w-20 h-20 text-primary/30" />
                            </div>
                        )}
                        {isPast && (
                            <div className="absolute top-4 right-4">
                                <Badge variant="secondary">Geçmiş Etkinlik</Badge>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col justify-between">
                        <div>
                            <div className="mb-4">
                                <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                                    {event.title}
                                </h3>
                                {event.tagline && (
                                    <p className="text-muted-foreground">{event.tagline}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium">{formattedDate}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-primary" />
                                    <span>{formattedTime}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span>{event.event_location}</span>
                                </div>

                                {event.max_attendees && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="w-4 h-4 text-primary" />
                                        <span>Kontenjan: {event.max_attendees} kişi</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link to={`/event/${event.slug}`}>
                                <Button className="w-full group/btn" disabled={isPast}>
                                    {isPast ? (
                                        "Etkinlik Sona Erdi"
                                    ) : (
                                        <>
                                            Detayları Gör & Kayıt Ol
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Etkinlikler yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-background to-secondary/30">
            <div className="container max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Etkinliklerimiz
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Hemşirelik alanındaki profesyonel gelişim etkinliklerimize katılın
                    </p>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
                        <TabsTrigger value="active">
                            Aktif ({activeEvents.length})
                        </TabsTrigger>
                        <TabsTrigger value="upcoming">
                            Yaklaşan ({upcomingEvents.length})
                        </TabsTrigger>
                        <TabsTrigger value="past">
                            Geçmiş ({pastEvents.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-6">
                        {activeEvents.length === 0 ? (
                            <Card className="p-12 text-center">
                                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    Şu anda aktif etkinlik bulunmuyor
                                </h3>
                                <p className="text-muted-foreground">
                                    Yaklaşan etkinliklerimizi kontrol edin
                                </p>
                            </Card>
                        ) : (
                            activeEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="upcoming" className="space-y-6">
                        {upcomingEvents.length === 0 ? (
                            <Card className="p-12 text-center">
                                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    Yaklaşan etkinlik bulunmuyor
                                </h3>
                                <p className="text-muted-foreground">
                                    Yeni etkinlikler için bizi takip edin
                                </p>
                            </Card>
                        ) : (
                            upcomingEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="past" className="space-y-6">
                        {pastEvents.length === 0 ? (
                            <Card className="p-12 text-center">
                                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">
                                    Geçmiş etkinlik bulunmuyor
                                </h3>
                            </Card>
                        ) : (
                            pastEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))
                        )}
                    </TabsContent>
                </Tabs>

                {/* Admin Button - Only visible to logged in admins */}
                {isAdmin && (
                    <div className="mt-12 text-center">
                        <Link to="/admin">
                            <Button variant="outline">Admin Paneli</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
