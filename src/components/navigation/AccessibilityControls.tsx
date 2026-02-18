import { motion, AnimatePresence } from 'framer-motion';
import {
    Accessibility,
    X,
    Type,
    Sun,
    Volume2,
    Users,
    Armchair,
    CheckCircle2
} from 'lucide-react';
import { useNavigationStore } from '../../store/useNavigationStore';
import { useState } from 'react';

export function AccessibilityControls() {
    const [isOpen, setIsOpen] = useState(false);
    const { accessibilityMode, toggleAccessibility } = useNavigationStore();

    const features = [
        { key: 'wheelchair', label: 'Wheelchair Accessible', icon: Armchair, description: 'Avoid stairs & narrow paths' },
        { key: 'highContrast', label: 'High Contrast', icon: Sun, description: 'Increase visibility & distinct colors' },
        { key: 'largeText', label: 'Large Text', icon: Type, description: 'Increase font size 20%' },
        { key: 'voiceAssist', label: 'Voice Guidance', icon: Volume2, description: 'Audible navigation instructions' },
        { key: 'avoidCrowds', label: 'Quiet Routes', icon: Users, description: 'Avoid busy waiting areas' }
    ] as const;

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-colors border-2 border-white/10"
                aria-label="Open Accessibility Options"
            >
                <Accessibility className="w-6 h-6" />
                {Object.values(accessibilityMode).some(v => v) && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-indigo-600" />
                )}
            </motion.button>

            {/* Slide-out Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-sm bg-slate-950 border-l border-white/10 z-50 shadow-2xl p-6 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Accessibility className="w-6 h-6 text-indigo-400" />
                                    Accessibility
                                </h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {features.map((feature) => {
                                    const isActive = accessibilityMode[feature.key];
                                    const Icon = feature.icon;

                                    return (
                                        <button
                                            key={feature.key}
                                            onClick={() => toggleAccessibility(feature.key)}
                                            className={`w-full p-4 rounded-2xl border transition-all duration-200 text-left relative overflow-hidden group ${isActive
                                                    ? 'bg-indigo-600/20 border-indigo-500/50'
                                                    : 'bg-slate-900/50 border-white/5 hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4 relative z-10">
                                                <div className={`p-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'
                                                    }`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                                                            {feature.label}
                                                        </span>
                                                        {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>

                                            {isActive && (
                                                <motion.div
                                                    layoutId="active-glow"
                                                    className="absolute inset-0 bg-indigo-500/5 z-0"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-white/5">
                                <p className="text-xs text-slate-500 text-center font-medium">
                                    Settings are automatically saved for your next visit.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
