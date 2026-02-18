import { motion } from 'framer-motion';
import { Activity, Users, Clock, Zap, AlertCircle } from 'lucide-react';
import { useNavigationStore } from '../../../store/useNavigationStore';

export default function LiveNetworkPanel() {
    const { hospitalMetrics } = useNavigationStore();

    if (!hospitalMetrics) return null;

    const { status, occupancy, totalDoctors, avgWaitTime } = hospitalMetrics;

    const getStatusColor = () => {
        switch (status) {
            case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'High Load': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            {/* High-tech Background Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-24 h-24 text-indigo-500" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Live Network Health</h3>
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border transition-colors ${getStatusColor()}`}>
                        {status}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-3xl">
                            <div className="flex items-center gap-3 mb-2 text-slate-500">
                                <Users className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Active Doctors</span>
                            </div>
                            <div className="text-3xl font-black text-white">{totalDoctors}</div>
                        </div>
                        <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-3xl">
                            <div className="flex items-center gap-3 mb-2 text-slate-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Avg Wait Time</span>
                            </div>
                            <div className="text-3xl font-black text-white">{avgWaitTime}<span className="text-xs text-slate-500 ml-1">min</span></div>
                        </div>
                    </div>

                    {/* Occupancy Gauge */}
                    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Activity className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Current Occupancy</span>
                            </div>
                            <span className={`text-sm font-black ${occupancy > 80 ? 'text-red-500' : 'text-emerald-500'}`}>{occupancy}%</span>
                        </div>

                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${occupancy}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={`h-full rounded-full ${occupancy > 80 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' :
                                    occupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                                    }`}
                            />
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-medium italic">
                            <AlertCircle className="w-3 h-3" />
                            <span>Calculated based on real-time check-ins and discharge rates</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                        <button className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg">
                            Book Priority Slot
                        </button>
                        <button className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors">
                            View Live Queue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
