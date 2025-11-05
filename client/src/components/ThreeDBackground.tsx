import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

function NetworkParticles({ count = 2000 }) {
  const meshRef = useRef<THREE.Points>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const radius = Math.random() * 15 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const colorChoice = Math.random();
      if (colorChoice > 0.6) {
        colors[i3] = 0.02;
        colors[i3 + 1] = 0.71;
        colors[i3 + 2] = 0.83;
      } else if (colorChoice > 0.3) {
        colors[i3] = 0.93;
        colors[i3 + 1] = 0.28;
        colors[i3 + 2] = 0.6;
      } else {
        colors[i3] = 0.5;
        colors[i3 + 1] = 0.2;
        colors[i3 + 2] = 0.9;
      }
    }

    return { positions, colors };
  }, [count]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
    }

    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 10;
      lightRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.5) * 10;
    }
  });

  return (
    <group>
      <Points ref={meshRef} positions={particles.positions} stride={3}>
        <PointMaterial
          transparent
          vertexColors
          size={0.15}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </Points>

      <pointLight ref={lightRef} position={[10, 10, 10]} intensity={1} color="#06b6d4" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#8b5cf6" />
    </group>
  );
}

function NetworkGrid() {
  const gridRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={gridRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
        <planeGeometry args={[50, 50, 50, 50]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.1}
        />
      </mesh>
      <mesh rotation={[0, 0, 0]} position={[0, 0, -15]}>
        <planeGeometry args={[50, 50, 50, 50]} />
        <meshBasicMaterial
          color="#ec4899"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

export default function ThreeDBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-40">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['transparent']} />
        <fog attach="fog" args={['#000', 10, 50]} />

        <ambientLight intensity={0.1} />

        <NetworkParticles count={2000} />
        <NetworkGrid />

        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            height={300}
          />
        </EffectComposer>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate
          autoRotateSpeed={0.2}
        />
      </Canvas>
    </div>
  );
}
