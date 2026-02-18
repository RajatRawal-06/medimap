import { Skeleton } from '../ui/Skeleton';

export function MapPageSkeleton() {
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950">
            {/* Header Skeleton */}
            <div className="h-16 border-b border-white/10 px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full bg-white/5" />
                    <div className="space-y-2">
                        <Skeleton className="w-32 h-4 bg-white/5" />
                        <Skeleton className="w-24 h-3 bg-white/5" />
                    </div>
                </div>
                <Skeleton className="w-24 h-10 rounded-lg bg-white/5" />
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Skeleton */}
                <div className="w-80 border-r border-white/10 p-4 space-y-4 hidden lg:block">
                    <Skeleton className="w-full h-12 rounded-xl bg-white/5" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="w-full h-16 rounded-xl bg-white/5" />
                        ))}
                    </div>
                </div>

                {/* Map Area Skeleton */}
                <div className="flex-1 p-4 relative">
                    <Skeleton className="w-full h-full rounded-3xl bg-white/5" />

                    {/* Floating Controls Skeleton */}
                    <div className="absolute bottom-8 right-8 space-y-4">
                        <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
                        <Skeleton className="w-12 h-12 rounded-full bg-white/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
