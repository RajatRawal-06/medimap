import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useState } from 'react';
import Hospital3D from './Hospital3D';
import Path3D from './Path3D';
import type { NavigationPath } from '../../navigation/types';

interface SceneContainerProps {
    onNodeClick?: (nodeId: string) => void;
    path?: NavigationPath | null;
}

export default function SceneContainer({ onNodeClick, path }: SceneContainerProps) {
    const [currentFloor, setCurrentFloor] = useState<number>(-1); // -1 = All visible
    const floors = [1, 2, 3];

    return (
        <div className="h-full w-full bg-slate-950 rounded-[2rem] overflow-hidden relative border border-white/5 shadow-2xl">
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
                <PerspectiveCamera makeDefault position={[80, 80, 80]} fov={45} />
                <OrbitControls
                    makeDefault
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 2.2}
                    enableDamping={true}
                    dampingFactor={0.05}
                    maxDistance={200}
                    minDistance={30}
                />

                <Suspense fallback={null}>
                    <Environment preset="night" />
                    <ambientLight intensity={0.2} />
                    <spotLight
                        position={[100, 200, 100]}
                        angle={0.15}
                        penumbra={1}
                        intensity={2}
                        castShadow
                    />

                    <Hospital3D onNodeClick={onNodeClick} visibleFloor={currentFloor} />
                    <Path3D path={path || null} visibleFloor={currentFloor} />

                    <ContactShadows
                        position={[0, -0.5, 0]}
                        opacity={0.4}
                        scale={150}
                        blur={2.5}
                        far={20}
                    />
                </Suspense>
            </Canvas>

            {/* Premium Floor Selector */}
            <div className="absolute top-8 right-8 flex flex-col gap-3 z-30 pointer-events-auto">
                <button
                    onClick={() => setCurrentFloor(-1)}
                    className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300 backdrop-blur-xl ${currentFloor === -1
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                        : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                >
                    Global View
                </button>
                <div className="w-full h-px bg-white/5 my-1" />
                {floors.map(floor => (
                    <button
                        key={floor}
                        onClick={() => setCurrentFloor(floor)}
                        className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-300 backdrop-blur-xl ${currentFloor === floor
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]'
                            : 'bg-slate-900/40 border-white/5 text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Level 0{floor}
                    </button>
                ))}
            </div>
        </div>
    );
}
