import React from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Ticket } from 'lucide-react';
import { useNavigationStore } from '../../store/useNavigationStore';

interface FacilityStatusProps {
    nodeId: string;
    label?: string;
    showQueue?: boolean;
}

export const FacilityStatus: React.FC<FacilityStatusProps> = ({ nodeId, label, showQueue = true }) => {
    const { crowdMetrics } = useNavigationStore();
    const metrics = crowdMetrics[nodeId];

    if (!metrics) return null;

    const getCrowdLevel = (score: number) => {
        if (score < 30) return { label: 'Low', color: 'bg-emerald-500', text: 'text-emerald-400' };
        if (score < 70) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-400' };
        return { label: 'High', color: 'bg-rose-500', text: 'text-rose-400' };
    };

    const crowd = getCrowdLevel(metrics.congestion_score);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl max-w-sm w-full"
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm truncate pr-2">{label || 'Facility Status'}</h3>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${crowd.color}/20 ${crowd.text} border border-${crowd.color}/20`}>
                    {crowd.label} Density
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {/* Crowd Score */}
                <div className="bg-slate-800/50 rounded-xl p-2 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Crowd</div>
                        <div className="text-sm font-black text-white">{metrics.congestion_score}%</div>
                    </div>
                </div>

                {/* Queue Info (if applicable) */}
                {showQueue && metrics.currentToken && (
                    <div className="bg-slate-800/50 rounded-xl p-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Ticket className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Now Serving</div>
                            <div className="text-sm font-black text-white">{metrics.currentToken}</div>
                        </div>
                    </div>
                )}
            </div>

            {showQueue && metrics.estimatedWait !== undefined && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 bg-slate-800/30 p-2 rounded-lg">
                    <Clock className="w-3 h-3" />
                    <span>Est. Wait Time: <span className="text-white font-bold">{metrics.estimatedWait} mins</span></span>
                </div>
            )}
        </motion.div>
    );
};
