"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
interface AppState {
  activeComponent: string; commandOpen: boolean; panel: "materials" | "manufacturing" | "settings" | null;
  quality: "high" | "balanced"; autoRotate: boolean; reducedMotion: boolean;
  set: (patch: Partial<Omit<AppState, "set">>) => void;
}
export const useAppStore = create<AppState>()(persist((set) => ({
  activeComponent: "input-shaft", commandOpen: false, panel: null,
  quality: "high", autoRotate: true, reducedMotion: false, set: (patch) => set(patch),
}), { name: "mechavis-preferences", partialize: (s) => ({ quality: s.quality, autoRotate: s.autoRotate, reducedMotion: s.reducedMotion }), skipHydration: true }));
