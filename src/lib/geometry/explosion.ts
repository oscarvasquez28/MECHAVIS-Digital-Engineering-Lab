import type { ModelKind, Vec3 } from "@/types/engineering";

export const MODEL_MM_PER_UNIT = 50;

const OFFSETS: Record<ModelKind, Record<string, Vec3>> = {
  shaft: {
    gear: [0, -1.2, 0],
    bearing: [1.65, 0.45, 0],
    spacer: [0, 0.85, 0],
    retainer: [0, 1.55, 0],
  },
  spindle: {},
  coil: {
    coil: [0, 0, 0],
    workpiece: [0, 1.4, 0],
    terminal: [1.1, 0, 0],
  },
  planetary: {
    sun: [0, 1.1, 0],
    planet: [0, 0.42, 0],
    carrier: [0, -1.25, 0],
  },
  rotor: {
    rotor: [1.55, 0, 0],
    fan: [0, -1.05, 0],
  },
  housing: {
    seat: [0, 1.1, 0],
    bolt: [0, 1.45, 0],
  },
  coupling: {
    hub: [0, 0.65, 0],
    insert: [1.65, 0, 0],
    bolt: [0, 1.25, 0],
  },
  gear: {
    hub: [0, 1.15, 0],
  },
  bearing: {
    outer: [0, 0.85, 0],
    inner: [0, -0.9, 0],
    balls: [0, 0, 0],
    cage: [1.7, 0, 0],
  },
};

export function getPartOffset(kind: ModelKind, partId: string, explode = 0): Vec3 {
  const amount = Number.isFinite(explode) ? Math.min(1, Math.max(0, explode)) : 0;
  const offset = OFFSETS[kind]?.[partId];
  if (!offset || amount === 0) return [0, 0, 0];
  return [offset[0] * amount, offset[1] * amount, offset[2] * amount];
}
