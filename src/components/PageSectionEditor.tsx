import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Save,
    X,
    Plus,
    Trash2,
    Eye,
    Palette,
    Type,
    Image,
    Layout,
    Sparkles,
    Clock,
    Lightbulb,
    Rocket,
    FileCheck,
    Award,
    Megaphone,
    Trophy,
    Users,
    Calendar,
    MapPin,
    Heart,
    Star,
    Zap,
    Target,
    Coffee,
    BookOpen,
    MessageCircle,
    Music,
    Video,
    Gift,
    Flag,
    Bell,
    Sun,
    Moon,
    Mic,
    Camera,
    Headphones,
    Send,
    Phone,
    Mail,
    Globe,
    Link,
    ChevronUp,
    ChevronDown,
    RotateCcw,
    Upload,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface PageSection {
    id: string;
    section_key: string;
    section_title: string;
    is_visible: boolean;
    display_order: number;
    event_id: string | null;
    settings: any;
}

interface ProgramItem {
    time: string;
    title: string;
    description: string;
    icon?: string;
    speaker?: string;
    duration?: string;
}

interface PageSectionEditorProps {
    section: PageSection;
    onSave: (section: PageSection) => void;
    onCancel: () => void;
}

// İkon seçenekleri
const ICON_OPTIONS = [
    { value: "Lightbulb", label: "Ampul", icon: Lightbulb },
    { value: "Rocket", label: "Roket", icon: Rocket },
    { value: "FileCheck", label: "Dosya", icon: FileCheck },
    { value: "Award", label: "Ödül", icon: Award },
    { value: "Megaphone", label: "Megafon", icon: Megaphone },
    { value: "Trophy", label: "Kupa", icon: Trophy },
    { value: "Users", label: "Kullanıcılar", icon: Users },
    { value: "Calendar", label: "Takvim", icon: Calendar },
    { value: "Heart", label: "Kalp", icon: Heart },
    { value: "Star", label: "Yıldız", icon: Star },
    { value: "Zap", label: "Şimşek", icon: Zap },
    { value: "Target", label: "Hedef", icon: Target },
    { value: "Coffee", label: "Kahve", icon: Coffee },
    { value: "BookOpen", label: "Kitap", icon: BookOpen },
    { value: "MessageCircle", label: "Mesaj", icon: MessageCircle },
    { value: "Music", label: "Müzik", icon: Music },
    { value: "Video", label: "Video", icon: Video },
    { value: "Gift", label: "Hediye", icon: Gift },
    { value: "Flag", label: "Bayrak", icon: Flag },
    { value: "Bell", label: "Zil", icon: Bell },
    { value: "Mic", label: "Mikrofon", icon: Mic },
    { value: "Camera", label: "Kamera", icon: Camera },
    { value: "Headphones", label: "Kulaklık", icon: Headphones },
    { value: "Globe", label: "Dünya", icon: Globe },
];

// Animasyon seçenekleri
const ANIMATION_OPTIONS = [
    { value: "none", label: "Yok" },
    { value: "fade-in", label: "Fade In" },
    { value: "slide-up", label: "Aşağıdan Yukarı" },
    { value: "slide-down", label: "Yukarıdan Aşağı" },
    { value: "slide-left", label: "Sağdan Sola" },
    { value: "slide-right", label: "Soldan Sağa" },
    { value: "zoom-in", label: "Yakınlaştır" },
    { value: "bounce", label: "Zıpla" },
];

// Gradient seçenekleri
const GRADIENT_OPTIONS = [
    { value: "none", label: "Düz Renk" },
    { value: "gradient-primary", label: "Primary Gradient" },
    { value: "gradient-secondary", label: "Secondary Gradient" },
    { value: "gradient-accent", label: "Accent Gradient" },
    { value: "gradient-sunset", label: "Gün Batımı" },
    { value: "gradient-ocean", label: "Okyanus" },
    { value: "gradient-forest", label: "Orman" },
    { value: "gradient-royal", label: "Kraliyet" },
];

