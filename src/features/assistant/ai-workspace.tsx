"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Crosshair } from "lucide-react";
import { components, getComponent } from "@/data/components";
import { ModelViewport } from "@/components/three/model-viewport";
import { Eyebrow, SectionHeading, TechnicalValue } from "@/components/ui/primitives";
import { ViewerToolbar } from "@/features/viewer/viewer-toolbar";
import { useAppStore } from "@/stores/app-store";
import { useViewer, ViewerProvider } from "@/stores/viewer-store";
import type { Component } from "@/types/engineering";
import { AssistantPanel } from "./assistant-panel";
import styles from "./assistant.module.css";

export function AIWorkspace({ defaultComponentId }: { defaultComponentId?: string }) {
  const [componentId, setComponentId] = useState(() => getComponent(defaultComponentId || "input-shaft")?.id || components[0].id);
  const component = getComponent(componentId) || components[0];
  const setApp = useAppStore((state) => state.set);
  useEffect(() => { setApp({ activeComponent: component.id }); }, [component.id, setApp]);
  return <div className={styles.workspace}>
    <SectionHeading eyebrow="Engineering / Intelligence" title="Ask better questions" description="Your component. In context. A new way to explore engineering decisions."><label className={styles.selector}><span>ACTIVE COMPONENT</span><select value={component.id} onChange={(event) => setComponentId(event.target.value)}>{components.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></SectionHeading>
    {defaultComponentId && !getComponent(defaultComponentId) && <p className={styles.notice}>The requested component was not found. The assistant is using {component.name}.</p>}
    <ViewerProvider key={component.id}><div className={styles.workspaceGrid}><AssistantModel component={component}/><AssistantPanel component={component}/></div></ViewerProvider>
  </div>;
}

function AssistantModel({ component }: { component: Component }) {
  const selectedHotspot = useViewer((state) => state.selectedHotspot);
  const focus = useViewer((state) => state.focus);
  const hotspot = component.hotspots.find((item) => item.id === selectedHotspot);
  return <section className={styles.modelPanel} aria-label={`${component.name} contextual model`}>
    <div className={styles.modelHeader}><div><Eyebrow>{component.partNumber} / DIGITAL TWIN</Eyebrow><h2>{component.name}</h2><p>{component.subtitle}</p></div><span className={styles.linkedLabel}><span/>CONTEXT LINKED</span></div>
    <div className={styles.viewport}><ModelViewport component={component}/></div>
    <div className={styles.modelHint}><Crosshair size={13}/><span>Select a model marker to give your question a precise context.</span></div>
    <div className={styles.toolbar}><ViewerToolbar/></div>
    <div className={styles.componentContext}><div className={styles.componentMetrics}><TechnicalValue label="Material" value={component.material.name}/><TechnicalValue label="Mass" value={component.weight} unit="kg"/><TechnicalValue label="Criticality" value={component.criticality}/></div><div className={styles.regionHeader}><Eyebrow>Mapped regions</Eyebrow><span>{component.hotspots.length.toString().padStart(2, "0")}</span></div><div className={styles.regionList}>{component.hotspots.map((item, index) => <button type="button" key={item.id} className={selectedHotspot === item.id ? styles.activeRegion : ""} onClick={() => focus(item)} aria-pressed={selectedHotspot === item.id}><span>{String(index + 1).padStart(2, "0")}</span>{item.name}<ArrowUpRight size={12}/></button>)}</div>{hotspot && <p className={styles.regionDescription} aria-live="polite"><strong>{hotspot.name}</strong> — {hotspot.description}</p>}<Link href={`/components/${component.id}`} className={styles.detailLink}>Open full component workspace <ArrowUpRight size={14}/></Link></div>
  </section>;
}
