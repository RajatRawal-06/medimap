import type { ReactNode } from 'react';

interface SectionWrapperProps {
    children: ReactNode;
    className?: string;
    id?: string;
    bg?: 'white' | 'slate' | 'indigo' | 'none';
}

export function SectionWrapper({ children, className = '', id, bg = 'none' }: SectionWrapperProps) {
    const bgClasses = {
        white: 'bg-white',
        slate: 'bg-slate-50 dark:bg-slate-950',
        indigo: 'bg-indigo-600',
        none: ''
    };

    return (
        <section
            id={id}
            className={`py-24 lg:py-32 relative overflow-hidden ${bgClasses[bg]} ${className}`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {children}
            </div>
        </section>
    );
}
