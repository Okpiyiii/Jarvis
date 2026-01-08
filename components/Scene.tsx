import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import Orb from './Orb';
import AudioVisualizerRing from './AudioVisualizerRing';
import { AssistantState } from '../types';

interface SceneProps {
  state: AssistantState;
  audioLevel: number;
}

const Scene: React.FC<SceneProps> = ({ state, audioLevel }) => {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: false }}>
        <color attach="background" args={['#050505']} />

        <Suspense fallback={null}>
          <Environment preset="city" />

          <group position={[0, 0, 0]}>
            <Orb state={state} audioLevel={audioLevel} />
            <AudioVisualizerRing audioLevel={audioLevel} />
          </group>

          <Sparkles
            count={100}
            scale={10}
            size={2}
            speed={0.4}
            opacity={0.5}
            color={state === AssistantState.ERROR ? '#ff0000' : '#00ffff'}
          />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          <EffectComposer>
            <Bloom luminanceThreshold={0.8} mipmapBlur intensity={1.5} radius={0.5} />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
      </Canvas>
    </div>
  );
};

export default Scene;
