import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Hospital } from '../../../types';

import HospitalCard from './HospitalCard';

export default function HospitalList() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHospitals() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('hospitals')
                    .select('*')
                    .order('name');

                if (error) throw error;

                setHospitals(data || []);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to fetch hospitals');
            } finally {
                setLoading(false);
            }
        }

        fetchHospitals();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-200 h-80 rounded-lg"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-600 bg-red-50 rounded-lg border border-red-200">
                <p className="font-semibold">Error loading hospitals</p>
                <p className="text-sm">{error}</p>
            </div>
        );
    }

    if (hospitals.length === 0) {
        return (
            <div className="text-center p-8 text-gray-500">
                <p>No hospitals found.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
        </div>
    );
}
