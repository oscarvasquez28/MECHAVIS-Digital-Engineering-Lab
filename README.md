# MECHAVIS — Digital Engineering Lab

An interactive digital laboratory for exploring mechanical components in 3D. Part engineering software, part sci-fi interface: inspect gears, shafts, spindles, bearings and induction coils with real-time WebGL, technical data, conceptual analysis overlays and a context-aware engineering assistant.

> All component data is illustrative and educational — not certified specifications, validated FEA, or production design guidance.

## What's inside

- **3D Engineering Viewer** — rotate, pan, zoom, preset camera views, hotspot selection with tolerances and surface-finish tooltips
- **Exploded view** — animated disassembly slider with technical connector lines
- **Section view** — real-time clipping planes with axis and position control
- **Measurement mode** — pick two surface points and read the distance in mm
- **Component Explorer** — searchable, filterable library of 10 procedural components
- **Engineering Analysis** — conceptual stress, thermal, wear and critical-zone overlays with charts
- **MECHAVIS AI** — simulated engineering assistant that focuses the camera on the region it describes
- **Component Comparison** — normalized radar/bar charts, spec tables and a priority-based recommendation
- **Command palette** (`⌘K`), manufacturing journey, loading experience, responsive layout, WebGL fallbacks

No backend required. All models are procedural Three.js geometry; all data is curated mock content behind interfaces ready for real APIs.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Three.js + React Three Fiber + drei · Motion · Zustand · Recharts · Lucide React · Radix Dialog

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Development server                 |
| `npm run build`    | Production build                   |
| `npm run start`    | Serve the production build         |
| `npm run lint`     | ESLint                             |
| `npm run typecheck`| `tsc --noEmit`                     |
| `npm run test`     | Vitest unit tests                  |
| `npm run test:e2e` | Playwright end-to-end tests        |

## Structure

```
src/
  app/            routes: /, /components, /components/[id], /analysis, /compare, /ai
  components/     layout shell, UI primitives, three/ (canvas, models, gallery)
  data/           components, materials, manufacturing, analysis datasets
  features/       lab, explorer, viewer, analysis, assistant, comparison, manufacturing
  lib/            geometry primitives + engineering helpers
  services/       component repository + mock assistant provider (replaceable)
  stores/         Zustand: per-viewer state + persisted app preferences
  types/          engineering domain contracts
tests/            Vitest unit + Playwright e2e
```

See `AGENTS.md` for architecture conventions (model-local coordinates, part IDs, viewer commands).
