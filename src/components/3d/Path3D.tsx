import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNavigationStore } from '../../store/useNavigationStore';
import type { NavigationPath } from '../../navigation/types';

interface Path3DProps {
    path: NavigationPath | null;
    visibleFloor?: number;
}

export default function Path3D({ path, visibleFloor = -1 }: Path3DProps) {
    const { currentStepIndex } = useNavigationStore();
    const tubeMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
    const indicatorRef = useRef<THREE.Group>(null);

    const pathCurve = useMemo(() => {
        if (!path || path.steps.length < 2) return null;

        const points = path.steps.map(step => {
            const x = step.x - 50;
            const z = step.y - 50;
            const y = (step.floorId - 1) * 20 + 2;
            return new THREE.Vector3(x, y, z);
        });

        return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.1);
    }, [path]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        if (tubeMaterialRef.current) {
            tubeMaterialRef.current.emissiveIntensity = 1 + Math.sin(t * 4) * 0.5;
            // Animated texture offset for "flow" effect
            if (tubeMaterialRef.current.map) {
                tubeMaterialRef.current.map.offset.x = -t * 0.5;
            }
        }

        // Animate indicator following the path step
        if (indicatorRef.current && pathCurve && path) {
            const progress = currentStepIndex / (path.steps.length - 1 || 1);
            const targetPos = pathCurve.getPointAt(progress);
            indicatorRef.current.position.lerp(targetPos, 0.1);
        }
    });

    if (!pathCurve) return null;

    const isVisible = visibleFloor === -1 || path?.steps.some(s => s.floorId === visibleFloor);
    if (!isVisible) return null;

    return (
        <group>
            <mesh>
                <tubeGeometry args={[pathCurve, 128, 0.6, 12, false]} />
                <meshStandardMaterial
                    ref={tubeMaterialRef}
                    color="#6366f1"
                    emissive="#6366f1"
                    emissiveIntensity={1}
                    transparent
                    opacity={0.8}
                    metalness={0.5}
                    roughness={0.2}
                />
            </mesh>

            {/* Walking Indicator */}
            <group ref={indicatorRef}>
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial
                        color="#10b981"
                        emissive="#10b981"
                        emissiveIntensity={2}
                    />
                </mesh>
                <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2, 2.5, 32]} />
                    <meshBasicMaterial color="#10b981" transparent opacity={0.5} />
                </mesh>
            </group>
        </group>
    );
}
