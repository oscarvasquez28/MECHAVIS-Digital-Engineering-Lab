"use client";

import { useState } from "react";
import { ArrowRight, Check, Focus } from "lucide-react";
import type { Component } from "@/types/engineering";
import { Eyebrow } from "@/components/ui/primitives";
export function ManufacturingJourney({ component }: { component: Component }) {
  const [active, setActive] = useState(0);
  const process = component.manufacturingProcess[active] || component.manufacturingProcess[0];
  return <section className="manufacturing-journey"><div className="journey-heading"><div><Eyebrow>FROM STOCK TO SPECIFICATION</Eyebrow><h2>Precision is a process<span className="accent">.</span></h2></div><span className="mono muted">{component.partNumber} / PROCESS ROUTE</span></div><div className="journey-track">{component.manufacturingProcess.map((p,i) => <button className={`journey-step ${i === active ? "active" : ""}`} key={p.id} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}><span className="step-number">{String(i+1).padStart(2,"0")}</span><span>{p.name}</span><ArrowRight size={14}/></button>)}<div className="journey-final"><Check size={18}/><span>FINAL<br/>COMPONENT</span></div></div>{process && <div className="journey-detail"><Focus size={22}/><div><span className="eyebrow">{process.name}</span><p>{process.purpose}</p></div><div><span className="eyebrow">TYPICAL TOLERANCE</span><strong className="mono">{process.tolerance}</strong></div><div><span className="eyebrow">QUALITY CHECK</span><p>{process.inspection}</p></div></div>}</section>;
}
