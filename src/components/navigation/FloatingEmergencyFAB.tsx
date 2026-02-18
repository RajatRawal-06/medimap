import { Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '../../store/useNavigationStore';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FloatingEmergencyFAB() {
    const { isEmergencyActive, triggerEmergency } = useNavigationStore();
    const navigate = useNavigate();
    const location = useLocation();

    if (location.pathname === '/emergency') return null;

    const handleClick = () => {
        if (!isEmergencyActive) {
            triggerEmergency();
        }
        navigate('/emergency');
    };

    return (
        <AnimatePresence>
            <motion.button
                initial={{ scale: 0, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0, opacity: 0, y: 20 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClick}
                className={`fixed bottom-8 right-8 z-[100] p-5 rounded-3xl shadow-2xl flex items-center justify-center transition-colors ${isEmergencyActive
                        ? 'bg-red-600 text-white animate-pulse shadow-red-600/50'
                        : 'bg-white dark:bg-slate-900 text-red-600 border border-red-100 dark:border-red-900 shadow-xl'
                    }`}
            >
                <div className="relative">
                    <Phone className="w-6 h-6" />
                    {isEmergencyActive && (
                        <motion.span
                            layoutId="emergency-glow"
                            className="absolute -inset-4 bg-red-400/30 rounded-full blur-xl -z-10"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    )}
                </div>
            </motion.button>
        </AnimatePresence>
    );
}
