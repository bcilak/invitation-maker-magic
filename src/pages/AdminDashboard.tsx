import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Download, Search, Loader2, Users, Mail, Building, Settings, LogOut, Calendar, MapPin, Layout, Eye, EyeOff, GripVertical, Save, Plus, Trash2, Image, Edit, ExternalLink, CheckCircle2, Clock, XCircle, Palette, Sparkles, ArrowUpDown, Monitor, ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { InvitationGenerator } from "@/components/InvitationGenerator";
import { AdvancedInvitationGenerator } from "@/components/AdvancedInvitationGenerator";
import { PersonalInvitation } from "@/components/PersonalInvitation";
import { PosterManager } from "@/components/PosterManager";
import { EventSelector } from "@/components/EventSelector";
import EventEditor from "@/components/EventEditor";
import { PageSectionEditor } from "@/components/PageSectionEditor";
import { QRScanner } from "@/components/QRScanner";

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
    created_at: string;
    updated_at: string;
}

interface Registration {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    institution: string;
    position: string;
    event_id: string | null;
    created_at: string;
}

interface EventSettings {
    id: string;
    event_title: string;
    event_subtitle: string;
    event_tagline: string;
    event_date: string;
    event_location: string;
    event_location_detail: string;
    event_address: string;
}

interface PageSection {
    id: string;
    section_key: string;
    section_title: string;
    is_visible: boolean;
    display_order: number;
    event_id: string | null;
    settings: any;
    created_at?: string;
    updated_at?: string;
}

interface ProgramItem {
    time: string;
    title: string;
    description: string;
}

