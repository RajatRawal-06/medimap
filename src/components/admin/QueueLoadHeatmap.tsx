import { motion } from 'framer-motion';
import { Activity, Users, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const heatmapData = [
    { department: 'Emergency', load: 85, trend: '+12%', staff: 12 },
    { department: 'Radiology', load: 45, trend: '-5%', staff: 6 },
    { department: 'Cardiology', load: 60, trend: '+2%', staff: 8 },
    { department: 'OPD - Block A', load: 92, trend: '+15%', staff: 14 },
    { department: 'OPD - Block B', load: 30, trend: '-10%', staff: 10 },
    { department: 'Laboratory', load: 55, trend: '0%', staff: 5 },
    { department: 'Pharmacy', load: 78, trend: '+8%', staff: 4 },
];

export default function QueueLoadHeatmap() {
    const getLoadColor = (load: number) => {
        if (load >= 80) return 'bg-rose-500 shadow-rose-500/50';
        if (load >= 60) return 'bg-orange-500 shadow-orange-500/50';
        if (load >= 40) return 'bg-amber-500 shadow-amber-500/50';
        return 'bg-emerald-500 shadow-emerald-500/50';
    };



    return (
        <Card className="backdrop-blur-xl bg-white/5 border-white/10 text-white mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black uppercase tracking-widest">Queue Load Heatmap</CardTitle>
                    <p className="text-sm text-slate-400 font-medium">Real-time facility congestion metrics</p>
                </div>
                <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {heatmapData.map((item, idx) => (
                        <motion.div
                            key={item.department}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative group cursor-pointer"
                        >
                            <div className={`absolute inset-0 rounded-3xl blur-xl opacity-20 transition-opacity group-hover:opacity-40 ${getLoadColor(item.load)}`} />
                            <div className="relative bg-white/5 border border-white/10 rounded-3xl p-5 hover:bg-white/10 transition-all overflow-hidden">
                                {/* Load Bar Background */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.load}%` }}
                                        className={`h-full ${getLoadColor(item.load)}`}
                                    />
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-sm text-slate-200">{item.department}</h4>
                                    {item.load >= 80 && <AlertCircle className="w-4 h-4 text-rose-500" />}
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <span className="text-3xl font-black tabular-nums">{item.load}%</span>
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Utilization</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1">
                                            <Users className="w-3 h-3" />
                                            {item.staff} STAFF
                                        </div>
                                        <span className={`text-xs font-black ${item.trend.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {item.trend}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
