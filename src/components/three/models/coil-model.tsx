"use client";

import { useContext, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ProfilePoint } from "@/lib/geometry/mechanical";
import { Bolt, Box, Helix, MachiningRings, ModelContext, Part, Ring, Tube, Turned } from "./primitives";

const WORKPIECE: ProfilePoint[] = [
  [0, -2.12], [0.33, -2.12], [0.39, -2.06], [0.39, -1.86],
  [0.49, -1.8], [0.52, -1.74], [0.52, 1.74], [0.49, 1.8],
  [0.39, 1.86], [0.39, 2.06], [0.33, 2.12], [0, 2.12],
];
const LOWER_LEAD = [[1.02, -1.35, 0], [1.19, -1.35, -0.18], [1.47, -1.35, -0.32], [1.9, -1.35, -0.32]] as const;
const UPPER_LEAD = [[1.02, 1.35, 0], [1.19, 1.35, 0.18], [1.47, 1.35, 0.32], [1.9, 1.35, 0.32]] as const;
const noRaycast = () => {};

function FieldLines() {
  const { clippingPlanes, thermalProgress } = useContext(ModelContext);
  const group = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const curves = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const a = i * Math.PI * 2 / 7;
    const radialPoints = [
      [0.27, -1.45], [0.33, 0], [0.27, 1.45], [0.65, 2.0],
      [1.34, 1.75], [1.57, 0], [1.34, -1.75], [0.65, -2.0],
    ];
    return new THREE.CatmullRomCurve3(radialPoints.map(([r, y]) => new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r)), true);
  }), []);
  const sample = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    if (!group.current || !particles.current || !Number.isFinite(dt)) return;
    const delta = Math.min(dt, 0.08);
    phase.current += delta * (0.09 + thermalProgress * 0.075);
    group.current.rotation.y += delta * 0.035;
    particles.current.children.forEach((particle, i) => {
      curves[i].getPoint((phase.current + i / curves.length) % 1, sample);
      particle.position.copy(sample);
    });
  });
  return (
    <group ref={group}>
      {curves.map((curve, i) => (
        <mesh key={i} raycast={noRaycast}>
          <tubeGeometry args={[curve, 112, 0.005, 5, true]} />
          <meshBasicMaterial color="#53ceff" transparent opacity={0.11 + thermalProgress * 0.12} depthWrite={false} clippingPlanes={clippingPlanes} />
        </mesh>
      ))}
      <group ref={particles}>
        {curves.map((_, i) => (
          <mesh key={i} raycast={noRaycast}>
            <sphereGeometry args={[0.023, 10, 8]} />
            <meshBasicMaterial color="#97e5ff" transparent opacity={0.58} depthWrite={false} clippingPlanes={clippingPlanes} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function CoilModel() {
  const { analysis } = useContext(ModelContext);
  return (
    <group>
      <Part id="coil">
        <Helix radius={1.02} height={2.7} turns={8} tube={0.115} metal="copper" />
        <Ring outer={1.09} inner={0.95} width={0.06} position={[0, -1.49, 0]} metal="ceramic" />
        <Ring outer={1.09} inner={0.95} width={0.06} position={[0, 1.49, 0]} metal="ceramic" />
      </Part>
      <Part id="workpiece">
        <Turned profile={WORKPIECE} metal="dark" roughness={0.32} />
        <MachiningRings radius={0.39} start={1.91} end={2.02} count={4} />
        <MachiningRings radius={0.39} start={-2.02} end={-1.91} count={4} />
      </Part>
      <Part id="terminal" anchor={[1.75, 0, 0]}>
        <Tube points={LOWER_LEAD} radius={0.115} metal="copper" />
        <Tube points={UPPER_LEAD} radius={0.115} metal="copper" />
        {[-1, 1].map((side) => (
          <group key={side} position={[1.99, side * 1.35, side * 0.32]}>
            <Box size={[0.44, 0.17, 0.4]} metal="copper" />
            <Bolt position={[0.08, 0.13, 0]} radius={0.092} length={0.18} metal="polished" />
            <Box size={[0.2, 0.27, 0.48]} position={[-0.4, 0, 0]} metal="ceramic" />
          </group>
        ))}
      </Part>
      {analysis === "thermal" && <FieldLines />}
    </group>
  );
}
