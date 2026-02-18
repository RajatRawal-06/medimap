import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const variants = {
    initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.98, filter: 'blur(5px)' }
};

export default function PageTransition({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex-grow flex flex-col w-full origin-top"
        >
            {children}
        </motion.div>
    );
}
