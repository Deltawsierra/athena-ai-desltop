/**
 * The threat field.
 *
 * A rotating globe of the estate, with one node per monitored site and an arc
 * for every finding tying that site back to the core. It is the first thing
 * on the dashboard, so it has to earn the space: every mark on it is bound to
 * a real record, and when there are no records it says so rather than
 * animating an invented estate.
 *
 * That constraint is the whole design. A demo that renders forty glowing
 * threat vectors against an empty database is a lie told in WebGL, and the
 * person being demoed to usually asks what the dots are.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface FieldNode {
  id: string;
  /** What this node is called in the record it came from. */
  label: string;
  /** 0 = nothing found here, 1 = the worst thing in the estate. */
  severity: number;
}

/** Points spread evenly over a sphere, so no cluster is an accident of maths. */
function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * ring * radius,
        y * radius,
        Math.sin(theta) * ring * radius,
      ),
    );
  }
  return points;
}

const SEVERITY_LOW = new THREE.Color("#22d3ee");
const SEVERITY_HIGH = new THREE.Color("#fb3b64");

function Wireframe({ radius }: { radius: number }) {
  const mesh = useRef<THREE.LineSegments>(null);

  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.06;
  });

  const geometry = useMemo(
    () => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(radius, 2)),
    [radius],
  );

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments ref={mesh} geometry={geometry}>
      <lineBasicMaterial color="#0e7490" transparent opacity={0.22} />
    </lineSegments>
  );
}

function Nodes({ nodes, radius }: { nodes: FieldNode[]; radius: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.06;
    // A slow breath, so a still screen never looks like a frozen one.
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, index) => {
      const node = nodes[index];
      if (!node) return;
      const breath = 1 + Math.sin(t * 1.6 + index) * 0.06 * (0.3 + node.severity);
      child.scale.setScalar(breath);
    });
  });

  const placed = useMemo(() => {
    const positions = fibonacciSphere(nodes.length, radius * 1.02);
    return nodes.map((node, index) => ({
      node,
      position: positions[index],
      color: SEVERITY_LOW.clone().lerp(SEVERITY_HIGH, node.severity),
      size: 0.045 + node.severity * 0.05,
    }));
  }, [nodes, radius]);

  return (
    <group ref={group}>
      {placed.map(({ node, position, color, size }) => (
        <mesh key={node.id} position={position}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * One arc per finding, from the node it was found on to the core.
 *
 * Drawn as a curve rather than a straight line because a straight line
 * through the middle of a sphere reads as an error in the render.
 */
function Arcs({ nodes, radius }: { nodes: FieldNode[]; radius: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06;
  });

  // Built as real THREE.Line objects rather than as <line> elements: in JSX
  // that tag resolves to the SVG one, which does not take a geometry.
  const lines = useMemo(() => {
    const positions = fibonacciSphere(nodes.length, radius * 1.02);
    return nodes
      .map((node, index) => ({ node, from: positions[index] }))
      .filter(({ node }) => node.severity > 0)
      .map(({ node, from }) => {
        const mid = from.clone().multiplyScalar(0.45);
        mid.y += radius * 0.35;
        const curve = new THREE.QuadraticBezierCurve3(
          from,
          mid,
          new THREE.Vector3(0, 0, 0),
        );
        const geometry = new THREE.BufferGeometry().setFromPoints(
          curve.getPoints(24),
        );
        const material = new THREE.LineBasicMaterial({
          color: SEVERITY_LOW.clone().lerp(SEVERITY_HIGH, node.severity),
          transparent: true,
          opacity: 0.18 + node.severity * 0.4,
          toneMapped: false,
        });
        const line = new THREE.Line(geometry, material);
        line.name = node.id;
        return line;
      });
  }, [nodes, radius]);

  // Geometries and materials are not garbage collected with the React tree.
  useEffect(
    () => () => {
      for (const line of lines) {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }
    },
    [lines],
  );

  return (
    <group ref={group}>
      {lines.map((line) => (
        <primitive key={line.name} object={line} />
      ))}
    </group>
  );
}

function Core({ alert }: { alert: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.scale.setScalar(1 + Math.sin(t * (alert ? 3.2 : 1.4)) * 0.05);
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[0.32, 1]} />
      <meshBasicMaterial
        color={alert ? "#fb3b64" : "#22d3ee"}
        wireframe
        toneMapped={false}
      />
    </mesh>
  );
}

export interface ThreatFieldProps {
  nodes: FieldNode[];
  /** Drawn in red rather than cyan: something in the estate needs attention. */
  alert?: boolean;
  className?: string;
}

export default function ThreatField({
  nodes,
  alert = false,
  className,
}: ThreatFieldProps) {
  const radius = 1.6;

  // An empty estate renders an empty field. Inventing nodes here would make
  // the most prominent thing on the dashboard the least true.
  if (nodes.length === 0) {
    return (
      <div
        className={className}
        data-testid="threat-field-empty"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "22rem" }}>
          <div className="athena-label" style={{ marginBottom: "0.5rem" }}>
            No estate to display
          </div>
          <p
            style={{
              color: "hsl(var(--muted-foreground))",
              fontSize: "0.875rem",
              lineHeight: 1.6,
            }}
          >
            Add a client and a site, and every monitored host will appear here
            with its findings tied back to the core.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} data-testid="threat-field">
      <Canvas
        camera={{ position: [0, 0.9, 4.4], fov: 45 }}
        // Capped: this runs in Electron on whatever laptop the demo is given
        // on, and a retina display at full density triples the fill cost for
        // no visible gain on a scene this simple.
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Wireframe radius={radius} />
        <Arcs nodes={nodes} radius={radius} />
        <Nodes nodes={nodes} radius={radius} />
        <Core alert={alert} />
      </Canvas>
    </div>
  );
}
