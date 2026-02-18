import { motion } from 'framer-motion';

interface AIProgressBarProps {
    progress: number; // 0 to 100
    label?: string;
    status?: string;
    className?: string;
}

export function AIProgressBar({ progress, label, status, className = '' }: AIProgressBarProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {(label || status) && (
                <div className="flex justify-between items-end">
                    {label && <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</p>}
                    {status && <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{status}</p>}
                </div>
            )}
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute inset-y-0 left-0 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                />
                <motion.div
                    animate={{
                        left: ["-100%", "200%"],
                        transition: { duration: 2, repeat: Infinity, ease: "linear" }
                    }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                />
            </div>
            <div className="flex justify-end">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">{Math.round(progress)}%</span>
            </div>
        </div>
    );
}
