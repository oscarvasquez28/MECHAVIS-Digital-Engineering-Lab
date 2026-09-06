"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Crosshair, Focus, Sparkles, X } from "lucide-react";
import type { Component } from "@/types/engineering";
import { ViewerProvider, useViewer } from "@/stores/viewer-store";
import { useAppStore } from "@/stores/app-store";
import { ModelViewport } from "@/components/three/model-viewport";
import { Disclaimer, Modal } from "@/components/ui/primitives";
import { ViewerToolbar } from "./viewer-toolbar";
import { EngineeringData } from "./engineering-data";
import { AssistantPanel } from "@/features/assistant/assistant-panel";
export function EngineeringWorkspace({ component }: { component: Component }) { return <ViewerProvider key={component.id}><Workspace component={component}/></ViewerProvider>; }
function Workspace({ component:c }: { component: Component }) {
  const [ai,setAi] = useState(false);
  const s = useViewer((state) => state);
  const setApp = useAppStore((state) => state.set);
  useEffect(() => { setApp({ activeComponent:c.id }); },[c.id,setApp]);
  const hotspot = c.hotspots.find((h) => h.id === s.selectedHotspot);
  return <div className="engineering-workspace"><section className="engineering-stage"><div className="viewer-heading"><Link href="/components" className="back-link"><ArrowLeft size={13}/> COMPONENT LIBRARY</Link><div><span className="eyebrow">{c.category} / {c.partNumber}</span><h1>{c.name}</h1><span className="viewer-subtitle">{c.subtitle}</span></div></div><div className="viewer-topright"><span className="status-label"><span className="status-dot"/> INSPECTED · DEMO</span><button className="icon-button" title="Open engineering assistant" aria-label="Open engineering assistant" onClick={() => setAi(true)}><Sparkles size={17}/></button></div><ModelViewport component={c}/><div className="viewer-scene-meta"><span className="eyebrow">{s.analysis === "none" ? "SHADED WITH MATERIAL" : `${s.analysis.toUpperCase()} / CONCEPTUAL`}</span><span className="mono">MM · {s.cameraPreset.toUpperCase()}</span></div>{hotspot && !s.measure && <div className="hotspot-tooltip"><div><Crosshair size={14}/><strong>{hotspot.name.toUpperCase()}</strong><button aria-label="Clear selection" onClick={() => s.set({selectedHotspot:null,selectedPart:null,focusTarget:null})}><X size={13}/></button></div><p>{hotspot.description}</p><dl><dt>Surface finish</dt><dd>{hotspot.surfaceFinish}</dd><dt>Tolerance</dt><dd>{hotspot.tolerance}</dd><dt>Criticality</dt><dd className="accent">{hotspot.criticality.toUpperCase()}</dd></dl><div className="coordinates">{hotspot.position.map((p,i) => <span key={i}>{["X","Y","Z"][i]}: {(p*50).toFixed(2)}</span>)}</div><button className="text-button" onClick={() => setAi(true)}><Sparkles size={12}/> Explain this area <ArrowUpRight size={12}/></button></div>}<div className="viewer-bottom-left"><Focus size={12}/> {s.measure ? "CLICK TWO SURFACE POINTS / CONCEPTUAL MM" : "DRAG TO ORBIT · RIGHT DRAG TO PAN"}</div><ViewerToolbar/></section><aside className="engineering-inspector"><EngineeringData component={c}/><div className="inspector-ai-callout"><Sparkles size={18}/><h3>An engineering mind.<br/>One question away.</h3><p>Understand the decisions behind this component.</p><button className="button secondary" onClick={() => setAi(true)}>Ask MECHAVIS AI <ArrowUpRight size={14}/></button></div><Disclaimer/></aside><Modal open={ai} onOpenChange={setAi} title="MECHAVIS AI" description={`${c.partNumber} / Contextual engineering assistant`} className="ai-drawer"><AssistantPanel component={c}/></Modal></div>;
}
