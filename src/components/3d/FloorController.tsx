// import { useNavigationStore } from '../../store/useNavigationStore';

interface FloorControllerProps {
    floors: number[];
    currentFloor: number;
    onFloorChange: (floor: number) => void;
}

export default function FloorController({ floors, currentFloor, onFloorChange }: FloorControllerProps) {
    return (
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg flex flex-col gap-2 z-10">
            <span className="text-xs font-bold text-gray-500 uppercase text-center">Floors</span>
            {floors.map(floor => (
                <button
                    key={floor}
                    onClick={() => onFloorChange(floor)}
                    className={`w-10 h-10 rounded-full font-bold transition-colors ${currentFloor === floor
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {floor}
                </button>
            ))}
            <button
                onClick={() => onFloorChange(-1)} // -1 for all
                className={`w-10 h-10 rounded-full font-bold text-xs transition-colors ${currentFloor === -1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
            >
                ALL
            </button>
        </div>
    );
}
