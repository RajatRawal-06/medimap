import type { Hospital } from '../../../types';


interface HospitalCardProps {
    hospital: Hospital;
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
    const rating = '4.5'; // Static mock rating for demo

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
            <div className="h-48 bg-gray-200 relative group">
                {hospital.image_url ? (
                    <img
                        src={hospital.image_url}
                        alt={hospital.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">
                        <span className="text-4xl">🏥</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1">
                    <span>⭐</span> {rating}
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{hospital.name}</h3>
                <p className="text-gray-500 mb-4 text-sm flex items-center gap-1">
                    📍 {hospital.address || 'Address not available'}
                </p>

                <div className="mt-auto flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
                        Details
                    </button>
                    <button className="flex-1 bg-white text-blue-600 border border-blue-200 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium">
                        Navigate
                    </button>
                </div>
            </div>
        </div>
    );
}

