import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseTest() {
    const [hospitals, setHospitals] = useState<{ id: string; name: string; address: string }[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHospitals() {
            const { data, error } = await supabase.from('hospitals').select('*');
            if (error) {
                setError(error.message);
            } else {
                setHospitals(data || []);
            }
        }
        fetchHospitals();
    }, []);

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-bold mb-2">Supabase Connection Test</h2>
            {error && <p className="text-red-500">Error: {error}</p>}
            {hospitals.length === 0 && !error && <p>No hospitals found or loading...</p>}
            <ul>
                {hospitals.map((hospital) => (
                    <li key={hospital.id} className="mb-1">
                        <strong>{hospital.name}</strong> - {hospital.address}
                    </li>
                ))}
            </ul>
        </div>
    );
}
