import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigationStore } from '../../store/useNavigationStore';
import {
    Menu, X, LogOut,
    Eye, Type, MoveVertical, ShieldAlert,
    Sun, Moon, Phone, Volume2, LayoutGrid
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isAcessMenuOpen, setIsAccessMenuOpen] = useState(false);
    const { user, signOut } = useAuthStore();
    const {
        theme, toggleTheme,
        language, setLanguage,
        accessibilityMode, toggleAccessibility,
        isVoiceEnabled, toggleTTS,
        isEmergencyActive
    } = useNavigationStore();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className={`bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-500 ${isEmergencyActive ? 'ring-2 ring-red-600 ring-inset ring-offset-2' : ''}`}>
            {isEmergencyActive && (
                <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest text-center py-1 animate-pulse">
                    Emergency Mode Active - High Urgency
                </div>
            )}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">

                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2.5">
                            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                                <ShieldAlert className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-xl text-slate-950 dark:text-white leading-none">MediMap</span>
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-md px-1.5 py-0.5 mt-1 self-start uppercase tracking-widest bg-white dark:bg-slate-900">Health Network</span>
                            </div>
                        </Link>

                        <div className="hidden lg:flex items-center space-x-1 ml-4 shadow-sm border border-slate-100 dark:border-slate-800 rounded-xl p-1 bg-slate-50/50 dark:bg-slate-900/50">
                            <NavLink to="/dashboard" label={t('dashboard')} active={location.pathname === '/dashboard'} />
                            <NavLink to="/facilities" label={t('facilities')} active={location.pathname.startsWith('/facilities')} />
                            <NavLink to="/practitioners" label={t('practitioners')} active={location.pathname.startsWith('/practitioners')} />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            to="/emergency"
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isEmergencyActive
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20'
                                }`}
                        >
                            <Phone className={`w-4 h-4 ${isEmergencyActive ? 'animate-bounce' : ''}`} />
                            {isEmergencyActive ? t('activeEmergency') : t('emergency')}
                        </Link>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-600 dark:text-slate-400 group"
                        >
                            {theme === 'light' ? (
                                <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
                            ) : (
                                <Sun className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            )}
                        </button>

                        {/* Language Toggle */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                            {(['EN', 'HI', 'ES'] as const).map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${language === lang ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>

                        {/* Accessibility Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsAccessMenuOpen(!isAcessMenuOpen)}
                                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-600 dark:text-slate-400"
                            >
                                <Eye className="w-5 h-5" />
                            </button>

                            {isAcessMenuOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">{t('accessibility')}</h4>
                                    <div className="space-y-3">
                                        <AccessToggle
                                            icon={<Eye className="w-4 h-4" />}
                                            label={t('highContrast')}
                                            active={accessibilityMode.highContrast}
                                            onClick={() => toggleAccessibility('highContrast')}
                                        />
                                        <AccessToggle
                                            icon={<Type className="w-4 h-4" />}
                                            label={t('largeText')}
                                            active={accessibilityMode.largeText}
                                            onClick={() => toggleAccessibility('largeText')}
                                        />
                                        <AccessToggle
                                            icon={<MoveVertical className="w-4 h-4" />}
                                            label={t('reducedMotion')}
                                            active={accessibilityMode.reducedMotion}
                                            onClick={() => toggleAccessibility('reducedMotion')}
                                        />
                                        <AccessToggle
                                            icon={<LayoutGrid className="w-4 h-4" />}
                                            label={t('simplifiedMode')}
                                            active={accessibilityMode.simplifiedMode}
                                            onClick={() => toggleAccessibility('simplifiedMode')}
                                        />
                                        <AccessToggle
                                            icon={<Volume2 className="w-4 h-4" />}
                                            label={t('textToSpeech')}
                                            active={isVoiceEnabled}
                                            onClick={toggleTTS}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/my-appointments" className={`text-sm font-semibold transition-colors ${location.pathname === '/my-appointments' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'}`}>
                                    Appointments
                                </Link>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-2xl">
                                    <div className="h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-500/20 dark:ring-indigo-500/10">
                                        {user.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        title={t('signOut')}
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white px-4 transition-colors">{t('signIn')}</Link>
                                <Link to="/signup" className="bg-indigo-600 dark:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all">
                                    {t('getStarted')}
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 gap-2">
                        <MobileLink to="/dashboard" label="Dashboard" active={location.pathname === '/dashboard'} onClick={() => setIsOpen(false)} />
                        <MobileLink to="/facilities" label="Facilities" active={location.pathname.startsWith('/facilities')} onClick={() => setIsOpen(false)} />
                        <MobileLink to="/practitioners" label="Practitioners" active={location.pathname.startsWith('/practitioners')} onClick={() => setIsOpen(false)} />
                        <MobileLink to="/emergency" label="Emergency" active={location.pathname === '/emergency'} onClick={() => setIsOpen(false)} />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Language</span>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            {(['EN', 'HI', 'ES'] as const).map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLanguage(l)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${language === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Accessibility</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <AccessToggle
                                icon={<Eye className="w-4 h-4" />}
                                label="High Contrast"
                                active={accessibilityMode.highContrast}
                                onClick={() => toggleAccessibility('highContrast')}
                            />
                            <AccessToggle
                                icon={<Type className="w-4 h-4" />}
                                label="Large Text"
                                active={accessibilityMode.largeText}
                                onClick={() => toggleAccessibility('largeText')}
                            />
                        </div>
                    </div>
                </div>
            )}
        </nav>

    );
}

function NavLink({ to, label, active = false }: { to: string, label: string, active?: boolean }) {
    return (
        <Link
            to={to}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${active
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                }`}
        >
            {label}
        </Link>
    );
}

function MobileLink({ to, label, active = false, onClick }: { to: string, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={`px-4 py-3 rounded-xl text-base font-bold transition-all ${active
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 outline-none'
                }`}
        >
            {label}
        </Link>
    );
}

function AccessToggle({ icon, label, active, onClick }: { icon: ReactNode, label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                }`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-bold">{label}</span>
            </div>
            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
        </button>
    );
}
