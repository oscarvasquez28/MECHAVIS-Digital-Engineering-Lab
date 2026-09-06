"use client";

import { useMemo } from "react";
import type { Vec3 } from "@/types/engineering";
import type { ProfilePoint } from "@/lib/geometry/mechanical";
import { Ball, Cylinder, Part, Ring, Turned } from "./primitives";

interface BearingDimensions {
  outer: number;
  inner: number;
  width: number;
  count?: number;
}

function bearingDimensions({ outer, inner, width }: BearingDimensions) {
  return { orbit: (outer + inner) / 2, ball: Math.min((outer - inner) * 0.235, width * 0.36) };
}

export function OuterRace({ outer, inner, width }: BearingDimensions) {
  const { orbit, ball } = bearingDimensions({ outer, inner, width });
  const profile = useMemo<ProfilePoint[]>(() => {
    const h = width / 2;
    const lip = orbit + ball * 0.55;
    return [
      [lip, -h + 0.025], [lip + 0.025, -h], [outer - 0.035, -h],
      [outer, -h + 0.035], [outer, -h + 0.075], [outer - 0.009, -h + 0.09],
      [outer - 0.009, h - 0.09], [outer, h - 0.075], [outer, h - 0.035],
      [outer - 0.035, h], [lip + 0.025, h], [lip, h - 0.025],
      [lip, ball * 0.85], [orbit + ball * 0.84, ball * 0.55],
      [orbit + ball * 1.025, 0], [orbit + ball * 0.84, -ball * 0.55],
      [lip, -ball * 0.85], [lip, -h + 0.025],
    ];
  }, [outer, width, orbit, ball]);
  return <Turned profile={profile} metal="polished" />;
}

export function InnerRace({ outer, inner, width }: BearingDimensions) {
  const { orbit, ball } = bearingDimensions({ outer, inner, width });
  const profile = useMemo<ProfilePoint[]>(() => {
    const h = width / 2;
    const lip = orbit - ball * 0.55;
    return [
      [inner + 0.025, -h], [lip - 0.025, -h], [lip, -h + 0.025],
      [lip, -ball * 0.85], [orbit - ball * 0.84, -ball * 0.55],
      [orbit - ball * 1.025, 0], [orbit - ball * 0.84, ball * 0.55],
      [lip, ball * 0.85], [lip, h - 0.025], [lip - 0.025, h],
      [inner + 0.025, h], [inner, h - 0.025], [inner, -h + 0.025], [inner + 0.025, -h],
    ];
  }, [inner, width, orbit, ball]);
  return <Turned profile={profile} metal="polished" />;
}

export function BearingBalls({ count = 12, ...dimensions }: BearingDimensions) {
  const { orbit, ball } = bearingDimensions(dimensions);
  return <>{Array.from({ length: count }, (_, i) => {
    const a = i * Math.PI * 2 / count;
    return <Ball key={i} radius={ball} position={[Math.cos(a) * orbit, 0, Math.sin(a) * orbit]} metal="polished" roughness={0.11} />;
  })}</>;
}

export function BearingCage({ count = 12, ...dimensions }: BearingDimensions) {
  const { orbit, ball } = bearingDimensions(dimensions);
  return (
    <>
      {[-1, 1].map((side) => <Ring key={side} outer={orbit + ball * 0.44} inner={orbit - ball * 0.44} width={0.023} position={[0, side * ball * 0.77, 0]} metal="brass" />)}
      {Array.from({ length: count }, (_, i) => {
        const a = (i + 0.5) * Math.PI * 2 / count;
        return <Cylinder key={i} radius={ball * 0.25} height={ball * 1.65} position={[Math.cos(a) * orbit, 0, Math.sin(a) * orbit]} metal="brass" segments={12} />;
      })}
    </>
  );
}

export function BearingAssembly({ position = [0, 0, 0], ...dimensions }: BearingDimensions & { position?: Vec3 }) {
  return (
    <group position={position}>
      <OuterRace {...dimensions} />
      <InnerRace {...dimensions} />
      <BearingBalls {...dimensions} />
      <BearingCage {...dimensions} />
    </group>
  );
}

export function BearingModel() {
  const dimensions = { outer: 1.55, inner: 0.65, width: 0.7, count: 13 };
  return (
    <group>
      <Part id="outer" anchor={[1.5, 0, 0]}><OuterRace {...dimensions} /></Part>
      <Part id="inner" anchor={[0.65, 0, 0]}><InnerRace {...dimensions} /></Part>
      <Part id="balls" anchor={[1.1, 0, 0]}><BearingBalls {...dimensions} /></Part>
      <Part id="cage" anchor={[1.1, 0.2, 0]}><BearingCage {...dimensions} /></Part>
    </group>
  );
}
