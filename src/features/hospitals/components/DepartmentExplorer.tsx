import { motion } from 'framer-motion';
import { ArrowRight, Activity, Users } from 'lucide-react';
import type { Department } from '../../../types';

interface DepartmentExplorerProps {
    departments: Department[];
}

export default function DepartmentExplorer({ departments }: DepartmentExplorerProps) {
    if (departments.length === 0) {
        return (
            <div className="p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] text-center italic text-slate-400">
                No departments listed yet.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept, index) => (
                <motion.div
                    key={dept.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white capitalize">{dept.name}</h3>
                            <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                <Activity className="w-5 h-5" />
                            </div>
                        </div>

                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                            Expert medical care specializing in {dept.name.toLowerCase()} diagnostics and advanced treatment protocols.
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                    <Users className="w-3 h-3" />
                                    <span>8+ Experts</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span>Avail Now</span>
                                </div>
                            </div>
                            <button className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
