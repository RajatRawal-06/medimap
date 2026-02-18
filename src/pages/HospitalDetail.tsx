import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Star,
    Shield,
    Clock,
    Users,
    Activity,
    CheckCircle2,
    Map,
    Calendar,
    Phone,
    Navigation,
    Accessibility,
    Building2,
    Stethoscope,
    Car,
    Pill
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { mockHospitals, getMockHospitalBySlug, type HospitalExtended } from '../data/hospitals';
import { PageWrapper } from '../components/layout/PageWrapper';
import { HospitalReviews } from '../components/hospital/HospitalReviews';
import { HospitalDetailSkeleton } from '../components/hospital/HospitalDetailSkeleton';

export default function HospitalDetail() {
    const { id } = useParams<{ id: string }>(); // 'id' here is the slug from URL
    const navigate = useNavigate();

    // State
    const [hospital, setHospital] = useState<HospitalExtended | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHospitalData() {
            if (!id) return;
            setLoading(true);

            try {
                // 1. Try Supabase by slug
                const { data: hospitalData } = await supabase
                    .from('hospitals')
                    .select('*')
                    .eq('slug', id)
                    .single();

                let resolvedHospital: HospitalExtended | null = null;

                if (hospitalData) {
                    // Found in DB. Merge with mock data to ensure we have rich UI elements
                    const mockBase = getMockHospitalBySlug(hospitalData.slug) || mockHospitals[0];
                    resolvedHospital = {
                        ...mockBase,
                        ...hospitalData,
                        // Ensure DB data wins for critical fields
                        id: hospitalData.id,
                        slug: hospitalData.slug,
                        name: hospitalData.name,
                    };
                } else {
                    // 2. Not found in DB? Check pure mock data by slug.
                    // This handles cases where we are just navigating using mock slugs (city-general, etc.)
                    resolvedHospital = getMockHospitalBySlug(id);
                }

                // 3. Absolute Fallback (if slug is totally unknown, show a default mock so page doesn't break)
                if (!resolvedHospital) {
                    console.warn(`Hospital slug '${id}' not found in DB or Mocks. Using default fallback.`);
                    resolvedHospital = mockHospitals[0];
                }

                setHospital(resolvedHospital);

            } catch (err) {
                console.error("Error fetching hospital:", err);
                // Fallback on error to default mock
                setHospital(mockHospitals[0]);
            } finally {
                setLoading(false);
            }
        }

        fetchHospitalData();
    }, [id]);

    if (loading) {
        return <HospitalDetailSkeleton />;
    }

    if (!hospital) return null; // Should not happen due to fallback

    return (
        <PageWrapper className="min-h-screen bg-slate-950 text-white relative isolate overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[100px] -z-10" />

            {/* HERO SECTION */}
            <div className="relative h-[50vh] min-h-[500px] w-full">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0">
                    <img
                        src={hospital.image_url || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000'}
                        alt={hospital.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/30" />
                </div>

                <div className="absolute inset-0 flex flex-col justify-end pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3">
                            {hospital.is_emergency_available && (
                                <div className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Emergency Ready</span>
                                </div>
                            )}
                            <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2">
                                <Shield className="w-3 h-3 text-indigo-400" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">JCI Accredited</span>
                            </div>
                        </div>

                        {/* Title & Rating */}
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 shadow-black drop-shadow-lg">
                                {hospital.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-slate-300">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-indigo-400" />
                                    <span className="font-medium text-lg">{hospital.address || 'Central Metropolis'}</span>
                                </div>
                                <div className="w-1.5 h-1.5 bg-white/20 rounded-full hidden md:block" />
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    <span className="font-black text-white text-lg">{hospital.rating}</span>
                                    <span className="text-slate-400 font-medium">({hospital.reviews_count} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 pt-4">
                            <button
                                onClick={() => navigate(`/facilities/${hospital.id}/map`)}
                                className="px-8 py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center gap-3"
                            >
                                <Navigation className="w-5 h-5" />
                                Navigate Hospital
                            </button>
                            <button className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all hover:scale-105 flex items-center gap-3">
                                <Calendar className="w-5 h-5" />
                                Book Appointment
                            </button>
                            <button className="px-6 py-4 bg-indigo-600/20 backdrop-blur-xl border border-indigo-500/30 text-indigo-300 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600/30 transition-all flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                View Queue
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT COLUMN (2/3) */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Stats Grid */}
                        <section>
                            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-indigo-400" />
                                Facility Insights
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl group hover:border-indigo-500/30 transition-colors">
                                    <div className="mb-4 bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                        <Stethoscope className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-black text-white mb-1">{hospital.stats?.total_doctors}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Doctors</div>
                                </div>
                                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl group hover:border-indigo-500/30 transition-colors">
                                    <div className="mb-4 bg-pink-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-black text-white mb-1">{hospital.stats?.total_departments}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Departments</div>
                                </div>
                                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl group hover:border-indigo-500/30 transition-colors">
                                    <div className="mb-4 bg-emerald-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-black text-white mb-1">{hospital.stats?.beds_available}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Beds Open</div>
                                </div>
                                <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl group hover:border-indigo-500/30 transition-colors">
                                    <div className="mb-4 bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="text-3xl font-black text-white mb-1">{hospital.stats?.crowd_status}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Crowd Level</div>
                                </div>
                            </div>
                        </section>

                        {/* Accessibility Features */}
                        <section>
                            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <Accessibility className="w-6 h-6 text-emerald-400" />
                                Accessibility & Amenities
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {hospital.features?.map((feature, idx) => {
                                    const iconMap: Record<string, React.ReactNode> = {
                                        'Wheelchair': <Accessibility className="w-5 h-5" />,
                                        'Elevator': <Activity className="w-5 h-5" />,
                                        'Braille': <Users className="w-5 h-5" />,
                                        'Emergency': <Shield className="w-5 h-5" />,
                                        'Parking': <Car className="w-5 h-5" />,
                                        'Pharmacy': <Pill className="w-5 h-5" />
                                    };
                                    const icon = Object.entries(iconMap).find(([key]) => feature.includes(key))?.[1] || <CheckCircle2 className="w-5 h-5" />;

                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 text-slate-300">
                                            <div className="text-emerald-400">{icon}</div>
                                            <span className="text-xs font-bold">{feature}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Reviews */}
                        <HospitalReviews
                            reviews={hospital.reviews || []}
                            rating={hospital.rating || 0}
                            reviewsCount={hospital.reviews_count || 0}
                            loading={false}
                        />
                    </div>

                    {/* RIGHT COLUMN (1/3) - Sticky Actions/Map Preview */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Emergency Card */}
                        <div className="p-8 bg-rose-600 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-rose-900/50 group hover:scale-[1.02] transition-transform">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            <Shield className="w-10 h-10 text-white mb-6" />
                            <h3 className="text-2xl font-black text-white mb-2">Emergency?</h3>
                            <p className="text-rose-100 font-medium mb-8">Direct line to ER triage desk. 24/7 Response.</p>
                            <a href={`tel:${hospital.emergency_phone}`} className="flex items-center justify-center gap-3 w-full py-4 bg-white text-rose-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-rose-50 transition-colors">
                                <Phone className="w-4 h-4" />
                                Call Emergency
                            </a>
                        </div>

                        {/* Opening Hours */}
                        <div className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem]">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500" />
                                Visiting Hours
                            </h4>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Mon - Fri</span>
                                    <span className="text-white font-bold">08:00 AM - 08:00 PM</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Sat - Sun</span>
                                    <span className="text-white font-bold">10:00 AM - 06:00 PM</span>
                                </div>
                                <div className="h-px bg-white/5 my-4" />
                                <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-3 rounded-xl">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-wide">Open Now</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Nav Preview */}
                        <div className="relative aspect-video bg-slate-800 rounded-3xl overflow-hidden border border-white/5 group cursor-pointer" onClick={() => navigate(`/facilities/${hospital.id}/map`)}>
                            {/* Placeholder Map Image */}
                            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                                <Map className="w-12 h-12 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-500 transition-colors">
                                    Load Interactive Map
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </PageWrapper>
    );
}
