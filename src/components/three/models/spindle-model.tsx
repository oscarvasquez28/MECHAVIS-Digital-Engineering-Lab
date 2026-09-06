"use client";

import type { ProfilePoint } from "@/lib/geometry/mechanical";
import { Gear, Helix, KeyedShaft, MachiningRings, Part, Ring, Turned } from "./primitives";

const TAPER: ProfilePoint[] = [
  [0.14, -2.5], [0.23, -2.5], [0.275, -2.46], [0.295, -2.32],
  [0.675, -0.92], [0.705, -0.86], [0.705, -0.76],
  [0.67, -0.735], [0.67, -0.67], [0.71, -0.65], [0.71, -0.53],
  [0.305, -0.53], [0.305, -1.65], [0.14, -2.28], [0.14, -2.5],
];
const BODY: ProfilePoint[] = [
  [0.3, -0.58], [0.74, -0.58], [0.785, -0.53], [0.785, -0.2],
  [0.74, -0.16], [0.705, -0.16], [0.68, -0.11], [0.68, 0.16],
  [0.3, 0.16], [0.3, -0.58],
];
const JOURNAL: ProfilePoint[] = [
  [0.2, 0.69], [0.68, 0.69], [0.665, 0.74], [0.545, 0.79],
  [0.495, 0.84], [0.48, 0.9], [0.48, 1.62], [0.455, 1.65],
  [0.455, 1.7], [0.47, 1.72], [0.47, 1.79], [0.38, 1.82],
  [0.2, 1.82], [0.2, 0.69],
];
const THREAD: ProfilePoint[] = [
  [0.2, 1.79], [0.36, 1.79], [0.36, 2.16], [0.335, 2.2],
  [0.22, 2.2], [0.2, 2.18], [0.2, 1.79],
];

export function SpindleModel() {
  return (
    <group>
      <Part id="body">
        <Turned profile={BODY} metal="steel" />
        <KeyedShaft radius={0.68} length={0.555} slotWidth={0.23} slotDepth={0.1} centerY={0.43} metal="steel" />
        <Gear radius={1.04} teeth={48} width={0.205} bore={0.71} holes={8} toothDepth={0.003} position={[0, -0.43, 0]} metal="polished" />
        <Ring outer={0.862} inner={0.79} width={0.044} position={[0, -0.25, 0]} metal="dark" />
        <Ring outer={0.746} inner={0.684} width={0.1} position={[0, 0.08, 0]} metal="dark" />
        <MachiningRings radius={0.68} start={0.23} end={0.36} count={5} />
        <MachiningRings radius={0.68} start={0.52} end={0.63} count={5} />
      </Part>
      <Part id="taper" anchor={[0, -1.4, 0]}>
        <Turned profile={TAPER} metal="polished" roughness={0.19} />
        <Ring outer={0.706} inner={0.674} width={0.027} position={[0, -0.805, 0]} metal="dark" />
        <Ring outer={0.266} inner={0.14} width={0.019} position={[0, -2.475, 0]} metal="dark" />
      </Part>
      <Part id="journal" anchor={[0, 0.9, 0]}>
        <Turned profile={JOURNAL} metal="polished" roughness={0.13} />
        <MachiningRings radius={0.48} start={0.97} end={1.47} count={9} metal="polished" />
      </Part>
      <Part id="thread" anchor={[0, 2, 0]}>
        <Turned profile={THREAD} metal="steel" />
        <Helix radius={0.362} height={0.29} turns={7} tube={0.021} centerY={1.995} metal="polished" />
      </Part>
    </group>
  );
}
