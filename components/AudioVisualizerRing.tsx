import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus } from '@react-three/drei';
import * as THREE from 'three';

interface AudioVisualizerRingProps {
    audioLevel: number; // 0 to 1
}

const AudioVisualizerRing: React.FC<AudioVisualizerRingProps> = ({ audioLevel }) => {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (ringRef.current) {
            // Rotation
            ringRef.current.rotation.z += delta * 0.2;
            ringRef.current.rotation.x += delta * 0.1;

            // Pulse Scale based on Audio
            // Base scale 1.2, adds up to 0.8 scale based on audio
            const targetScale = 1.2 + (audioLevel * 0.5);
            ringRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            // Dynamic Opacity/Intensity
            const material = ringRef.current.material as THREE.MeshStandardMaterial;
            if (material) {
                material.emissiveIntensity = 0.5 + (audioLevel * 2);
            }
        }
    });

    return (
        <Torus ref={ringRef} args={[1.8, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={0.5}
                transparent
                opacity={0.6}
                roughness={0}
                metalness={1}
            />
        </Torus>
    );
};

export default AudioVisualizerRing;
