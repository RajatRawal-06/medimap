import { PageWrapper } from '../components/layout/PageWrapper';
import { SectionWrapper } from '../components/ui/SectionWrapper';
import { PageHeader } from '../components/ui/PageHeader';
import { FeatureCard } from '../components/ui/FeatureCard';
import { Users, Search, Heart, Star, ChevronRight, Hospital as HospitalIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockDoctors } from '../data/doctors';

export default function PractitionersList() {
    const navigate = useNavigate();

    return (
        <PageWrapper>
            <SectionWrapper bg="white" className="pt-32 pb-20">
                <PageHeader
                    badge="Practitioners"
                    title="Expert Medical Staff"
                    subtitle="Connect with top-tier clinicians across our integrated health network."
                />

                <div className="relative mt-12 mb-16 max-w-2xl">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search doctors by name or specialty..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockDoctors.map(d => (
                        <FeatureCard
                            key={d.id}
                            title={`Dr. ${d.name}`}
                            desc={`${d.specialization}`}
                            icon={
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                                    {d.image_url ? (
                                        <img src={d.image_url} alt={d.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            }
                            className="group hover:border-indigo-500/50 transition-all"
                        >
                            <div className="mt-2 mb-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <HospitalIcon className="w-3 h-3" />
                                    <span>{d.hospitals?.name || 'Affiliated Hospital'}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                        <span className="text-xs font-black">{d.rating}</span>
                                        <span className="text-[10px] text-slate-400">({d.ratings_count})</span>
                                    </div>
                                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        {d.experience_years}+ Years Exp.
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {d.bio}
                                </p>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => navigate(`/practitioners/${d.slug || d.id}`)}
                                    className="flex-1 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    View Profile
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                                <button
                                    className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                                >
                                    <Heart className="w-4 h-4" />
                                </button>
                            </div>
                        </FeatureCard>
                    ))}
                </div>
            </SectionWrapper>
        </PageWrapper>
    );
}
