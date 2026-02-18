import { Skeleton } from '../ui/Skeleton';

export function HospitalDetailSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Hero Skeleton */}
            <div className="relative h-[40vh] min-h-[400px] bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 container mx-auto px-4 h-full flex flex-col justify-end pb-12">
                    <Skeleton className="h-8 w-24 mb-4 bg-white/10" />
                    <Skeleton className="h-12 w-3/4 mb-4 bg-white/10" />
                    <div className="flex gap-4">
                        <Skeleton className="h-6 w-32 bg-white/10" />
                        <Skeleton className="h-6 w-32 bg-white/10" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-10 grid gap-6 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 bg-slate-800/50 backdrop-blur-md rounded-2xl" />
                ))}
            </div>

            <div className="container mx-auto px-4 py-8 grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    {/* About Section */}
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Skeleton key={i} className="h-24 rounded-xl" />
                        ))}
                    </div>

                    {/* Reviews Skeleton */}
                    <div className="space-y-6 pt-8">
                        <Skeleton className="h-10 w-48" />
                        <div className="grid gap-4 md:grid-cols-2">
                            <Skeleton className="h-40 rounded-2xl" />
                            <Skeleton className="h-40 rounded-2xl" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-48 rounded-2xl" />
                </div>
            </div>
        </div>
    );
}
