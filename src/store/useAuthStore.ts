import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    session: Session | null;
    userRole: 'admin' | 'doctor' | 'patient' | null;
    loading: boolean;
    initialized: boolean;
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    initialize: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    userRole: null,
    loading: true,
    initialized: false,
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session }),
    initialize: async () => {
        try {
            set({ loading: true });
            const { data: { session } } = await supabase.auth.getSession();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let role: any = session?.user?.user_metadata?.role || null;

            // Fallback to profiles table if metadata is missing (legacy)
            if (session?.user && !role) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();
                role = profile?.role || 'patient';
            }

            set({
                session,
                user: session?.user ?? null,
                userRole: role,
                initialized: true,
                loading: false
            });

            supabase.auth.onAuthStateChange(async (_event, session) => {
                let currentRole = session?.user?.user_metadata?.role || null;

                if (session?.user && !currentRole) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();
                    currentRole = profile?.role || 'patient';
                }

                set({
                    session,
                    user: session?.user ?? null,
                    userRole: currentRole,
                    loading: false
                });
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ loading: false, initialized: true });
        }
    },
    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
    },
}));
