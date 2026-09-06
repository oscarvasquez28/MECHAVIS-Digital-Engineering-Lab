"use client";

import { useAppStore } from "@/stores/app-store";
import { components } from "@/data/components";
import { materials } from "@/data/materials";
import { Modal, Disclaimer } from "@/components/ui/primitives";
import { ManufacturingJourney } from "@/features/manufacturing/manufacturing-journey";
export function ToolPanels() {
  const s = useAppStore();
  const c = components.find((c) => c.id === s.activeComponent) || components[0];
  return <Modal open={s.panel !== null} onOpenChange={(open) => { if(!open) s.set({panel:null}); }} title={s.panel === "materials" ? "Material library" : s.panel === "manufacturing" ? "Manufacturing route" : "Visualization settings"} description={s.panel === "manufacturing" ? `${c.name} · ${c.partNumber}` : "Engineering tools / local workspace"} className={s.panel === "manufacturing" ? "wide-dialog" : ""}>
    {s.panel === "materials" && <><div className="material-library">{materials.map((m) => <article key={m.id}><div><span className="eyebrow">{m.family}</span><h3>{m.name}</h3></div><p>{m.description}</p><div className="material-stats"><span>YIELD <strong>{m.yieldStrength} MPa</strong></span><span>DENSITY <strong>{m.density} kg/m³</strong></span><span>HARDNESS <strong>{m.hardness}</strong></span></div><small>{m.condition}</small></article>)}</div><Disclaimer/></>}
    {s.panel === "manufacturing" && <><ManufacturingJourney key={c.id} component={c}/><Disclaimer/></>}
    {s.panel === "settings" && <div className="settings-list"><label><span>Render quality<small>Balanced reduces pixel density and shadows.</small></span><select value={s.quality} onChange={(e) => s.set({quality:e.target.value as "high"|"balanced"})}><option value="high">High fidelity</option><option value="balanced">Balanced</option></select></label><label><span>Ambient rotation<small>Slow rotation in the laboratory hero.</small></span><input type="checkbox" checked={s.autoRotate} onChange={(e) => s.set({autoRotate:e.target.checked})}/></label><label><span>Reduce motion<small>Disable ambient motion and smooth camera transitions.</small></span><input type="checkbox" checked={s.reducedMotion} onChange={(e) => s.set({reducedMotion:e.target.checked})}/></label><p className="disclaimer">Preferences are saved in this browser. No data leaves your device.</p></div>}
  </Modal>;
}
