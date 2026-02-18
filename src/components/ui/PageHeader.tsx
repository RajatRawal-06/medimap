import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
    centered?: boolean;
    className?: string;
    children?: ReactNode;
}

export function PageHeader({
    title,
    subtitle,
    badge,
    centered = true,
    className = '',
    children
}: PageHeaderProps) {
    return (
        <div className={`${centered ? 'text-center max-w-3xl mx-auto' : ''} mb-16 lg:mb-20 ${className}`}>
            {badge && (
                <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.25em] text-[10px] mb-4 block px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 w-fit rounded-full mx-auto">
                    {badge}
                </span>
            )}
            <h2 className="text-4xl lg:text-7xl font-black text-slate-950 dark:text-white mb-6 tracking-tighter leading-[0.9]">
                {title}
            </h2>
            {subtitle && (
                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto font-medium">
                    {subtitle}
                </p>
            )}
            {children}
        </div>
    );
}
