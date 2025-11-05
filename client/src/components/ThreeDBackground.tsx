import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, MeshDistortMaterial, Float, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Particle field that responds to cursor and waves
function ParticleField({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 3000;

  const particleData = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create a layered field
      const layer = Math.floor(Math.random() * 3);
      const radius = 15 + layer * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Color variation (cyan, magenta, purple)
      const colorRand = Math.random();
      if (colorRand > 0.65) {
        colors[i3] = 0.02; colors[i3 + 1] = 0.71; colors[i3 + 2] = 0.83; // Cyan
      } else if (colorRand > 0.35) {
        colors[i3] = 0.93; colors[i3 + 1] = 0.28; colors[i3 + 2] = 0.6; // Magenta
      } else {
        colors[i3] = 0.66; colors[i3 + 1] = 0.33; colors[i3 + 2] = 0.97; // Purple
      }
    }
    
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Animate particles with waves and cursor influence
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const z = positions[i3 + 2];
      
      // Complex wave motion
      const wave1 = Math.sin(time * 0.5 + x * 0.08) * 1.5;
      const wave2 = Math.cos(time * 0.3 + z * 0.08) * 1.5;
      const cursorInfluence = Math.sin(time + i * 0.01) * (mouseX * 0.5 + mouseY * 0.5);
      
      positions[i3 + 1] += (wave1 + wave2 + cursorInfluence - positions[i3 + 1]) * 0.02;
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate entire field based on cursor
    const targetRotationY = mouseX * 0.4;
    const targetRotationX = -mouseY * 0.3;
    pointsRef.current.rotation.y += (targetRotationY - pointsRef.current.rotation.y) * 0.03;
    pointsRef.current.rotation.x += (targetRotationX - pointsRef.current.rotation.x) * 0.03;
    
    // Auto rotation
    pointsRef.current.rotation.z = time * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particleData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Animated 3D geometric shapes
function GeometricShapes({ mouseX, mouseY, scrollY }: { mouseX: number; mouseY: number; scrollY: number }) {
  const sphere1Ref = useRef<THREE.Mesh>(null);
  const sphere2Ref = useRef<THREE.Mesh>(null);
  const torusRef = useRef<THREE.Mesh>(null);
  const icosahedronRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const scrollOffset = scrollY * 0.01;
    
    // Main distorted sphere
    if (sphere1Ref.current) {
      sphere1Ref.current.rotation.x = time * 0.15;
      sphere1Ref.current.rotation.y = time * 0.2;
      sphere1Ref.current.position.x = Math.sin(time * 0.4) * 4 + mouseX * 3;
      sphere1Ref.current.position.y = Math.cos(time * 0.3) * 2 + mouseY * 2 - scrollOffset * 2;
      sphere1Ref.current.position.z = -8 + Math.sin(time * 0.2) * 2;
    }
    
    // Magenta sphere
    if (sphere2Ref.current) {
      sphere2Ref.current.rotation.x = time * -0.25;
      sphere2Ref.current.rotation.z = time * 0.15;
      sphere2Ref.current.position.x = Math.cos(time * 0.5) * 5 - mouseX * 2;
      sphere2Ref.current.position.y = Math.sin(time * 0.4) * 3 - mouseY * 2 - scrollOffset * 1.5;
      sphere2Ref.current.position.z = -12 + Math.cos(time * 0.3) * 3;
    }
    
    // Wireframe torus
    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.3;
      torusRef.current.rotation.y = time * 0.2;
      torusRef.current.position.x = mouseX * -2.5;
      torusRef.current.position.y = mouseY * -2 - scrollOffset;
      torusRef.current.position.z = -6;
    }
    
    // Icosahedron
    if (icosahedronRef.current) {
      icosahedronRef.current.rotation.x = time * 0.1;
      icosahedronRef.current.rotation.y = time * -0.15;
      icosahedronRef.current.position.x = Math.sin(time * 0.6) * 6 + mouseX * 1.5;
      icosahedronRef.current.position.y = -3 + mouseY * 1.5 - scrollOffset * 0.8;
      icosahedronRef.current.position.z = -10;
    }
  });

  return (
    <>
      {/* Main cyan distorted sphere */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
        <Sphere ref={sphere1Ref} args={[1.8, 128, 128]} position={[4, 0, -8]}>
          <MeshDistortMaterial
            color="#06b6d4"
            attach="material"
            distort={0.6}
            speed={3}
            roughness={0.1}
            metalness={1}
            emissive="#06b6d4"
            emissiveIntensity={0.5}
            transparent
            opacity={0.75}
          />
        </Sphere>
      </Float>

      {/* Magenta distorted sphere */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.9}>
        <Sphere ref={sphere2Ref} args={[1.4, 128, 128]} position={[-5, 2, -12]}>
          <MeshDistortMaterial
            color="#ec4899"
            attach="material"
            distort={0.5}
            speed={2.5}
            roughness={0.15}
            metalness={0.95}
            emissive="#ec4899"
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </Sphere>
      </Float>

      {/* Purple wireframe torus */}
      <mesh ref={torusRef} position={[0, -1, -6]}>
        <torusGeometry args={[2.5, 0.6, 32, 100]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.7}
          roughness={0.2}
          metalness={1}
          transparent
          opacity={0.6}
          wireframe
        />
      </mesh>

      {/* Icosahedron */}
      <mesh ref={icosahedronRef} position={[6, -3, -10]}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.9}
          transparent
          opacity={0.5}
          wireframe
        />
      </mesh>
    </>
  );
}

