import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const CreateEvent = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        subtitle: "",
        tagline: "",
        description: "",
        event_date: "",
        event_location: "",
        event_location_detail: "",
        event_address: "",
        max_attendees: "",
        status: "draft",
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/ı/g, "i")
            .replace(/ğ/g, "g")
            .replace(/ü/g, "u")
            .replace(/ş/g, "s")
            .replace(/ö/g, "o")
            .replace(/ç/g, "c")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const handleTitleChange = (value: string) => {
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug: generateSlug(value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            // Validate required fields
            if (!formData.title || !formData.event_date || !formData.event_location) {
                toast({
                    title: "Hata",
                    description: "Lütfen zorunlu alanları doldurun.",
                    variant: "destructive",
                });
                setIsSaving(false);
                return;
            }

            // Check if slug already exists
            const { data: existingEvent, error: checkError } = await supabase
                .from("events")
                .select("id")
                .eq("slug", formData.slug)
                .maybeSingle();

            if (checkError) {
                console.error("Error checking slug:", checkError);
                // Continue anyway, might be a connection issue
            }

            if (existingEvent) {
                toast({
                    title: "Hata",
                    description: "Bu slug zaten kullanılıyor. Başlığı değiştirin.",
                    variant: "destructive",
                });
                setIsSaving(false);
                return;
            }

            // Prepare event data
            const eventData = {
                id: crypto.randomUUID(),
                title: formData.title,
                slug: formData.slug,
                subtitle: formData.subtitle || null,
                tagline: formData.tagline || null,
                description: formData.description || null,
                event_date: formData.event_date,
                event_location: formData.event_location,
                event_location_detail: formData.event_location_detail || null,
                event_address: formData.event_address || null,
                poster_url: null,
                max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
                status: formData.status,
                settings: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            console.log("Creating event with data:", eventData);

            // Try to insert into database
            let insertSuccess = false;
            try {
                const { error: insertError } = await supabase
                    .from("events")
                    .insert([eventData]);

                if (insertError) {
                    console.error("Database insert error:", insertError);
                    throw insertError;
                }
                insertSuccess = true;
            } catch (dbError) {
                console.error("Database error, saving to localStorage:", dbError);
            }

            // Always save to localStorage (as backup or primary)
            const storedEvents = localStorage.getItem("events");
            let events = storedEvents ? JSON.parse(storedEvents) : [];

            // Check if event already exists in array
            const existingIndex = events.findIndex((e: any) => e.id === eventData.id);
            if (existingIndex >= 0) {
                events[existingIndex] = eventData; // Update existing
            } else {
                events.unshift(eventData); // Add to beginning (most recent first)
            }

            localStorage.setItem("events", JSON.stringify(events));
            console.log("Event saved to localStorage. Total events:", events.length);
            console.log("Saved event details:", eventData);

            // Mark this as new event to auto-select in AdminDashboard
            localStorage.setItem("admin_selected_event", eventData.id);
            localStorage.setItem("new_event_created", "true");

            console.log("New event ID to be selected:", eventData.id);

            toast({
                title: "Başarılı!",
                description: insertSuccess
                    ? "Etkinlik oluşturuldu ve veritabanına kaydedildi."
                    : "Etkinlik oluşturuldu (yerel kayıt).",
            });

            navigate("/admin/dashboard");
        } catch (error: any) {
            console.error("Error creating event:", error);
            toast({
                title: "Hata",
                description: error?.message || "Etkinlik oluşturulurken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-12 px-4">
            <div className="container max-w-4xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Admin Paneline Dön
                    </Button>
                </div>

                <Card className="p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">Yeni Etkinlik Oluştur</h1>
                        <p className="text-muted-foreground">
                            Yeni bir etkinlik oluşturun ve yayınlayın
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <Label htmlFor="title">
                                Etkinlik Başlığı <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Örn: Hemşirelikte İnovatif Yaklaşımlar"
                                required
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <Label htmlFor="slug">
                                URL Slug <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                                }
                                placeholder="hemsirelikte-inovatif-yaklasimlar"
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                URL: /event/{formData.slug || "etkinlik-slug"}
                            </p>
                        </div>

                        {/* Subtitle */}
                        <div>
                            <Label htmlFor="subtitle">Alt Başlık</Label>
                            <Input
                                id="subtitle"
                                value={formData.subtitle}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
                                }
                                placeholder="HEMŞIRELIKTE İNOVATIF YAKLAŞIMLAR"
                            />
                        </div>

                        {/* Tagline */}
                        <div>
                            <Label htmlFor="tagline">Slogan</Label>
                            <Input
                                id="tagline"
                                value={formData.tagline}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, tagline: e.target.value }))
                                }
                                placeholder="Rutinleri Kırmaya Cesaretin Var mı?"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Açıklama</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                                placeholder="Etkinlik hakkında detaylı açıklama..."
                                rows={4}
                            />
                        </div>

                        {/* Event Date */}
                        <div>
                            <Label htmlFor="event_date">
                                Etkinlik Tarihi ve Saati <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="event_date"
                                type="datetime-local"
                                value={formData.event_date}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, event_date: e.target.value }))
                                }
                                required
                            />
                        </div>

                        {/* Location */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="event_location">
                                    Etkinlik Yeri <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="event_location"
                                    value={formData.event_location}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            event_location: e.target.value,
                                        }))
                                    }
                                    placeholder="S.B.Ü Mehmet Akif İnan E.A.H"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="event_location_detail">Yer Detayı</Label>
                                <Input
                                    id="event_location_detail"
                                    value={formData.event_location_detail}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            event_location_detail: e.target.value,
                                        }))
                                    }
                                    placeholder="Ana Bina Konferans Salonu"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <Label htmlFor="event_address">Adres</Label>
                            <Input
                                id="event_address"
                                value={formData.event_address}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        event_address: e.target.value,
                                    }))
                                }
                                placeholder="Şanlıurfa"
                            />
                        </div>

                        {/* Max Attendees */}
                        <div>
                            <Label htmlFor="max_attendees">Maksimum Katılımcı Sayısı</Label>
                            <Input
                                id="max_attendees"
                                type="number"
                                value={formData.max_attendees}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        max_attendees: e.target.value,
                                    }))
                                }
                                placeholder="100"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <Label htmlFor="status">Durum</Label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                                }
                                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            >
                                <option value="draft">Taslak</option>
                                <option value="published">Yayınla</option>
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">
                                Taslak etkinlikler yalnızca admin tarafından görünür
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" size="lg" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Kaydediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Etkinliği Oluştur
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/admin/dashboard")}
                                disabled={isSaving}
                            >
                                İptal
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default CreateEvent;
