import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useEventSettings } from "@/hooks/useEventSettings";

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownProps {
    settings?: {
        countdown_title?: string;
        show_countdown?: boolean;
    };
}

export const Countdown = ({ settings: customSettings }: CountdownProps) => {
    const settings = useEventSettings();
    const targetDate = new Date(settings.event_date).getTime();

    const calculateTimeLeft = (): TimeLeft => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    const timeUnits = [
        { label: "Gün", value: timeLeft.days },
        { label: "Saat", value: timeLeft.hours },
        { label: "Dakika", value: timeLeft.minutes },
        { label: "Saniye", value: timeLeft.seconds },
    ];

    // Format date for display
    const eventDate = new Date(settings.event_date);
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

    return (
        <section
            className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30"
            aria-labelledby="countdown-title"
            id="countdown-section"
        >
            <div className="container max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 id="countdown-title" className="text-4xl md:text-5xl font-bold mb-4">
                        {customSettings?.countdown_title || "Etkinliğe"} <span className="text-primary">Kalan Süre</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        {formattedDate} - {formattedTime}
                    </p>
                </div>

                <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                    role="timer"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`Etkinliğe ${timeLeft.days} gün, ${timeLeft.hours} saat, ${timeLeft.minutes} dakika, ${timeLeft.seconds} saniye kaldı`}
                >
                    {timeUnits.map((unit) => (
                        <Card
                            key={unit.label}
                            className="p-6 text-center shadow-[var(--shadow-elegant)] hover:scale-105 transition-transform duration-300"
                        >
                            <div className="text-5xl md:text-6xl font-bold text-primary mb-2" aria-hidden="true">
                                {unit.value.toString().padStart(2, "0")}
                            </div>
                            <div className="text-lg text-muted-foreground font-semibold">
                                {unit.label}
                            </div>
                            <span className="sr-only">{unit.value} {unit.label}</span>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};
