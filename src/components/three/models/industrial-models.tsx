"use client";

import type { ProfilePoint } from "@/lib/geometry/mechanical";
import { BladeGeometry, Bolt, Box, Cylinder, KeyedShaft, MachiningRings, MountingFlangeGeometry, Part, Ring, Solid, Tube, Turned } from "./primitives";

const ROTOR_SHAFT: ProfilePoint[] = [
  [0, -2.58], [0.22, -2.58], [0.27, -2.53], [0.27, -1.58],
  [0.32, -1.53], [0.36, -1.51], [0.36, 1.44], [0.42, 1.48],
  [0.42, 1.57], [0.4, 1.6], [0.295, 1.64], [0, 1.64],
];
const LAMINATION: ProfilePoint[] = [[0.361, -1.15], [0.91, -1.15]];
for (let i = 0; i < 34; i++) {
  const y = -1.15 + i * 2.3 / 34;
  LAMINATION.push([0.96, y + 0.006], [0.96, y + 0.052], [0.945, y + 0.057], [0.945, y + 2.3 / 34]);
}
LAMINATION.push([0.91, 1.15], [0.361, 1.15], [0.361, -1.15]);
const CONDUCTORS = Array.from({ length: 22 }, (_, i) => Array.from({ length: 5 }, (_, j) => {
  const a = i * Math.PI * 2 / 22 + j * 0.045;
  return [Math.cos(a) * 0.972, -1.18 + j * 0.59, Math.sin(a) * 0.972] as const;
}));

export function RotorModel() {
  return (
    <group>
      <Part id="shaft">
        <Turned profile={ROTOR_SHAFT} metal="polished" />
        <KeyedShaft radius={0.295} length={1.02} slotWidth={0.12} slotDepth={0.068} centerY={2.145} metal="polished" />
        <Ring outer={0.3} inner={0.24} width={0.031} position={[0, -2.36, 0]} metal="dark" />
        <MachiningRings radius={0.27} start={-2.24} end={-1.97} count={6} />
      </Part>
      <Part id="rotor">
        <Turned profile={LAMINATION} metal="dark" color="#6e7783" roughness={0.42} />
        {CONDUCTORS.map((points, i) => <Tube key={i} points={points} radius={0.038} metal="copper" />)}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Ring outer={1.035} inner={0.71} width={0.16} position={[0, side * 1.22, 0]} metal="copper" />
            <Ring outer={0.86} inner={0.362} width={0.085} position={[0, side * 1.28, 0]} metal="dark" />
            <Ring outer={0.47} inner={0.362} width={0.16} position={[0, side * 1.37, 0]} metal="polished" />
            {Array.from({ length: 6 }, (_, i) => {
              const a = i * Math.PI / 3;
              return <Bolt key={i} radius={0.052} length={0.12} position={[Math.cos(a) * 0.63, side * 1.33, Math.sin(a) * 0.63]} />;
            })}
          </group>
        ))}
      </Part>
      <Part id="fan" anchor={[0, -1.76, 0]}>
        <Ring outer={0.51} inner={0.275} width={0.23} position={[0, -1.78, 0]} metal="blue" />
        <Ring outer={0.59} inner={0.275} width={0.055} position={[0, -1.91, 0]} metal="polished" />
        {Array.from({ length: 9 }, (_, i) => (
          <Solid key={i} metal="blue" position={[0, -1.77, 0]} rotation={[0, i * Math.PI * 2 / 9, 0]}>
            <BladeGeometry args={[0.47, 1.22, 0.09]} />
          </Solid>
        ))}
      </Part>
    </group>
  );
}

const HOUSING: ProfilePoint[] = [
  [0.77, -0.65], [1.19, -0.65], [1.24, -0.59], [1.24, -0.41],
  [1.2, -0.32], [1.12, -0.22], [1.09, 0.52], [1.13, 0.58],
  [1.13, 0.73], [1.09, 0.79], [0.93, 0.79], [0.9, 0.75],
  [0.9, 0.36], [0.78, 0.36], [0.75, 0.32], [0.75, -0.59], [0.77, -0.65],
];
const SEAT: ProfilePoint[] = [
  [0.635, 0.37], [0.89, 0.37], [0.897, 0.41], [0.897, 0.72],
  [0.875, 0.75], [0.665, 0.75], [0.635, 0.72], [0.635, 0.62],
  [0.646, 0.6], [0.646, 0.555], [0.635, 0.535], [0.635, 0.37],
];

export function HousingModel() {
  return (
    <group>
      <Part id="housing">
        <Solid position={[0, -0.65, 0]} metal="blue" roughness={0.5}>
          <MountingFlangeGeometry args={[3.2, 2.55, 0.32, 0.76, 0.25]} />
        </Solid>
        <Turned profile={HOUSING} metal="blue" roughness={0.47} />
        <Ring outer={1.131} inner={0.901} width={0.021} position={[0, 0.736, 0]} metal="steel" />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Box size={[0.2, 0.48, 0.75]} position={[side * 1.19, -0.29, 0]} rotation={[0, 0, side * 0.18]} metal="blue" roughness={0.5} />
            <Box size={[0.22, 0.31, 0.6]} position={[side * 0.78, -0.36, 0.79]} rotation={[0, -side * 0.6, 0]} metal="blue" roughness={0.5} />
          </group>
        ))}
        <group position={[0, 0.2, 1.09]} rotation={[Math.PI / 2, 0, 0]}>
          <Cylinder radius={0.16} height={0.15} segments={6} metal="dark" />
          <Ring outer={0.095} inner={0.045} width={0.04} position={[0, -0.09, 0]} metal="brass" />
        </group>
        <Box size={[0.5, 0.19, 0.018]} position={[0, -0.38, 1.225]} metal="dark" />
      </Part>
      <Part id="seat" anchor={[0, 0.6, 0]}>
        <Turned profile={SEAT} metal="brass" />
        <Ring outer={0.878} inner={0.67} width={0.014} position={[0, 0.755, 0]} metal="polished" />
        <Ring outer={0.829} inner={0.813} width={0.016} position={[0, 0.759, 0]} metal="dark" />
      </Part>
      <Part id="bolt" anchor={[1.28, -0.4, 0.955]}>
        {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
          <Bolt key={`${x}-${z}`} position={[x * 1.28, -0.39, z * 0.955]} radius={0.16} length={0.55} />
        )))}
      </Part>
    </group>
  );
}
