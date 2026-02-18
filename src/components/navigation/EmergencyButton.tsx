import React from 'react';
import { useNavigationStore } from '../../store/useNavigationStore';
import { AlertTriangle, Siren } from 'lucide-react';

export const EmergencyButton: React.FC = () => {
    const { triggerEmergency } = useNavigationStore();

    return (
        <button
            onClick={triggerEmergency}
            className="fixed bottom-6 right-6 z-[100] group flex items-center gap-2 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-red-500/40 hover:bg-red-700 transition-all active:scale-95 animate-pulse hover:animate-none"
        >
            <div className="relative">
                <Siren className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
            </div>
            <div className="flex flex-col items-start leading-none">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Quick Action</span>
                <span className="text-sm font-black uppercase">Emergency</span>
            </div>
            <div className="ml-2 pl-4 border-l border-white/20">
                <AlertTriangle className="w-5 h-5 text-red-100" />
            </div>
        </button>
    );
};