// Animated grid planes
function AnimatedGrids({ scrollY }: { scrollY: number }) {
  const floorGridRef = useRef<THREE.Mesh>(null);
  const backGridRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (floorGridRef.current) {
      floorGridRef.current.position.y = -8 + scrollY * 0.008;
      floorGridRef.current.rotation.z = time * 0.01;
    }
    
    if (backGridRef.current) {
      backGridRef.current.position.z = -20 - scrollY * 0.005;
      backGridRef.current.rotation.z = time * 0.015;
    }
  });

  return (
    <>
      {/* Floor grid */}
      <mesh ref={floorGridRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[80, 80, 80, 80]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Back wall grid */}
      <mesh ref={backGridRef} rotation={[0, 0, 0]} position={[0, 0, -20]}>
        <planeGeometry args={[80, 80, 80, 80]} />
        <meshBasicMaterial
          color="#ec4899"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>
    </>
  );
}

// Dynamic lighting
function DynamicLights({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (light1Ref.current) {
      light1Ref.current.position.x = Math.sin(time * 0.5) * 15 + mouseX * 5;
      light1Ref.current.position.y = Math.cos(time * 0.3) * 10 + mouseY * 3;
      light1Ref.current.position.z = Math.sin(time * 0.4) * 10;
      light1Ref.current.intensity = 2 + Math.sin(time * 2) * 0.5;
    }
    
    if (light2Ref.current) {
      light2Ref.current.position.x = Math.cos(time * 0.4) * 15 - mouseX * 4;
      light2Ref.current.position.y = Math.sin(time * 0.6) * 10 - mouseY * 3;
      light2Ref.current.position.z = Math.cos(time * 0.5) * 10;
      light2Ref.current.intensity = 1.5 + Math.cos(time * 1.5) * 0.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight ref={light1Ref} color="#06b6d4" intensity={2} distance={30} />
      <pointLight ref={light2Ref} color="#ec4899" intensity={1.5} distance={25} />
      <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} intensity={1} color="#a855f7" castShadow />
    </>
  );
}

// Camera controller
function CameraController({ mouseX, mouseY, scrollY }: { mouseX: number; mouseY: number; scrollY: number }) {
  const { camera } = useThree();

  useFrame(() => {
    // Smooth camera movement based on cursor and scroll
    const targetX = mouseX * 1.5;
    const targetY = mouseY * 1.5 + scrollY * 0.015;
    const targetZ = 20 - scrollY * 0.01;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.02;
    
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main 3D scene
function Scene({ mouseX, mouseY, scrollY }: { mouseX: number; mouseY: number; scrollY: number }) {
  return (
    <>
      <DynamicLights mouseX={mouseX} mouseY={mouseY} />
      <ParticleField mouseX={mouseX} mouseY={mouseY} />
      <GeometricShapes mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />
      <AnimatedGrids scrollY={scrollY} />
      <Stars radius={150} depth={80} count={8000} factor={5} saturation={0} fade speed={1.5} />
      <CameraController mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom 
          intensity={1.8} 
          luminanceThreshold={0.15} 
          luminanceSmoothing={0.9} 
          height={300}
        />
        <DepthOfField 
          focusDistance={0.01} 
          focalLength={0.02} 
          bokehScale={3} 
        />
        <ChromaticAberration 
          blendFunction={BlendFunction.NORMAL}
          offset={[0.001, 0.001]}
        />
      </EffectComposer>
    </>
  );
}

export default function ThreeDBackground() {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 range
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
        camera={{ position: [0, 0, 20], fov: 75 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0a0f1e']} />
        <fog attach="fog" args={['#0a0f1e', 20, 50]} />
        
        <Scene mouseX={mouseX} mouseY={mouseY} scrollY={scrollY} />
      </Canvas>
      
      {/* Gradient overlay for content readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 pointer-events-none" />
    </div>
  );
}