// Preset renk paletleri
const COLOR_PRESETS = [
    { name: "Varsayılan", primary: "#8B5CF6", secondary: "#D946EF", accent: "#F97316" },
    { name: "Okyanus", primary: "#0EA5E9", secondary: "#06B6D4", accent: "#14B8A6" },
    { name: "Orman", primary: "#22C55E", secondary: "#10B981", accent: "#84CC16" },
    { name: "Gün Batımı", primary: "#F59E0B", secondary: "#EF4444", accent: "#EC4899" },
    { name: "Gece", primary: "#6366F1", secondary: "#8B5CF6", accent: "#A855F7" },
    { name: "Profesyonel", primary: "#3B82F6", secondary: "#1D4ED8", accent: "#60A5FA" },
];

export function PageSectionEditor({ section, onSave, onCancel }: PageSectionEditorProps) {
    const [editedSection, setEditedSection] = useState<PageSection>({ ...section });
    const [activeTab, setActiveTab] = useState("content");

    const updateSettings = (key: string, value: any) => {
        setEditedSection({
            ...editedSection,
            settings: { ...editedSection.settings, [key]: value },
        });
    };

    const updateNestedSettings = (parentKey: string, key: string, value: any) => {
        setEditedSection({
            ...editedSection,
            settings: {
                ...editedSection.settings,
                [parentKey]: {
                    ...(editedSection.settings[parentKey] || {}),
                    [key]: value,
                },
            },
        });
    };

    // Program item işlemleri
    const addProgramItem = () => {
        const newItem: ProgramItem = {
            time: "00:00 - 00:00",
            title: "Yeni Program Maddesi",
            description: "Açıklama ekleyin",
            icon: "Lightbulb",
            speaker: "",
            duration: "60 dk",
        };
        updateSettings("program_items", [
            ...(editedSection.settings.program_items || []),
            newItem,
        ]);
    };

    const removeProgramItem = (index: number) => {
        updateSettings(
            "program_items",
            editedSection.settings.program_items.filter((_: any, i: number) => i !== index)
        );
    };

    const updateProgramItem = (index: number, field: string, value: string) => {
        const items = [...(editedSection.settings.program_items || [])];
        items[index] = { ...items[index], [field]: value };
        updateSettings("program_items", items);
    };

    const moveProgramItem = (index: number, direction: "up" | "down") => {
        const items = [...(editedSection.settings.program_items || [])];
        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= items.length) return;
        [items[index], items[newIndex]] = [items[newIndex], items[index]];
        updateSettings("program_items", items);
    };

    const renderIconSelector = (value: string, onChange: (val: string) => void) => (
        <div className="grid grid-cols-6 gap-2 p-2 border rounded-lg max-h-48 overflow-y-auto">
            {ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                return (
                    <Button
                        key={option.value}
                        type="button"
                        variant={value === option.value ? "default" : "ghost"}
                        size="sm"
                        className="h-10 w-10 p-0"
                        onClick={() => onChange(option.value)}
                        title={option.label}
                    >
                        <IconComponent className="w-5 h-5" />
                    </Button>
                );
            })}
        </div>
    );

    return (
        <Card className="p-6 border-2 border-primary/20 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Layout className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">{section.section_title}</h3>
                        <p className="text-sm text-muted-foreground">
                            Bölüm ayarlarını özelleştirin
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="font-mono">
                    {section.section_key}
                </Badge>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                    <TabsTrigger value="content" className="gap-2">
                        <Type className="w-4 h-4" />
                        İçerik
                    </TabsTrigger>
                    <TabsTrigger value="style" className="gap-2">
                        <Palette className="w-4 h-4" />
                        Stil
                    </TabsTrigger>
                    <TabsTrigger value="animation" className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        Animasyon
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="gap-2">
                        <Layout className="w-4 h-4" />
                        Gelişmiş
                    </TabsTrigger>
                </TabsList>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-6">
                    {/* Hero Section */}
                    {section.section_key === "hero" && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Başlık</Label>
                                    <Input
                                        value={editedSection.settings.title || ""}
                                        onChange={(e) => updateSettings("title", e.target.value)}
                                        placeholder="Etkinlik başlığı"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Alt Başlık</Label>
                                    <Input
                                        value={editedSection.settings.subtitle || ""}
                                        onChange={(e) => updateSettings("subtitle", e.target.value)}
                                        placeholder="Kısa açıklama"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Slogan</Label>
                                <Input
                                    value={editedSection.settings.tagline || ""}
                                    onChange={(e) => updateSettings("tagline", e.target.value)}
                                    placeholder="Akılda kalıcı slogan"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Açıklama</Label>
                                <Textarea
                                    value={editedSection.settings.description || ""}
                                    onChange={(e) => updateSettings("description", e.target.value)}
                                    placeholder="Detaylı açıklama..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>CTA Butonu Metni</Label>
                                <Input
                                    value={editedSection.settings.cta_text || "Etkinliğe Katıl"}
                                    onChange={(e) => updateSettings("cta_text", e.target.value)}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                <div>
                                    <Label>Poster Göster</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Hero alanında etkinlik posterini göster
                                    </p>
                                </div>
                                <Switch
                                    checked={editedSection.settings.show_poster !== false}
                                    onCheckedChange={(checked) => updateSettings("show_poster", checked)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Countdown Section */}
                    {section.section_key === "countdown" && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Geri Sayım Başlığı</Label>
                                <Input
                                    value={editedSection.settings.countdown_title || "Etkinliğe"}
                                    onChange={(e) => updateSettings("countdown_title", e.target.value)}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                        <Label>Günleri Göster</Label>
                                    </div>
                                    <Switch
                                        checked={editedSection.settings.show_days !== false}
                                        onCheckedChange={(checked) => updateSettings("show_days", checked)}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                        <Label>Saniyeleri Göster</Label>
                                    </div>
                                    <Switch
                                        checked={editedSection.settings.show_seconds !== false}
                                        onCheckedChange={(checked) => updateSettings("show_seconds", checked)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Sayaç Stili</Label>
                                <Select
                                    value={editedSection.settings.counter_style || "cards"}
                                    onValueChange={(value) => updateSettings("counter_style", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cards">Kartlar</SelectItem>
                                        <SelectItem value="circles">Daireler</SelectItem>
                                        <SelectItem value="minimal">Minimal</SelectItem>
                                        <SelectItem value="flip">Flip Clock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Program Section */}
                    {section.section_key === "program" && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Program Başlığı</Label>
                                <Input
                                    value={editedSection.settings.program_title || "Program"}
                                    onChange={(e) => updateSettings("program_title", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Alt Başlık</Label>
                                <Input
                                    value={editedSection.settings.program_subtitle || ""}
                                    onChange={(e) => updateSettings("program_subtitle", e.target.value)}
                                    placeholder="Program hakkında kısa açıklama"
                                />
                            </div>

                            {/* Program Items */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg font-semibold">Program Maddeleri</Label>
                                    <Button type="button" size="sm" onClick={addProgramItem}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Yeni Ekle
                                    </Button>
                                </div>

                                {(editedSection.settings.program_items || []).map(
                                    (item: ProgramItem, index: number) => (
                                        <Card key={index} className="p-4 border-2 border-dashed hover:border-primary/50 transition-colors">
                                            <div className="space-y-4">
                                                {/* Header with controls */}
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="secondary">
                                                        {index + 1}. Madde
                                                    </Badge>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => moveProgramItem(index, "up")}
                                                            disabled={index === 0}
                                                        >
                                                            <ChevronUp className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => moveProgramItem(index, "down")}
                                                            disabled={
                                                                index ===
                                                                (editedSection.settings.program_items?.length || 0) - 1
                                                            }
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => removeProgramItem(index)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {/* İkon Seçimi */}
                                                <div className="space-y-2">
                                                    <Label>İkon</Label>
                                                    {renderIconSelector(item.icon || "Lightbulb", (val) =>
                                                        updateProgramItem(index, "icon", val)
                                                    )}
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Saat Aralığı</Label>
                                                        <Input
                                                            value={item.time}
                                                            onChange={(e) =>
                                                                updateProgramItem(index, "time", e.target.value)
                                                            }
                                                            placeholder="09:00 - 10:00"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Süre</Label>
                                                        <Input
                                                            value={item.duration || ""}
                                                            onChange={(e) =>
                                                                updateProgramItem(index, "duration", e.target.value)
                                                            }
                                                            placeholder="60 dakika"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Başlık</Label>
                                                    <Input
                                                        value={item.title}
                                                        onChange={(e) =>
                                                            updateProgramItem(index, "title", e.target.value)
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Konuşmacı (Opsiyonel)</Label>
                                                    <Input
                                                        value={item.speaker || ""}
                                                        onChange={(e) =>
                                                            updateProgramItem(index, "speaker", e.target.value)
                                                        }
                                                        placeholder="Dr. Ahmet Yılmaz"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Açıklama</Label>
                                                    <Textarea
                                                        value={item.description}
                                                        onChange={(e) =>
                                                            updateProgramItem(index, "description", e.target.value)
                                                        }
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                )}

                                {(!editedSection.settings.program_items ||
                                    editedSection.settings.program_items.length === 0) && (
                                        <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                                            <p className="text-muted-foreground mb-4">
                                                Henüz program maddesi eklenmemiş
                                            </p>
                                            <Button type="button" onClick={addProgramItem}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                İlk Maddeyi Ekle
                                            </Button>
                                        </div>
                                    )}
                            </div>
                        </div>
                    )}

                    {/* Registration Section */}
                    {section.section_key === "registration" && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Form Başlığı</Label>
                                <Input
                                    value={editedSection.settings.form_title || "Kayıt Ol"}
                                    onChange={(e) => updateSettings("form_title", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Form Açıklaması</Label>
                                <Textarea
                                    value={editedSection.settings.form_description || ""}
                                    onChange={(e) => updateSettings("form_description", e.target.value)}
                                    placeholder="Etkinliğe katılmak için formu doldurun..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Gönder Butonu Metni</Label>
                                <Input
                                    value={editedSection.settings.submit_text || "Kayıt Ol"}
                                    onChange={(e) => updateSettings("submit_text", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Başarı Mesajı</Label>
                                <Textarea
                                    value={editedSection.settings.success_message || ""}
                                    onChange={(e) => updateSettings("success_message", e.target.value)}
                                    placeholder="Kaydınız başarıyla alındı!"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">Form Alanları</Label>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {["name", "email", "phone", "institution", "position"].map((field) => {
                                        const labels: Record<string, string> = {
                                            name: "Ad Soyad",
                                            email: "E-posta",
                                            phone: "Telefon",
                                            institution: "Kurum",
                                            position: "Pozisyon",
                                        };
                                        return (
                                            <div
                                                key={field}
                                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                            >
                                                <Label>{labels[field]}</Label>
                                                <Switch
                                                    checked={editedSection.settings[`show_${field}`] !== false}
                                                    onCheckedChange={(checked) =>
                                                        updateSettings(`show_${field}`, checked)
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Location Section */}
                    {section.section_key === "location" && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Konum Başlığı</Label>
                                <Input
                                    value={editedSection.settings.location_title || "Etkinlik"}
                                    onChange={(e) => updateSettings("location_title", e.target.value)}
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mekan Adı</Label>
                                    <Input
                                        value={editedSection.settings.location_name || ""}
                                        onChange={(e) => updateSettings("location_name", e.target.value)}
                                        placeholder="Örn: Kongre Merkezi"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mekan Detayı</Label>
                                    <Input
                                        value={editedSection.settings.location_detail || ""}
                                        onChange={(e) => updateSettings("location_detail", e.target.value)}
                                        placeholder="Örn: Ana Salon"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Adres</Label>
                                <Textarea
                                    value={editedSection.settings.address || ""}
                                    onChange={(e) => updateSettings("address", e.target.value)}
                                    placeholder="Tam adres..."
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Google Maps Embed URL</Label>
                                <Textarea
                                    value={editedSection.settings.map_embed_url || ""}
                                    onChange={(e) => updateSettings("map_embed_url", e.target.value)}
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Google Maps'ten "Paylaş" → "Haritayı Yerleştir" → iframe src URL'sini kopyalayın
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                <div>
                                    <Label>Yol Tarifi Butonu</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Google Maps yol tarifi butonu göster
                                    </p>
                                </div>
                                <Switch
                                    checked={editedSection.settings.show_directions !== false}
                                    onCheckedChange={(checked) => updateSettings("show_directions", checked)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Footer Section */}
                    {section.section_key === "footer" && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Footer Metni</Label>
                                <Input
                                    value={editedSection.settings.footer_text || ""}
                                    onChange={(e) => updateSettings("footer_text", e.target.value)}
                                    placeholder="© 2025 Tüm hakları saklıdır."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Organizatör Adı</Label>
                                <Input
                                    value={editedSection.settings.organizer_name || ""}
                                    onChange={(e) => updateSettings("organizer_name", e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">İletişim Bilgileri</Label>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" /> E-posta
                                        </Label>
                                        <Input
                                            value={editedSection.settings.contact_email || ""}
                                            onChange={(e) => updateSettings("contact_email", e.target.value)}
                                            placeholder="info@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" /> Telefon
                                        </Label>
                                        <Input
                                            value={editedSection.settings.contact_phone || ""}
                                            onChange={(e) => updateSettings("contact_phone", e.target.value)}
                                            placeholder="+90 555 555 55 55"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-lg font-semibold">Sosyal Medya</Label>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {["instagram", "twitter", "facebook", "linkedin"].map((social) => (
                                        <div key={social} className="space-y-2">
                                            <Label className="capitalize">{social}</Label>
                                            <Input
                                                value={editedSection.settings[`${social}_url`] || ""}
                                                onChange={(e) => updateSettings(`${social}_url`, e.target.value)}
                                                placeholder={`https://${social}.com/...`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Style Tab */}
                <TabsContent value="style" className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Renk Paletleri</Label>
                        <div className="grid grid-cols-3 gap-3">
                            {COLOR_PRESETS.map((preset) => (
                                <Button
                                    key={preset.name}
                                    type="button"
                                    variant="outline"
                                    className="h-auto p-3 flex flex-col gap-2"
                                    onClick={() => {
                                        updateSettings("color_primary", preset.primary);
                                        updateSettings("color_secondary", preset.secondary);
                                        updateSettings("color_accent", preset.accent);
                                    }}
                                >
                                    <div className="flex gap-1">
                                        <div
                                            className="w-6 h-6 rounded-full"
                                            style={{ backgroundColor: preset.primary }}
                                        />
                                        <div
                                            className="w-6 h-6 rounded-full"
                                            style={{ backgroundColor: preset.secondary }}
                                        />
                                        <div
                                            className="w-6 h-6 rounded-full"
                                            style={{ backgroundColor: preset.accent }}
                                        />
                                    </div>
                                    <span className="text-xs">{preset.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Özel Renkler</Label>
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { key: "color_primary", label: "Ana Renk" },
                                { key: "color_secondary", label: "İkincil Renk" },
                                { key: "color_accent", label: "Vurgu Rengi" },
                            ].map((color) => (
                                <div key={color.key} className="space-y-2">
                                    <Label>{color.label}</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={editedSection.settings[color.key] || "#8B5CF6"}
                                            onChange={(e) => updateSettings(color.key, e.target.value)}
                                            className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                            value={editedSection.settings[color.key] || "#8B5CF6"}
                                            onChange={(e) => updateSettings(color.key, e.target.value)}
                                            className="flex-1 font-mono"
                                            placeholder="#8B5CF6"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Arkaplan</Label>
                        <div className="space-y-2">
                            <Label>Gradient Stili</Label>
                            <Select
                                value={editedSection.settings.gradient_style || "none"}
                                onValueChange={(value) => updateSettings("gradient_style", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {GRADIENT_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Kenarlık & Gölge</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Köşe Yuvarlaklığı</Label>
                                <Slider
                                    value={[editedSection.settings.border_radius || 8]}
                                    onValueChange={([value]) => updateSettings("border_radius", value)}
                                    max={32}
                                    step={2}
                                />
                                <p className="text-sm text-muted-foreground text-right">
                                    {editedSection.settings.border_radius || 8}px
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Gölge Yoğunluğu</Label>
                                <Slider
                                    value={[editedSection.settings.shadow_intensity || 0]}
                                    onValueChange={([value]) => updateSettings("shadow_intensity", value)}
                                    max={100}
                                    step={10}
                                />
                                <p className="text-sm text-muted-foreground text-right">
                                    {editedSection.settings.shadow_intensity || 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Boşluklar</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Üst/Alt Padding</Label>
                                <Slider
                                    value={[editedSection.settings.padding_y || 80]}
                                    onValueChange={([value]) => updateSettings("padding_y", value)}
                                    min={20}
                                    max={200}
                                    step={10}
                                />
                                <p className="text-sm text-muted-foreground text-right">
                                    {editedSection.settings.padding_y || 80}px
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Sağ/Sol Padding</Label>
                                <Slider
                                    value={[editedSection.settings.padding_x || 16]}
                                    onValueChange={([value]) => updateSettings("padding_x", value)}
                                    min={0}
                                    max={100}
                                    step={4}
                                />
                                <p className="text-sm text-muted-foreground text-right">
                                    {editedSection.settings.padding_x || 16}px
                                </p>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* Animation Tab */}
                <TabsContent value="animation" className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Giriş Animasyonu</Label>
                        <Select
                            value={editedSection.settings.enter_animation || "fade-in"}
                            onValueChange={(value) => updateSettings("enter_animation", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {ANIMATION_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Animasyon Ayarları</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Animasyon Süresi</Label>
                                <Slider
                                    value={[editedSection.settings.animation_duration || 500]}
                                    onValueChange={([value]) => updateSettings("animation_duration", value)}
                                    min={100}
                                    max={2000}
                                    step={100}
                                />
                                <p className="text-sm text-muted-foreground text-right">
                                    {editedSection.settings.animation_duration || 500}ms
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Gecikme</Label>
                                <Slider
                                    value={[editedSection.settings.animation_delay || 0]}
                                    onValueChange={([value]) => updateSettings("animation_delay", value)}
                                    min={0}
                                    max={1000}
                                    step={50}
                                />
                                <p className="text-sm text-muted-foreground text-right">
                                    {editedSection.settings.animation_delay || 0}ms
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                            <Label>Scroll Animasyonu</Label>
                            <p className="text-sm text-muted-foreground">
                                Sayfa kaydırıldığında animasyonu tetikle
                            </p>
                        </div>
                        <Switch
                            checked={editedSection.settings.animate_on_scroll !== false}
                            onCheckedChange={(checked) => updateSettings("animate_on_scroll", checked)}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <div>
                            <Label>Hover Efektleri</Label>
                            <p className="text-sm text-muted-foreground">
                                Mouse üzerine gelince efekt göster
                            </p>
                        </div>
                        <Switch
                            checked={editedSection.settings.hover_effects !== false}
                            onCheckedChange={(checked) => updateSettings("hover_effects", checked)}
                        />
                    </div>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">CSS Sınıfları</Label>
                        <div className="space-y-2">
                            <Label>Ek CSS Sınıfları</Label>
                            <Input
                                value={editedSection.settings.custom_classes || ""}
                                onChange={(e) => updateSettings("custom_classes", e.target.value)}
                                placeholder="custom-class another-class"
                            />
                            <p className="text-xs text-muted-foreground">
                                Tailwind veya özel CSS sınıfları ekleyin (boşlukla ayırın)
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">Özel Stiller</Label>
                        <div className="space-y-2">
                            <Label>Inline CSS</Label>
                            <Textarea
                                value={editedSection.settings.custom_css || ""}
                                onChange={(e) => updateSettings("custom_css", e.target.value)}
                                placeholder="background: linear-gradient(...);"
                                rows={4}
                                className="font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">HTML ID</Label>
                        <div className="space-y-2">
                            <Label>Section ID</Label>
                            <Input
                                value={editedSection.settings.section_id || section.section_key}
                                onChange={(e) => updateSettings("section_id", e.target.value)}
                                placeholder="custom-section-id"
                            />
                            <p className="text-xs text-muted-foreground">
                                Sayfa içi link için kullanılır (örn: #hero)
                            </p>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-700">Gelişmiş Özellikler</h4>
                                <p className="text-sm text-yellow-600/80 mt-1">
                                    Bu ayarlar teknik bilgi gerektirir. Yanlış kullanım sayfa görünümünü
                                    bozabilir.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setEditedSection({
                                ...editedSection,
                                settings: {},
                            });
                        }}
                        className="w-full"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Tüm Ayarları Sıfırla
                    </Button>
                </TabsContent>
            </Tabs>

            {/* Footer Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4 mr-2" />
                    İptal
                </Button>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.open(`/event/preview?section=${section.section_key}`, "_blank")}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Önizle
                    </Button>
                    <Button type="button" onClick={() => onSave(editedSection)}>
                        <Save className="w-4 h-4 mr-2" />
                        Kaydet
                    </Button>
                </div>
            </div>
        </Card>
    );
}
