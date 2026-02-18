import type { Department } from '../../../types';

interface DepartmentListProps {
    departments: Department[];
}

export default function DepartmentList({ departments }: DepartmentListProps) {
    if (departments.length === 0) {
        return <p className="text-gray-500 italic">No departments listed.</p>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {departments.map((dept) => (
                <div key={dept.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow flex items-center justify-center text-center">
                    <p className="font-medium text-gray-800 dark:text-slate-200">{dept.name}</p>
                </div>
            ))}
        </div>
    );
}
