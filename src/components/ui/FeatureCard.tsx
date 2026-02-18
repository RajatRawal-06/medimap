import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
    title: string;
    desc: string;
    icon: ReactNode;
    className?: string;
    children?: ReactNode;
}

export function FeatureCard({ title, desc, icon, children, className = '' }: FeatureCardProps) {
    return (
        <motion.div
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className={`p-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group ${className}`}
        >
            <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit shadow-sm text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-500/30 transition-all duration-500">
                {icon}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 transition-colors uppercase tracking-tight leading-none prose-h3:m-0">
                {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {desc}
            </p>
            {children}
        </motion.div>
    );
}
