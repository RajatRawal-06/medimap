import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '../../store/useNavigationStore';
import type { PredictionResult, RerouteResult } from '../../store/useNavigationStore';
import {
    AlertTriangle,
    MapPin,
    Navigation,
    Brain,
    Activity,
    Loader2,
    Route,
    Clock,
    Sparkles
} from 'lucide-react';

export default function AIAssistant() {
    const {
        predictNextStep,
        currentLocation,
        path,
        isNavigating,
        applyAlternatePath,
        checkReroute
    } = useNavigationStore();

    const [aiResult, setAiResult] = useState<{ prediction: PredictionResult; reroute: RerouteResult } | null>(null);
    const [loading, setLoading] = useState(false);
    const [isThinking, setIsThinking] = useState(false);

    const handlePredict = async () => {
        if (!currentLocation) return;

        setLoading(true);
        setIsThinking(true);

        const prediction = await predictNextStep(currentLocation, 'patient', {
            appointmentType: 'Radiology',
            doctorType: 'Cardiologist'
        });

        if (!prediction) {
            setLoading(false);
            setIsThinking(false);
            return;
        }

        const reroute = await checkReroute(currentLocation, prediction.nextNode, 'patient');

        if (!reroute) {
            setLoading(false);
            setIsThinking(false);
            return;
        }

        setAiResult({ prediction, reroute });
        setLoading(false);
        setIsThinking(false);
    };

    const steps = path?.steps || [];
    const currentIndex = steps.findIndex(s => s.nodeId === currentLocation);
    const progressPercent = steps.length > 0 ? Math.round(((currentIndex + 1) / steps.length) * 100) : 0;

    if (!currentLocation && !isNavigating) return null;

    return (
        <div className="fixed bottom-24 left-6 w-[380px] z-50 pointer-events-none">
            <div className="pointer-events-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden"
                >
                    {/* Premium Header */}
                    <div className="p-6 pb-4 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 animate-pulse" />
                                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">MediMap Cognitive</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Neural Engine Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Status/Thinking Area */}
                        {!aiResult && !isNavigating && (
                            <div className="text-center py-8">
                                <div className="relative inline-block mb-6">
                                    <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full" />
                                    <Activity className="w-12 h-12 text-indigo-400 mx-auto" />
                                </div>
                                <h4 className="text-white font-bold mb-2">How can I assist your journey?</h4>
                                <p className="text-xs text-slate-400 px-8 leading-relaxed mb-6">
                                    I analyze hospital load, your clinical profile, and current position to guide you efficiently.
                                </p>
                                <button
                                    onClick={handlePredict}
                                    disabled={loading}
                                    className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-xl"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Analyzing Patterns...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            What should I do next?
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Prediction Results */}
                        <AnimatePresence mode="wait">
                            {aiResult && !isThinking && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {/* Primary Suggestion Card */}
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 group hover:bg-white/[0.08] transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
                                                    <MapPin className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Next Destination</p>
                                                    <h4 className="text-base font-bold text-white mt-0.5">{aiResult.prediction.nextNode.replace('node_', '').replace(/_/g, ' ')}</h4>
                                                </div>
                                            </div>
                                            <div className="bg-indigo-500/10 px-2 py-1 rounded-lg">
                                                <span className="text-[10px] font-black text-indigo-400">{Math.round(aiResult.prediction.confidence * 100)}% Match</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-300 leading-relaxed italic bg-black/20 p-4 rounded-2xl border border-white/5">
                                            "{aiResult.prediction.reasoning}"
                                        </p>
                                    </div>

                                    {/* Reroute Alert */}
                                    {aiResult.reroute?.shouldReroute && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 overflow-hidden"
                                        >
                                            <div className="flex gap-4">
                                                <div className="bg-amber-500 p-2 h-fit rounded-xl">
                                                    <AlertTriangle className="w-4 h-4 text-slate-900" />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Heavy Congestion Detected</h5>
                                                    <p className="text-[11px] text-amber-200/80 leading-snug mb-4">{aiResult.reroute.alternative?.reason}</p>

                                                    <button
                                                        onClick={() => applyAlternatePath()}
                                                        className="w-full bg-amber-500 text-slate-950 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-400 transition-all"
                                                    >
                                                        <Route className="w-4 h-4" />
                                                        Take Faster Route
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <button
                                        onClick={() => setAiResult(null)}
                                        className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors py-2"
                                    >
                                        Dismiss Assistance
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Step Progress during navigation */}
                        {isNavigating && !aiResult && (
                            <div className="space-y-6 animate-in fade-in duration-700">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-slate-500" />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Journey Progress</p>
                                        </div>
                                        <span className="text-xs font-black text-white">{progressPercent}%</span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-3xl p-5 flex items-center gap-4 border border-white/5">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <Navigation className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest">Following Guidance</h5>
                                        <p className="text-xs text-slate-400">Arriving at your destination in ~3 mins.</p>
                                    </div>
                                    <button
                                        onClick={handlePredict}
                                        className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
