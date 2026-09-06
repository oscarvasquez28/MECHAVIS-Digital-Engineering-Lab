"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createStore, type StoreApi } from "zustand/vanilla";
import { useStore } from "zustand";
import type { AnalysisMode, Hotspot, Vec3 } from "@/types/engineering";

export interface ViewerState {
  selectedHotspot: string | null; selectedPart: string | null; focusTarget: Vec3 | null; focusRevision: number;
  cameraPreset: "iso" | "front" | "top" | "side"; resetRevision: number;
  explode: number; section: boolean; sectionAxis: "x" | "y" | "z"; sectionOffset: number;
  wireframe: boolean; edges: boolean; measure: boolean; points: Vec3[];
  analysis: AnalysisMode; thermalProgress: number; playing: boolean; interaction: "rotate" | "pan" | "zoom";
  set: (patch: Partial<Omit<ViewerState, "set" | "reset" | "focus" | "addPoint">>) => void;
  reset: () => void; focus: (hotspot: Hotspot) => void; addPoint: (point: Vec3) => void;
}
const defaults = { selectedHotspot: null, selectedPart: null, focusTarget: null, focusRevision: 0, cameraPreset: "iso" as const, resetRevision: 0, explode: 0, section: false, sectionAxis: "x" as const, sectionOffset: 0, wireframe: false, edges: false, measure: false, points: [] as Vec3[], analysis: "none" as AnalysisMode, thermalProgress: 0.45, playing: false, interaction: "rotate" as const };
export function createViewerStore() {
  return createStore<ViewerState>((set) => ({ ...defaults,
    set: (patch) => set((state) => ({ ...patch, ...(patch.measure === true ? { explode: 0, section: false, points: [] } : {}), ...(patch.explode !== undefined && patch.explode !== state.explode || patch.section !== undefined || patch.analysis !== undefined ? { measure: false, points: [] } : {}) })),
    reset: () => set((s) => ({ ...defaults, resetRevision: s.resetRevision + 1 })),
    focus: (h) => set((s) => ({ selectedHotspot: h.id, selectedPart: h.partId, focusTarget: h.position, focusRevision: s.focusRevision + 1, measure: false, points: [] })),
    addPoint: (point) => set((s) => ({ points: s.points.length >= 2 ? [point] : [...s.points, point] })),
  }));
}
const Context = createContext<StoreApi<ViewerState> | null>(null);
export function ViewerProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createViewerStore);
  useEffect(() => {
    const command = (e: Event) => {
      const action = (e as CustomEvent<string>).detail;
      const s = store.getState();
      if (action === "wireframe") s.set({ wireframe: !s.wireframe });
      if (action === "explode") s.set({ explode: s.explode ? 0 : 0.65 });
      if (action === "measure") s.set({ measure: !s.measure });
      if (action === "reset") s.reset();
    };
    window.addEventListener("mechavis:command", command);
    const action = new URLSearchParams(window.location.search).get("tool");
    if (action) command(new CustomEvent("mechavis:command", { detail: action }));
    return () => window.removeEventListener("mechavis:command", command);
  }, [store]);
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useViewer<T>(selector: (state: ViewerState) => T): T {
  const store = useContext(Context);
  if (!store) throw new Error("ViewerProvider is required");
  return useStore(store, selector);
}
