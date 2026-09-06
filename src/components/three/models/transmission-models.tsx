"use client";

import { AnnularGearGeometry, Bolt, Box, Cylinder, Gear, MachiningRings, Part, Ring, Solid } from "./primitives";

export function PlanetaryModel() {
  return (
    <group>
      <Part id="carrier" anchor={[0, -0.4, 0]}>
        <Solid metal="dark"><AnnularGearGeometry args={[1.79, 1.465, 54, 0.43, 0.105]} /></Solid>
        <Ring outer={1.797} inner={1.685} width={0.037} position={[0, 0.231, 0]} metal="polished" />
        <Ring outer={1.797} inner={1.695} width={0.037} position={[0, -0.231, 0]} metal="polished" />
        <Gear radius={1.44} teeth={48} width={0.14} bore={0.24} holes={6} toothDepth={0.002} position={[0, -0.405, 0]} metal="blue" />
        <Ring outer={0.44} inner={0.24} width={0.32} position={[0, -0.56, 0]} metal="dark" />
        {Array.from({ length: 9 }, (_, i) => {
          const a = i * Math.PI * 2 / 9;
          return <Bolt key={i} radius={0.065} length={0.2} position={[Math.cos(a) * 1.675, 0.248, Math.sin(a) * 1.675]} metal="dark" />;
        })}
      </Part>
      <Part id="sun" anchor={[0, 0.05, 0]}>
        <Gear radius={0.545} teeth={18} width={0.48} bore={0.18} toothDepth={0.11} position={[0, 0.04, 0]} metal="brass" />
        <Ring outer={0.3} inner={0.18} width={0.78} position={[0, 0.08, 0]} metal="polished" />
        <Ring outer={0.313} inner={0.18} width={0.045} position={[0, 0.463, 0]} metal="dark" />
      </Part>
      <Part id="planet" anchor={[0.96, 0, 0]}>
        {Array.from({ length: 3 }, (_, i) => {
          const a = i * Math.PI * 2 / 3 + Math.PI / 6;
          return (
            <group key={i} position={[Math.cos(a) * 0.975, 0.025, Math.sin(a) * 0.975]} rotation={[0, a + Math.PI / 18, 0]}>
              <Gear radius={0.545} teeth={18} width={0.4} bore={0.18} toothDepth={0.11} metal="steel" />
              <Ring outer={0.26} inner={0.14} width={0.44} metal="brass" />
              <Cylinder radius={0.132} height={0.7} position={[0, -0.07, 0]} metal="polished" />
              <Bolt radius={0.115} length={0.18} position={[0, 0.285, 0]} />
              <Ring outer={0.37} inner={0.32} width={0.012} position={[0, 0.212, 0]} metal="dark" />
            </group>
          );
        })}
      </Part>
    </group>
  );
}

export function GearModel() {
  return (
    <group>
      <Part id="gear">
        <Gear radius={1.57} teeth={40} width={0.46} bore={0.565} holes={6} toothDepth={0.18} metal="steel" />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Ring outer={1.345} inner={1.285} width={0.019} position={[0, side * 0.239, 0]} metal="polished" />
            <Ring outer={0.72} inner={0.565} width={0.032} position={[0, side * 0.24, 0]} metal="dark" />
          </group>
        ))}
      </Part>
      <Part id="hub">
        <Ring outer={0.565} inner={0.315} width={0.96} metal="polished" />
        <Ring outer={0.605} inner={0.316} width={0.075} position={[0, 0.46, 0]} metal="steel" />
        <Ring outer={0.605} inner={0.316} width={0.075} position={[0, -0.46, 0]} metal="steel" />
        <MachiningRings radius={0.565} start={0.3} end={0.39} count={5} />
        <Box size={[0.112, 0.83, 0.075]} position={[0, 0, 0.294]} metal="dark" />
        <group rotation={[0, 0, -Math.PI / 2]} position={[0.57, 0.34, 0]}>
          <Bolt radius={0.083} length={0.12} />
        </group>
      </Part>
    </group>
  );
}

export function CouplingModel() {
  return (
    <group>
      <Part id="hub" anchor={[0, 0.7, 0]}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <Ring outer={0.79} inner={0.345} width={0.84} position={[0, side * 0.97, 0]} metal="steel" />
            <Ring outer={1.04} inner={0.35} width={0.24} position={[0, side * 0.51, 0]} metal="polished" />
            <Ring outer={0.795} inner={0.7} width={0.032} position={[0, side * 1.225, 0]} metal="dark" />
            <Ring outer={0.795} inner={0.7} width={0.032} position={[0, side * 1.31, 0]} metal="dark" />
            {Array.from({ length: 3 }, (_, i) => {
              const a = i * Math.PI * 2 / 3 + (side < 0 ? Math.PI / 3 : 0);
              return (
                <group key={i} rotation={[0, a, 0]}>
                  <Box size={[0.39, 0.8, 0.36]} position={[0.69, side * 0.1, 0]} metal="steel" />
                </group>
              );
            })}
            <Box size={[0.14, 0.76, 0.075]} position={[0, side * 0.97, 0.32]} metal="dark" />
          </group>
        ))}
      </Part>
      <Part id="insert">
        <Ring outer={0.69} inner={0.36} width={0.59} metal="rubber" color="#326577" />
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i + 0.5) * Math.PI / 3;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <Cylinder radius={0.16} height={0.61} position={[0.79, 0, 0]} metal="rubber" color="#397b8b" />
            </group>
          );
        })}
      </Part>
      <Part id="bolt" anchor={[0.79, 0.85, 0]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[0, side * 0.94, 0]}>
            {[0, Math.PI].map((a) => (
              <group key={a} rotation={[0, a, -Math.PI / 2]} position={[Math.cos(a) * 0.79, 0, 0]}>
                <Bolt radius={0.12} length={0.23} />
              </group>
            ))}
          </group>
        ))}
      </Part>
    </group>
  );
}
