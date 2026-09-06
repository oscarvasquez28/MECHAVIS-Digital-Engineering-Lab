"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Crosshair, ShieldCheck } from "lucide-react";
import type { Component, EngineeringProperty } from "@/types/engineering";
import { useViewer } from "@/stores/viewer-store";
import { Eyebrow } from "@/components/ui/primitives";
const tabs = ["Overview","Material","Dimensions","Manufacturing","Properties","Inspection"];
function Properties({ items }: { items: EngineeringProperty[] }) { return <dl className="property-list">{items.map((p) => <div key={p.label}><dt>{p.label}</dt><dd>{p.value}{p.unit && ` ${p.unit}`}</dd></div>)}</dl>; }
export function EngineeringData({ component:c }: { component:Component }) {
  const [tab,setTab] = useState("Overview"); const focus = useViewer((s) => s.focus); const selected = useViewer((s) => s.selectedHotspot);
  return <><div className="inspector-heading"><Eyebrow><span className="tiny-square"/> ENGINEERING DATA</Eyebrow><span className="mono muted">REV. 01</span></div><div className="data-tabs" role="tablist" aria-label="Engineering data">{tabs.map((t) => <button key={t} role="tab" aria-selected={tab===t} className={tab===t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>)}</div><div className="data-content" role="tabpanel">
    {tab === "Overview" && <><span className="component-category">{c.category.toUpperCase()}</span><h2>{c.name}</h2><p>{c.description}</p><Properties items={[{label:"Part number",value:c.partNumber},{label:"Material",value:c.material.name},{label:"Application",value:c.applications[0]},{label:"Criticality",value:c.criticality},{label:"Weight",value:c.weight.toFixed(2),unit:"kg"},{label:"Tolerance",value:c.tolerance}]}/><div className="inspection-stamp"><ShieldCheck size={16}/><div>Inspection complete<small>Illustrative dataset / Rev. 01</small></div><span className="status-dot"/></div></>}
    {tab === "Material" && <><Eyebrow>{c.material.family}</Eyebrow><h2>{c.material.name}</h2><p>{c.material.description}</p><p className="material-condition">{c.material.condition}</p><Properties items={[{label:"Density",value:String(c.material.density),unit:"kg/m³"},{label:"Tensile strength",value:String(c.material.tensileStrength),unit:"MPa"},{label:"Yield strength",value:String(c.material.yieldStrength),unit:"MPa"},{label:"Hardness",value:c.material.hardness}]}/><Eyebrow>MATERIAL ALTERNATIVES</Eyebrow><p>{c.material.alternatives.join(" · ")}</p></>}
    {tab === "Dimensions" && <><Eyebrow>NOMINAL ENVELOPE</Eyebrow><Properties items={c.dimensions}/><div className="dimension-note"><Crosshair size={18}/><p>Use the measurement tool to explore distances between model surfaces. Geometry and dimensions are illustrative.</p></div></>}
    {tab === "Manufacturing" && <div className="process-list">{c.manufacturingProcess.map((p,i) => <article key={p.id}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{p.name}</h3><p>{p.purpose}</p><small className="mono">{p.tolerance}</small></div></article>)}</div>}
    {tab === "Properties" && <><Eyebrow>MECHANICAL PROPERTIES</Eyebrow><Properties items={c.mechanicalProperties}/><Eyebrow>POTENTIAL FAILURE MODES</Eyebrow>{c.failureModes.map((f) => <div className="failure-mode" key={f.name}><h3>{f.name}</h3><p>{f.cause}</p><small>{f.prevention}</small></div>)}</>}
    {tab === "Inspection" && <><Eyebrow>QUALITY PARAMETERS</Eyebrow><Properties items={c.inspection}/><p>Acceptance limits shown for demonstration. Validate against a controlled drawing before manufacture.</p></>}
  </div><div className="hotspot-list"><div className="list-heading"><Eyebrow>POINTS OF INTEREST</Eyebrow><span className="mono muted">{String(c.hotspots.length).padStart(2,"0")}</span></div>{c.hotspots.map((h,i) => <button key={h.id} onClick={() => focus(h)} className={selected === h.id ? "active" : ""}><span className="hotspot-index">{String(i+1).padStart(2,"0")}</span><span>{h.name}<small>{h.criticality.toUpperCase()} CRITICALITY</small></span><Crosshair size={14}/></button>)}</div><Link className="inspector-analysis-link" href={`/analysis?component=${c.id}`}>Open engineering analysis <ArrowUpRight size={14}/></Link></>;
}
