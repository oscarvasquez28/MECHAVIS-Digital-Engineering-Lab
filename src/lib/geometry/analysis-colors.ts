import * as THREE from "three";
import type { AnalysisMode, ModelKind, Vec3 } from "@/types/engineering";

const stressPalette = ["#163b8e", "#126ed0", "#10bcd0", "#64d98a", "#e5de45", "#ff8e31", "#ed354b"].map((c) => new THREE.Color(c));
const thermalPalette = ["#18346f", "#365bb6", "#7944aa", "#d54868", "#f48239", "#ffd26e", "#fff0b8"].map((c) => new THREE.Color(c));
const wearPalette = ["#174568", "#168ea4", "#65cdb5", "#d7dc72", "#fa9f42", "#ef4c39"].map((c) => new THREE.Color(c));

const CRITICAL_HEIGHT: Record<ModelKind, number> = {
  shaft: 0.6,
  spindle: -0.6,
  coil: 0,
  planetary: 0,
  rotor: 0.85,
  housing: 0.45,
  coupling: 0,
  gear: 0,
  bearing: 0,
};

const stressParts: Record<string, number> = {
  shoulder: 0.33, journal: 0.15, spline: 0.25, thread: 0.23,
  gear: 0.17, planet: 0.22, sun: 0.2, taper: 0.24,
  bolt: 0.18, seat: 0.22, balls: 0.2, insert: 0.24,
};

function gaussian(value: number, center: number, spread: number) {
  return Math.exp(-(((value - center) / spread) ** 2));
}

export function applyAnalysisColors(
  geometry: THREE.BufferGeometry,
  kind: ModelKind,
  partId: string,
  mode: AnalysisMode,
  progress: number,
  offset: Vec3 = [0, 0, 0],
) {
  if (mode === "none") return;
  const positions = geometry.getAttribute("position");
  if (!positions) return;
  let attribute = geometry.getAttribute("color") as THREE.BufferAttribute | undefined;
  if (!attribute || attribute.count !== positions.count) {
    attribute = new THREE.BufferAttribute(new Float32Array(positions.count * 3), 3);
    geometry.setAttribute("color", attribute);
  }
  const palette = mode === "thermal" ? thermalPalette : mode === "wear" ? wearPalette : stressPalette;
  const color = new THREE.Color();
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) + offset[0];
    const y = positions.getY(i) + offset[1];
    const z = positions.getZ(i) + offset[2];
    const radius = Math.hypot(x, z);
    const angle = Math.atan2(z, x);
    const circumferential = (Math.sin(angle * 2.5 + y * 1.7) + 1) / 2;
    const transition = gaussian(y, CRITICAL_HEIGHT[kind], kind === "shaft" ? 0.42 : 0.8);
    const toothContact = (Math.sin(angle * 12 + y * 4) + 1) / 2;
    let value: number;
    if (mode === "thermal") {
      const core = gaussian(y, 0, 0.45 + p * 1.8);
      const absorption = kind === "coil" && partId === "workpiece" ? 1 : 0.88;
      value = 0.06 + p * absorption * (0.3 + core * 0.66) + circumferential * 0.075 - radius * 0.025;
    } else if (mode === "wear") {
      const contact = ["journal", "balls", "inner", "outer", "gear", "planet", "sun", "spline", "taper"].includes(partId);
      value = 0.1 + transition * 0.22 + circumferential * 0.24 + (contact ? 0.28 + toothContact * 0.18 : 0);
    } else {
      const spatial = transition * (0.43 + circumferential * 0.22);
      const surface = Math.min(radius / 1.5, 1) * 0.12;
      value = 0.08 + spatial + surface + (stressParts[partId] ?? 0) + circumferential * 0.09;
      if (mode === "critical") value = Math.max(0.08, Math.pow(value, 1.45));
    }
    const t = THREE.MathUtils.clamp(value, 0, 1) * (palette.length - 1);
    const lower = Math.min(Math.floor(t), palette.length - 2);
    color.lerpColors(palette[lower], palette[lower + 1], t - lower);
    attribute.setXYZ(i, color.r, color.g, color.b);
  }
  attribute.needsUpdate = true;
}
