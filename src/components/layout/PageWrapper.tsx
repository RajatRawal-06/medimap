import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageWrapperProps {
    children: ReactNode;
    className?: string;
}

const variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
};

export const PageWrapper = ({ children, className }: PageWrapperProps) => {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`flex-grow flex flex-col ${className}`}
        >
            {children}
        </motion.div>
    );
};
