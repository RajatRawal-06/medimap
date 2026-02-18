import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, Camera, ShieldCheck } from 'lucide-react';

interface QRScannerProps {
    onScan: (nodeId: string) => void;
    onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);

    const simulateScan = () => {
        setIsScanning(true);
        // Simulate a delay and then "detect" a node ID
        setTimeout(() => {
            onScan('node_main_entrance'); // Hardcoded for demo/simulator
            setIsScanning(false);
            onClose();
        }, 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-6"
        >
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-3 bg-slate-800 text-slate-400 rounded-full hover:text-white transition-colors z-10"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <QrCode className="w-10 h-10 text-indigo-500" />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Scan Entrance QR</h2>
                    <p className="text-slate-400 mb-12 font-medium leading-relaxed">
                        Locate the MediMap QR code at the facility entrance to automatically set your starting position.
                    </p>

                    <div className="relative aspect-square w-full max-w-[280px] mx-auto mb-12 border-2 border-dashed border-slate-700 rounded-3xl flex items-center justify-center group overflow-hidden">
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ y: "-100%" }}
                                    animate={{ y: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)] z-20"
                                />
                            )}
                        </AnimatePresence>

                        {!isScanning ? (
                            <div className="text-center">
                                <Camera className="w-12 h-12 text-slate-600 mx-auto mb-4 group-hover:text-indigo-500 transition-colors" />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Awaiting Lens</span>
                            </div>
                        ) : (
                            <div className="text-center">
                                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest animate-pulse">Analyzing Pattern...</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={simulateScan}
                        disabled={isScanning}
                        className="w-full bg-white text-slate-950 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                    >
                        {isScanning ? 'Scanning...' : 'Open Simulator'}
                    </button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
