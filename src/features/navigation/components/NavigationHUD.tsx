import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight,
    ChevronLeft,
    Volume2,
    VolumeX,
    RotateCcw,
    Navigation,
    Clock,
    MapPin
} from 'lucide-react';
import { useNavigationStore } from '../../../store/useNavigationStore';

export default function NavigationHUD() {
    const {
        instructions,
        currentStepIndex,
        nextStep,
        prevStep,
        isVoiceEnabled,
        toggleVoice,
        restartNavigation,
        path,
        navigationActive
    } = useNavigationStore();

    if (!navigationActive || instructions.length === 0) return null;

    const currentInstruction = instructions[currentStepIndex];
    const totalSteps = instructions.length;
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;

    return (
        <div className="absolute inset-x-0 bottom-0 p-8 pointer-events-none z-50">
            {/* Top Stats Overlay */}
            <div className="absolute top-[-500px] left-8 pointer-events-auto">
                <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-6 rounded-3xl shadow-2xl flex items-center gap-6">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                        <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ETA</p>
                        <p className="text-xl font-black text-white">
                            {path ? Math.ceil(path.estimatedTime / 60) : 0} <span className="text-xs text-slate-400">min</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto pointer-events-auto">
                <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] relative overflow-hidden">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
                        <motion.div
                            className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Step Indicator */}
                        <div className="relative">
                            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex flex-col items-center justify-center text-white shadow-xl">
                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Step</span>
                                <span className="text-3xl font-black">{currentStepIndex + 1}</span>
                            </div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>

                        {/* Instruction Text */}
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <Navigation className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Live Guidance</span>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.h3
                                    key={currentStepIndex}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="text-2xl font-black text-white leading-tight tracking-tight truncate"
                                >
                                    {currentInstruction}
                                </motion.h3>
                            </AnimatePresence>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleVoice}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border ${isVoiceEnabled
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                    : 'bg-white/5 border-white/10 text-slate-500'
                                    }`}
                            >
                                {isVoiceEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                            </button>

                            <div className="h-10 w-px bg-white/10 mx-2" />

                            <div className="flex gap-2">
                                <button
                                    disabled={currentStepIndex === 0}
                                    onClick={prevStep}
                                    className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-20 transition-all"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    disabled={currentStepIndex === totalSteps - 1}
                                    onClick={nextStep}
                                    className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-500 disabled:opacity-20 transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-slate-500">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">{totalSteps} Waypoints</span>
                            </div>
                        </div>
                        <button
                            onClick={restartNavigation}
                            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Restart Trip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
