import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useNavigationStore } from '../../store/useNavigationStore';
import { HOSPITAL_FLOOR_DATA, MOCK_PATHS } from '../../data/floorMapData';
import type { MapNode } from '../../data/floorMapData';
// import {
//     Users,
//     Activity,
//     Pill,
//     Shield,
//     Coffee,
//     Stethoscope,
//     UserCircle2,
//     ArrowUp,
//     Map
// } from 'lucide-react';

interface HospitalFloorMapProps {
    floor: number;
    userLocation: string | null;
    destination: string | null;
    onNodeClick: (node: MapNode) => void;
    currentPath?: string[]; // Array of node IDs
}

export function HospitalFloorMap({ floor, userLocation, destination, onNodeClick }: HospitalFloorMapProps) {
    const nodes = HOSPITAL_FLOOR_DATA[floor] || [];

    // Calculate lines between nodes for grid effect
    const gridLines = useMemo(() => {
        const lines = [];
        for (let i = 1; i < 10; i++) {
            lines.push(<line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />);
            lines.push(<line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />);
        }
        return lines;
    }, []);

    // Helper to get Node by ID
    const getNode = (id: string) => Object.values(HOSPITAL_FLOOR_DATA).flat().find(n => n.id === id);

    // Accessibility Simulation
    const { accessibilityMode } = useNavigationStore();

    useEffect(() => {
        if (!userLocation || !destination) return;

        if (accessibilityMode.wheelchair) {
            toast.info("Route updated: Avoiding stairs (Elevator priority)", { position: 'bottom-center', duration: 3000 });
        }
        if (accessibilityMode.avoidCrowds) {
            toast.success("Route updated: Avoiding high-traffic zones", { position: 'bottom-center', duration: 3000 });
        }
    }, [userLocation, destination, accessibilityMode.wheelchair, accessibilityMode.avoidCrowds]);

    const renderPath = () => {
        if (!userLocation || !destination) return null;

        const startNode = getNode(userLocation);
        const endNode = getNode(destination);

        // Only render if both on current floor for simple simulation
        if (!startNode || !endNode) return null;

        // Check local path keys
        const pathKey = `${startNode.id}-to-${endNode.id}`;
        const reverseKey = `${endNode.id}-to-${startNode.id}`;

        let d = "";

        if (startNode.floor === floor && endNode.floor === floor) {
            d = MOCK_PATHS[pathKey] || MOCK_PATHS[reverseKey] || `M ${startNode.x} ${startNode.y} L ${endNode.x} ${endNode.y}`;
        } else if (startNode.floor === floor && endNode.floor !== floor) {
            // Go to nearest elevator on this floor
            const elevator = nodes.find(n => n.type === 'Elevator');
            if (elevator) {
                d = `M ${startNode.x} ${startNode.y} L ${elevator.x} ${elevator.y}`;
            }
        } else if (startNode.floor !== floor && endNode.floor === floor) {
            // Came from elevator
            const elevator = nodes.find(n => n.type === 'Elevator');
            if (elevator) {
                d = `M ${elevator.x} ${elevator.y} L ${endNode.x} ${endNode.y}`;
            }
        }

        if (!d) return null;

        return (
            <path
                d={d}
                stroke={accessibilityMode.wheelchair ? "#3b82f6" : "#22c55e"} // Blue for wheelchair, Green normal
                strokeWidth={accessibilityMode.highContrast ? "1.5" : "0.8"} // Thicker for high contrast
                fill="none"
                strokeLinecap="round"
                strokeDasharray="4 2"
                className="animate-dash" // Custom or keyframe animation needed in CSS
            >
                <animate
                    attributeName="stroke-dashoffset"
                    from="100"
                    to="0"
                    dur={accessibilityMode.reducedMotion ? "0s" : "2s"}
                    repeatCount="indefinite"
                />
            </path>
        );
    };

    return (
        <div className="relative w-full h-full bg-slate-950/50 backdrop-blur-xl overflow-hidden rounded-3xl border border-white/5 shadow-2xl">
            {/* SVG MAP LAYER */}
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Grid */}
                {gridLines}

                {/* Active Path */}
                {renderPath()}

                {/* Nodes */}
                {nodes.map(node => {
                    const isDestination = node.id === destination;
                    const isStart = node.id === userLocation;
                    const isEmergency = node.type === 'Emergency';

                    return (
                        <g
                            key={node.id}
                            onClick={() => onNodeClick(node)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            {/* Animated Pulse for Important Nodes */}
                            {(isDestination || isStart || isEmergency) && (
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r="6"
                                    fill="url(#nodeGlow)"
                                    className="animate-pulse"
                                />
                            )}

                            {/* Node Dot */}
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r="2.5"
                                fill="#0f172a"
                                stroke={isDestination ? '#22c55e' : (isEmergency ? '#ef4444' : '#6366f1')}
                                strokeWidth="0.8"
                            />
                        </g>
                    );
                })}

                {/* User Position Marker */}
                {userLocation && getNode(userLocation)?.floor === floor && (
                    <g>
                        <circle
                            cx={getNode(userLocation)?.x}
                            cy={getNode(userLocation)?.y}
                            r="1.5"
                            fill="#fff"
                            className="animate-ping origin-center"
                        />
                        <circle
                            cx={getNode(userLocation)?.x}
                            cy={getNode(userLocation)?.y}
                            r="1.2"
                            fill="#3b82f6"
                            stroke="#fff"
                            strokeWidth="0.2"
                        />
                    </g>
                )}
            </svg>

            {/* HTML OVERLAYS for Labels */}
            {nodes.map(node => (
                <div
                    key={`label-${node.id}`}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: `${node.x}%`, top: `${node.y - 5}%` }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`
                            px-2 py-1 rounded shadow-lg whitespace-nowrap text-[8px] font-bold uppercase tracking-wider
                            ${node.id === destination ? 'bg-emerald-500 text-slate-900' : 'bg-slate-900 border border-white/10 text-slate-400'}
                        `}
                    >
                        {node.label}
                        {/* Crowd Indicator */}
                        <div className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full border border-slate-900 ${node.crowdLevel === 'High' ? 'bg-rose-500' :
                            node.crowdLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                    </motion.div>
                </div>
            ))}
        </div>
    );
}
