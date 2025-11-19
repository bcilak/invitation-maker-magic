import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PersonalInvitationProps {
    fullName: string;
    email: string;
    eventSettings: {
        event_title: string;
        event_subtitle: string;
        event_tagline: string;
        event_date: string;
        event_location: string;
        event_location_detail: string;
        event_address: string;
    };
    template?: "modern" | "elegant" | "minimal" | "colorful";
}

export const PersonalInvitation = ({
    fullName,
    email,
    eventSettings,
    template = "elegant",
}: PersonalInvitationProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        generatePersonalInvitation();
    }, [fullName, email, eventSettings, template]);

    const generatePersonalInvitation = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Canvas boyutları
        canvas.width = 1080;
        canvas.height = 1350; // Biraz daha uzun, kişisel bilgi için

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

        // Elegant template for personal invitations
        drawPersonalElegantTemplate(ctx, canvas, fullName, formattedDate, formattedTime);
    };

    const drawPersonalElegantTemplate = (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement,
        fullName: string,
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

        // Personal greeting at top
        ctx.font = "italic 42px Georgia";
        ctx.fillStyle = "#8B6F47";
        ctx.textAlign = "center";
        ctx.fillText("Sayın", canvas.width / 2, 180);

        // Name in large, elegant font
        ctx.font = "bold 56px Georgia";
        ctx.fillStyle = "#2C1810";
        const nameParts = fullName.split(" ");
        let nameY = 260;
        nameParts.forEach((part) => {
            ctx.fillText(part, canvas.width / 2, nameY);
            nameY += 70;
        });

        // Invitation text
        ctx.font = "italic 36px Georgia";
        ctx.fillStyle = "#8B6F47";
        ctx.fillText("Etkinliğimize Davetlisiniz", canvas.width / 2, nameY + 40);

        // Divider line
        ctx.strokeStyle = "#D4A574";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(250, nameY + 80);
        ctx.lineTo(830, nameY + 80);
        ctx.stroke();

        // Event title
        ctx.font = "bold 48px Georgia";
        ctx.fillStyle = "#2C1810";
        const titleY = nameY + 160;
        ctx.fillText(eventSettings.event_tagline.split(" ").slice(0, 2).join(" "), canvas.width / 2, titleY);
        ctx.fillText(eventSettings.event_tagline.split(" ").slice(2).join(" "), canvas.width / 2, titleY + 60);

        // Subtitle
        ctx.font = "italic 32px Georgia";
        ctx.fillStyle = "#8B6F47";
        ctx.fillText(eventSettings.event_subtitle, canvas.width / 2, titleY + 130);

        // Decorative line
        ctx.strokeStyle = "#D4A574";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(300, titleY + 170);
        ctx.lineTo(780, titleY + 170);
        ctx.stroke();

        // Event details
        ctx.font = "28px Georgia";
        ctx.fillStyle = "#2C1810";
        const detailsY = titleY + 240;

        ctx.font = "bold 30px Georgia";
        ctx.fillText("📅 Tarih", canvas.width / 2, detailsY);
        ctx.font = "26px Georgia";
        ctx.fillStyle = "#5C4A3A";
        ctx.fillText(formattedDate, canvas.width / 2, detailsY + 40);

        ctx.font = "bold 30px Georgia";
        ctx.fillStyle = "#2C1810";
        ctx.fillText("🕐 Saat", canvas.width / 2, detailsY + 100);
        ctx.font = "26px Georgia";
        ctx.fillStyle = "#5C4A3A";
        ctx.fillText(formattedTime, canvas.width / 2, detailsY + 140);

        ctx.font = "bold 30px Georgia";
        ctx.fillStyle = "#2C1810";
        ctx.fillText("📍 Mekan", canvas.width / 2, detailsY + 200);
        ctx.font = "26px Georgia";
        ctx.fillStyle = "#5C4A3A";
        ctx.fillText(eventSettings.event_location, canvas.width / 2, detailsY + 240);
        ctx.font = "24px Georgia";
        ctx.fillText(eventSettings.event_location_detail, canvas.width / 2, detailsY + 275);

        // Footer
        ctx.font = "italic 22px Georgia";
        ctx.fillStyle = "#8B6F47";
        ctx.fillText("Katılımınızı bekliyoruz", canvas.width / 2, canvas.height - 140);

        ctx.font = "20px Georgia";
        ctx.fillStyle = "#999";
        ctx.fillText(eventSettings.event_address, canvas.width / 2, canvas.height - 90);

        // Personal QR code placeholder
        ctx.strokeStyle = "#D4A574";
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 60, canvas.height - 60, 120, 40);
        ctx.font = "14px Georgia";
        ctx.fillStyle = "#8B6F47";
        ctx.fillText("Kişiye Özel Davetiye", canvas.width / 2, canvas.height - 33);
    };

    const downloadInvitation = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement("a");
        const safeName = fullName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
        link.download = `davetiye-${safeName}-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    return (
        <div className="inline-block">
            <Button onClick={downloadInvitation} size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Kişiye Özel Davetiye İndir
            </Button>
            <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
    );
};
