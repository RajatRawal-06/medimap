import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Footer from './Footer';
import { useNavigationStore } from '../../store/useNavigationStore';
import PageTransition from './PageTransition';
import FloatingEmergencyFAB from '../navigation/FloatingEmergencyFAB';
import GlobalToaster from './GlobalToaster';

export default function MainLayout() {
    const { accessibilityMode, theme } = useNavigationStore();
    const location = useLocation();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const accessibilityClasses = [
        accessibilityMode.highContrast ? 'high-contrast' : '',
        accessibilityMode.largeText ? 'large-text' : '',
        accessibilityMode.reducedMotion ? 'reduced-motion' : '',
        accessibilityMode.simplifiedMode ? 'simplified-mode' : '',
    ].join(' ');

    return (
        <div className={`flex flex-col min-h-screen transition-colors duration-500 ${accessibilityClasses}`}>
            <AccessibilityEffect />
            <Navbar />
            <main className="flex-grow flex flex-col">
                <AnimatePresence mode="wait">
                    <PageTransition key={location.pathname}>
                        <Outlet />
                    </PageTransition>
                </AnimatePresence>
            </main>
            <Footer />
            <FloatingEmergencyFAB />
            <GlobalToaster />
            <TTSListener />
        </div>
    );
}

function TTSListener() {
    const { isVoiceEnabled } = useNavigationStore();

    useEffect(() => {
        if (!isVoiceEnabled) return;

        const handleFocus = (e: FocusEvent) => {
            const target = e.target as HTMLElement;
            const text = target.ariaLabel || target.innerText || target.title;
            if (text) {
                const utterance = new SpeechSynthesisUtterance(text);
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            }
        };

        const handleMouseEnter = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Only speak if it's a button, link, or has specific accessibility attributes
            if (['BUTTON', 'A', 'H1', 'H2', 'H3'].includes(target.tagName) || target.getAttribute('role') === 'button') {
                const text = target.ariaLabel || target.innerText || target.title;
                if (text) {
                    const utterance = new SpeechSynthesisUtterance(text);
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                }
            }
        };

        window.addEventListener('focusin', handleFocus);
        window.addEventListener('mouseover', handleMouseEnter);

        return () => {
            window.removeEventListener('focusin', handleFocus);
            window.removeEventListener('mouseover', handleMouseEnter);
        };
    }, [isVoiceEnabled]);

    return null;
}

function AccessibilityEffect() {
    const { accessibilityMode } = useNavigationStore();

    useEffect(() => {
        const root = document.documentElement;
        if (accessibilityMode.highContrast) {
            root.classList.add('high-contrast');
            root.style.filter = 'contrast(1.5) saturate(1.2)';
        } else {
            root.classList.remove('high-contrast');
            root.style.filter = '';
        }

        if (accessibilityMode.largeText) {
            root.style.fontSize = '120%';
        } else {
            root.style.fontSize = '';
        }
    }, [accessibilityMode.highContrast, accessibilityMode.largeText]);

    return null;
}
