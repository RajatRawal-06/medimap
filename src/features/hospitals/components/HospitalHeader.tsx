import type { Hospital } from '../../../types';

interface HospitalHeaderProps {
    hospital: Hospital;
}

export default function HospitalHeader({ hospital }: HospitalHeaderProps) {
    const rating = '4.5'; // Static mock rating for demo

    return (
        <div className="relative">
            <div className="h-64 md:h-80 w-full bg-gray-200 overflow-hidden rounded-xl">
                {hospital.image_url ? (
                    <img
                        src={hospital.image_url}
                        alt={hospital.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <span className="text-6xl">🏥</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white">
                <h1 className="text-3xl md:text-5xl font-bold mb-2">{hospital.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-200">
                    <span className="flex items-center gap-1">📍 {hospital.address}</span>
                    <span className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded border border-yellow-500/50 text-yellow-200">
                        ⭐ {rating} (120+ reviews)
                    </span>
                    <span className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded border border-green-500/50 text-green-200">
                        ✅ Accredited
                    </span>
                </div>
            </div>
        </div>
    );
}