export default function AdminDashboard() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [filteredData, setFilteredData] = useState<Registration[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [eventSettings, setEventSettings] = useState<EventSettings | null>(null);
    const [pageSections, setPageSections] = useState<PageSection[]>([]);
    const [editingSection, setEditingSection] = useState<PageSection | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [draggedItem, setDraggedItem] = useState<PageSection | null>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is logged in
        const adminSession = localStorage.getItem("admin_session");
        if (!adminSession) {
            navigate("/admin/login");
            return;
        }

        // Initial fetch
        fetchEvents();

        // Check if we need to reload events (after creating new event)
        const newEventCreated = localStorage.getItem("new_event_created");
        if (newEventCreated === "true") {
            console.log("New event created flag detected, refreshing events...");
            localStorage.removeItem("new_event_created");

            // Force refetch multiple times to ensure we get the new event
            setTimeout(() => {
                console.log("First refresh...");
                fetchEvents();
            }, 300);

            setTimeout(() => {
                console.log("Second refresh...");
                fetchEvents();
            }, 1000);
        }
    }, [navigate]);

    useEffect(() => {
        // Load saved selected event from localStorage
        const savedEventId = localStorage.getItem("admin_selected_event");

        if (events.length === 0) return; // Wait for events to load

        // Check if saved event ID exists in current events list
        const savedEventExists = savedEventId && events.some(e => e.id === savedEventId);

        if (savedEventExists) {
            setSelectedEventId(savedEventId);
        } else {
            // Auto-select first event if saved one doesn't exist
            setSelectedEventId(events[0].id);
            localStorage.setItem("admin_selected_event", events[0].id);
        }
    }, [events]);

    useEffect(() => {
        // When event is selected, fetch its data
        if (selectedEventId && events.length > 0) {
            fetchRegistrations();
            fetchEventSettings();
            fetchPageSections();
        }
    }, [selectedEventId, events]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredData(registrations);
        } else {
            const filtered = registrations.filter(
                (reg) =>
                    reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reg.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    reg.phone.includes(searchTerm)
            );
            setFilteredData(filtered);
        }
    }, [searchTerm, registrations]);

    const fetchRegistrations = async () => {
        if (!selectedEventId) return;

        try {
            // Try localStorage first
            const localStorageRegistrations = localStorage.getItem("event_registrations");
            if (localStorageRegistrations) {
                const localData = JSON.parse(localStorageRegistrations);
                // Filter by selected event
                const eventRegistrations = localData.filter(
                    (reg: Registration) => reg.event_id === selectedEventId
                );
                setRegistrations(eventRegistrations);
                setFilteredData(eventRegistrations);
            }

            // Try to fetch from database
            const { data, error } = await supabase
                .from("registrations")
                .select("*")
                .eq("event_id", selectedEventId)
                .order("created_at", { ascending: false });

            if (!error && data && data.length > 0) {
                setRegistrations(data);
                setFilteredData(data);
            }
        } catch (error) {
            console.error("Error fetching registrations:", error);
            // Don't show error toast if localStorage worked
            const localStorageRegistrations = localStorage.getItem("event_registrations");
            if (!localStorageRegistrations) {
                toast({
                    title: "Hata",
                    description: "Kayıtlar yüklenirken bir hata oluştu.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchEvents = async () => {
        try {
            let allEvents: Event[] = [];

            // Try localStorage first to get any unsaved events
            const storedEvents = localStorage.getItem("events");
            if (storedEvents) {
                try {
                    const localEvents = JSON.parse(storedEvents);
                    allEvents = Array.isArray(localEvents) ? localEvents : [];
                } catch (parseError) {
                    console.error("Error parsing localStorage events:", parseError);
                }
            }

            // Try to fetch from database (this will override localStorage if successful)
            try {
                const { data, error } = await supabase
                    .from("events")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (!error && data) {
                    // If database has events, use them
                    if (data.length > 0) {
                        allEvents = data;
                        // Update localStorage with fresh data from database
                        localStorage.setItem("events", JSON.stringify(data));
                    }
                }
            } catch (dbError) {
                console.log("Database fetch failed, using localStorage:", dbError);
            }

            // ALWAYS update state, even if empty (to show "no events" message)
            setEvents(allEvents);

            console.log("Fetched events count:", allEvents.length);
        } catch (error) {
            console.error("Error fetching events:", error);
            setEvents([]); // Set empty array on error
        }
    };

    const handleEventChange = (eventId: string) => {
        setSelectedEventId(eventId);
        localStorage.setItem("admin_selected_event", eventId);

        // Update current_event in localStorage for components
        const selectedEvent = events.find(e => e.id === eventId);
        if (selectedEvent) {
            localStorage.setItem("current_event", JSON.stringify(selectedEvent));
            localStorage.setItem("event_settings", JSON.stringify({
                event_title: selectedEvent.title,
                event_subtitle: selectedEvent.subtitle || "",
                event_tagline: selectedEvent.tagline || "",
                event_date: selectedEvent.event_date,
                event_location: selectedEvent.event_location,
                event_location_detail: selectedEvent.event_location_detail || "",
                event_address: selectedEvent.event_address || "",
            }));
        }
    };

    const handleEventStatusChange = async (eventId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("events")
                .update({ status: newStatus })
                .eq("id", eventId);

            if (error) throw error;

            toast({
                title: "Başarılı!",
                description: `Etkinlik durumu ${newStatus === 'published' ? 'yayınlandı' : 'güncellendi'}.`,
            });

            fetchEvents();
        } catch (error) {
            console.error("Error updating event status:", error);
            toast({
                title: "Hata",
                description: "Etkinlik durumu güncellenirken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return;

        try {
            const { error } = await supabase
                .from("events")
                .delete()
                .eq("id", eventId);

            if (error) throw error;

            toast({
                title: "Başarılı!",
                description: "Etkinlik silindi.",
            });

            fetchEvents();
        } catch (error) {
            console.error("Error deleting event:", error);
            toast({
                title: "Hata",
                description: "Etkinlik silinirken bir hata oluştu.",
                variant: "destructive",
            });
        }
    };

    const handleUpdateEvent = (updatedEvent: Event) => {
        // Update events state
        setEvents(prevEvents =>
            prevEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e)
        );

        // If this is the selected event, update settings too
        if (selectedEventId === updatedEvent.id) {
            setEventSettings({
                id: updatedEvent.id,
                event_title: updatedEvent.title,
                event_subtitle: updatedEvent.subtitle || "",
                event_tagline: updatedEvent.tagline || "",
                event_date: updatedEvent.event_date,
                event_location: updatedEvent.event_location,
                event_location_detail: updatedEvent.event_location_detail || "",
                event_address: updatedEvent.event_address || "",
            });
        }
    };

    const fetchEventSettings = async () => {
        if (!selectedEventId) return;

        try {
            // Find the selected event from state
            let selectedEvent = events.find(e => e.id === selectedEventId);

            // If not found in state, try localStorage
            if (!selectedEvent) {
                const storedEvents = localStorage.getItem("events");
                if (storedEvents) {
                    const localEvents = JSON.parse(storedEvents);
                    selectedEvent = localEvents.find((e: Event) => e.id === selectedEventId);
                }
            }

            // If still not found, try database
            if (!selectedEvent) {
                const { data, error } = await supabase
                    .from("events")
                    .select("*")
                    .eq("id", selectedEventId)
                    .single();

                if (!error && data) {
                    selectedEvent = data;
                }
            }

            if (selectedEvent) {
                const settings = {
                    id: selectedEvent.id,
                    event_title: selectedEvent.title,
                    event_subtitle: selectedEvent.subtitle || "",
                    event_tagline: selectedEvent.tagline || "",
                    event_date: selectedEvent.event_date,
                    event_location: selectedEvent.event_location,
                    event_location_detail: selectedEvent.event_location_detail || "",
                    event_address: selectedEvent.event_address || "",
                };

                setEventSettings(settings);

                console.log("Event settings loaded:", settings);
            } else {
                console.warn("Event not found:", selectedEventId);
            }
        } catch (error) {
            console.error("Error fetching event settings:", error);
        }
    };

    const fetchPageSections = async () => {
        if (!selectedEventId) return;

        try {
            const { data, error } = await supabase
                .from("page_sections")
                .select("*")
                .eq("event_id", selectedEventId)
                .order("display_order", { ascending: true });

            if (error) {
                console.error("Error fetching page sections:", error);
                toast({
                    title: "Hata",
                    description: "Sayfa bölümleri yüklenemedi: " + error.message,
                    variant: "destructive",
                });
                setPageSections([]); // Set empty array to stop loading
                return;
            }

            if (data && data.length > 0) {
                setPageSections(data);
            } else {
                setPageSections([]);
                // Create default sections for this event if none exist
                await createDefaultSections();
            }
        } catch (error: any) {
            console.error("Error fetching page sections:", error);
            setPageSections([]); // Set empty array to stop loading
            toast({
                title: "Hata",
                description: "Bir hata oluştu: " + (error?.message || "Bilinmeyen hata"),
                variant: "destructive",
            });
        }
    };

    const createDefaultSections = async () => {
        if (!selectedEventId) return;

        const defaultSections = [
            { section_key: "hero", section_title: "Ana Görsel", display_order: 1 },
            { section_key: "countdown", section_title: "Geri Sayım", display_order: 2 },
            { section_key: "program", section_title: "Program", display_order: 3 },
            { section_key: "registration", section_title: "Kayıt Formu", display_order: 4 },
            { section_key: "location", section_title: "Konum", display_order: 5 },
            { section_key: "footer", section_title: "Footer", display_order: 6 },
        ];

        try {
            const sectionsToInsert = defaultSections.map(section => ({
                ...section,
                event_id: selectedEventId,
                is_visible: true,
                settings: {},
            }));

            const { error } = await supabase
                .from("page_sections")
                .insert(sectionsToInsert);

            if (error) throw error;

            await fetchPageSections();

            toast({
                title: "Başarılı",
                description: "Varsayılan bölümler oluşturuldu.",
            });
        } catch (error) {
            console.error("Error creating default sections:", error);
            toast({
                title: "Hata",
                description: "Varsayılan bölümler oluşturulamadı.",
                variant: "destructive",
            });
        }
    };

    const handleSectionVisibilityToggle = async (section: PageSection) => {
        try {
            const { error } = await supabase
                .from("page_sections")
                .update({ is_visible: !section.is_visible })
                .eq("id", section.id);

            if (error) throw error;

            setPageSections(
                pageSections.map((s) =>
                    s.id === section.id ? { ...s, is_visible: !s.is_visible } : s
                )
            );

            toast({
                title: "Başarılı",
                description: `${section.section_title} ${!section.is_visible ? "gösterilecek" : "gizlenecek"}.`,
            });
        } catch (error) {
            console.error("Error updating section visibility:", error);
            toast({
                title: "Hata",
                description: "Görünürlük değiştirilemedi.",
                variant: "destructive",
            });
        }
    };

    const handleDragStart = (section: PageSection) => {
        setDraggedItem(section);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (targetSection: PageSection) => {
        if (!draggedItem || draggedItem.id === targetSection.id) return;

        const newSections = [...pageSections];
        const draggedIndex = newSections.findIndex((s) => s.id === draggedItem.id);
        const targetIndex = newSections.findIndex((s) => s.id === targetSection.id);

        // Remove dragged item and insert at new position
        const [removed] = newSections.splice(draggedIndex, 1);
        newSections.splice(targetIndex, 0, removed);

        // Update display_order for all sections
        const updatedSections = newSections.map((section, index) => ({
            ...section,
            display_order: index + 1,
        }));

        setPageSections(updatedSections);
        setDraggedItem(null);

        // Update in database
        try {
            const updates = updatedSections.map((section) =>
                supabase
                    .from("page_sections")
                    .update({ display_order: section.display_order })
                    .eq("id", section.id)
            );

            await Promise.all(updates);

            toast({
                title: "Başarılı",
                description: "Bölüm sırası güncellendi.",
            });
        } catch (error) {
            console.error("Error updating section order:", error);
            toast({
                title: "Hata",
                description: "Sıralama kaydedilemedi.",
                variant: "destructive",
            });
        }
    };

    const handleSaveSectionSettings = async (section: PageSection) => {
        try {
            const { error } = await supabase
                .from("page_sections")
                .update({ settings: section.settings })
                .eq("id", section.id);

            if (error) throw error;

            setPageSections(
                pageSections.map((s) => (s.id === section.id ? section : s))
            );
            setEditingSection(null);

            toast({
                title: "Başarılı",
                description: "Bölüm ayarları kaydedildi.",
            });
        } catch (error) {
            console.error("Error saving section settings:", error);
            toast({
                title: "Hata",
                description: "Ayarlar kaydedilemedi.",
                variant: "destructive",
            });
        }
    };

    const addProgramItem = (section: PageSection) => {
        const newItem: ProgramItem = {
            time: "00:00 - 00:00",
            title: "Yeni Program Maddesi",
            description: "Açıklama",
        };
        const updatedSettings = {
            ...section.settings,
            program_items: [...(section.settings.program_items || []), newItem],
        };
        setEditingSection({ ...section, settings: updatedSettings });
    };

    const removeProgramItem = (section: PageSection, index: number) => {
        const updatedSettings = {
            ...section.settings,
            program_items: section.settings.program_items.filter((_: any, i: number) => i !== index),
        };
        setEditingSection({ ...section, settings: updatedSettings });
    };

    const updateProgramItem = (section: PageSection, index: number, field: keyof ProgramItem, value: string) => {
        const updatedItems = [...section.settings.program_items];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        const updatedSettings = {
            ...section.settings,
            program_items: updatedItems,
        };
        setEditingSection({ ...section, settings: updatedSettings });
    };

    const handleLogout = async () => {
        try {
            // Sign out from Supabase
            await supabase.auth.signOut();

            // Clear all admin-related localStorage items
            localStorage.removeItem("admin_session");
            localStorage.removeItem("admin_selected_event");
            localStorage.removeItem("new_event_created");

            // Clear rate limiting
            localStorage.removeItem("registration_rate_limit");

            toast({
                title: "Çıkış Yapıldı",
                description: "Güvenli bir şekilde çıkış yaptınız.",
            });

            navigate("/admin/login");
        } catch (error) {
            console.error("Logout error:", error);
            // Even if there's an error, clear local data and redirect
            localStorage.removeItem("admin_session");
            localStorage.removeItem("admin_selected_event");
            navigate("/admin/login");
        }
    };

    const handleSaveEventSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventSettings || !selectedEventId) return;

        setIsSaving(true);
        try {
            // Update the event in database
            const { error } = await supabase
                .from("events")
                .update({
                    title: eventSettings.event_title,
                    subtitle: eventSettings.event_subtitle,
                    tagline: eventSettings.event_tagline,
                    event_date: eventSettings.event_date,
                    event_location: eventSettings.event_location,
                    event_location_detail: eventSettings.event_location_detail,
                    event_address: eventSettings.event_address,
                })
                .eq("id", selectedEventId);

            if (error) throw error;

            // Update localStorage
            localStorage.setItem("event_settings", JSON.stringify(eventSettings));

            // Update current_event in localStorage
            const updatedEvent = events.find(e => e.id === selectedEventId);
            if (updatedEvent) {
                const updated = {
                    ...updatedEvent,
                    title: eventSettings.event_title,
                    subtitle: eventSettings.event_subtitle,
                    tagline: eventSettings.event_tagline,
                    event_date: eventSettings.event_date,
                    event_location: eventSettings.event_location,
                    event_location_detail: eventSettings.event_location_detail,
                    event_address: eventSettings.event_address,
                };
                localStorage.setItem("current_event", JSON.stringify(updated));
            }

            // Dispatch custom event to update settings in real-time
            window.dispatchEvent(new CustomEvent("event_settings_updated", {
                detail: eventSettings
            }));

            // Refresh events list
            await fetchEvents();

            toast({
                title: "Başarılı!",
                description: "Etkinlik ayarları güncellendi.",
            });
        } catch (error) {
            console.error("Error saving event settings:", error);
            toast({
                title: "Hata",
                description: "Ayarlar kaydedilirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const exportToCSV = () => {
        const headers = ["Ad Soyad", "E-posta", "Telefon", "Kurum", "Pozisyon", "Kayıt Tarihi"];
        const csvData = filteredData.map((reg) => [
            reg.full_name,
            reg.email,
            reg.phone,
            reg.institution,
            reg.position,
            new Date(reg.created_at).toLocaleString("tr-TR"),
        ]);

        const csvContent = [
            headers.join(","),
            ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `kayitlar_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
            title: "Başarılı!",
            description: `${filteredData.length} kayıt CSV olarak indirildi.`,
        });
    };

    const stats = {
        total: registrations.length,
        today: registrations.filter(
            (reg) =>
                new Date(reg.created_at).toDateString() === new Date().toDateString()
        ).length,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-12 px-4">
            <div className="container max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Admin <span className="text-primary">Panel</span>
                        </h1>
                        <p className="text-muted-foreground">Etkinlik Kayıt Yönetimi</p>
                    </div>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıkış Yap
                    </Button>
                </div>

                <Tabs defaultValue="registrations" className="space-y-6">
                    <TabsList className="grid w-full max-w-6xl grid-cols-6">
                        <TabsTrigger value="events">
                            <Calendar className="w-4 h-4 mr-2" />
                            Etkinlikler
                        </TabsTrigger>
                        <TabsTrigger value="registrations">Kayıtlar</TabsTrigger>
                        <TabsTrigger value="qr-scanner">
                            <ScanLine className="w-4 h-4 mr-2" />
                            QR Okuyucu
                        </TabsTrigger>
                        <TabsTrigger value="page-builder">
                            <Layout className="w-4 h-4 mr-2" />
                            Sayfa Düzenleyici
                        </TabsTrigger>
                        <TabsTrigger value="invitation">
                            <Image className="w-4 h-4 mr-2" />
                            Davetiye Oluştur
                        </TabsTrigger>
                        <TabsTrigger value="settings">Etkinlik Ayarları</TabsTrigger>
                    </TabsList>

                    {/* Events Tab */}
                    <TabsContent value="events" className="space-y-6">
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Etkinlik Yönetimi</h2>
                                    <p className="text-muted-foreground">Etkinlikleri yönetin, durumlarını değiştirin</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => fetchEvents()}>
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Yenile
                                    </Button>
                                    <Button onClick={() => navigate('/admin/events/create')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Yeni Etkinlik
                                    </Button>
                                </div>
                            </div>

                            {events.length === 0 ? (
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Henüz etkinlik yok</h3>
                                    <p className="text-muted-foreground mb-4">İlk etkinliğinizi oluşturarak başlayın</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {events.map((event) => {
                                        const eventDate = new Date(event.event_date);
                                        const isPast = eventDate < new Date();

                                        return (
                                            <Card key={event.id} className="p-6">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="text-xl font-bold">{event.title}</h3>
                                                            {event.status === 'published' && (
                                                                <Badge variant="default" className="gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Yayında
                                                                </Badge>
                                                            )}
                                                            {event.status === 'draft' && (
                                                                <Badge variant="secondary" className="gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    Taslak
                                                                </Badge>
                                                            )}
                                                            {event.status === 'cancelled' && (
                                                                <Badge variant="destructive" className="gap-1">
                                                                    <XCircle className="w-3 h-3" />
                                                                    İptal
                                                                </Badge>
                                                            )}
                                                            {isPast && (
                                                                <Badge variant="outline">Geçmiş</Badge>
                                                            )}
                                                        </div>

                                                        {event.tagline && (
                                                            <p className="text-muted-foreground mb-3">{event.tagline}</p>
                                                        )}

                                                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4 text-primary" />
                                                                <span>{eventDate.toLocaleDateString('tr-TR', {
                                                                    day: 'numeric',
                                                                    month: 'long',
                                                                    year: 'numeric'
                                                                })}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="w-4 h-4 text-primary" />
                                                                <span>{event.event_location}</span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-3 text-xs text-muted-foreground">
                                                            Slug: <code className="bg-muted px-2 py-1 rounded">{event.slug}</code>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setEditingEvent(event)}
                                                        >
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Düzenle
                                                        </Button>

                                                        {event.status === 'published' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(`/event/${event.slug}`, '_blank')}
                                                            >
                                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                                Görüntüle
                                                            </Button>
                                                        )}

                                                        {event.status === 'draft' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleEventStatusChange(event.id, 'published')}
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                Yayınla
                                                            </Button>
                                                        )}

                                                        {event.status === 'published' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEventStatusChange(event.id, 'draft')}
                                                            >
                                                                Taslağa Al
                                                            </Button>
                                                        )}

                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteEvent(event.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Sil
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="registrations" className="space-y-6">
                        {/* Event Selector */}
                        <EventSelector
                            events={events}
                            selectedEventId={selectedEventId}
                            onEventChange={handleEventChange}
                        />

                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <Card className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Toplam Kayıt</p>
                                        <p className="text-3xl font-bold">{stats.total}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-accent/10">
                                        <Mail className="w-6 h-6 text-accent" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Bugünkü Kayıtlar</p>
                                        <p className="text-3xl font-bold">{stats.today}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-secondary/50">
                                        <Building className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Farklı Kurum</p>
                                        <p className="text-3xl font-bold">
                                            {new Set(registrations.map((r) => r.institution)).size}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Search and Export */}
                        <Card className="p-6">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="relative flex-1 w-full md:max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Ad, e-posta, kurum veya telefon ile ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button onClick={exportToCSV} variant="default" className="w-full md:w-auto">
                                    <Download className="mr-2 h-4 w-4" />
                                    CSV İndir ({filteredData.length} kayıt)
                                </Button>
                            </div>
                        </Card>

                        {/* Table */}
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ad Soyad</TableHead>
                                            <TableHead>E-posta</TableHead>
                                            <TableHead>Telefon</TableHead>
                                            <TableHead>Kurum</TableHead>
                                            <TableHead>Pozisyon</TableHead>
                                            <TableHead>Kayıt Tarihi</TableHead>
                                            <TableHead>Davetiye</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    {searchTerm ? "Sonuç bulunamadı" : "Henüz kayıt yok"}
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredData.map((reg) => (
                                                <TableRow key={reg.id}>
                                                    <TableCell className="font-medium">{reg.full_name}</TableCell>
                                                    <TableCell>{reg.email}</TableCell>
                                                    <TableCell>{reg.phone}</TableCell>
                                                    <TableCell>{reg.institution}</TableCell>
                                                    <TableCell>{reg.position}</TableCell>
                                                    <TableCell>
                                                        {new Date(reg.created_at).toLocaleString("tr-TR", {
                                                            day: "2-digit",
                                                            month: "2-digit",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {eventSettings && (
                                                            <PersonalInvitation
                                                                fullName={reg.full_name}
                                                                email={reg.email}
                                                                eventSettings={eventSettings}
                                                                registrationId={reg.id}
                                                            />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="qr-scanner" className="space-y-6">
                        {/* Event Selector */}
                        <EventSelector
                            events={events}
                            selectedEventId={selectedEventId}
                            onEventChange={handleEventChange}
                        />

                        {/* QR Scanner Header */}
                        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-green-600">
                                    <ScanLine className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        QR Kod Okuyucu
                                        <Badge variant="secondary" className="ml-2">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Canlı
                                        </Badge>
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Etkinliğe giriş ve çıkış işlemlerini QR kod ile yönetin
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {selectedEventId ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Check-in Scanner */}
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        Giriş Tarama
                                    </h3>
                                    <QRScanner eventId={selectedEventId} mode="check-in" />
                                </div>

                                {/* Check-out Scanner */}
                                <div>
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-blue-600" />
                                        Çıkış Tarama
                                    </h3>
                                    <QRScanner eventId={selectedEventId} mode="check-out" />
                                </div>
                            </div>
                        ) : (
                            <Card className="p-12 text-center">
                                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-xl font-semibold mb-2">Etkinlik Seçin</h3>
                                <p className="text-muted-foreground">
                                    QR kod okuyucuyu kullanmak için önce bir etkinlik seçin
                                </p>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="page-builder">
                        {/* Event Selector */}
                        <EventSelector
                            events={events}
                            selectedEventId={selectedEventId}
                            onEventChange={handleEventChange}
                        />

                        {/* Page Builder Header */}
                        <Card className="p-6 mt-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10">
                                        <Layout className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            Sayfa Düzenleyici
                                            <Badge variant="secondary" className="ml-2">
                                                <Sparkles className="w-3 h-3 mr-1" />
                                                Gelişmiş
                                            </Badge>
                                        </h2>
                                        <p className="text-muted-foreground">
                                            Etkinlik sayfanızı tamamen özelleştirin • Sürükle & Bırak • Canlı Önizleme
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedEventId && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const event = events.find(e => e.id === selectedEventId);
                                                if (event) window.open(`/event/${event.slug}`, '_blank');
                                            }}
                                        >
                                            <Monitor className="w-4 h-4 mr-2" />
                                            Canlı Önizle
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <Card className="p-4 text-center">
                                <div className="text-3xl font-bold text-primary">{pageSections.length}</div>
                                <div className="text-sm text-muted-foreground">Toplam Bölüm</div>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {pageSections.filter(s => s.is_visible).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Görünür</div>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="text-3xl font-bold text-gray-400">
                                    {pageSections.filter(s => !s.is_visible).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Gizli</div>
                            </Card>
                            <Card className="p-4 text-center">
                                <div className="text-3xl font-bold text-accent">
                                    {pageSections.filter(s => Object.keys(s.settings || {}).length > 0).length}
                                </div>
                                <div className="text-sm text-muted-foreground">Özelleştirilmiş</div>
                            </Card>
                        </div>

                        {/* Sections List */}
                        <Card className="p-6 mt-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
                                    <span className="font-medium">Bölüm Sıralaması</span>
                                    <span className="text-sm text-muted-foreground">(Sürükleyerek sıralayın)</span>
                                </div>
                            </div>

                            {pageSections.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        Bölümler yükleniyor...
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pageSections.map((section, index) => {
                                        const sectionIcons: Record<string, any> = {
                                            hero: Image,
                                            countdown: Clock,
                                            program: Calendar,
                                            registration: Users,
                                            location: MapPin,
                                            footer: Layout,
                                        };
                                        const SectionIcon = sectionIcons[section.section_key] || Layout;
                                        const hasCustomSettings = Object.keys(section.settings || {}).length > 0;

                                        return (
                                            <Card
                                                key={section.id}
                                                className={`p-4 transition-all duration-200 hover:shadow-md cursor-move border-2 ${draggedItem?.id === section.id
                                                    ? "opacity-50 border-primary border-dashed"
                                                    : section.is_visible
                                                        ? "border-transparent hover:border-primary/30"
                                                        : "border-transparent bg-muted/50"
                                                    }`}
                                                draggable
                                                onDragStart={() => handleDragStart(section)}
                                                onDragOver={handleDragOver}
                                                onDrop={() => handleDrop(section)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Drag Handle */}
                                                    <div className="p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                                                    </div>

                                                    {/* Section Icon */}
                                                    <div className={`p-3 rounded-xl ${section.is_visible ? 'bg-primary/10' : 'bg-muted'}`}>
                                                        <SectionIcon className={`w-5 h-5 ${section.is_visible ? 'text-primary' : 'text-muted-foreground'}`} />
                                                    </div>

                                                    {/* Section Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`font-semibold text-lg ${!section.is_visible ? 'text-muted-foreground' : ''}`}>
                                                                {section.section_title}
                                                            </span>
                                                            <Badge variant="outline" className="font-mono text-xs">
                                                                #{section.display_order}
                                                            </Badge>
                                                            {hasCustomSettings && (
                                                                <Badge variant="secondary" className="gap-1">
                                                                    <Palette className="w-3 h-3" />
                                                                    Özel
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {section.section_key} bölümü
                                                            {hasCustomSettings && ` • ${Object.keys(section.settings).length} ayar`}
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-3">
                                                        {/* Visibility Toggle */}
                                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                                                            <Switch
                                                                checked={section.is_visible}
                                                                onCheckedChange={() => handleSectionVisibilityToggle(section)}
                                                                aria-label={`${section.section_title} görünürlüğü`}
                                                            />
                                                            {section.is_visible ? (
                                                                <Eye className="w-4 h-4 text-green-600" />
                                                            ) : (
                                                                <EyeOff className="w-4 h-4 text-gray-400" />
                                                            )}
                                                        </div>

                                                        {/* Edit Button */}
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => setEditingSection(section)}
                                                            className="gap-2"
                                                        >
                                                            <Settings className="w-4 h-4" />
                                                            Düzenle
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>

                        {/* Section Editor */}
                        {editingSection && (
                            <div className="mt-6">
                                <PageSectionEditor
                                    section={editingSection}
                                    onSave={handleSaveSectionSettings}
                                    onCancel={() => setEditingSection(null)}
                                />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="invitation">
                        {/* Event Selector */}
                        <EventSelector
                            events={events}
                            selectedEventId={selectedEventId}
                            onEventChange={handleEventChange}
                        />

                        <Card className="p-8 mt-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    <Image className="w-6 h-6" />
                                    Gelişmiş Davetiye Oluşturucu
                                    <Badge variant="secondary" className="ml-2">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Yeni
                                    </Badge>
                                </h2>
                                <p className="text-muted-foreground">
                                    8 farklı şablon, özelleştirilebilir renkler, QR kod desteği ve çoklu boyut seçenekleri.
                                    Sosyal medya için optimize edilmiş davetiye görselleri oluşturun.
                                </p>
                            </div>

                            {eventSettings ? (
                                <AdvancedInvitationGenerator eventSettings={eventSettings} />
                            ) : (
                                <div className="text-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                                    <p className="text-muted-foreground">Etkinlik ayarları yükleniyor...</p>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="settings">
                        {/* Event Selector */}
                        <EventSelector
                            events={events}
                            selectedEventId={selectedEventId}
                            onEventChange={handleEventChange}
                        />

                        {eventSettings ? (
                            <Card className="p-8 mt-6">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                        <Settings className="w-6 h-6" />
                                        Etkinlik Bilgileri
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Etkinlik detaylarını buradan düzenleyebilirsiniz. Değişiklikler anında ana sayfada görünür.
                                    </p>
                                </div>

                                <form onSubmit={handleSaveEventSettings} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="event_title">Etkinlik Başlığı</Label>
                                            <Input
                                                id="event_title"
                                                value={eventSettings.event_title}
                                                onChange={(e) =>
                                                    setEventSettings({ ...eventSettings, event_title: e.target.value })
                                                }
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="event_subtitle">Alt Başlık</Label>
                                            <Input
                                                id="event_subtitle"
                                                value={eventSettings.event_subtitle}
                                                onChange={(e) =>
                                                    setEventSettings({ ...eventSettings, event_subtitle: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="event_tagline">Slogan</Label>
                                        <Input
                                            id="event_tagline"
                                            value={eventSettings.event_tagline}
                                            onChange={(e) =>
                                                setEventSettings({ ...eventSettings, event_tagline: e.target.value })
                                            }
                                            placeholder="Rutinleri Kırmaya Cesaretin Var mı?"
                                            required
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="event_date" className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Tarih ve Saat
                                            </Label>
                                            <Input
                                                id="event_date"
                                                type="datetime-local"
                                                value={eventSettings.event_date.slice(0, 16)}
                                                onChange={(e) =>
                                                    setEventSettings({ ...eventSettings, event_date: e.target.value })
                                                }
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="event_location">Lokasyon</Label>
                                            <Input
                                                id="event_location"
                                                value={eventSettings.event_location}
                                                onChange={(e) =>
                                                    setEventSettings({ ...eventSettings, event_location: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="event_location_detail">Lokasyon Detayı</Label>
                                            <Input
                                                id="event_location_detail"
                                                value={eventSettings.event_location_detail}
                                                onChange={(e) =>
                                                    setEventSettings({
                                                        ...eventSettings,
                                                        event_location_detail: e.target.value,
                                                    })
                                                }
                                                placeholder="Ana Bina Konferans Salonu"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="event_address" className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Şehir/Adres
                                            </Label>
                                            <Input
                                                id="event_address"
                                                value={eventSettings.event_address}
                                                onChange={(e) =>
                                                    setEventSettings({ ...eventSettings, event_address: e.target.value })
                                                }
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <Button type="submit" size="lg" disabled={isSaving}>
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Kaydediliyor...
                                                </>
                                            ) : (
                                                "Değişiklikleri Kaydet"
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={fetchEventSettings}
                                            disabled={isSaving}
                                        >
                                            İptal
                                        </Button>
                                    </div>
                                </form>

                                {/* Poster Manager Section */}
                                <div className="mt-12 pt-8 border-t">
                                    <PosterManager
                                        eventId={selectedEventId || ""}
                                        currentPosterUrl={events.find(e => e.id === selectedEventId)?.poster_url}
                                    />
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-8 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                                <p className="text-muted-foreground">Etkinlik ayarları yükleniyor...</p>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Button variant="outline" onClick={() => navigate("/")}>
                        Ana Sayfaya Dön
                    </Button>
                </div>
            </div>

            {/* Event Editor Modal */}
            {editingEvent && (
                <EventEditor
                    event={editingEvent}
                    onClose={() => setEditingEvent(null)}
                    onUpdate={handleUpdateEvent}
                />
            )}
        </div>
    );
}
