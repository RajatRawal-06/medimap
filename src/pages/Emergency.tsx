import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Navigation, AlertTriangle, Hospital as HospitalIcon, MapPin } from 'lucide-react';
import { useNavigationStore } from '../store/useNavigationStore';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNavigate } from 'react-router-dom';

export default function Emergency() {
    const navigate = useNavigate();
    const {
        emergencyHospital,
        emergencyDistance,
        emergencyETA,
        findNearestHospital,
        logEmergency,
        setEmergencyActive,
        setDestination
    } = useNavigationStore();

    const { coords, error, loading } = useGeolocation();
    const [isLogging, setIsLogging] = useState(false);

    useEffect(() => {
        if (coords) {
            findNearestHospital(coords.latitude, coords.longitude);
        }
    }, [coords, findNearestHospital]);

    const handleCall = () => {
        if (emergencyHospital?.emergency_phone) {
            window.location.href = `tel:${emergencyHospital.emergency_phone}`;
        }
    };

    const handleStartNavigation = async () => {
        if (!emergencyHospital || !coords) return;

        setIsLogging(true);
        try {
            await logEmergency(emergencyHospital.id, coords.latitude, coords.longitude);

            // Check if user is "inside" hospital (threshold < 0.1km)
            if (emergencyDistance !== null && emergencyDistance < 0.1) {
                setDestination('emergency-ward'); // Route to specific internal node
                navigate(`/facilities/${emergencyHospital.id}/map`);
            } else {
                // Outdoor navigation placeholder/external link
                const url = `https://www.google.com/maps/dir/?api=1&destination=${emergencyHospital.location_lat},${emergencyHospital.location_lng}`;
                window.open(url, '_blank');
            }
        } finally {
            setIsLogging(false);
            setEmergencyActive(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
            {/* Flashing Red Overlay */}
            <motion.div
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-red-600 pointer-events-none z-0"
            />

            <div className="relative z-10 max-w-lg mx-auto px-6 pt-20 pb-10 flex flex-col h-screen">
                <header className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-4 bg-red-600 rounded-full mb-6 shadow-2xl shadow-red-600/50"
                    >
                        <AlertTriangle className="w-12 h-12 text-white animate-pulse" />
                    </motion.div>
                    <h1 className="text-4xl font-black tracking-tighter mb-2">EMERGENCY MODE</h1>
                    <p className="text-slate-400 font-medium">Locating nearest assistance...</p>
                </header>

                <main className="flex-grow flex flex-col gap-6">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 h-64"
                            >
                                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                                <span className="font-bold text-slate-500">Detecting Geolocation...</span>
                            </motion.div>
                        ) : emergencyHospital ? (
                            <motion.div
                                key="hospital-card"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="bg-slate-900 border border-red-900/50 rounded-3xl p-6 shadow-2xl"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-1">{emergencyHospital.name}</h2>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <MapPin className="w-4 h-4" />
                                            <span>{emergencyHospital.address}</span>
                                        </div>
                                    </div>
                                    <div className="bg-red-600/20 text-red-500 p-3 rounded-2xl">
                                        <HospitalIcon className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Distance</div>
                                        <div className="text-xl font-black text-white">{emergencyDistance?.toFixed(1)} km</div>
                                    </div>
                                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                        <div className="text-slate-500 text-xs font-bold uppercase mb-1">Estimated Arrival</div>
                                        <div className="text-xl font-black text-red-500">{emergencyETA} mins</div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : error ? (
                            <div className="bg-red-950/20 border border-red-900 rounded-3xl p-6 text-center">
                                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <p className="text-red-400 font-bold">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-4 px-6 py-2 bg-red-600 rounded-xl text-sm font-bold"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : null}
                    </AnimatePresence>

                    {emergencyHospital && (
                        <div className="flex flex-col gap-4 mt-auto">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCall}
                                className="w-full bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 p-5 rounded-3xl flex items-center justify-between font-bold transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-500/20 text-green-500 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs text-slate-500 uppercase tracking-widest">Immediate Call</div>
                                        <div>Contact Hospital</div>
                                    </div>
                                </div>
                                <span className="text-slate-500">{emergencyHospital.emergency_phone}</span>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStartNavigation}
                                disabled={isLogging}
                                className="w-full bg-red-600 hover:bg-red-700 p-5 rounded-3xl flex items-center justify-center gap-3 font-black text-xl shadow-2xl shadow-red-600/30 transition-all disabled:opacity-50"
                            >
                                {isLogging ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Navigation className="w-6 h-6" />
                                        START NAVIGATION
                                    </>
                                )}
                            </motion.button>
                        </div>
                    )}
                </main>

                <footer className="mt-10 text-center">
                    <button
                        onClick={() => {
                            setEmergencyActive(false);
                            navigate('/');
                        }}
                        className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 mx-auto"
                    >
                        <X className="w-4 h-4" /> Cancel Emergency
                    </button>
                </footer>
            </div>
        </div>
    );
}

function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}
