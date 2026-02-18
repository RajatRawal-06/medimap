import { Shield, Lock, Globe } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 text-white font-bold text-xl mb-4">
                            <span>🏥</span>
                            <span>MediMap</span>
                        </div>
                        <p className="max-w-sm text-sm leading-relaxed mb-6">
                            Government-approved medical navigation system designed to reduce hospital
                            congestion and improve patient outcomes through advanced AI guidance.
                        </p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                                <Shield className="w-3 h-3 text-emerald-500" />
                                Secure
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                                <Lock className="w-3 h-3 text-blue-500" />
                                HIPAA Compliant
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Resources</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Accessibility Statement</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Report Issue</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Admin</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p>© 2026 Department of Digital Health. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3" />
                            <span>Global Instance: Node-04</span>
                        </div>
                        <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                        <p>Version 2.4.0 (Redesign Build)</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
