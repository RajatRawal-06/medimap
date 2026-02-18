import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode,
    Volume2,
    VolumeX,
    AlertTriangle,
    Accessibility,
    ArrowLeft
} from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useNavigationStore } from '../store/useNavigationStore';
import { HospitalFloorMap } from '../components/map/HospitalFloorMap';
import { AccessibilityControls } from '../components/navigation/AccessibilityControls';
import type { MapNode } from '../data/floorMapData';
import { getMockHospitalBySlug } from '../data/hospitals';

import { MapPageSkeleton } from '../components/map/MapPageSkeleton';

export default function HospitalNavigation() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Store
    const {
        currentLocation,
        destination,
        setLocation,
        setDestination,
        isVoiceEnabled,
        toggleVoice,
        accessibilityMode,
        toggleAccessibility,
        isEmergencyActive,
        triggerEmergency,
    } = useNavigationStore();

    // Local State
    const [currentFloor, setCurrentFloor] = useState(1);
    const [showFloorMenu, setShowFloorMenu] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [loading, setLoading] = useState(true);

    // Derive hospital name from route param instead of setState in effect
    const hospitalName = useMemo(() => {
        if (id) {
            const hosp = getMockHospitalBySlug(id);
            if (hosp) return hosp.name;
        }
        return 'Hospital';
    }, [id]);

    // Simulate Loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <MapPageSkeleton />;

    // Handle Emergency Route
    const handleEmergency = () => {
        triggerEmergency();
        setCurrentFloor(1); // ER is usually on Ground
        // Set Destination to Emergency Node ID if exists
        setDestination('emergency');
        // Set user to Entrance if not set
        if (!currentLocation) setLocation('start-entrance');
    };

    // Handle QR Scan Simulation
    const handleQRScan = () => {
        setShowScanner(false);
        // Simulate scanning a code at Main Entrance
        setLocation('start-entrance');
        setCurrentFloor(1);
    };

    // Node Click Interaction
    const handleNodeClick = (node: MapNode) => {
        if (!currentLocation) {
            setLocation(node.id);
        } else {
            setDestination(node.id);
        }
    };

    return (
        <PageWrapper className={`h-screen overflow-hidden bg-slate-950 text-white ${accessibilityMode.highContrast ? 'grayscale contrast-125' : ''}`}>

            {/* TOP BAR / HEADER */}
            <div className="absolute top-0 left-0 right-0 h-20 z-30 flex items-center justify-between px-6 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-white/10 backdrop-blur border border-white/10 hover:bg-white/20 transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black tracking-tight">{hospitalName}</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Interactive Guidance</p>
                    </div>
                </div>

                <div className="pointer-events-auto flex items-center gap-3">
                    <button
                        onClick={toggleVoice}
                        className={`p-3 rounded-full backdrop-blur border transition-all ${isVoiceEnabled ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                        {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => toggleAccessibility('wheelchair')}
                        className={`p-3 rounded-full backdrop-blur border transition-all ${accessibilityMode.wheelchair ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-white/5 border-white/10 text-slate-400'}`}
                    >
                        <Accessibility className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex h-full pt-0">

                {/* LEFT SIDEBAR CONTROLS */}
                <div className="w-24 hidden md:flex flex-col items-center justify-center gap-6 z-20 pointer-events-none">
                    {/* Floating Action Buttons */}
                    <div className="pointer-events-auto flex flex-col gap-6">
                        <button
                            onClick={() => setShowScanner(true)}
                            className="w-14 h-14 rounded-2xl bg-slate-900/80 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:scale-110 transistion-transform shadow-xl group"
                        >
                            <QrCode className="w-6 h-6 group-hover:text-indigo-400 transition-colors" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setShowFloorMenu(!showFloorMenu)}
                                className="w-14 h-14 rounded-2xl bg-slate-900/80 backdrop-blur border border-white/10 flex flex-col items-center justify-center text-white hover:scale-110 transistion-transform shadow-xl"
                            >
                                <span className="text-[10px] font-black uppercase text-slate-500">Level</span>
                                <span className="text-xl font-black">{currentFloor}</span>
                            </button>

                            <AnimatePresence>
                                {showFloorMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 10 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="absolute left-full top-0 ml-2 bg-slate-900 border border-white/10 rounded-2xl p-2 flex flex-col gap-2 min-w-[80px]"
                                    >
                                        {[3, 2, 1].map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => { setCurrentFloor(lvl); setShowFloorMenu(false); }}
                                                className={`py-2 px-4 rounded-xl text-sm font-bold transition-colors ${currentFloor === lvl ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                                            >
                                                Lvl 0{lvl}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* MAP CONTAINER */}
                <div className="flex-1 relative h-full w-full bg-black">
                    {/* Glowing Grid Background Implementation is inside HospitalFloorMap */}
                    <div className="absolute inset-4 md:inset-8">
                        <HospitalFloorMap
                            floor={currentFloor}
                            userLocation={currentLocation}
                            destination={destination}
                            onNodeClick={handleNodeClick}
                        />
                    </div>

                    {/* OVERLAYS */}

                    {/* Emergency Effect */}
                    {isEmergencyActive && (
                        <div className="absolute inset-0 z-0 pointer-events-none border-[8px] border-rose-600/50 rounded-none animate-pulse shadow-[inset_0_0_100px_rgba(225,29,72,0.5)]" />
                    )}

                    {/* Bottom Action Bar (Mobile/Tablet friendly) */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40 w-full max-w-md px-6">
                        <button
                            onClick={handleEmergency}
                            className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-105 active:scale-95 ${isEmergencyActive ? 'bg-rose-500 text-white animate-pulse' : 'bg-rose-600 text-white hover:bg-rose-500'}`}
                        >
                            <AlertTriangle className="w-5 h-5 fill-current" />
                            {isEmergencyActive ? 'Emergency Active' : 'Emergency Route'}
                        </button>
                    </div>
                </div>
            </div>

            {/* QR SCANNER OVERLAY */}
            <AnimatePresence>
                {showScanner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                    >
                        <button onClick={() => setShowScanner(false)} className="absolute top-8 right-8 text-white"><ArrowLeft className="w-8 h-8" /></button>
                        <div className="w-[300px] h-[300px] border-4 border-indigo-500 rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent animate-scan" style={{ animationDuration: '2s' }} />
                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_20px_#818cf8] animate-scan-line" />
                            <div className="flex items-center justify-center h-full text-slate-500 font-mono text-sm">
                                [CAMERA FEED MOCK]
                            </div>
                        </div>
                        <p className="mt-8 text-slate-400 font-medium text-center max-w-xs">Scan the QR code at any hospital entrance or room to set your location.</p>
                        <button
                            onClick={handleQRScan}
                            className="mt-8 px-8 py-3 bg-white text-black rounded-xl font-bold uppercase tracking-wider hover:scale-105 transition-transform"
                        >
                            Simulate Scan
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Accessibility Controls */}
            <AccessibilityControls />

        </PageWrapper>
    );
}
