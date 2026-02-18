import { PageWrapper } from '../components/layout/PageWrapper';
import { SectionWrapper } from '../components/ui/SectionWrapper';
import { PageHeader } from '../components/ui/PageHeader';
import { FeatureCard } from '../components/ui/FeatureCard';
import { Building2, Search, Map } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FacilitiesList() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (location.state?.focusSearch && searchInputRef.current) {
            searchInputRef.current.focus();
            // Optional: Scroll to the input if needed
            searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [location.state]);

    const dummyHospitals = [
        { id: 'city-general', name: 'City General Hospital', location: 'Downtown', rating: 4.8 },
        { id: 'st-marys', name: 'St. Mary\'s Medical Center', location: 'Westside', rating: 4.5 },
        { id: 'valley-heart', name: 'Valley Heart Institute', location: 'East Valley', rating: 4.9 },
    ];

    return (
        <PageWrapper>
            <SectionWrapper bg="white" className="pt-32 pb-20">
                <PageHeader
                    badge="Facilities"
                    title="Network Hospitals"
                    subtitle="Explore our network of premium medical facilities equipped with 3D spatial intelligence."
                />

                <div className="relative mt-12 mb-16 max-w-2xl">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search facilities by name or location..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {dummyHospitals.map(h => (
                        <FeatureCard
                            key={h.id}
                            title={h.name}
                            desc={`${h.location} • ⭐ ${h.rating}`}
                            icon={<Building2 className="w-8 h-8" />}
                        >
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => navigate(`/facilities/${h.id}`)}
                                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => navigate(`/facilities/${h.id}/map`)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"
                                >
                                    <Map className="w-3.5 h-3.5" /> Navigate
                                </button>
                            </div>
                        </FeatureCard>
                    ))}
                </div>
            </SectionWrapper>
        </PageWrapper>
    );
}
