import { useState, useEffect } from "react";

interface EventSettings {
    event_title: string;
    event_subtitle: string;
    event_tagline: string;
    event_date: string;
    event_location: string;
    event_location_detail: string;
    event_address: string;
}

const defaultSettings: EventSettings = {
    event_title: "Hemşirelikte İnovatif Yaklaşımlar",
    event_subtitle: "HEMŞIRELIKTE İNOVATIF YAKLAŞIMLAR",
    event_tagline: "Rutinleri Kırmaya Cesaretin Var mı?",
    event_date: "2025-11-19T09:00:00",
    event_location: "S.B.Ü Mehmet Akif İnan E.A.H",
    event_location_detail: "Ana Bina Konferans Salonu",
    event_address: "Şanlıurfa",
};

export const useEventSettings = () => {
    const [settings, setSettings] = useState<EventSettings>(defaultSettings);

    useEffect(() => {
        // Load settings from localStorage
        const loadSettings = () => {
            const stored = localStorage.getItem("event_settings");
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setSettings(parsed);
                } catch (error) {
                    console.error("Error parsing event settings:", error);
                }
            }
        };

        loadSettings();

        // Listen for storage changes (when admin updates settings)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "event_settings" && e.newValue) {
                try {
                    const parsed = JSON.parse(e.newValue);
                    setSettings(parsed);
                } catch (error) {
                    console.error("Error parsing event settings:", error);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        // Also listen for custom event for same-tab updates
        const handleCustomEvent = (e: CustomEvent) => {
            setSettings(e.detail);
        };

        window.addEventListener("event_settings_updated" as any, handleCustomEvent as any);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("event_settings_updated" as any, handleCustomEvent as any);
        };
    }, []);

    return settings;
};
