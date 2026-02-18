import React, { useEffect } from 'react';
import { useNavigationStore } from '../../store/useNavigationStore';
import { Activity, Flame, Users } from 'lucide-react';

export const CrowdHeatmap: React.FC = () => {
    const { heatmapData, crowdMetrics, subscribeToCrowdData } = useNavigationStore();

    useEffect(() => {
        const unsubscribe = subscribeToCrowdData();
        return () => unsubscribe();
    }, [subscribeToCrowdData]);

    const getIntensityColor = (intensity: number) => {
        if (intensity < 0.3) return 'from-emerald-400 to-emerald-600';
        if (intensity < 0.6) return 'from-amber-400 to-amber-600';
        if (intensity < 0.8) return 'from-orange-500 to-orange-700';
        return 'from-rose-500 to-rose-700';
    };

    const getIntensityLabel = (intensity: number) => {
        if (intensity < 0.3) return 'Clear';
        if (intensity < 0.6) return 'Moderate';
        if (intensity < 0.8) return 'Busy';
        return 'Critical';
    };

    const activeDepartments = Object.keys(heatmapData).filter(id => heatmapData[id] > 0);

    if (activeDepartments.length === 0) {
        return (
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs flex items-center gap-3">
                <Activity className="w-4 h-4 animate-pulse text-indigo-500" />
                Synchronizing with live network...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-6 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl rounded-full -mr-16 -mt-16" />

            <div className="flex items-center justify-between mb-2 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600/20 p-1.5 rounded-lg">
                        <Users className="w-4 h-4 text-indigo-400" />
                    </div>
                    <span className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Crowd Telemetry</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-[9px] font-black text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                    Live
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {activeDepartments.sort((a, b) => heatmapData[b] - heatmapData[a]).slice(0, 5).map(nodeId => {
                    const intensity = heatmapData[nodeId];
                    const metrics = crowdMetrics[nodeId];

                    return (
                        <div key={nodeId} className="group">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-slate-300 capitalize tracking-wide">{nodeId.replace(/_/g, ' ')}</span>
                                <div className="flex items-center gap-2">
                                    {(metrics?.queue_count ?? 0) > 0 && (
                                        <span className="text-[10px] text-slate-500 font-mono">Q:{metrics.queue_count}</span>
                                    )}
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md bg-gradient-to-br ${getIntensityColor(intensity)} text-white shadow-lg shadow-black/20`}>
                                        {Math.round(intensity * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden border border-slate-800/50">
                                <div
                                    className={`h-full bg-gradient-to-r ${getIntensityColor(intensity)} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]`}
                                    style={{ width: `${intensity * 100}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between mt-1.5 px-0.5">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{getIntensityLabel(intensity)}</span>
                                <span className="text-[9px] text-slate-600 italic">Updated just now</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeDepartments.some(id => heatmapData[id] > 0.8) && (
                <div className="mt-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 animate-pulse relative z-10">
                    <div className="bg-rose-600 p-1.5 rounded-lg shadow-lg shadow-rose-900/20">
                        <Flame className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Congestion Threshold Exceeded</span>
                </div>
            )}
        </div>
    );
};
