import type { Doctor } from '../../../types';


interface DoctorCardProps {
    doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
                    <p className="text-blue-600 dark:text-indigo-400 font-medium text-sm">{doctor.specialization}</p>
                    {doctor.hospitals && (
                        <p className="text-gray-500 text-xs mt-1">
                            📍 {doctor.hospitals.name}
                        </p>
                    )}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${doctor.availability_status === 'available'
                    ? 'bg-green-100 dark:bg-emerald-500/10 text-green-800 dark:text-emerald-400'
                    : 'bg-red-100 dark:bg-rose-500/10 text-red-800 dark:text-rose-400'
                    }`}>
                    {doctor.availability_status === 'available' ? 'Available' : 'Busy'}
                </div>
            </div>
            <button className="mt-4 w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
                Book Appointment
            </button>
        </div>
    );
}
