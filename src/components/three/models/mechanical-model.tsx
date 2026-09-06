"use client";

import { useMemo, type ComponentType } from "react";
import type * as THREE from "three";
import type { AnalysisMode, ModelKind } from "@/types/engineering";
import { BearingModel } from "./bearing-parts";
import { CoilModel } from "./coil-model";
import { HousingModel, RotorModel } from "./industrial-models";
import { ModelContext, type ModelState } from "./primitives";
import { ShaftModel } from "./shaft-model";
import { SpindleModel } from "./spindle-model";
import { CouplingModel, GearModel, PlanetaryModel } from "./transmission-models";

export { getPartOffset, MODEL_MM_PER_UNIT } from "@/lib/geometry/explosion";

export interface MechanicalModelProps {
  kind: ModelKind;
  explode?: number;
  wireframe?: boolean;
  edges?: boolean;
  selectedPart?: string | null;
  analysis?: AnalysisMode;
  thermalProgress?: number;
  clippingPlanes?: THREE.Plane[];
  onSelect?: (partId: string, point: THREE.Vector3) => void;
}

const MODELS: Record<ModelKind, ComponentType> = {
  shaft: ShaftModel,
  spindle: SpindleModel,
  coil: CoilModel,
  planetary: PlanetaryModel,
  rotor: RotorModel,
  housing: HousingModel,
  coupling: CouplingModel,
  gear: GearModel,
  bearing: BearingModel,
};

export function MechanicalModel({
  kind,
  explode = 0,
  wireframe = false,
  edges = false,
  selectedPart = null,
  analysis = "none",
  thermalProgress = 0,
  clippingPlanes,
  onSelect,
}: MechanicalModelProps) {
  const state = useMemo<ModelState>(() => ({
    kind,
    explode: Number.isFinite(explode) ? Math.max(0, Math.min(1, explode)) : 0,
    wireframe,
    edges,
    selectedPart,
    analysis,
    thermalProgress: Number.isFinite(thermalProgress) ? Math.max(0, Math.min(1, thermalProgress)) : 0,
    clippingPlanes,
    onSelect,
  }), [kind, explode, wireframe, edges, selectedPart, analysis, thermalProgress, clippingPlanes, onSelect]);
  const Model = MODELS[kind];
  return (
    <ModelContext.Provider value={state}>
      <group key={kind} name={`mechanical-${kind}`}>
        <Model />
      </group>
    </ModelContext.Provider>
  );
}
