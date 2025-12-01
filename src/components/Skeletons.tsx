import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function EventCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="grid md:grid-cols-[300px_1fr] gap-0">
                <Skeleton className="h-64 md:h-auto" />
                <div className="p-6 flex flex-col justify-between">
                    <div>
                        <Skeleton className="h-8 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-1/2 mb-6" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full mt-6" />
                </div>
            </div>
        </Card>
    );
}

export function EventListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-6">
            {Array.from({ length: count }).map((_, i) => (
                <EventCardSkeleton key={i} />
            ))}
        </div>
    );
}

export function RegistrationTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Skeleton className="h-10 flex-1 max-w-md" />
                <Skeleton className="h-10 w-40" />
            </div>
            <Card className="p-0 overflow-hidden">
                <div className="border-b p-4 flex gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-4 flex-1" />
                    ))}
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border-b p-4 flex gap-4">
                        {[1, 2, 3, 4, 5, 6].map((j) => (
                            <Skeleton key={j} className="h-4 flex-1" />
                        ))}
                    </div>
                ))}
            </Card>
        </div>
    );
}

export function StatsCardSkeleton() {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </div>
        </Card>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
            </div>
            <RegistrationTableSkeleton />
        </div>
    );
}

export function EventHeroSkeleton() {
    return (
        <section className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-background to-secondary/30">
            <div className="container max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <Skeleton className="h-[500px] rounded-2xl" />
                    <div className="space-y-6">
                        <Skeleton className="h-8 w-48 rounded-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Card className="p-8">
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-6 w-56" />
                            </div>
                        </Card>
                        <Skeleton className="h-12 w-40" />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function FormSkeleton() {
    return (
        <Card className="p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6 space-y-2">
                <Skeleton className="h-8 w-48 mx-auto" />
                <Skeleton className="h-4 w-64 mx-auto" />
            </div>
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ))}
                <Skeleton className="h-12 w-full mt-4" />
            </div>
        </Card>
    );
}

export function PageSectionSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="p-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-6 h-6" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="w-12 h-6 rounded-full" />
                        <Skeleton className="w-24 h-8" />
                    </div>
                </Card>
            ))}
        </div>
    );
}
