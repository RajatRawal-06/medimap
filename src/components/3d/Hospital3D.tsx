import { useMemo, useState } from 'react';
import { Text, Float } from '@react-three/drei';
import { useNavigationStore } from '../../store/useNavigationStore';

interface Hospital3DProps {
    onNodeClick?: (nodeId: string) => void;
    visibleFloor?: number;
}

export default function Hospital3D({ onNodeClick, visibleFloor = -1 }: Hospital3DProps) {
    const { nodes } = useNavigationStore();
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    const filteredNodes = useMemo(() => {
        return nodes.filter(node => visibleFloor === -1 || node.floorId === visibleFloor);
    }, [nodes, visibleFloor]);

    return (
        <group>
            {filteredNodes.map((node) => {
                const isHovered = hoveredNode === node.id;
                const isRoom = node.type === 'room' || node.type === 'emergency';
                const y = (node.floorId - 1) * 20;

                // Color mapping based on type
                const getColor = () => {
                    if (node.type === 'emergency') return '#f43f5e';
                    if (node.type === 'room') return '#6366f1';
                    if (node.type === 'elevator') return '#8b5cf6';
                    if (node.type === 'stairs') return '#ec4899';
                    return '#f1f5f9'; // corridor/path
                };

                const color = getColor();
                const isPath = (node.type as string) === 'path' || (node.type as string) === 'corridor';

                return (
                    <group key={node.id} position={[node.x - 50, y, node.y - 50]}>
                        <mesh
                            receiveShadow
                            castShadow={!isPath}
                            onClick={(e) => { e.stopPropagation(); onNodeClick?.(node.id); }}
                            onPointerOver={(e) => { e.stopPropagation(); setHoveredNode(node.id); }}
                            onPointerOut={() => setHoveredNode(null)}
                        >
                            <boxGeometry args={[isPath ? 6 : 10, isPath ? 0.5 : 4, isPath ? 6 : 10]} />
                            <meshStandardMaterial
                                color={isHovered ? '#ffffff' : color}
                                metalness={0.2}
                                roughness={0.8}
                                transparent
                                opacity={0.9}
                            />
                        </mesh>

                        {/* Architectural Accent for Rooms */}
                        {isRoom && (
                            <mesh position={[0, 4, 0]}>
                                <boxGeometry args={[10, 8, 10]} />
                                <meshStandardMaterial
                                    color={color}
                                    wireframe
                                    transparent
                                    opacity={isHovered ? 0.3 : 0.1}
                                />
                            </mesh>
                        )}

                        {/* Labels for important rooms */}
                        {node.label && (node.type as string) !== 'path' && (
                            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                                <Text
                                    position={[0, 8, 0]}
                                    fontSize={1.8}
                                    color="white"
                                    anchorX="center"
                                    anchorY="middle"
                                    outlineWidth={0.15}
                                    outlineColor="#1e1b4b"
                                >
                                    {node.label}
                                </Text>
                            </Float>
                        )}
                    </group>
                );
            })}

            {/* Ground Planes for each floor */}
            {Array.from(new Set(nodes.map(n => n.floorId))).map(floor => (
                <mesh
                    key={`ground-${floor}`}
                    position={[0, (floor - 1) * 20 - 0.5, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                >
                    <planeGeometry args={[120, 120]} />
                    <meshStandardMaterial
                        color="#0f172a"
                        transparent
                        opacity={visibleFloor === -1 || visibleFloor === floor ? 0.1 : 0.02}
                    />
                </mesh>
            ))}
        </group>
    );
}
