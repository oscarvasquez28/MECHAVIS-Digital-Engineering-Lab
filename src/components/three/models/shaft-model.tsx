"use client";

import type { ProfilePoint } from "@/lib/geometry/mechanical";
import { BearingAssembly } from "./bearing-parts";
import { Gear, Helix, KeyedShaft, MachiningRings, Part, Ring, Turned } from "./primitives";

const LOWER_BODY: ProfilePoint[] = [
  [0, -1.45], [0.39, -1.45], [0.42, -1.43], [0.42, -1.36],
  [0.51, -1.32], [0.55, -1.27], [0.55, -1.19], [0.535, -1.175],
  [0.535, -1.135], [0.555, -1.115], [0.555, -0.54], [0.57, -0.5], [0, -0.5],
];
const SHOULDER: ProfilePoint[] = [
  [0, 0.35], [0.57, 0.35], [0.57, 0.39], [0.59, 0.415],
  [0.655, 0.44], [0.68, 0.47], [0.68, 0.71], [0.67, 0.735],
  [0.63, 0.755], [0.62, 0.81], [0.595, 0.845], [0.525, 0.87],
  [0.48, 0.9], [0.459, 0.94], [0.455, 1.015], [0, 1.015],
];
const JOURNAL: ProfilePoint[] = [
  [0, 1.0], [0.455, 1.0], [0.455, 1.7], [0.441, 1.72],
  [0.441, 1.755], [0.455, 1.77], [0.455, 1.9], [0.437, 1.93],
  [0.37, 1.96], [0.35, 1.99], [0, 1.99],
];
const THREAD_CORE: ProfilePoint[] = [
  [0, 1.975], [0.35, 1.975], [0.35, 2.075], [0.329, 2.1],
  [0.329, 2.16], [0.34, 2.185], [0.34, 2.785], [0.308, 2.85],
  [0.11, 2.85], [0.07, 2.8], [0.07, 2.75], [0, 2.73],
];
const SPLINE_CORE: ProfilePoint[] = [
  [0, -2.81], [0.12, -2.81], [0.12, -2.85], [0.325, -2.85],
  [0.365, -2.8], [0.365, -2.62], [0.385, -2.58], [0.385, -1.46],
  [0.415, -1.42], [0.415, -1.35], [0, -1.35],
];

export function ShaftModel() {
  return (
    <group>
      <Part id="shaft">
        <Turned profile={LOWER_BODY} metal="steel" />
        <KeyedShaft radius={0.57} length={0.86} slotWidth={0.19} slotDepth={0.105} centerY={-0.07} metal="steel" />
        <MachiningRings radius={0.555} start={-1.07} end={-0.59} count={7} />
      </Part>
      <Part id="shoulder" anchor={[0, 0.6, 0]}>
        <Turned profile={SHOULDER} metal="polished" roughness={0.23} />
        <Ring outer={0.6808} inner={0.673} width={0.006} chamfer={0} position={[0, 0.53, 0]} metal="dark" />
        <MachiningRings radius={0.68} start={0.565} end={0.675} count={5} />
      </Part>
      <Part id="journal" anchor={[0, 1.5, 0]}>
        <Turned profile={JOURNAL} metal="polished" roughness={0.14} />
        <MachiningRings radius={0.455} start={1.46} end={1.66} count={6} metal="polished" />
      </Part>
      <Part id="spline" anchor={[0, -1.8, 0]}>
        <Turned profile={SPLINE_CORE} metal="steel" />
        <Gear radius={0.475} teeth={16} width={1.14} bore={0} toothDepth={0.095} position={[0, -2.01, 0]} metal="steel" />
        <Ring outer={0.389} inner={0.36} width={0.034} position={[0, -2.65, 0]} metal="dark" />
      </Part>
      <Part id="thread" anchor={[0, 2.4, 0]}>
        <Turned profile={THREAD_CORE} metal="steel" />
        <Helix radius={0.344} height={0.535} turns={12} tube={0.022} centerY={2.46} metal="polished" />
      </Part>
      <Part id="gear" anchor={[0, -0.8, 0]}>
        <Gear radius={1.12} teeth={30} width={0.36} bore={0.558} holes={6} toothDepth={0.145} position={[0, -0.8, 0]} metal="steel" />
        <Ring outer={0.685} inner={0.558} width={0.49} position={[0, -0.8, 0]} metal="dark" />
        <Ring outer={0.921} inner={0.895} width={0.007} position={[0, -0.612, 0]} metal="polished" />
      </Part>
      <Part id="bearing" anchor={[0, 1.24, 0]}>
        <BearingAssembly outer={0.88} inner={0.463} width={0.37} count={11} position={[0, 1.24, 0]} />
      </Part>
      <Part id="spacer" anchor={[0, 1.95, 0]}>
        <Ring outer={0.575} inner={0.459} width={0.115} position={[0, 1.915, 0]} metal="polished" />
        <Ring outer={0.579} inner={0.47} width={0.016} position={[0, 1.907, 0]} metal="dark" />
      </Part>
      <Part id="retainer" anchor={[0, 2.65, 0]}>
        <Gear radius={0.53} teeth={8} width={0.125} bore={0.353} toothDepth={0.055} position={[0, 2.65, 0]} metal="dark" />
        <Ring outer={0.43} inner={0.354} width={0.027} position={[0, 2.727, 0]} metal="polished" />
      </Part>
    </group>
  );
}
