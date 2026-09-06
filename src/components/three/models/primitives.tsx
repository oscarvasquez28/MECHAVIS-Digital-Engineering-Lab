"use client";

import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { extend, useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { AnalysisMode, ModelKind, Vec3 } from "@/types/engineering";
import { applyAnalysisColors } from "@/lib/geometry/analysis-colors";
import { getPartOffset } from "@/lib/geometry/explosion";
import {
  BentTubeGeometry, FanBladeGeometry, FlangeGeometry, GearGeometry,
  HelixGeometry, InternalGearGeometry, KeywayGeometry, ProfileGeometry, ringProfile, type ProfilePoint,
} from "@/lib/geometry/mechanical";

const Profile = extend(ProfileGeometry);
const Toothed = extend(GearGeometry);
const Helical = extend(HelixGeometry);
const Keyed = extend(KeywayGeometry);
const BentTube = extend(BentTubeGeometry);
export const BladeGeometry = extend(FanBladeGeometry);
export const MountingFlangeGeometry = extend(FlangeGeometry);
export const AnnularGearGeometry = extend(InternalGearGeometry);

export interface ModelState {
  kind: ModelKind;
  explode: number;
  wireframe: boolean;
  edges: boolean;
  selectedPart: string | null;
  analysis: AnalysisMode;
  thermalProgress: number;
  clippingPlanes?: THREE.Plane[];
  onSelect?: (partId: string, point: THREE.Vector3) => void;
}

export const ModelContext = createContext<ModelState>({
  kind: "shaft", explode: 0, wireframe: false, edges: false,
  selectedPart: null, analysis: "none", thermalProgress: 0,
});
const PartContext = createContext("shaft");
const ORIGIN: Vec3 = [0, 0, 0];
const ignoreRaycast = () => {};

export function Part({ id, children, anchor = ORIGIN }: { id: string; children: ReactNode; anchor?: Vec3 }) {
  const state = useContext(ModelContext);
  const group = useRef<THREE.Group>(null);
  const line = useRef<THREE.LineSegments>(null);
  const target = getPartOffset(state.kind, id, state.explode);
  const positions = useMemo(() => new Float32Array(6), []);
  useFrame((_, dt) => {
    if (!group.current || !line.current || !Number.isFinite(dt)) return;
    const delta = Math.min(dt, 0.08);
    const p = group.current.position;
    p.x = THREE.MathUtils.damp(p.x, target[0], 11, delta);
    p.y = THREE.MathUtils.damp(p.y, target[1], 11, delta);
    p.z = THREE.MathUtils.damp(p.z, target[2], 11, delta);
    if (Math.abs(p.x - target[0]) + Math.abs(p.y - target[1]) + Math.abs(p.z - target[2]) < 0.0001) {
      p.set(...target);
    }
    line.current.visible = p.lengthSq() > 0.001;
    if (!line.current.visible) return;
    const attribute = line.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    attribute.setXYZ(0, ...anchor);
    attribute.setXYZ(1, anchor[0] + p.x, anchor[1] + p.y, anchor[2] + p.z);
    attribute.needsUpdate = true;
    line.current.geometry.computeBoundingSphere();
  });
  const select = (event: ThreeEvent<MouseEvent>) => {
    if (state.clippingPlanes?.some((plane) => plane.distanceToPoint(event.point) < -0.00001)) return;
    event.stopPropagation();
    if (event.delta > 4) return;
    state.onSelect?.(id, event.point.clone());
  };
  return (
    <PartContext.Provider value={id}>
      <group ref={group} name={`part-${id}`} onClick={select}>
        {children}
      </group>
      <lineSegments ref={line} visible={false} raycast={ignoreRaycast} renderOrder={1}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#83b0c8" transparent opacity={0.3} depthWrite={false} clippingPlanes={state.clippingPlanes} />
      </lineSegments>
    </PartContext.Provider>
  );
}

export type Metal = "steel" | "polished" | "dark" | "copper" | "brass" | "rubber" | "ceramic" | "blue";
const METALS: Record<Metal, { color: string; metalness: number; roughness: number }> = {
  steel: { color: "#aab5c0", metalness: 0.94, roughness: 0.27 },
  polished: { color: "#d7e0e7", metalness: 1, roughness: 0.17 },
  dark: { color: "#46505b", metalness: 0.9, roughness: 0.34 },
  copper: { color: "#c57a43", metalness: 0.96, roughness: 0.25 },
  brass: { color: "#bc9a52", metalness: 0.88, roughness: 0.3 },
  rubber: { color: "#263c49", metalness: 0.08, roughness: 0.72 },
  ceramic: { color: "#d6dce0", metalness: 0.12, roughness: 0.38 },
  blue: { color: "#24576f", metalness: 0.72, roughness: 0.35 },
};

interface SolidProps {
  children: ReactNode;
  metal?: Metal;
  position?: Vec3;
  rotation?: Vec3;
  scale?: Vec3 | number;
  color?: string;
  roughness?: number;
  outline?: boolean;
}

export function Solid({ children, metal = "steel", position = ORIGIN, rotation, scale, color, roughness, outline = true }: SolidProps) {
  const state = useContext(ModelContext);
  const partId = useContext(PartContext);
  const [mesh, setMesh] = useState<THREE.Mesh | null>(null);
  const selected = state.selectedPart === partId;
  const activeAnalysis = state.analysis !== "none";
  const finish = METALS[metal];
  const [px, py, pz] = position;
  useLayoutEffect(() => {
    if (!mesh) return;
    applyAnalysisColors(mesh.geometry, state.kind, partId, state.analysis, state.thermalProgress, [px, py, pz]);
  }, [mesh, state.kind, state.analysis, state.thermalProgress, partId, px, py, pz]);
  return (
    <mesh ref={setMesh} position={position} rotation={rotation} scale={scale} castShadow receiveShadow>
      {children}
      <meshPhysicalMaterial
        color={activeAnalysis ? "#ffffff" : color ?? finish.color}
        metalness={activeAnalysis ? 0.32 : finish.metalness}
        roughness={activeAnalysis ? 0.43 : roughness ?? finish.roughness}
        envMapIntensity={1.15}
        clearcoat={metal === "rubber" ? 0 : 0.18}
        clearcoatRoughness={0.28}
        emissive={selected ? "#247bff" : "#000000"}
        emissiveIntensity={selected ? 0.3 : 0}
        vertexColors={activeAnalysis}
        wireframe={state.wireframe}
        clippingPlanes={state.clippingPlanes}
        clipShadows
        side={THREE.DoubleSide}
        polygonOffset={selected || state.edges}
        polygonOffsetFactor={1}
        polygonOffsetUnits={1}
      />
      {mesh && outline && (selected || state.edges) && !state.wireframe && (
        <lineSegments raycast={ignoreRaycast}>
          <edgesGeometry args={[mesh.geometry, 28]} />
          <lineBasicMaterial
            color={selected ? "#79bbff" : "#3e637b"}
            transparent
            opacity={selected ? 0.9 : 0.42}
            depthWrite={false}
            clippingPlanes={state.clippingPlanes}
          />
        </lineSegments>
      )}
    </mesh>
  );
}

export function Turned({ profile, ...props }: Omit<SolidProps, "children"> & { profile: readonly ProfilePoint[] }) {
  return <Solid {...props}><Profile args={[profile]} /></Solid>;
}

export function Ring({ outer, inner, width, chamfer = 0.025, ...props }: Omit<SolidProps, "children"> & { outer: number; inner: number; width: number; chamfer?: number }) {
  const profile = useMemo(() => ringProfile(outer, inner, width, chamfer), [outer, inner, width, chamfer]);
  return <Turned profile={profile} {...props} />;
}

export function Gear({ radius, teeth, width, bore, holes = 0, toothDepth = 0.15, ...props }: Omit<SolidProps, "children"> & { radius: number; teeth: number; width: number; bore: number; holes?: number; toothDepth?: number }) {
  return <Solid {...props}><Toothed args={[radius, teeth, width, bore, holes, toothDepth]} /></Solid>;
}

export function Helix({ radius, height, turns, tube, phase = 0, centerY = 0, ...props }: Omit<SolidProps, "children"> & { radius: number; height: number; turns: number; tube: number; phase?: number; centerY?: number }) {
  return <Solid outline={false} {...props}><Helical args={[radius, height, turns, tube, phase, centerY]} /></Solid>;
}

export function Tube({ points, radius, ...props }: Omit<SolidProps, "children"> & { points: readonly (readonly [number, number, number])[]; radius: number }) {
  return <Solid outline={false} {...props}><BentTube args={[points, radius]} /></Solid>;
}

export function KeyedShaft({ radius, length, slotWidth, slotDepth, centerY = 0, ...props }: Omit<SolidProps, "children"> & { radius: number; length: number; slotWidth: number; slotDepth: number; centerY?: number }) {
  return <Solid {...props}><Keyed args={[radius, length, slotWidth, slotDepth, centerY]} /></Solid>;
}

export function Box({ size, ...props }: Omit<SolidProps, "children"> & { size: Vec3 }) {
  return <Solid {...props}><boxGeometry args={size} /></Solid>;
}

export function Ball({ radius, ...props }: Omit<SolidProps, "children"> & { radius: number }) {
  return <Solid outline={false} {...props}><sphereGeometry args={[radius, 28, 18]} /></Solid>;
}

export function Cylinder({ radius, height, segments = 64, ...props }: Omit<SolidProps, "children"> & { radius: number; height: number; segments?: number }) {
  return <Solid {...props}><cylinderGeometry args={[radius, radius, height, segments]} /></Solid>;
}

export function Bolt({ position = ORIGIN, radius = 0.12, length = 0.3, metal = "dark" }: { position?: Vec3; radius?: number; length?: number; metal?: Metal }) {
  return (
    <group position={position}>
      <Cylinder radius={radius * 0.58} height={length} position={[0, -length / 2, 0]} metal={metal} />
      <Cylinder radius={radius} height={radius * 0.9} segments={6} metal={metal} />
      <Cylinder radius={radius * 0.42} height={0.007} segments={6} position={[0, radius * 0.46, 0]} metal="rubber" />
      <Ring outer={radius * 1.23} inner={radius * 0.62} width={0.027} position={[0, -radius * 0.45, 0]} metal="polished" />
    </group>
  );
}

export function MachiningRings({ radius, start, end, count = 8, metal = "steel" }: { radius: number; start: number; end: number; count?: number; metal?: Metal }) {
  return <>{Array.from({ length: count }, (_, i) => (
    <Ring key={i} outer={radius + 0.0015} inner={radius - 0.003} width={0.003} chamfer={0} position={[0, start + (end - start) * i / Math.max(1, count - 1), 0]} metal={metal} roughness={0.46} outline={false} />
  ))}</>;
}
