import { Skeleton } from '../ui/Skeleton';

export function ReviewsSkeleton() {
    return (
        <div className="space-y-8">
            {/* Rating Summary Skeleton */}
            <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                <div className="text-center space-y-2">
                    <Skeleton className="h-16 w-32 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                </div>

                <div className="flex-1 w-full space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-2 flex-1 rounded-full" />
                            <Skeleton className="h-4 w-8" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Review Cards Skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
