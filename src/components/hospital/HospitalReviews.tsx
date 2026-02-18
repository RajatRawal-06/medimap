import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, CheckCircle2, MoreHorizontal } from 'lucide-react';
import type { Review } from '../../types';
import { ReviewsSkeleton } from './ReviewsSkeleton';

interface HospitalReviewsProps {
    reviews: Review[];
    rating: number;
    reviewsCount: number;
    loading?: boolean;
}

export function HospitalReviews({ reviews, rating, reviewsCount, loading }: HospitalReviewsProps) {
    // Calculate distribution — must be before any early returns (rules of hooks)
    const distribution = useMemo(() => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        if (!reviews.length) return dist;

        reviews.forEach(r => {
            const rounded = Math.round(r.rating) as keyof typeof dist;
            if (dist[rounded] !== undefined) dist[rounded]++;
        });
        return dist;
    }, [reviews]);

    if (loading) {
        return <ReviewsSkeleton />;
    }

    const totalReviews = reviews.length || 1; // Avoid div by zero

    return (
        <section className="py-12 border-t border-white/5">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
                <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                Patient Reviews
                <span className="text-sm font-medium text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                    {reviewsCount} Verified
                </span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* LEFT: Summary & Distribution */}
                <div className="space-y-8">
                    {/* Big Rating */}
                    <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 text-center relative overflow-hidden group hover:border-indigo-500/20 transition-colors">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />

                        <div className="text-6xl font-black text-white mb-2">{rating.toFixed(1)}</div>
                        <div className="flex justify-center gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                                />
                            ))}
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Based on {reviewsCount} patient ratings</p>
                    </div>

                    {/* Distribution Bars */}
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((stars) => {
                            const count = distribution[stars as keyof typeof distribution];
                            const percentage = (count / totalReviews) * 100;

                            return (
                                <div key={stars} className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1 w-12 shrink-0 text-slate-400 font-bold">
                                        {stars} <Star className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${percentage}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${stars >= 4 ? 'bg-emerald-500' :
                                                stars === 3 ? 'bg-amber-500' : 'bg-rose-500'
                                                }`}
                                        />
                                    </div>
                                    <div className="w-8 shrink-0 text-right text-slate-500 font-mono text-xs">
                                        {Math.round(percentage)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Review Cards */}
                <div className="lg:col-span-2 space-y-6">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl hover:bg-slate-900/60 transition-colors group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 font-black text-lg">
                                        {review.user_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {review.user_name || 'Anonymous Patient'}
                                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] uppercase tracking-widest rounded-full flex items-center gap-1 border border-emerald-500/20">
                                                <CheckCircle2 className="w-3 h-3" /> Verified
                                            </span>
                                        </h4>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                                            <span>{new Date(review.created_at || '2024-01-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                            <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                            <span>Outpatient Visit</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-slate-600 hover:text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                ))}
                            </div>

                            <p className="text-slate-300 leading-relaxed font-medium pl-1 border-l-2 border-white/5">
                                "{review.comment}"
                            </p>

                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors">
                                    <ThumbsUp className="w-3 h-3" /> Helpful
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    <button className="w-full py-4 border border-white/10 rounded-2xl text-sm font-black text-slate-400 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors">
                        Load More Reviews
                    </button>
                </div>
            </div>
        </section>
    );
}
