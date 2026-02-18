import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star,
    Calendar,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    User,
    Hospital as HospitalIcon,
    Award,
    Users,
    CalendarPlus,
    X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Doctor } from '../types';
import { useAuthStore } from '../store/useAuthStore';

interface Slot {
    time: string;
    available: boolean;
    capacity: number;
    booked: number;
}

export default function DoctorDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, userRole } = useAuthStore();

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Booking State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Mock Slots Logic (Deterministic simulation to satisfy lint and stability)
    const availableSlots: Slot[] = useMemo(() => {
        const slots = [
            '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
        ];

        // Simple deterministic pseudo-random based on date string to ensure purity
        const dateStr = selectedDate.toISOString().split('T')[0];
        const seed = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const getPseudoRandom = (i: number) => {
            const x = Math.sin(seed + i) * 10000;
            return x - Math.floor(x);
        };

        return slots.map((time, i) => ({
            time,
            available: getPseudoRandom(i) > 0.3,
            capacity: 5,
            booked: Math.floor(getPseudoRandom(i + 10) * 5)
        }));
    }, [selectedDate]);

    useEffect(() => {
        async function fetchDoctor() {
            if (!id) return;
            try {
                setLoading(true);

                // 1. Try fetching from Supabase by slug enabled
                // Note: We need to check if 'slug' column exists or if we should use ID.
                // For now, we'll try to match 'slug' OR 'id' if possible, but Supabase doesn't support OR across different fields easily without .or() syntax.
                // We will assume 'id' in URL is actually a slug now.

                let doctorData: Doctor | null = null;

                const { data } = await supabase
                    .from('doctors')
                    .select('*, hospitals(*)')
                    .eq('slug', id)
                    .single();

                if (data) {
                    doctorData = data;
                } else {
                    // Fallback: Check if it's a UUID (legacy support)
                    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
                    if (isUuid) {
                        const { data: uuidData } = await supabase
                            .from('doctors')
                            .select('*, hospitals(*)')
                            .eq('id', id)
                            .single();
                        if (uuidData) doctorData = uuidData;
                    }
                }

                // Fallback to MOCK data if not found in DB (for demo purposes)
                if (!doctorData) {
                    // Lazy load mock data to avoid bundle bloat if possible, but for now direct import is fine
                    const { mockDoctors } = await import('../data/doctors');
                    const mock = mockDoctors.find(d => d.slug === id || d.id === id);
                    if (mock) doctorData = mock;
                }

                if (!doctorData) throw new Error('Doctor not found');

                // Add defaults for new fields if not fetched
                setDoctor({
                    ...doctorData,
                    rating: doctorData.rating || 4.8,
                    ratings_count: doctorData.ratings_count || 124,
                    live_queue: doctorData.live_queue || 3,
                    bio: doctorData.bio || `Dr. ${doctorData.name} is a dedicated specialist committed to providing top-tier medical care.`
                });
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchDoctor();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!doctor || !selectedSlot) return;

        try {
            setBookingLoading(true);
            const { error } = await supabase
                .from('appointments')
                .insert([
                    {
                        doctor_id: doctor.id,
                        user_id: user.id,
                        hospital_id: doctor.hospital_id,
                        appointment_date: selectedDate.toISOString().split('T')[0],
                        appointment_time: selectedSlot,
                        status: 'booked'
                    }
                ]);

            if (error) throw error;

            setBookingSuccess(true);
            setShowConfirmModal(false);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            alert('Booking failed: ' + message);
        } finally {
            setBookingLoading(false);
        }
    };

    const addToGoogleCalendar = () => {
        if (!doctor) return;
        const dateStr = selectedDate.toISOString().split('T')[0].replace(/-/g, '');
        const title = `Appointment with Dr. ${doctor.name}`;
        const details = `Specialization: ${doctor.specialization}. Hospital: ${doctor.hospitals?.name}`;
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dateStr}T090000Z/${dateStr}T100000Z&details=${encodeURIComponent(details)}&location=${encodeURIComponent(doctor.hospitals?.address || '')}`;
        window.open(url, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        </div>
    );

    if (error || !doctor) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">System Error</h2>
            <p className="text-slate-500 mb-8 max-w-md">{error || 'Unable to retrieve clinical profile.'}</p>
            <Link to="/practitioners" className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest">Back to Directory</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white relative isolate overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-8 pt-24 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                    {/* LEFT: Clinical Profile */}
                    <div className="lg:col-span-7 space-y-12">
                        {/* Hero Header */}
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition" />
                                <div className="relative w-40 h-40 md:w-56 md:h-56 bg-slate-900 rounded-[2.2rem] overflow-hidden border border-white/10 ring-8 ring-slate-950">
                                    {doctor.image_url ? (
                                        <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl font-black text-indigo-400">
                                            {doctor.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-slate-950 p-2.5 rounded-2xl shadow-xl border-4 border-slate-950">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </motion.div>

                            <div className="flex-grow pt-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
                                        <Star className="w-3 h-3 text-indigo-400 fill-indigo-400" />
                                        <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">{doctor.rating} Rating</span>
                                    </div>
                                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Available Today</span>
                                    </div>
                                </div>
                                <h1 className="text-5xl font-black tracking-tighter mb-4">Dr. {doctor.name}</h1>
                                <p className="text-xl text-slate-400 font-bold mb-6">{doctor.specialization}</p>

                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Experience</span>
                                        <span className="text-lg font-black">{doctor.experience_years}+ <span className="text-xs text-slate-500 font-bold uppercase">Years</span></span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10 self-end mb-1" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Patients</span>
                                        <span className="text-lg font-black">1.2k+ <span className="text-xs text-slate-500 font-bold uppercase">Served</span></span>
                                    </div>
                                    <div className="w-px h-8 bg-white/10 self-end mb-1" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Live Queue</span>
                                        <span className="text-lg font-black text-emerald-400">#{doctor.live_queue} <span className="text-xs text-emerald-500/50 font-bold uppercase">Current</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="p-8 bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-500/5 rounded-full blur-[60px]" />
                            <h3 className="text-lg font-black mb-4 flex items-center gap-3">
                                <Award className="w-5 h-5 text-indigo-400" />
                                Clinical Excellence
                            </h3>
                            <p className="text-slate-400 leading-relaxed font-medium">
                                Dr. {doctor.name} is a senior board-certified {doctor.specialization} specialist affiliated with {doctor.hospitals?.name}.
                                With extensive clinical training and a compassionate approach, they specialize in complex diagnosis
                                and modern therapeutic interventions.
                            </p>
                        </div>

                        {/* Hospital Association */}
                        {doctor.hospitals && (
                            <div className="flex items-center gap-6 p-6 bg-slate-900/50 rounded-3xl border border-white/5">
                                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 border border-white/5">
                                    <HospitalIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Primary Affiliation</p>
                                    <h4 className="text-lg font-black text-white">{doctor.hospitals.name}</h4>
                                    <p className="text-sm text-slate-400 font-medium">{doctor.hospitals.address}</p>
                                </div>
                                <Link to={`/facilities/${doctor.hospitals.id}`} className="ml-auto w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Dynamic Scheduling */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-8">
                            <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                                <h3 className="text-2xl font-black mb-8 tracking-tighter">Schedule Appointment</h3>

                                {/* Date Selector (Horizontal) */}
                                <div className="space-y-4 mb-8">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Select Date</p>
                                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                                        {[0, 1, 2, 3, 4, 5].map((offset) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() + offset);
                                            const isActive = d.toDateString() === selectedDate.toDateString();
                                            return (
                                                <button
                                                    key={offset}
                                                    onClick={() => setSelectedDate(d)}
                                                    className={`flex-shrink-0 w-20 h-24 rounded-2xl flex flex-col items-center justify-center transition-all border ${isActive
                                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl shadow-indigo-500/20'
                                                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">
                                                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                                    </span>
                                                    <span className="text-2xl font-black">
                                                        {d.getDate()}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Slot Grid */}
                                <div className="space-y-4 mb-10">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Preferred Time Slot</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                disabled={!slot.available}
                                                onClick={() => setSelectedSlot(slot.time)}
                                                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${selectedSlot === slot.time
                                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/20'
                                                    : !slot.available
                                                        ? 'bg-white/5 border-transparent text-slate-600 cursor-not-allowed opacity-50'
                                                        : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                                                    }`}
                                            >
                                                <span className="font-black text-sm">{slot.time}</span>
                                                {selectedSlot === slot.time && <CheckCircle2 className="w-4 h-4" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {userRole === 'patient' ? (
                                    <button
                                        onClick={() => setShowConfirmModal(true)}
                                        disabled={!selectedSlot}
                                        className="w-full bg-white text-slate-950 py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-100 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20"
                                    >
                                        Confirm Details
                                    </button>
                                ) : userRole === 'doctor' ? (
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        Manage Clinic Slots
                                    </button>
                                ) : (
                                    <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5 text-center">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Administrative View</p>
                                        <p className="text-xs text-slate-400 mt-1 font-medium italic">Bookings restricted to Patient accounts.</p>
                                    </div>
                                )}
                            </div>

                            {/* Trust Badge */}
                            <div className="flex items-center justify-center gap-6 px-10">
                                <div className="flex flex-col items-center gap-2">
                                    <Award className="w-5 h-5 text-indigo-400" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Verified Expert</span>
                                </div>
                                <div className="w-px h-6 bg-white/5" />
                                <div className="flex flex-col items-center gap-2">
                                    <Users className="w-5 h-5 text-emerald-400" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Safe & Private</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.8)]"
                        >
                            <button onClick={() => setShowConfirmModal(false)} className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>

                            <h2 className="text-3xl font-black mb-2 tracking-tighter">Review Booking</h2>
                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mb-10">Almost ready for your consultation</p>

                            <div className="space-y-6 mb-12">
                                <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl">
                                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Appointment Slot</p>
                                        <p className="text-lg font-black text-white">
                                            {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                        <p className="text-sm text-indigo-400 font-black uppercase tracking-widest">{selectedSlot}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl">
                                    <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Medical Provider</p>
                                        <p className="text-lg font-black text-white">Dr. {doctor.name}</p>
                                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Consulting Specialist</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={bookingLoading}
                                className="w-full h-20 bg-emerald-500 text-slate-950 rounded-3xl font-black text-lg uppercase tracking-[0.2em] shadow-[0_15px_30px_-5px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center disabled:opacity-50"
                            >
                                {bookingLoading ? (
                                    <div className="w-6 h-6 border-4 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                                ) : (
                                    <>Book Appointment</>
                                )}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SUCCESS MODAL */}
            <AnimatePresence>
                {bookingSuccess && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative w-full max-w-lg text-center"
                        >
                            <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30">
                                <CheckCircle2 className="w-12 h-12 text-slate-950" />
                            </div>
                            <h2 className="text-5xl font-black mb-4 tracking-tighter">Booking Success!</h2>
                            <p className="text-slate-400 text-lg font-medium mb-12 max-w-xs mx-auto">
                                Your appointment is confirmed. We've sent a notification to the clinical team.
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={addToGoogleCalendar}
                                    className="h-16 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center gap-3 transition-all border border-white/5 font-black text-xs uppercase tracking-widest"
                                >
                                    <CalendarPlus className="w-5 h-5" />
                                    Add to Google Calendar
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="h-16 bg-white text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
