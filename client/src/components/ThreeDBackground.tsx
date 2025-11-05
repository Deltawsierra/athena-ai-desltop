import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Animated particle field
function ParticleField({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 2500;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 12 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
      
      const colorChoice = Math.random();
      if (colorChoice > 0.6) {
        colors[i3] = 0.02; colors[i3 + 1] = 0.71; colors[i3 + 2] = 0.83;
      } else if (colorChoice > 0.3) {
        colors[i3] = 0.93; colors[i3 + 1] = 0.28; colors[i3 + 2] = 0.6;
      } else {
        colors[i3] = 0.66; colors[i3 + 1] = 0.33; colors[i3 + 2] = 0.97;
      }
    }
    
    return { positions: pos, colors };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = posArray[i3];
      const z = posArray[i3 + 2];
      posArray[i3 + 1] += Math.sin(time * 0.5 + x * 0.1) * 0.02 + Math.cos(time * 0.3 + z * 0.1) * 0.02;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.0005 + mouseX * 0.001;
    pointsRef.current.rotation.x += -mouseY * 0.0005;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={positions.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Animated geometric meshes
function GeometricMeshes({ mouseX, mouseY, scrollY }: { mouseX: number; mouseY: number; scrollY: number }) {
  const sphere1 = useRef<THREE.Mesh>(null);
  const sphere2 = useRef<THREE.Mesh>(null);
  const torus = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scroll = scrollY * 0.01;
    
    if (sphere1.current) {
      sphere1.current.rotation.x = t * 0.2;
      sphere1.current.rotation.y = t * 0.3;
      sphere1.current.position.x = Math.sin(t * 0.5) * 3 + mouseX * 2;
      sphere1.current.position.y = Math.cos(t * 0.5) * 2 + mouseY * 2 - scroll;
    }
    
    if (sphere2.current) {
      sphere2.current.rotation.x = t * -0.3;
      sphere2.current.rotation.z = t * 0.2;
      sphere2.current.position.x = Math.cos(t * 0.4) * 4 - mouseX * 1.5;
      sphere2.current.position.y = Math.sin(t * 0.6) * 3 - mouseY * 1.5 - scroll * 1.5;
    }
    
    if (torus.current) {
      torus.current.rotation.x = t * 0.4;
      torus.current.rotation.y = t * 0.2;
      torus.current.position.x = mouseX * -2;
      torus.current.position.y = mouseY * -2 - scroll * 0.8;
    }
  });

  return (
    <>
      <mesh ref={sphere1} position={[3, 0, -8]}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.5}
          metalness={1}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>

      <mesh ref={sphere2} position={[-4, 2, -10]}>
        <sphereGeometry args={[1.2, 64, 64]} />
        <meshStandardMaterial
          color="#ec4899"
          emissive="#ec4899"
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.15}
          transparent
          opacity={0.6}
        />
      </mesh>

      <mesh ref={torus} position={[0, -1, -6]}>
        <torusGeometry args={[2.2, 0.5, 32, 100]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.7}
          metalness={1}
          roughness={0.2}
          transparent
          opacity={0.5}
          wireframe
        />
      </mesh>
    </>
  );
}

// Animated grid
function AnimatedGrid({ scrollY }: { scrollY: number }) {
  const gridRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = -8 + scrollY * 0.005;
      gridRef.current.rotation.z = state.clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <mesh ref={gridRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
      <planeGeometry args={[60, 60, 60, 60]} />
      <meshBasicMaterial
        color="#06b6d4"
        wireframe
        transparent
        opacity={0.12}
      />
    </mesh>
  );
}

// Lights
function Lights({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    if (light1.current) {
      light1.current.position.x = Math.sin(t * 0.5) * 12 + mouseX * 4;
      light1.current.position.y = Math.cos(t * 0.3) * 8 + mouseY * 3;
      light1.current.intensity = 1.5 + Math.sin(t * 2) * 0.3;
    }
    
    if (light2.current) {
      light2.current.position.x = Math.cos(t * 0.4) * 12 - mouseX * 3;
      light2.current.position.y = Math.sin(t * 0.6) * 8 - mouseY * 3;
      light2.current.intensity = 1.2 + Math.cos(t * 1.5) * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight ref={light1} color="#06b6d4" distance={25} decay={2} />
      <pointLight ref={light2} color="#ec4899" distance={20} decay={2} />
      <spotLight position={[0, 12, 0]} angle={0.5} penumbra={1} intensity={0.8} color="#a855f7" />
    </>
  );
}

// Scene component
function Scene({ mouseX, mouseY, scrollY }: { mouseX: number; mouseY: number; scrollY: number }) {
  return (
    <>
      <Lights mouseX={mouseX} mouseY={mouseY} />
      <ParticleField mouseX={mouseX} mouseY={mouseY} />
      <GeometricMeshes mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />
      <AnimatedGrid scrollY={scrollY} />
      <Stars radius={120} depth={60} count={6000} factor={4} saturation={0} fade speed={1.2} />
    </>
  );
}

export default function ThreeDBackground() {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX((e.clientX / window.innerWidth) * 2 - 1);
      setMouseY(-((e.clientY / window.innerHeight) * 2 - 1));
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10" data-testid="threed-background">
      <Canvas
        camera={{ position: [0, 0, 18], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#0a0f1e']} />
        <fog attach="fog" args={['#0a0f1e', 15, 45]} />
        <Scene mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />
      </Canvas>
      
      <div className="absolute inset-0 bg-gradient-to-b from-background/65 via-background/45 to-background/65 pointer-events-none" />
    </div>
  );
}
