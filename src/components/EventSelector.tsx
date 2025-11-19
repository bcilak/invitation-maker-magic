import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

interface Event {
    id: string;
    title: string;
    slug: string;
    status: string;
    event_date: string;
}

interface EventSelectorProps {
    events: Event[];
    selectedEventId: string | null;
    onEventChange: (eventId: string) => void;
}

export function EventSelector({ events, selectedEventId, onEventChange }: EventSelectorProps) {
    const activeEvents = events.filter(e => e.status === 'published' || e.status === 'draft');

    return (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Etkinlik Seçin
                </label>
                <Select value={selectedEventId || undefined} onValueChange={onEventChange}>
                    <SelectTrigger className="w-full max-w-md bg-white">
                        <SelectValue placeholder="Bir etkinlik seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                        {activeEvents.map((event) => (
                            <SelectItem key={event.id} value={event.id}>
                                <div className="flex items-center gap-2">
                                    <span>{event.title}</span>
                                    <span className="text-xs text-gray-500">
                                        ({new Date(event.event_date).toLocaleDateString('tr-TR')})
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
