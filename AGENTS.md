# MECHAVIS — Digital Engineering Lab

Interactive mechanical-engineering demo: Next.js App Router, React 19, Three.js via React Three Fiber + drei (procedural geometry, no external model assets), Tailwind 4, Motion, Zustand, Recharts, Lucide.

## Commands
- `npm run dev` — dev server on :3000
- `npm run build` / `npm run start` — production
- `npm run lint` — ESLint (flat config, eslint-config-next)
- `npm run typecheck` — `tsc --noEmit`
- `npm run test` — Vitest unit tests (`tests/unit`)
- `npm run test:e2e` — Playwright (`tests/e2e`; requires dev server or uses `webServer` auto-start)

## Conventions
- Component data is illustrative: keep `ILLUSTRATIVE_DISCLAIMER` semantics, never present values as certified specs.
- Model-local coords: y-axis is axial; `MODEL_MM_PER_UNIT = 50` (`src/data/components.ts`, `src/lib/geometry/explosion.ts`).
- Part IDs used by models and hotspots: shaft `shaft,journal,shoulder,spline,thread,gear,bearing,spacer,retainer`; spindle `body,taper,journal,thread`; coil `coil,workpiece,terminal`; planetary `sun,planet,carrier`; rotor `shaft,rotor,fan`; housing `housing,seat,bolt`; coupling `hub,insert,bolt`; gear `gear,hub`; bearing `outer,inner,balls,cage`.
- Viewer state lives in `src/stores/viewer-store.tsx` (per-viewer `ViewerProvider`); app prefs in `src/stores/app-store.ts` (persisted, `skipHydration`, call `useAppStore.persist.rehydrate()` on mount — done in `app-shell`).
- Window event `mechavis:command` (detail: `wireframe|explode|measure|reset`) targets the active viewer.
- New routes: keep pages server-light; load 3D through `ModelViewport` / `PreviewGallery` (dynamic, `ssr:false`). Gallery previews share one canvas via drei `View`.
- `.next/` is ignored; don't commit build output or env files.
