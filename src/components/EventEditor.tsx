import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, X } from "lucide-react";

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
    status: string;
    max_attendees: number | null;
}

interface EventEditorProps {
    event: Event;
    onClose: () => void;
    onUpdate: (updatedEvent: Event) => void;
}

export default function EventEditor({ event, onClose, onUpdate }: EventEditorProps) {
    const [formData, setFormData] = useState<Event>(event);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleChange = (field: keyof Event, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const generateSlug = (title: string): string => {
        const turkishMap: Record<string, string> = {
            'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
            'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
        };

        return title
            .split('')
            .map(char => turkishMap[char] || char)
            .join('')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleTitleChange = (title: string) => {
        handleChange('title', title);
        // Auto-generate slug when title changes
        if (title) {
            const baseSlug = generateSlug(title);
            const year = new Date(formData.event_date).getFullYear();
            handleChange('slug', `${baseSlug}-${year}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate required fields
            if (!formData.title || !formData.event_date || !formData.event_location) {
                throw new Error("Lütfen tüm zorunlu alanları doldurun.");
            }

            // Check for duplicate slug (excluding current event)
            const { data: existingEvent, error: checkError } = await supabase
                .from('events')
                .select('id')
                .eq('slug', formData.slug)
                .neq('id', event.id)
                .single();

            if (existingEvent) {
                throw new Error("Bu slug zaten kullanılıyor. Lütfen farklı bir başlık girin.");
            }

            // Update event
            const { data: updatedEvent, error: updateError } = await supabase
                .from('events')
                .update({
                    title: formData.title,
                    slug: formData.slug,
                    subtitle: formData.subtitle || null,
                    tagline: formData.tagline || null,
                    description: formData.description || null,
                    event_date: formData.event_date,
                    event_location: formData.event_location,
                    event_location_detail: formData.event_location_detail || null,
                    event_address: formData.event_address || null,
                    status: formData.status,
                    max_attendees: formData.max_attendees || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', event.id)
                .select()
                .single();

            if (updateError) throw updateError;

            // Update localStorage
            const storedEvents = JSON.parse(localStorage.getItem("events") || "[]");
            const updatedEvents = storedEvents.map((e: Event) =>
                e.id === event.id ? updatedEvent : e
            );
            localStorage.setItem("events", JSON.stringify(updatedEvents));

            toast({
                title: "Başarılı! 🎉",
                description: "Etkinlik bilgileri güncellendi.",
            });

            onUpdate(updatedEvent);
            onClose();

        } catch (error: any) {
            console.error("Error updating event:", error);
            toast({
                title: "Hata",
                description: error.message || "Etkinlik güncellenirken bir hata oluştu.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-4xl p-6 my-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Etkinlik Düzenle</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Label htmlFor="title">
                                Etkinlik Başlığı <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Örn: Hemşirelikte İnovatif Yaklaşımlar"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="slug">
                                URL Slug (Otomatik oluşturuldu)
                            </Label>
                            <Input
                                id="slug"
                                value={formData.slug}
                                onChange={(e) => handleChange('slug', e.target.value)}
                                placeholder="hemsirelikte-inovatif-yaklasimlar-2025"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Bu slug etkinlik URL'inde kullanılır: /event/{formData.slug}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="subtitle">Alt Başlık</Label>
                            <Input
                                id="subtitle"
                                value={formData.subtitle || ""}
                                onChange={(e) => handleChange('subtitle', e.target.value)}
                                placeholder="HEMŞIRELIKTE İNOVATIF YAKLAŞIMLAR"
                            />
                        </div>

                        <div>
                            <Label htmlFor="tagline">Slogan</Label>
                            <Input
                                id="tagline"
                                value={formData.tagline || ""}
                                onChange={(e) => handleChange('tagline', e.target.value)}
                                placeholder="Rutinleri Kırmaya Cesaretin Var mı?"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="description">Açıklama</Label>
                            <Textarea
                                id="description"
                                value={formData.description || ""}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Etkinlik hakkında detaylı açıklama..."
                                rows={4}
                            />
                        </div>

                        <div>
                            <Label htmlFor="event_date">
                                Etkinlik Tarihi ve Saati <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="event_date"
                                type="datetime-local"
                                value={formData.event_date.slice(0, 16)}
                                onChange={(e) => handleChange('event_date', new Date(e.target.value).toISOString())}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">Durum</Label>
                            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Taslak</SelectItem>
                                    <SelectItem value="published">Yayında</SelectItem>
                                    <SelectItem value="past">Geçmiş</SelectItem>
                                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="event_location">
                                Konum <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="event_location"
                                value={formData.event_location}
                                onChange={(e) => handleChange('event_location', e.target.value)}
                                placeholder="S.B.Ü Mehmet Akif İnan E.A.H"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="event_location_detail">Konum Detayı</Label>
                            <Input
                                id="event_location_detail"
                                value={formData.event_location_detail || ""}
                                onChange={(e) => handleChange('event_location_detail', e.target.value)}
                                placeholder="Ana Bina Konferans Salonu"
                            />
                        </div>

                        <div>
                            <Label htmlFor="event_address">Adres</Label>
                            <Input
                                id="event_address"
                                value={formData.event_address || ""}
                                onChange={(e) => handleChange('event_address', e.target.value)}
                                placeholder="Şanlıurfa"
                            />
                        </div>

                        <div>
                            <Label htmlFor="max_attendees">Maksimum Katılımcı</Label>
                            <Input
                                id="max_attendees"
                                type="number"
                                value={formData.max_attendees || ""}
                                onChange={(e) => handleChange('max_attendees', e.target.value ? parseInt(e.target.value) : null)}
                                placeholder="Boş bırakın (sınırsız)"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            İptal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Değişiklikleri Kaydet
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
