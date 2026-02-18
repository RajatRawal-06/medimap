import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`rounded-[2rem] overflow-hidden border transition-all ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }: CardProps) {
    return (
        <div className={`p-6 border-b border-white/10 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }: CardProps) {
    return (
        <h3 className={`text-xl font-bold ${className}`}>
            {children}
        </h3>
    );
}

export function CardContent({ children, className = '' }: CardProps) {
    return (
        <div className={`p-6 ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }: CardProps) {
    return (
        <div className={`px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 ${className}`}>
            {children}
        </div>
    );
}
