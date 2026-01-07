import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
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
    Download,
    Image as ImageIcon,
    Loader2,
    RefreshCw,
    Palette,
    Type,
    Settings,
    QrCode,
    Sparkles,
    Upload,
    Smartphone,
    Monitor,
    Share2,
    Copy,
    Instagram,
    Facebook,
    Twitter,
    Linkedin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvitationGeneratorProps {
    eventSettings: {
        event_title: string;
        event_subtitle: string;
        event_tagline: string;
        event_date: string;
        event_location: string;
        event_location_detail: string;
        event_address: string;
    };
}

type TemplateType = "modern" | "elegant" | "minimal" | "colorful" | "corporate" | "festival" | "medical" | "tech";
type SizeType = "instagram" | "facebook" | "twitter" | "story" | "a4" | "custom";

interface CanvasSize {
    width: number;
    height: number;
    label: string;
}

const CANVAS_SIZES: Record<SizeType, CanvasSize> = {
    instagram: { width: 1080, height: 1080, label: "Instagram Post (1080x1080)" },
    facebook: { width: 1200, height: 630, label: "Facebook Cover (1200x630)" },
    twitter: { width: 1200, height: 675, label: "Twitter Post (1200x675)" },
    story: { width: 1080, height: 1920, label: "Story (1080x1920)" },
    a4: { width: 2480, height: 3508, label: "A4 Print (210x297mm)" },
    custom: { width: 1080, height: 1080, label: "Özel Boyut" },
};

interface CustomColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
}

