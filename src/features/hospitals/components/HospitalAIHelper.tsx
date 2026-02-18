import { useState } from 'react';
import {
    Brain,
    Clock,
    ArrowRight,
    ChevronDown,
    Sparkles,
    Activity
} from 'lucide-react';
import { useNavigationStore } from '../../../store/useNavigationStore';

interface PredictedStep {
    name: string;
    time: string;
    load: number; // 0 to 1
    id: string;
}

export default function HospitalAIHelper() {
    const [isOpen, setIsOpen] = useState(false);
    const { currentLocation } = useNavigationStore();
    const [loading, setLoading] = useState(false);
    const [predictions] = useState<PredictedStep[]>([
        { id: 'reg', name: 'Registration Desk', time: '2 min', load: 0.3 },
        { id: 'wait', name: 'Main Waiting Area', time: '15 min', load: 0.8 },
        { id: 'lab', name: 'Diagnostic Lab', time: '5 min', load: 0.4 },
    ]);

    const handlePredict = async () => {
        if (!currentLocation) return;
        setLoading(true);
        // In a real scenario, we'd call the API tool to get 3 steps
        // For now, we'll simulate the update to the predicted steps
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4 pointer-events-none">
            {/* Floating Panel */}
            <div className={`
        bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl transition-all duration-500 ease-out origin-bottom-right overflow-hidden pointer-events-auto
        ${isOpen ? 'w-80 opacity-100 scale-100' : 'w-0 h-0 opacity-0 scale-95'}
      `}>
                {/* Header */}
                <div className="bg-slate-950 dark:bg-black p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-wider">MediMap Intelligence</h3>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Real-time Patient Flow</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-slate-800 dark:hover:bg-slate-900 rounded-lg text-slate-400 transition-colors"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-6">
                    <div className="space-y-4">
                        {predictions.map((step) => (
                            <div key={step.id} className="group cursor-pointer">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                                        <span className="text-sm font-black text-slate-900 dark:text-slate-100">{step.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-[10px] font-black uppercase">{step.time}</span>
                                    </div>
                                </div>

                                {/* Progress Bar (Load) */}
                                <div className="relative h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`absolute h-full transition-all duration-1000 ${step.load > 0.7 ? 'bg-rose-500' : step.load > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                        style={{ width: `${step.load * 100}%` }}
                                    ></div>
                                </div>

                                <div className="mt-1 flex justify-between">
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Congestion</span>
                                    <span className={`text-[9px] font-black uppercase ${step.load > 0.7 ? 'text-rose-600 dark:text-rose-400' : step.load > 0.4 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                                        }`}>
                                        {step.load > 0.7 ? 'High' : step.load > 0.4 ? 'Moderate' : 'Low'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="w-full bg-slate-950 dark:bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 dark:hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-xl group border border-white/10"
                    >
                        {loading ? (
                            <Activity className="w-4 h-4 animate-pulse" />
                        ) : (
                            <>
                                Analyze Next Path
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl transition-all duration-300 pointer-events-auto group
          ${isOpen
                        ? 'bg-rose-600 text-white rotate-90 scale-0 opacity-0'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'
                    }
        `}
            >
                <div className="relative">
                    <Brain className="w-6 h-6 animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-indigo-600"></div>
                </div>
                <span className="font-black text-sm uppercase tracking-widest">What Next?</span>
            </button>

            {/* Close shortcut (only visible if open) */}
            {!isOpen && (
                <div className="absolute top-0 right-0 p-4 transform translate-y-full opacity-0">Helper</div>
            )}
        </div>
    );
}
