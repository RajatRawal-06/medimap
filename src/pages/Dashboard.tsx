import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    Calendar,
    Activity,
    TrendingUp,
    Clock,
    AlertTriangle,
    LayoutDashboard,
    ShieldCheck,
    Bell
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SectionWrapper } from '../components/ui/SectionWrapper';
import { StatCard } from '../components/ui/StatCard';
import { supabase } from '../lib/supabase';
import AdminAnalytics from '../components/admin/AdminAnalytics';
import QueueLoadHeatmap from '../components/admin/QueueLoadHeatmap';
import FacilityControls from '../components/admin/FacilityControls';
import { Skeleton } from '../components/ui/Skeleton';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        hospitals: 0,
        doctors: 0,
        activeUsers: 1240, // Simulated
        appointmentsToday: 0,
        avgWaitTime: 14, // Sims
        emergencyRequests: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            const [
                { count: hospCount },
                { count: docCount },
                { count: apptCount },
                { count: emergencyCount }
            ] = await Promise.all([
                supabase.from('hospitals').select('*', { count: 'exact', head: true }),
                supabase.from('doctors').select('*', { count: 'exact', head: true }),
                supabase.from('appointments').select('*', { count: 'exact', head: true })
                    .eq('appointment_date', new Date().toISOString().split('T')[0]),
                supabase.from('emergency_logs').select('*', { count: 'exact', head: true })
            ]);

            setStats(prev => ({
                ...prev,
                hospitals: hospCount || 0,
                doctors: docCount || 0,
                appointmentsToday: apptCount || 0,
                emergencyRequests: emergencyCount || 0
            }));
            setLoading(false);
        };

        fetchStats();
    }, []);

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
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <PageWrapper>
            <div className="min-h-screen bg-slate-950">
                <SectionWrapper className="pt-32 pb-20 max-w-[1400px] mx-auto px-6">
                    {/* Enterprise Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                                </div>
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Command Center v2.0</span>
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter">
                                Clinical <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Intelligence</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Admin Secured</span>
                            </div>
                            <button className="relative p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                                <Bell className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
                    >
                        {[
                            { label: "Total Hospitals", value: stats.hospitals, icon: <Building2 />, trend: "+0" },
                            { label: "Total Doctors", value: stats.doctors, icon: <Users />, trend: "+4" },
                            { label: "Active Users", value: stats.activeUsers.toLocaleString(), icon: <Activity />, trend: "+12%" },
                            { label: "Appointments", value: stats.appointmentsToday, icon: <Calendar />, trend: "-2" },
                            { label: "Avg Wait (Min)", value: stats.avgWaitTime, icon: <Clock />, trend: "-4%" },
                            { label: "Emergencies", value: stats.emergencyRequests, icon: <AlertTriangle />, trend: "HIGH" }
                        ].map((stat, i) => (
                            <motion.div key={i} variants={itemVariants}>
                                {loading ? (
                                    <Skeleton className="h-[140px] w-full" />
                                ) : (
                                    <StatCard
                                        label={stat.label}
                                        value={stat.value.toString()}
                                        icon={stat.icon}
                                        trend={stat.trend}
                                    />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Analytics Section */}
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-white uppercase tracking-widest">Growth & Trends</h2>
                            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" />
                                Updated Live
                            </div>
                        </div>
                        <AdminAnalytics />
                    </div>

                    {/* Heatmap & Resource Management */}
                    <div className="grid grid-cols-1 gap-8 mt-12">
                        <QueueLoadHeatmap />

                        <div className="mt-8">
                            <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6">Facility Records</h2>
                            <FacilityControls />
                        </div>
                    </div>
                </SectionWrapper>
            </div>
        </PageWrapper>
    );
}
