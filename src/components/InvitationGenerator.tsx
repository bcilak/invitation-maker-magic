import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Image as ImageIcon, Loader2, RefreshCw } from "lucide-react";
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

type TemplateType = "modern" | "elegant" | "minimal" | "colorful";

export const InvitationGenerator = ({ eventSettings }: InvitationGeneratorProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [template, setTemplate] = useState<TemplateType>("modern");
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        generateInvitation();
    }, [template, eventSettings]);

    const generateInvitation = async () => {
        setIsGenerating(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Canvas boyutları - Instagram post format
        canvas.width = 1080;
        canvas.height = 1080;

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

        // Template'e göre çiz
        switch (template) {
            case "modern":
                drawModernTemplate(ctx, canvas, formattedDate, formattedTime);
                break;
            case "elegant":
                drawElegantTemplate(ctx, canvas, formattedDate, formattedTime);
                break;
            case "minimal":
                drawMinimalTemplate(ctx, canvas, formattedDate, formattedTime);
                break;
            case "colorful":
                drawColorfulTemplate(ctx, canvas, formattedDate, formattedTime);
                break;
        }

        // Preview oluştur
        const url = canvas.toDataURL("image/png");
        setPreviewUrl(url);
        setIsGenerating(false);
    };

    const drawModernTemplate = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string
    ) => {
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#0F172A");
        gradient.addColorStop(1, "#1E293B");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Decorative circles
        ctx.fillStyle = "rgba(139, 92, 246, 0.1)";
        ctx.beginPath();
        ctx.arc(200, 200, 300, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(236, 72, 153, 0.1)";
        ctx.beginPath();
        ctx.arc(880, 880, 250, 0, Math.PI * 2);
        ctx.fill();

        // Title badge
        ctx.fillStyle = "rgba(139, 92, 246, 0.2)";
        ctx.strokeStyle = "#8B5CF6";
        ctx.lineWidth = 2;
        const badgeWidth = 600;
        const badgeHeight = 50;
        const badgeX = (canvas.width - badgeWidth) / 2;
        const badgeY = 120;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 25);
        ctx.fill();
        ctx.stroke();

        // Event title (small badge)
        ctx.font = "bold 24px Arial";
        ctx.fillStyle = "#8B5CF6";
        ctx.textAlign = "center";
        ctx.fillText(eventSettings.event_title, canvas.width / 2, badgeY + 35);

        // Main tagline
        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "#FFFFFF";
        const words = eventSettings.event_tagline.split(" ");
        let y = 280;
        let line = "";
        words.forEach((word, index) => {
            const testLine = line + word + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 900 && line !== "") {
                ctx.fillText(line.trim(), canvas.width / 2, y);
                line = word + " ";
                y += 60;
            } else {
                line = testLine;
            }
        });
        ctx.fillText(line.trim(), canvas.width / 2, y);

        // Subtitle with gradient
        ctx.font = "bold 32px Arial";
        const subtitleGradient = ctx.createLinearGradient(200, 0, 880, 0);
        subtitleGradient.addColorStop(0, "#8B5CF6");
        subtitleGradient.addColorStop(1, "#EC4899");
        ctx.fillStyle = subtitleGradient;
        ctx.fillText(eventSettings.event_subtitle, canvas.width / 2, y + 70);

        // Info box
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.strokeStyle = "rgba(139, 92, 246, 0.5)";
        ctx.lineWidth = 2;
        const boxWidth = 700;
        const boxHeight = 250;
        const boxX = (canvas.width - boxWidth) / 2;
        const boxY = 600;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 20);
        ctx.fill();
        ctx.stroke();

        // Date & Time
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("📅 " + formattedDate, canvas.width / 2, boxY + 60);
        ctx.fillText("🕐 " + formattedTime, canvas.width / 2, boxY + 110);

        // Location
        ctx.font = "bold 26px Arial";
        ctx.fillStyle = "#A78BFA";
        ctx.fillText("📍 " + eventSettings.event_location, canvas.width / 2, boxY + 160);
        ctx.font = "22px Arial";
        ctx.fillStyle = "#CBD5E1";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, boxY + 200);

        // Footer
        ctx.font = "18px Arial";
        ctx.fillStyle = "#64748B";
        ctx.fillText(eventSettings.event_address, canvas.width / 2, 980);
    };

    const drawElegantTemplate = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string
    ) => {
        // Background - cream color
        ctx.fillStyle = "#FFF8F0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Decorative borders
        ctx.strokeStyle = "#D4A574";
        ctx.lineWidth = 8;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

        ctx.strokeStyle = "#D4A574";
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

        // Decorative corner elements
        const drawCornerDecoration = (x: number, y: number, angle: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.strokeStyle = "#D4A574";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(50, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 50);
            ctx.stroke();
            ctx.restore();
        };

        drawCornerDecoration(100, 100, 0);
        drawCornerDecoration(canvas.width - 100, 100, Math.PI / 2);
        drawCornerDecoration(canvas.width - 100, canvas.height - 100, Math.PI);
        drawCornerDecoration(100, canvas.height - 100, (3 * Math.PI) / 2);

        // Title
        ctx.font = "italic 32px Georgia";
        ctx.fillStyle = "#8B6F47";
        ctx.textAlign = "center";
        ctx.fillText("Siz de davetlisiniz...", canvas.width / 2, 180);

        // Main title
        ctx.font = "bold 52px Georgia";
        ctx.fillStyle = "#2C1810";
        const titleWords = eventSettings.event_tagline.split(" ");
        let y = 280;
        titleWords.forEach((word) => {
            ctx.fillText(word, canvas.width / 2, y);
            y += 65;
        });

        // Divider line
        ctx.strokeStyle = "#D4A574";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(300, y + 20);
        ctx.lineTo(780, y + 20);
        ctx.stroke();

        // Subtitle
        ctx.font = "italic 28px Georgia";
        ctx.fillStyle = "#8B6F47";
        ctx.fillText(eventSettings.event_subtitle, canvas.width / 2, y + 70);

        // Info section
        ctx.font = "24px Georgia";
        ctx.fillStyle = "#2C1810";
        const infoY = 650;
        ctx.fillText(formattedDate, canvas.width / 2, infoY);
        ctx.fillText(formattedTime, canvas.width / 2, infoY + 50);

        ctx.font = "bold 26px Georgia";
        ctx.fillStyle = "#8B6F47";
        ctx.fillText(eventSettings.event_location, canvas.width / 2, infoY + 120);

        ctx.font = "22px Georgia";
        ctx.fillStyle = "#5C4A3A";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, infoY + 160);

        // Footer
        ctx.font = "italic 18px Georgia";
        ctx.fillStyle = "#8B6F47";
        ctx.fillText(eventSettings.event_address, canvas.width / 2, 960);
    };

    const drawMinimalTemplate = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string
    ) => {
        // Clean white background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Simple title
        ctx.font = "300 72px Arial";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.fillText(eventSettings.event_tagline.split(" ")[0], canvas.width / 2, 250);
        ctx.fillText(eventSettings.event_tagline.split(" ").slice(1).join(" "), canvas.width / 2, 340);

        // Thin line
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(340, 400);
        ctx.lineTo(740, 400);
        ctx.stroke();

        // Event type
        ctx.font = "400 24px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText(eventSettings.event_subtitle, canvas.width / 2, 460);

        // Date and time with icons
        ctx.font = "400 32px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText(formattedDate, canvas.width / 2, 580);
        ctx.fillText(formattedTime, canvas.width / 2, 640);

        // Location
        ctx.font = "400 28px Arial";
        ctx.fillStyle = "#333333";
        ctx.fillText(eventSettings.event_location, canvas.width / 2, 740);
        ctx.font = "300 24px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, 780);

        // Bottom accent
        ctx.fillStyle = "#000000";
        ctx.fillRect(340, 900, 400, 3);

        ctx.font = "300 20px Arial";
        ctx.fillStyle = "#999999";
        ctx.fillText(eventSettings.event_address, canvas.width / 2, 960);
    };

    const drawColorfulTemplate = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        formattedDate: string,
        formattedTime: string
    ) => {
        // Vibrant gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#FF6B6B");
        gradient.addColorStop(0.25, "#4ECDC4");
        gradient.addColorStop(0.5, "#45B7D1");
        gradient.addColorStop(0.75, "#FFA07A");
        gradient.addColorStop(1, "#98D8C8");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Geometric shapes
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.arc(150, 150, 200, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(700, 700, 300, 300);

        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.beginPath();
        ctx.moveTo(540, 100);
        ctx.lineTo(740, 200);
        ctx.lineTo(640, 350);
        ctx.closePath();
        ctx.fill();

        // White content box
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        ctx.beginPath();
        ctx.roundRect(140, 180, 800, 720, 30);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Content
        ctx.font = "bold 56px Arial";
        ctx.fillStyle = "#FF6B6B";
        ctx.textAlign = "center";
        ctx.fillText("🎉 " + eventSettings.event_tagline.split(" ")[0], canvas.width / 2, 310);

        ctx.font = "bold 44px Arial";
        ctx.fillStyle = "#4ECDC4";
        ctx.fillText(eventSettings.event_tagline.split(" ").slice(1).join(" "), canvas.width / 2, 380);

        // Colorful divider
        const dividerGradient = ctx.createLinearGradient(300, 0, 780, 0);
        dividerGradient.addColorStop(0, "#FF6B6B");
        dividerGradient.addColorStop(0.5, "#4ECDC4");
        dividerGradient.addColorStop(1, "#FFA07A");
        ctx.fillStyle = dividerGradient;
        ctx.fillRect(300, 420, 480, 4);

        // Subtitle
        ctx.font = "bold 28px Arial";
        ctx.fillStyle = "#45B7D1";
        ctx.fillText(eventSettings.event_subtitle, canvas.width / 2, 490);

        // Info with emojis
        ctx.font = "bold 30px Arial";
        ctx.fillStyle = "#333333";
        ctx.fillText("📅 " + formattedDate, canvas.width / 2, 590);
        ctx.fillText("⏰ " + formattedTime, canvas.width / 2, 650);
        ctx.fillText("📍 " + eventSettings.event_location, canvas.width / 2, 730);

        ctx.font = "26px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, 780);

        // Footer
        ctx.font = "20px Arial";
        ctx.fillStyle = "#999999";
        ctx.fillText(eventSettings.event_address, canvas.width / 2, 850);
    };

    const downloadInvitation = () => {
        if (!previewUrl) return;

        const link = document.createElement("a");
        const filename = `davetiye-${eventSettings.event_title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;
        link.download = filename;
        link.href = previewUrl;
        link.click();

        toast({
            title: "İndirildi!",
            description: "Davetiye görseli başarıyla indirildi.",
        });
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="mb-4">
                    <Label htmlFor="template">Davetiye Şablonu</Label>
                    <Select value={template} onValueChange={(value) => setTemplate(value as TemplateType)}>
                        <SelectTrigger id="template">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="modern">Modern - Gradient & Mor Tonlar</SelectItem>
                            <SelectItem value="elegant">Elegant - Klasik & Altın</SelectItem>
                            <SelectItem value="minimal">Minimal - Sade & Siyah-Beyaz</SelectItem>
                            <SelectItem value="colorful">Colorful - Renkli & Dinamik</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-4">
                    <Button onClick={generateInvitation} disabled={isGenerating}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                        Yenile
                    </Button>
                    <Button onClick={downloadInvitation} disabled={!previewUrl} variant="default">
                        <Download className="mr-2 h-4 w-4" />
                        PNG İndir (1080x1080)
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
                    <p className="text-sm text-muted-foreground">
                        Sosyal medya paylaşımı için optimize edilmiş (1080x1080px)
                    </p>
                </div>

                <div className="flex justify-center">
                    {isGenerating ? (
                        <div className="flex items-center justify-center h-[500px]">
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
