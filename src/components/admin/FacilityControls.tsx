
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hospital as HospitalIcon,
    Plus,
    Stethoscope,
    Settings2,
    Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export default function FacilityControls() {
    const [view, setView] = useState<'hospitals' | 'doctors'>('hospitals');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const table = view === 'hospitals' ? 'hospitals' : 'doctors';
            const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
            setItems(data || []);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10">
                    <button
                        onClick={() => setView('hospitals')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'hospitals' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'} `}
                    >
                        Hospitals
                    </button>
                    <button
                        onClick={() => setView('doctors')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'doctors' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'} `}
                    >
                        Doctors
                    </button>
                </div>

                <Button className="bg-white text-slate-950 hover:bg-slate-100 rounded-2xl flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add {view === 'hospitals' ? 'Hospital' : 'Doctor'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.03 }}
                        >
                            <Card className="backdrop-blur-md bg-white/5 border-white/10 group hover:border-indigo-500/50 transition-all">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            {view === 'hospitals' ? <HospitalIcon className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{item.name}</h4>
                                            <p className="text-xs text-slate-500 font-medium">
                                                {view === 'hospitals' ? item.address : item.specialization}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                            <Settings2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {loading && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Core Records...</span>
                </div>
            )}
        </div>
    );
}
