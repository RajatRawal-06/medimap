import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import type { Appointment } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    ChevronRight,
    CalendarPlus,
    History,
    Building2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';

export default function MyAppointments() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    useEffect(() => {
        async function fetchAppointments() {
            if (!user) return;

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('appointments')
                    .select('*, doctors(*, hospitals(*))')
                    .eq('user_id', user.id)
                    .order('appointment_date', { ascending: true });

                if (error) throw error;
                setAppointments(data || []);
            } catch (err) {
                console.error('Error fetching appointments:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchAppointments();
    }, [user]);

    const { upcoming, past } = useMemo(() => {
        const now = new Date();
        const upcoming: Appointment[] = [];
        const past: Appointment[] = [];

        appointments.forEach(apt => {
            // Create a date object from the appointment date and time
            // Assuming appointment_time is in "HH:MM:SS" or "HH:MM AM/PM" format
            const timeString = apt.appointment_time;
            const dateString = apt.appointment_date;

            // robust parsing for time (handling AM/PM or 24h)
            // robust parsing for time (handling AM/PM or 24h)
            const aptDate = new Date(dateString + ' ' + timeString);

            // Fallback if parsing fails (invalid date/time formats in DB)
            const isInvalid = isNaN(aptDate.getTime());

            // If invalid, default to simple date check
            if (isInvalid) {
                const simpleDate = new Date(dateString);
                if (simpleDate >= new Date(now.toDateString())) {
                    upcoming.push(apt);
                } else {
                    past.push(apt);
                }
                return;
            }

            if (aptDate >= now) {
                upcoming.push(apt);
            } else {
                past.push(apt);
            }
        });

        // Sort: Upcoming (nearest first), Past (most recent first)
        upcoming.sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
        past.sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());

        return { upcoming, past };
    }, [appointments]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    const displayedAppointments = activeTab === 'upcoming' ? upcoming : past;

    return (
        <PageWrapper>
            <div className="min-h-screen bg-slate-950 text-white relative isolate overflow-hidden font-sans">
                {/* Background Accents */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

                <div className="max-w-5xl mx-auto px-6 py-24">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4"
                            >
                                <User className="w-3 h-3" />
                                Patient Portal
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl font-black tracking-tight"
                            >
                                My Appointments
                            </motion.h1>
                        </div>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/facilities')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 transition-all"
                        >
                            <CalendarPlus className="w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">Book New</span>
                        </motion.button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mb-8 border-b border-white/10 pb-1">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`pb-3 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'upcoming' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Upcoming
                            <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{upcoming.length}</span>
                            {activeTab === 'upcoming' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`pb-3 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'past' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            History
                            <span className="ml-2 bg-white/10 px-2 py-0.5 rounded-full text-[10px]">{past.length}</span>
                            {activeTab === 'past' && (
                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {displayedAppointments.length === 0 ? (
                            <motion.div
                                key={`${activeTab}-empty`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white/5 border border-white/5 rounded-[2.5rem] p-12 text-center"
                            >
                                <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    {activeTab === 'upcoming' ? (
                                        <Calendar className="w-10 h-10 text-slate-500" />
                                    ) : (
                                        <History className="w-10 h-10 text-slate-500" />
                                    )}
                                </div>
                                <h3 className="text-xl font-bold mb-2">
                                    {activeTab === 'upcoming' ? 'No Upcoming Visits' : 'No Visit History'}
                                </h3>
                                <p className="text-slate-400 max-w-sm mx-auto mb-8">
                                    {activeTab === 'upcoming'
                                        ? "Your health journey starts here. Find a specialist or clinic nearby."
                                        : "You haven't completed any appointments yet."}
                                </p>
                                {activeTab === 'upcoming' && (
                                    <Link to="/facilities" className="inline-flex items-center gap-2 text-indigo-400 font-black text-xs uppercase tracking-widest hover:text-indigo-300 transition-colors">
                                        Find a Doctor <ChevronRight className="w-4 h-4" />
                                    </Link>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`${activeTab}-list`}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="space-y-4"
                            >
                                {displayedAppointments.map((apt) => (
                                    <motion.div
                                        key={apt.id}
                                        variants={itemVariants}
                                        className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="w-6 h-6 text-indigo-400" />
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 md:items-center">
                                            {/* Date Box */}
                                            <div className="flex-shrink-0 w-20 h-20 bg-slate-900 rounded-2xl flex flex-col items-center justify-center border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                    {new Date(apt.appointment_date).toLocaleString('default', { month: 'short' })}
                                                </span>
                                                <span className="text-2xl font-black text-white">
                                                    {new Date(apt.appointment_date).getDate()}
                                                </span>
                                                <span className="text-slate-500 text-[10px] font-bold">
                                                    {new Date(apt.appointment_date).getFullYear()}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-grow space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                                            Dr. {apt.doctors?.name || 'Unknown Specialist'}
                                                        </h3>
                                                        <p className="text-slate-400 text-sm font-medium">
                                                            {apt.doctors?.specialization || 'General Practice'}
                                                        </p>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${apt.status === 'booked'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : apt.status === 'completed'
                                                            ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                        {apt.status}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 text-indigo-500" />
                                                        {apt.appointment_time}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="w-4 h-4 text-indigo-500" />
                                                        {apt.doctors?.hospitals?.name || 'Main Hospital'}
                                                    </div>
                                                    {(apt.doctors?.hospitals?.address) && (
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                                            {apt.doctors.hospitals.address}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageWrapper>
    );
}