export const AdvancedInvitationGenerator = ({ eventSettings }: InvitationGeneratorProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [template, setTemplate] = useState<TemplateType>("modern");
    const [size, setSize] = useState<SizeType>("instagram");
    const [customWidth, setCustomWidth] = useState(1080);
    const [customHeight, setCustomHeight] = useState(1080);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { toast } = useToast();

    // Custom settings
    const [customColors, setCustomColors] = useState<CustomColors>({
        primary: "#8B5CF6",
        secondary: "#D946EF",
        accent: "#F97316",
        background: "#0F172A",
        text: "#FFFFFF",
    });

    // Text customization
    const [customTitle, setCustomTitle] = useState("");
    const [customSubtitle, setCustomSubtitle] = useState("");
    const [customFooter, setCustomFooter] = useState("");
    const [fontSize, setFontSize] = useState(48);
    const [fontFamily, setFontFamily] = useState("Arial");

    // Features
    const [showQrCode, setShowQrCode] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [showLogo, setShowLogo] = useState(false);
    const [logoUrl, setLogoUrl] = useState("");
    const [showEmojis, setShowEmojis] = useState(true);
    const [showDecorations, setShowDecorations] = useState(true);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [backgroundOpacity, setBackgroundOpacity] = useState(30);

    // Get actual canvas dimensions
    const getCanvasSize = useCallback((): CanvasSize => {
        if (size === "custom") {
            return { width: customWidth, height: customHeight, label: "Özel Boyut" };
        }
        return CANVAS_SIZES[size];
    }, [size, customWidth, customHeight]);

    useEffect(() => {
        generateInvitation();
    }, [
        template, size, customWidth, customHeight, customColors, fontSize, fontFamily,
        showQrCode, showEmojis, showDecorations, backgroundImage, backgroundOpacity,
        customTitle, customSubtitle, customFooter, eventSettings
    ]);

    const generateQRCode = async (text: string, size: number): Promise<string> => {
        // Simple QR code generation using a public API
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=000000`;
        return url;
    };

    const loadImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    };

    const generateInvitation = async () => {
        setIsGenerating(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const canvasSize = getCanvasSize();
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        // Format date
        const eventDate = new Date(eventSettings.event_date);
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

        // Get display texts
        const displayTitle = customTitle || eventSettings.event_tagline;
        const displaySubtitle = customSubtitle || eventSettings.event_subtitle;
        const displayFooter = customFooter || eventSettings.event_address;

        // Draw background image if available
        if (backgroundImage) {
            try {
                const bgImg = await loadImage(backgroundImage);
                ctx.globalAlpha = backgroundOpacity / 100;
                ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1;
            } catch (error) {
                console.log("Background image failed to load");
            }
        }

        // Template'e göre çiz
        switch (template) {
            case "modern":
                await drawModernTemplate(ctx, canvas, formattedDate, formattedTime, displayTitle, displaySubtitle, displayFooter);
                break;
            case "elegant":
                await drawElegantTemplate(ctx, canvas, formattedDate, formattedTime, displayTitle, displaySubtitle, displayFooter);
                break;
            case "minimal":
                await drawMinimalTemplate(ctx, canvas, formattedDate, formattedTime, displayTitle, displaySubtitle, displayFooter);
                break;
            case "colorful":
                await drawColorfulTemplate(ctx, canvas, formattedDate, formattedTime, displayTitle, displaySubtitle, displayFooter);
                break;
            case "corporate":
                await drawCorporateTemplate(ctx, canvas, formattedDate, formattedTime, displayTitle, displaySubtitle, displayFooter);
                break;
            case "festival":
                await drawFestivalTemplate(ctx, canvas, formattedDate, formattedTime, displayTitle, displaySubtitle, displayFooter);
                break;
            case "medical":
                await drawMedicalTemplate(ctx, canvas, formattedDate, formattedTime, displayTitle, displaySubtitle, displayFooter);
                break;
            case "tech":
                await drawTechTemplate(ctx, canvas, formattedDate, formattedTime, displayTitle, displaySubtitle, displayFooter);
                break;
        }

        // Draw QR code if enabled
        if (showQrCode && qrCodeUrl) {
            try {
                const qrSize = Math.min(canvas.width, canvas.height) * 0.15;
                const qrUrl = await generateQRCode(qrCodeUrl, Math.round(qrSize));
                const qrImg = await loadImage(qrUrl);
                const qrX = canvas.width - qrSize - 30;
                const qrY = canvas.height - qrSize - 30;

                // White background for QR
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
                ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            } catch (error) {
                console.log("QR code failed to load");
            }
        }

        // Preview oluştur
        const url = canvas.toDataURL("image/png");
        setPreviewUrl(url);
        setIsGenerating(false);
    };

    const drawModernTemplate = async (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string,
        displayTitle: string,
        displaySubtitle: string,
        displayFooter: string
    ) => {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, customColors.background);
        gradient.addColorStop(1, adjustColor(customColors.background, 30));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (showDecorations) {
            // Decorative circles
            ctx.fillStyle = hexToRgba(customColors.primary, 0.1);
            ctx.beginPath();
            ctx.arc(canvas.width * 0.2, canvas.height * 0.2, canvas.width * 0.25, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = hexToRgba(customColors.secondary, 0.1);
            ctx.beginPath();
            ctx.arc(canvas.width * 0.85, canvas.height * 0.85, canvas.width * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        const scale = canvas.width / 1080;

        // Title badge
        ctx.fillStyle = hexToRgba(customColors.primary, 0.2);
        ctx.strokeStyle = customColors.primary;
        ctx.lineWidth = 2 * scale;
        const badgeWidth = 600 * scale;
        const badgeHeight = 50 * scale;
        const badgeX = (canvas.width - badgeWidth) / 2;
        const badgeY = 120 * scale;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 25 * scale);
        ctx.fill();
        ctx.stroke();

        // Event title (small badge)
        ctx.font = `bold ${24 * scale}px ${fontFamily}`;
        ctx.fillStyle = customColors.primary;
        ctx.textAlign = "center";
        ctx.fillText(eventSettings.event_title, canvas.width / 2, badgeY + 35 * scale);

        // Main tagline
        ctx.font = `bold ${fontSize * scale}px ${fontFamily}`;
        ctx.fillStyle = customColors.text;
        const words = displayTitle.split(" ");
        let y = 280 * scale;
        let line = "";
        words.forEach((word) => {
            const testLine = line + word + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > canvas.width * 0.85 && line !== "") {
                ctx.fillText(line.trim(), canvas.width / 2, y);
                line = word + " ";
                y += fontSize * 1.3 * scale;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line.trim(), canvas.width / 2, y);

        // Subtitle with gradient
        ctx.font = `bold ${32 * scale}px ${fontFamily}`;
        const subtitleGradient = ctx.createLinearGradient(200, 0, 880, 0);
        subtitleGradient.addColorStop(0, customColors.primary);
        subtitleGradient.addColorStop(1, customColors.secondary);
        ctx.fillStyle = subtitleGradient;
        ctx.fillText(displaySubtitle, canvas.width / 2, y + 70 * scale);

        // Info box
        ctx.fillStyle = hexToRgba(customColors.text, 0.1);
        ctx.strokeStyle = hexToRgba(customColors.primary, 0.5);
        ctx.lineWidth = 2 * scale;
        const boxWidth = 700 * scale;
        const boxHeight = 250 * scale;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = canvas.height * 0.55;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 20 * scale);
        ctx.fill();
        ctx.stroke();

        // Date & Time
        ctx.font = `bold ${28 * scale}px ${fontFamily}`;
        ctx.fillStyle = customColors.text;
        const dateEmoji = showEmojis ? "📅 " : "";
        const timeEmoji = showEmojis ? "🕐 " : "";
        ctx.fillText(dateEmoji + formattedDate, canvas.width / 2, boxY + 60 * scale);
        ctx.fillText(timeEmoji + formattedTime, canvas.width / 2, boxY + 110 * scale);

        // Location
        ctx.font = `bold ${26 * scale}px ${fontFamily}`;
        ctx.fillStyle = customColors.accent;
        const locationEmoji = showEmojis ? "📍 " : "";
        ctx.fillText(locationEmoji + eventSettings.event_location, canvas.width / 2, boxY + 160 * scale);
        ctx.font = `${22 * scale}px ${fontFamily}`;
        ctx.fillStyle = hexToRgba(customColors.text, 0.7);
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, boxY + 200 * scale);

        // Footer
        ctx.font = `${18 * scale}px ${fontFamily}`;
        ctx.fillStyle = hexToRgba(customColors.text, 0.5);
        ctx.fillText(displayFooter, canvas.width / 2, canvas.height - 40 * scale);
    };

    // Helper functions
    const hexToRgba = (hex: string, alpha: number): string => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const adjustColor = (hex: string, amount: number): string => {
        const num = parseInt(hex.slice(1), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
    };

    const drawElegantTemplate = async (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string,
        displayTitle: string,
        displaySubtitle: string,
        displayFooter: string
    ) => {
        const scale = canvas.width / 1080;

        // Background - cream color
        ctx.fillStyle = "#FFF8F0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (showDecorations) {
            // Decorative borders
            ctx.strokeStyle = "#D4A574";
            ctx.lineWidth = 8 * scale;
            ctx.strokeRect(40 * scale, 40 * scale, canvas.width - 80 * scale, canvas.height - 80 * scale);

            ctx.strokeStyle = "#D4A574";
            ctx.lineWidth = 2 * scale;
            ctx.strokeRect(60 * scale, 60 * scale, canvas.width - 120 * scale, canvas.height - 120 * scale);
        }

        // Title
        ctx.font = `italic ${32 * scale}px Georgia`;
        ctx.fillStyle = "#8B6F47";
        ctx.textAlign = "center";
        ctx.fillText("Siz de davetlisiniz...", canvas.width / 2, 180 * scale);

        // Main title
        ctx.font = `bold ${52 * scale}px Georgia`;
        ctx.fillStyle = "#2C1810";
        const titleWords = displayTitle.split(" ");
        let y = 280 * scale;
        titleWords.forEach((word) => {
            ctx.fillText(word, canvas.width / 2, y);
            y += 65 * scale;
        });

        // Divider line
        ctx.strokeStyle = "#D4A574";
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(300 * scale, y + 20 * scale);
        ctx.lineTo(780 * scale, y + 20 * scale);
        ctx.stroke();

        // Subtitle
        ctx.font = `italic ${28 * scale}px Georgia`;
        ctx.fillStyle = "#8B6F47";
        ctx.fillText(displaySubtitle, canvas.width / 2, y + 70 * scale);

        // Info section
        ctx.font = `${24 * scale}px Georgia`;
        ctx.fillStyle = "#2C1810";
        const infoY = canvas.height * 0.6;
        ctx.fillText(formattedDate, canvas.width / 2, infoY);
        ctx.fillText(formattedTime, canvas.width / 2, infoY + 50 * scale);

        ctx.font = `bold ${26 * scale}px Georgia`;
        ctx.fillStyle = "#8B6F47";
        ctx.fillText(eventSettings.event_location, canvas.width / 2, infoY + 120 * scale);

        ctx.font = `${22 * scale}px Georgia`;
        ctx.fillStyle = "#5C4A3A";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, infoY + 160 * scale);

        // Footer
        ctx.font = `italic ${18 * scale}px Georgia`;
        ctx.fillStyle = "#8B6F47";
        ctx.fillText(displayFooter, canvas.width / 2, canvas.height - 60 * scale);
    };

    const drawMinimalTemplate = async (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string,
        displayTitle: string,
        displaySubtitle: string,
        displayFooter: string
    ) => {
        const scale = canvas.width / 1080;

        // Clean white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Simple title
        ctx.font = `300 ${72 * scale}px Arial`;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        const titleParts = displayTitle.split(" ");
        ctx.fillText(titleParts[0], canvas.width / 2, 250 * scale);
        ctx.fillText(titleParts.slice(1).join(" "), canvas.width / 2, 340 * scale);

        // Thin line
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(340 * scale, 400 * scale);
        ctx.lineTo(740 * scale, 400 * scale);
        ctx.stroke();

        // Event type
        ctx.font = `400 ${24 * scale}px Arial`;
        ctx.fillStyle = "#666666";
        ctx.fillText(displaySubtitle, canvas.width / 2, 460 * scale);

        // Date and time
        ctx.font = `400 ${32 * scale}px Arial`;
        ctx.fillStyle = "#000000";
        ctx.fillText(formattedDate, canvas.width / 2, 580 * scale);
        ctx.fillText(formattedTime, canvas.width / 2, 640 * scale);

        // Location
        ctx.font = `400 ${28 * scale}px Arial`;
        ctx.fillStyle = "#333333";
        ctx.fillText(eventSettings.event_location, canvas.width / 2, 740 * scale);
        ctx.font = `300 ${24 * scale}px Arial`;
        ctx.fillStyle = "#666666";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, 780 * scale);

        // Bottom accent
        ctx.fillStyle = "#000000";
        ctx.fillRect(340 * scale, 900 * scale, 400 * scale, 3 * scale);

        ctx.font = `300 ${20 * scale}px Arial`;
        ctx.fillStyle = "#999999";
        ctx.fillText(displayFooter, canvas.width / 2, 960 * scale);
    };

    const drawColorfulTemplate = async (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string,
        displayTitle: string,
        displaySubtitle: string,
        displayFooter: string
    ) => {
        const scale = canvas.width / 1080;

        // Vibrant gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#FF6B6B");
        gradient.addColorStop(0.25, "#4ECDC4");
        gradient.addColorStop(0.5, "#45B7D1");
        gradient.addColorStop(0.75, "#FFA07A");
        gradient.addColorStop(1, "#98D8C8");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (showDecorations) {
            // Geometric shapes
            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.beginPath();
            ctx.arc(150 * scale, 150 * scale, 200 * scale, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            ctx.fillRect(700 * scale, 700 * scale, 300 * scale, 300 * scale);
        }

        // White content box
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 20 * scale;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10 * scale;
        ctx.beginPath();
        ctx.roundRect(140 * scale, 180 * scale, 800 * scale, 720 * scale, 30 * scale);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Content
        const emoji = showEmojis ? "🎉 " : "";
        ctx.font = `bold ${56 * scale}px Arial`;
        ctx.fillStyle = "#FF6B6B";
        ctx.textAlign = "center";
        ctx.fillText(emoji + displayTitle.split(" ")[0], canvas.width / 2, 310 * scale);

        ctx.font = `bold ${44 * scale}px Arial`;
        ctx.fillStyle = "#4ECDC4";
        ctx.fillText(displayTitle.split(" ").slice(1).join(" "), canvas.width / 2, 380 * scale);

        // Colorful divider
        const dividerGradient = ctx.createLinearGradient(300 * scale, 0, 780 * scale, 0);
        dividerGradient.addColorStop(0, "#FF6B6B");
        dividerGradient.addColorStop(0.5, "#4ECDC4");
        dividerGradient.addColorStop(1, "#FFA07A");
        ctx.fillStyle = dividerGradient;
        ctx.fillRect(300 * scale, 420 * scale, 480 * scale, 4 * scale);

        // Subtitle
        ctx.font = `bold ${28 * scale}px Arial`;
        ctx.fillStyle = "#45B7D1";
        ctx.fillText(displaySubtitle, canvas.width / 2, 490 * scale);

        // Info with emojis
        ctx.font = `bold ${30 * scale}px Arial`;
        ctx.fillStyle = "#333333";
        const dateEmoji = showEmojis ? "📅 " : "";
        const timeEmoji = showEmojis ? "⏰ " : "";
        const locEmoji = showEmojis ? "📍 " : "";
        ctx.fillText(dateEmoji + formattedDate, canvas.width / 2, 590 * scale);
        ctx.fillText(timeEmoji + formattedTime, canvas.width / 2, 650 * scale);
        ctx.fillText(locEmoji + eventSettings.event_location, canvas.width / 2, 730 * scale);

        ctx.font = `${26 * scale}px Arial`;
        ctx.fillStyle = "#666666";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, 780 * scale);

        // Footer
        ctx.font = `${20 * scale}px Arial`;
        ctx.fillStyle = "#999999";
        ctx.fillText(displayFooter, canvas.width / 2, 850 * scale);
    };

    const drawCorporateTemplate = async (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string,
        displayTitle: string,
        displaySubtitle: string,
        displayFooter: string
    ) => {
        const scale = canvas.width / 1080;

        // Professional blue gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#1E3A5F");
        gradient.addColorStop(1, "#0F1C2E");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid pattern
        if (showDecorations) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
            ctx.lineWidth = 1;
            for (let i = 0; i < canvas.width; i += 50 * scale) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < canvas.height; i += 50 * scale) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
        }

        // Accent bar
        ctx.fillStyle = "#3B82F6";
        ctx.fillRect(0, 0, 8 * scale, canvas.height);

        // Content area
        ctx.font = `bold ${18 * scale}px Arial`;
        ctx.fillStyle = "#60A5FA";
        ctx.textAlign = "left";
        ctx.fillText(eventSettings.event_title.toUpperCase(), 80 * scale, 100 * scale);

        ctx.font = `bold ${64 * scale}px Arial`;
        ctx.fillStyle = "#FFFFFF";
        const titleWords = displayTitle.split(" ");
        let y = 200 * scale;
        titleWords.forEach((word) => {
            ctx.fillText(word, 80 * scale, y);
            y += 75 * scale;
        });

        ctx.font = `${28 * scale}px Arial`;
        ctx.fillStyle = "#94A3B8";
        ctx.fillText(displaySubtitle, 80 * scale, y + 30 * scale);

        // Info section
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(60 * scale, canvas.height * 0.55, canvas.width - 120 * scale, 200 * scale);

        ctx.font = `bold ${24 * scale}px Arial`;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(formattedDate, 80 * scale, canvas.height * 0.62);
        ctx.fillText(formattedTime, 80 * scale, canvas.height * 0.68);

        ctx.font = `bold ${26 * scale}px Arial`;
        ctx.fillStyle = "#3B82F6";
        ctx.fillText(eventSettings.event_location, 80 * scale, canvas.height * 0.75);
        ctx.font = `${22 * scale}px Arial`;
        ctx.fillStyle = "#94A3B8";
        ctx.fillText(eventSettings.event_location_detail, 80 * scale, canvas.height * 0.80);

        // Footer
        ctx.font = `${16 * scale}px Arial`;
        ctx.fillStyle = "#475569";
        ctx.fillText(displayFooter, 80 * scale, canvas.height - 60 * scale);
    };

    const drawFestivalTemplate = async (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string,
        displayTitle: string,
        displaySubtitle: string,
        displayFooter: string
    ) => {
        const scale = canvas.width / 1080;

        // Dark background with neon feel
        ctx.fillStyle = "#0A0A0A";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (showDecorations) {
            // Neon circles
            const neonColors = ["#FF006E", "#FB5607", "#FFBE0B", "#8338EC", "#3A86FF"];
            neonColors.forEach((color, i) => {
                ctx.strokeStyle = color;
                ctx.lineWidth = 3 * scale;
                ctx.beginPath();
                ctx.arc(
                    (Math.random() * 0.8 + 0.1) * canvas.width,
                    (Math.random() * 0.8 + 0.1) * canvas.height,
                    (50 + i * 30) * scale,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
            });
        }

        // Glowing title
        ctx.shadowColor = "#FF006E";
        ctx.shadowBlur = 30 * scale;
        ctx.font = `bold ${72 * scale}px Arial`;
        ctx.fillStyle = "#FF006E";
        ctx.textAlign = "center";
        ctx.fillText(displayTitle.split(" ")[0], canvas.width / 2, 250 * scale);

        ctx.shadowColor = "#FFBE0B";
        ctx.font = `bold ${56 * scale}px Arial`;
        ctx.fillStyle = "#FFBE0B";
        ctx.fillText(displayTitle.split(" ").slice(1).join(" "), canvas.width / 2, 340 * scale);
        ctx.shadowBlur = 0;

        // Subtitle
        ctx.font = `bold ${32 * scale}px Arial`;
        ctx.fillStyle = "#3A86FF";
        ctx.fillText(displaySubtitle, canvas.width / 2, 440 * scale);

        // Date/Time with glow
        ctx.shadowColor = "#8338EC";
        ctx.shadowBlur = 20 * scale;
        ctx.font = `bold ${36 * scale}px Arial`;
        ctx.fillStyle = "#8338EC";
        ctx.fillText(formattedDate, canvas.width / 2, 600 * scale);
        ctx.fillText(formattedTime, canvas.width / 2, 660 * scale);
        ctx.shadowBlur = 0;

        // Location
        ctx.font = `bold ${28 * scale}px Arial`;
        ctx.fillStyle = "#FB5607";
        ctx.fillText(eventSettings.event_location, canvas.width / 2, 760 * scale);
        ctx.font = `${24 * scale}px Arial`;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, 810 * scale);

        // Footer
        ctx.font = `${20 * scale}px Arial`;
        ctx.fillStyle = "#666666";
        ctx.fillText(displayFooter, canvas.width / 2, canvas.height - 60 * scale);
    };

    const drawMedicalTemplate = async (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string,
        displayTitle: string,
        displaySubtitle: string,
        displayFooter: string
    ) => {
        const scale = canvas.width / 1080;

        // Clean medical blue/white
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Top blue bar
        const blueGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        blueGradient.addColorStop(0, "#0EA5E9");
        blueGradient.addColorStop(1, "#06B6D4");
        ctx.fillStyle = blueGradient;
        ctx.fillRect(0, 0, canvas.width, 120 * scale);

        if (showDecorations) {
            // Medical cross
            ctx.fillStyle = "rgba(14, 165, 233, 0.1)";
            ctx.fillRect(canvas.width - 200 * scale, 200 * scale, 80 * scale, 200 * scale);
            ctx.fillRect(canvas.width - 260 * scale, 260 * scale, 200 * scale, 80 * scale);
        }

        // Event title
        ctx.font = `bold ${24 * scale}px Arial`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.fillText(eventSettings.event_title, canvas.width / 2, 70 * scale);

        // Main title
        ctx.font = `bold ${52 * scale}px Arial`;
        ctx.fillStyle = "#0F172A";
        const titleWords = displayTitle.split(" ");
        let y = 250 * scale;
        titleWords.forEach((word) => {
            ctx.fillText(word, canvas.width / 2, y);
            y += 65 * scale;
        });

        // Subtitle
        ctx.font = `${28 * scale}px Arial`;
        ctx.fillStyle = "#0EA5E9";
        ctx.fillText(displaySubtitle, canvas.width / 2, y + 30 * scale);

        // Divider
        ctx.fillStyle = "#0EA5E9";
        ctx.fillRect(340 * scale, y + 70 * scale, 400 * scale, 3 * scale);

        // Info
        ctx.font = `${28 * scale}px Arial`;
        ctx.fillStyle = "#334155";
        const infoY = canvas.height * 0.58;
        const dateEmoji = showEmojis ? "📅 " : "";
        const timeEmoji = showEmojis ? "🕐 " : "";
        ctx.fillText(dateEmoji + formattedDate, canvas.width / 2, infoY);
        ctx.fillText(timeEmoji + formattedTime, canvas.width / 2, infoY + 50 * scale);

        ctx.font = `bold ${26 * scale}px Arial`;
        ctx.fillStyle = "#0EA5E9";
        const locEmoji = showEmojis ? "🏥 " : "";
        ctx.fillText(locEmoji + eventSettings.event_location, canvas.width / 2, infoY + 120 * scale);
        ctx.font = `${22 * scale}px Arial`;
        ctx.fillStyle = "#64748B";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, infoY + 160 * scale);

        // Bottom bar
        ctx.fillStyle = blueGradient;
        ctx.fillRect(0, canvas.height - 80 * scale, canvas.width, 80 * scale);
        ctx.font = `${18 * scale}px Arial`;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(displayFooter, canvas.width / 2, canvas.height - 35 * scale);
    };

    const drawTechTemplate = async (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string,
        displayTitle: string,
        displaySubtitle: string,
        displayFooter: string
    ) => {
        const scale = canvas.width / 1080;

        // Dark tech background
        ctx.fillStyle = "#0F0F0F";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (showDecorations) {
            // Circuit patterns
            ctx.strokeStyle = "rgba(34, 197, 94, 0.2)";
            ctx.lineWidth = 2 * scale;
            for (let i = 0; i < 10; i++) {
                ctx.beginPath();
                const startX = Math.random() * canvas.width;
                const startY = Math.random() * canvas.height;
                ctx.moveTo(startX, startY);
                ctx.lineTo(startX + (Math.random() - 0.5) * 200 * scale, startY);
                ctx.lineTo(startX + (Math.random() - 0.5) * 200 * scale, startY + (Math.random() - 0.5) * 200 * scale);
                ctx.stroke();
            }

            // Glowing dots
            const dotColors = ["#22C55E", "#3B82F6", "#A855F7"];
            for (let i = 0; i < 20; i++) {
                ctx.fillStyle = dotColors[i % 3];
                ctx.beginPath();
                ctx.arc(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    3 * scale,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }

        // Green accent line
        ctx.fillStyle = "#22C55E";
        ctx.fillRect(0, 0, canvas.width, 5 * scale);

        // Terminal-like header
        ctx.font = `${18 * scale}px monospace`;
        ctx.fillStyle = "#22C55E";
        ctx.textAlign = "left";
        ctx.fillText("> " + eventSettings.event_title, 60 * scale, 80 * scale);

        // Main title with code brackets
        ctx.font = `bold ${56 * scale}px monospace`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.fillText("{ " + displayTitle.split(" ")[0] + " }", canvas.width / 2, 250 * scale);
        ctx.font = `bold ${44 * scale}px monospace`;
        ctx.fillStyle = "#22C55E";
        ctx.fillText(displayTitle.split(" ").slice(1).join(" "), canvas.width / 2, 330 * scale);

        // Subtitle
        ctx.font = `${28 * scale}px monospace`;
        ctx.fillStyle = "#3B82F6";
        ctx.fillText("// " + displaySubtitle, canvas.width / 2, 420 * scale);

        // Info section
        ctx.fillStyle = "rgba(34, 197, 94, 0.1)";
        ctx.strokeStyle = "#22C55E";
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.roundRect(200 * scale, 500 * scale, 680 * scale, 280 * scale, 10 * scale);
        ctx.fill();
        ctx.stroke();

        ctx.font = `${24 * scale}px monospace`;
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "left";
        ctx.fillText(`date: "${formattedDate}"`, 240 * scale, 560 * scale);
        ctx.fillText(`time: "${formattedTime}"`, 240 * scale, 610 * scale);
        ctx.fillStyle = "#22C55E";
        ctx.fillText(`location: "${eventSettings.event_location}"`, 240 * scale, 680 * scale);
        ctx.fillStyle = "#64748B";
        ctx.fillText(`detail: "${eventSettings.event_location_detail}"`, 240 * scale, 730 * scale);

        // Footer
        ctx.textAlign = "center";
        ctx.font = `${18 * scale}px monospace`;
        ctx.fillStyle = "#475569";
        ctx.fillText("/* " + displayFooter + " */", canvas.width / 2, canvas.height - 60 * scale);
    };

    const downloadInvitation = (format: "png" | "jpg") => {
        if (!previewUrl) return;

        const link = document.createElement("a");
        const filename = `davetiye-${eventSettings.event_title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${format}`;

        if (format === "jpg") {
            const canvas = canvasRef.current;
            if (canvas) {
                link.href = canvas.toDataURL("image/jpeg", 0.95);
            }
        } else {
            link.href = previewUrl;
        }

        link.download = filename;
        link.click();

        toast({
            title: "İndirildi!",
            description: `Davetiye görseli ${format.toUpperCase()} olarak indirildi.`,
        });
    };

    const copyToClipboard = async () => {
        if (!previewUrl) return;

        try {
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.toBlob(async (blob) => {
                    if (blob) {
                        await navigator.clipboard.write([
                            new ClipboardItem({ "image/png": blob })
                        ]);
                        toast({
                            title: "Kopyalandı!",
                            description: "Görsel panoya kopyalandı.",
                        });
                    }
                });
            }
        } catch (error) {
            toast({
                title: "Hata",
                description: "Görsel kopyalanamadı.",
                variant: "destructive",
            });
        }
    };

    const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setBackgroundImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="template" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="template" className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        Şablon
                    </TabsTrigger>
                    <TabsTrigger value="style" className="gap-2">
                        <Palette className="w-4 h-4" />
                        Stil
                    </TabsTrigger>
                    <TabsTrigger value="content" className="gap-2">
                        <Type className="w-4 h-4" />
                        İçerik
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="gap-2">
                        <Settings className="w-4 h-4" />
                        Ayarlar
                    </TabsTrigger>
                </TabsList>

                {/* Template Tab */}
                <TabsContent value="template" className="space-y-4">
                    <Card className="p-4">
                        <Label className="text-lg font-semibold mb-4 block">Şablon Seç</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { value: "modern", label: "Modern", color: "#8B5CF6" },
                                { value: "elegant", label: "Elegant", color: "#D4A574" },
                                { value: "minimal", label: "Minimal", color: "#000000" },
                                { value: "colorful", label: "Colorful", color: "#FF6B6B" },
                                { value: "corporate", label: "Corporate", color: "#3B82F6" },
                                { value: "festival", label: "Festival", color: "#FF006E" },
                                { value: "medical", label: "Medical", color: "#0EA5E9" },
                                { value: "tech", label: "Tech", color: "#22C55E" },
                            ].map((t) => (
                                <Button
                                    key={t.value}
                                    variant={template === t.value ? "default" : "outline"}
                                    className="h-auto py-4 flex flex-col gap-2"
                                    onClick={() => setTemplate(t.value as TemplateType)}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full"
                                        style={{ backgroundColor: t.color }}
                                    />
                                    <span>{t.label}</span>
                                </Button>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4">
                        <Label className="text-lg font-semibold mb-4 block">Boyut</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(CANVAS_SIZES).map(([key, value]) => (
                                <Button
                                    key={key}
                                    variant={size === key ? "default" : "outline"}
                                    className="h-auto py-3 flex flex-col gap-1"
                                    onClick={() => setSize(key as SizeType)}
                                >
                                    {key === "instagram" && <Instagram className="w-4 h-4" />}
                                    {key === "facebook" && <Facebook className="w-4 h-4" />}
                                    {key === "twitter" && <Twitter className="w-4 h-4" />}
                                    {key === "story" && <Smartphone className="w-4 h-4" />}
                                    {key === "a4" && <Monitor className="w-4 h-4" />}
                                    {key === "custom" && <Settings className="w-4 h-4" />}
                                    <span className="text-xs">{value.label}</span>
                                </Button>
                            ))}
                        </div>

                        {size === "custom" && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label>Genişlik (px)</Label>
                                    <Input
                                        type="number"
                                        value={customWidth}
                                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                                        min={200}
                                        max={4000}
                                    />
                                </div>
                                <div>
                                    <Label>Yükseklik (px)</Label>
                                    <Input
                                        type="number"
                                        value={customHeight}
                                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                                        min={200}
                                        max={4000}
                                    />
                                </div>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* Style Tab */}
                <TabsContent value="style" className="space-y-4">
                    <Card className="p-4">
                        <Label className="text-lg font-semibold mb-4 block">Renkler</Label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {Object.entries(customColors).map(([key, value]) => (
                                <div key={key}>
                                    <Label className="capitalize text-sm">{key}</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            type="color"
                                            value={value}
                                            onChange={(e) =>
                                                setCustomColors({ ...customColors, [key]: e.target.value })
                                            }
                                            className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                            value={value}
                                            onChange={(e) =>
                                                setCustomColors({ ...customColors, [key]: e.target.value })
                                            }
                                            className="flex-1 font-mono text-xs"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-4">
                        <Label className="text-lg font-semibold mb-4 block">Tipografi</Label>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Font Ailesi</Label>
                                <Select value={fontFamily} onValueChange={setFontFamily}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Arial">Arial</SelectItem>
                                        <SelectItem value="Georgia">Georgia</SelectItem>
                                        <SelectItem value="Verdana">Verdana</SelectItem>
                                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                        <SelectItem value="monospace">Monospace</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Başlık Font Boyutu: {fontSize}px</Label>
                                <Slider
                                    value={[fontSize]}
                                    onValueChange={([v]) => setFontSize(v)}
                                    min={24}
                                    max={72}
                                    step={2}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <Label className="text-lg font-semibold mb-4 block">Arkaplan Görseli</Label>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Label
                                    htmlFor="bg-upload"
                                    className="flex-1 flex items-center justify-center gap-2 h-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                                >
                                    <Upload className="w-4 h-4" />
                                    Görsel Yükle
                                </Label>
                                <input
                                    id="bg-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBackgroundUpload}
                                />
                                {backgroundImage && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setBackgroundImage(null)}
                                    >
                                        Kaldır
                                    </Button>
                                )}
                            </div>
                            {backgroundImage && (
                                <div>
                                    <Label>Opaklık: {backgroundOpacity}%</Label>
                                    <Slider
                                        value={[backgroundOpacity]}
                                        onValueChange={([v]) => setBackgroundOpacity(v)}
                                        min={10}
                                        max={100}
                                        step={5}
                                        className="mt-2"
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="space-y-4">
                    <Card className="p-4">
                        <Label className="text-lg font-semibold mb-4 block">Özel Metinler</Label>
                        <div className="space-y-4">
                            <div>
                                <Label>Özel Başlık (boş bırakılırsa etkinlik sloganı kullanılır)</Label>
                                <Input
                                    value={customTitle}
                                    onChange={(e) => setCustomTitle(e.target.value)}
                                    placeholder={eventSettings.event_tagline}
                                />
                            </div>
                            <div>
                                <Label>Özel Alt Başlık</Label>
                                <Input
                                    value={customSubtitle}
                                    onChange={(e) => setCustomSubtitle(e.target.value)}
                                    placeholder={eventSettings.event_subtitle}
                                />
                            </div>
                            <div>
                                <Label>Özel Footer</Label>
                                <Input
                                    value={customFooter}
                                    onChange={(e) => setCustomFooter(e.target.value)}
                                    placeholder={eventSettings.event_address}
                                />
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings" className="space-y-4">
                    <Card className="p-4">
                        <Label className="text-lg font-semibold mb-4 block">Özellikler</Label>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div>
                                    <Label>Emoji Göster</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Tarih, saat ve konum için emoji kullan
                                    </p>
                                </div>
                                <Switch checked={showEmojis} onCheckedChange={setShowEmojis} />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div>
                                    <Label>Dekorasyon Göster</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Şablona özel dekoratif elementler
                                    </p>
                                </div>
                                <Switch checked={showDecorations} onCheckedChange={setShowDecorations} />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div>
                                    <Label>QR Kod Ekle</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Sağ alt köşeye QR kod ekle
                                    </p>
                                </div>
                                <Switch checked={showQrCode} onCheckedChange={setShowQrCode} />
                            </div>

                            {showQrCode && (
                                <div>
                                    <Label>QR Kod URL</Label>
                                    <Input
                                        value={qrCodeUrl}
                                        onChange={(e) => setQrCodeUrl(e.target.value)}
                                        placeholder="https://etkinlik.com/kayit"
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Actions */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-3">
                    <Button onClick={generateInvitation} disabled={isGenerating}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                        Yenile
                    </Button>
                    <Button onClick={() => downloadInvitation("png")} disabled={!previewUrl}>
                        <Download className="mr-2 h-4 w-4" />
                        PNG İndir
                    </Button>
                    <Button onClick={() => downloadInvitation("jpg")} disabled={!previewUrl} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        JPG İndir
                    </Button>
                    <Button onClick={copyToClipboard} disabled={!previewUrl} variant="outline">
                        <Copy className="mr-2 h-4 w-4" />
                        Kopyala
                    </Button>
                </div>
            </Card>

            {/* Preview */}
            <Card className="p-6">
                <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Önizleme
                    </h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <Badge variant="outline">{getCanvasSize().width}x{getCanvasSize().height}px</Badge>
                        <Badge variant="secondary">{template}</Badge>
                    </div>
                </div>

                <div className="flex justify-center">
                    {isGenerating ? (
                        <div className="flex items-center justify-center h-[400px]">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Davetiye Önizleme"
                            className="max-w-full h-auto rounded-lg shadow-lg border-2 border-border"
                            style={{ maxHeight: "600px" }}
                        />
                    ) : null}
                </div>
            </Card>

            {/* Hidden canvas */}
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
};

export default AdvancedInvitationGenerator;
