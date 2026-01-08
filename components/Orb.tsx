import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, Vector3, MathUtils } from 'three';
import { AssistantState } from '../types';

interface OrbProps {
  state: AssistantState;
  audioLevel: number;
}

const Orb: React.FC<OrbProps> = ({ state, audioLevel }) => {
  const meshRef = useRef<Mesh>(null);
  const innerRef = useRef<Mesh>(null);

  // Base colors
  const idleColor = new Color('#3b82f6'); // Blue (Idle)
  const listeningColor = new Color('#ef4444'); // Red (Listening)
  const speakingColor = new Color('#06b6d4'); // Cyan (Speaking/Processing)
  const thinkingColor = new Color('#10b981'); // Green (Alternate Processing)
  const errorColor = new Color('#f59e0b'); // Amber

  const targetColor = useMemo(() => {
    switch (state) {
      case AssistantState.LISTENING: return listeningColor;
      case AssistantState.SPEAKING: return speakingColor;
      case AssistantState.PROCESSING: return speakingColor; // reuse cyan or use green
      case AssistantState.THINKING: return thinkingColor;
      case AssistantState.ERROR: return errorColor;
      default: return idleColor;
    }
  }, [state]);

  useFrame((rootState, delta) => {
    if (!meshRef.current || !innerRef.current) return;

    // Smooth color transition
    // @ts-ignore - material.color exists
    meshRef.current.material.color.lerp(targetColor, delta * 2);
    // @ts-ignore
    innerRef.current.material.color.lerp(targetColor, delta * 2);

    // Idle rotation
    meshRef.current.rotation.y += delta * 0.2;
    meshRef.current.rotation.z += delta * 0.1;
    innerRef.current.rotation.y -= delta * 0.3;

    // React to Audio
    // When speaking or listening, the orb pulses more aggressively
    const baseScale = 1.5;
    const pulseIntensity = (state === AssistantState.SPEAKING || state === AssistantState.LISTENING) ? 1.5 : 0.2;
    const currentScale = baseScale + (audioLevel * pulseIntensity);

    const scale = MathUtils.lerp(meshRef.current.scale.x, currentScale, delta * 10);
    meshRef.current.scale.set(scale, scale, scale);

    // Inner orb spins faster when active
    const activeSpeed = (state === AssistantState.IDLE) ? 0 : 2;
    innerRef.current.rotation.x += delta * activeSpeed * audioLevel;

  });

  return (
    <group>
      {/* Outer Shell - Glassy */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <meshPhysicalMaterial
          roughness={0}
          transmission={1}
          thickness={2.5} // refraction
          ior={1.52}
          reflectivity={0.5}
          iridescence={1}
          iridescenceIOR={1.3}
          clearcoat={1}
        />
      </mesh>

      {/* Inner Core - Emissive */}
      <mesh ref={innerRef} scale={0.5}>
        <octahedronGeometry args={[1, 2]} />
        <meshBasicMaterial
          wireframe={true}
          color="#ffffff"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Point light inside for glow */}
      <pointLight
        color={targetColor}
        intensity={5}
        distance={10}
        decay={2}
      />
    </group>
  );
};

export default Orb;
