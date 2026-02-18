import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Doctor } from '../../../types';

import DoctorCard from './DoctorCard';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default function DoctorSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [specialty, setSpecialty] = useState('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hardcoded specialties for now (could be fetched from DB)
    const specialties = ['Cardiologist', 'Neurologist', 'Pediatrician', 'General Practitioner', 'Dermatologist'];

    useEffect(() => {
        async function searchDoctors() {
            try {
                setLoading(true);
                setError(null);

                let query = supabase
                    .from('doctors')
                    .select(`
            *,
            hospitals (
              name
            )
          `);

                if (debouncedSearchTerm) {
                    query = query.or(`name.ilike.%${debouncedSearchTerm}%`);
                }

                if (specialty) {
                    query = query.ilike('specialization', `%${specialty}%`);
                }

                const { data, error } = await query;

                if (error) throw error;
                setDoctors(data || []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to search doctors');
            } finally {
                setLoading(false);
            }
        }

        searchDoctors();
    }, [debouncedSearchTerm, specialty]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Search doctors by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
                </div>

                <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[200px]"
                >
                    <option value="">All Specialties</option>
                    {specialties.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {loading && (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                    Error: {error}
                </div>
            )}

            {!loading && !error && doctors.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">No doctors found matching your criteria.</p>
                    <button
                        onClick={() => { setSearchTerm(''); setSpecialty(''); }}
                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Clear filters
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
            </div>
        </div>
    );
}

