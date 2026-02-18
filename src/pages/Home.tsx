import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Clock,
    Users,
    ShieldCheck,
    Globe,
    Layers,
    Activity,
    BrainCircuit,
    Zap,
    Building2,
    HeartPulse,
    ChevronRight,
    ArrowRight,
    Map
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { motion } from 'framer-motion';
import { useNavigationStore } from '../store/useNavigationStore';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';

// UI Components
import { SectionWrapper } from '../components/ui/SectionWrapper';
import { StatCard } from '../components/ui/StatCard';
import { FeatureCard } from '../components/ui/FeatureCard';
import { PageHeader } from '../components/ui/PageHeader';

const BackgroundParticles = () => {
    const particles = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        size: 160 + (i * 20) % 100,
        x1: `${(i * 17) % 100}%`,
        x2: `${(i * 31) % 100}%`,
        y1: `${(i * 23) % 100}%`,
        y2: `${(i * 41) % 100}%`,
        duration: 20 + (i * 2) % 10
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-indigo-500/5 rounded-full blur-3xl"
                    animate={{
                        x: [p.x1, p.x2],
                        y: [p.y1, p.y2],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "linear"
                    }}
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.x1,
                        top: p.y1,
                    }}
                />
            ))}
        </div>
    );
};

export default function Home() {
    const { crowdMetrics } = useNavigationStore();
    const { t } = useTranslation();
    const [stats, setStats] = useState({ hospitals: 0, activePractitioners: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            const { count: hCount } = await supabase.from('hospitals').select('*', { count: 'exact', head: true });
            const { count: dCount } = await supabase.from('doctors').select('*', { count: 'exact', head: true });
            setStats({ hospitals: hCount || 0, activePractitioners: dCount || 0 });
        };
        fetchStats();
    }, []);

    const totalInQueues = Object.values(crowdMetrics).reduce((acc: number, curr) => acc + (curr.queue_count || 0), 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const handleFindFacility = () => {
        navigate('/facilities', { state: { focusSearch: true } });
    };

    return (
        <PageWrapper>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">

                {/* 1. HERO SECTION */}
                <SectionWrapper bg="white" className="pt-32 pb-40 relative overflow-hidden">
                    <BackgroundParticles />
                    <div className="absolute inset-0 bg-indigo-600/[0.02] -skew-y-6 origin-top-left" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-indigo-100 dark:border-indigo-500/20">
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                v2.0 Live - Smart Routing Active
                            </motion.div>
                            <motion.h1 variants={itemVariants} className="text-6xl lg:text-8xl font-black text-slate-950 dark:text-white leading-[1] mb-8 tracking-tighter">
                                {t('heroTitle').split(' ').map((word: string, i: number) =>
                                    word === 'Health' || word === 'स्वास्थ्य' || word === 'Salud'
                                        ? <span key={i} className="text-indigo-600">{word} </span>
                                        : word + ' '
                                )}
                            </motion.h1>
                            <motion.p variants={itemVariants} className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed max-w-xl font-medium">
                                {t('heroSubtitle')}
                            </motion.p>
                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5">
                                <button
                                    onClick={handleFindFacility}
                                    className="h-16 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 text-lg"
                                >
                                    <span className="icon-label">{t('findFacility')}</span>
                                    <ArrowRight className="w-6 h-6" />
                                </button>
                                <button className="h-16 px-10 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex items-center justify-center gap-3 text-lg">
                                    <span className="icon-label">{t('systemOverview')}</span>
                                    <Map className="w-6 h-6" />
                                </button>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="relative"
                        >
                            <div className="absolute -inset-10 bg-indigo-500/10 blur-[100px] rounded-full" />
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden">
                                <div className="flex justify-between items-center mb-10">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-600 p-2.5 rounded-xl text-white">
                                            <Activity className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white leading-none">Live Network</h3>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time Telemetry</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase border border-emerald-100 dark:border-emerald-500/20">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        Operational
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-10">
                                    <StatCard label="Hospitals" value={stats.hospitals} icon={<Building2 className="w-5 h-5" />} />
                                    <StatCard label="Specialists" value={stats.activePractitioners} icon={<Users className="w-5 h-5" />} />
                                    <StatCard label="Queue Load" value={totalInQueues} icon={<Clock className="w-5 h-5" />} trend="Managed" />
                                    <StatCard label="Security" value="HIPAA" icon={<ShieldCheck className="w-5 h-5" />} />
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 flex items-center justify-between group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-100 dark:hover:border-indigo-500/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <HeartPulse className="w-6 h-6 text-rose-500 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nearest Emergency</p>
                                            <p className="text-base font-bold text-slate-900 dark:text-white">City General Trauma Center</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-slate-300 dark:text-slate-600 group-hover:text-indigo-400" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </SectionWrapper>

                {/* 2. FEATURES GRID */}
                <SectionWrapper bg="none" className="border-y border-slate-100 dark:border-slate-800">
                    <PageHeader
                        badge={t('coreTech')}
                        title={t('resilienceTitle')}
                        subtitle={t('resilienceSubtitle')}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                    >
                        <FeatureCard
                            title={t('feature3DTitle')}
                            desc={t('feature3DDesc')}
                            icon={<Layers className="w-10 h-10" />}
                        >
                            <Link to="/facilities" className="mt-8 flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all group/btn">
                                <span className="icon-label">{t('exploreMaps')}</span> <ArrowRight className="w-4 h-4 transition-transform" />
                            </Link>
                        </FeatureCard>
                        <FeatureCard
                            title={t('featureAITitle')}
                            desc={t('featureAIDesc')}
                            icon={<BrainCircuit className="w-10 h-10" />}
                        />
                        <FeatureCard
                            title={t('featureAccessTitle')}
                            desc={t('featureAccessDesc')}
                            icon={<Globe className="w-10 h-10" />}
                        />
                    </motion.div>
                </SectionWrapper>

                {/* 3. CTA SECTION */}
                <SectionWrapper bg="slate">
                    <div className="max-w-5xl mx-auto text-center bg-indigo-600 rounded-[3rem] py-20 px-10 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/20 rounded-full -ml-32 -mb-32 blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tight">Ready to Modernize Your Facility?</h2>
                            <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium">
                                Join over 50+ government and private healthcare providers using MediMap to enhance patient experience.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-5">
                                <button className="h-14 px-8 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-lg">
                                    Partner with Us
                                </button>
                                <button className="h-14 px-8 bg-indigo-500 text-white font-bold rounded-xl border border-indigo-400 hover:bg-indigo-400 transition-colors text-lg">
                                    Download Whitepaper
                                </button>
                            </div>
                        </div>
                    </div>
                </SectionWrapper>
            </div>
        </PageWrapper>
    );
}
