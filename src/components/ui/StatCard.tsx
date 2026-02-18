import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: ReactNode;
    trend?: string | ReactNode;
    description?: string;
}

export function StatCard({ label, value, icon, trend, description }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-6 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 p-2.5 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{value}</p>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>
            {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    {description}
                </p>
            )}
        </motion.div>
    );
}
