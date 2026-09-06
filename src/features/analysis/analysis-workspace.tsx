"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowUpRight, Crosshair, Pause, Play, ShieldAlert, Thermometer, Waves } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Link from "next/link";
import { components, getComponent } from "@/data/components";
import { ModelViewport } from "@/components/three/model-viewport";
import { Disclaimer, Eyebrow, SectionHeading, TechnicalValue } from "@/components/ui/primitives";
import { ViewerToolbar } from "@/features/viewer/viewer-toolbar";
import { useAppStore } from "@/stores/app-store";
import { useViewer, ViewerProvider } from "@/stores/viewer-store";
import type { AnalysisMode, Component } from "@/types/engineering";
import styles from "./analysis.module.css";

const modes = [
  { id: "stress", label: "Stress", icon: Activity },
  { id: "thermal", label: "Thermal", icon: Thermometer },
  { id: "wear", label: "Wear", icon: Waves },
  { id: "critical", label: "Critical zones", icon: ShieldAlert },
] as const;
const riskIndex = { Low: 25, Medium: 55, High: 85 };
const chartStyle = { background: "#151719", border: "1px solid #303439", borderRadius: 4, color: "#e5e7eb", fontSize: 12 };
const ambientTemperature = 22;
const temperatureAt = (component: Component, progress: number) => ambientTemperature + (component.analysis.maxTemperature - ambientTemperature) * ((1 - Math.exp(-3 * progress)) / (1 - Math.exp(-3)));

export function AnalysisWorkspace({ defaultComponentId }: { defaultComponentId?: string }) {
  const [componentId, setComponentId] = useState(() => getComponent(defaultComponentId || "input-shaft")?.id || components[0].id);
  const component = getComponent(componentId) || components[0];
  const setApp = useAppStore((state) => state.set);
  useEffect(() => { setApp({ activeComponent: component.id }); }, [component.id, setApp]);

  return <div className={styles.workspace}>
    <SectionHeading eyebrow="Engineering / Analysis" title="Understand the limits" description="Explore the forces, heat and surfaces that define a component.">
      <label className={styles.selector}><span>ACTIVE COMPONENT</span><select value={component.id} onChange={(event) => setComponentId(event.target.value)}>{components.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    </SectionHeading>
    {defaultComponentId && !getComponent(defaultComponentId) && <p className={styles.notice}>The requested component was not found. Select a component from the library to continue.</p>}
    <ViewerProvider key={component.id}><AnalysisExperience component={component}/></ViewerProvider>
  </div>;
}

function AnalysisExperience({ component }: { component: Component }) {
  const mode = useViewer((state) => state.analysis);
  const progress = useViewer((state) => state.thermalProgress);
  const playing = useViewer((state) => state.playing);
  const selectedHotspot = useViewer((state) => state.selectedHotspot);
  const set = useViewer((state) => state.set);
  const focus = useViewer((state) => state.focus);
  const progressRef = useRef(progress);
  useEffect(() => { set({ analysis: "stress", playing: false }); }, [set]);
  useEffect(() => { progressRef.current = progress; }, [progress]);
  useEffect(() => {
    if (!playing || mode !== "thermal") return;
    const timer = window.setInterval(() => {
      const next = Math.min(1, progressRef.current + 1 / 120);
      progressRef.current = next;
      set({ thermalProgress: next, playing: next < 1 });
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, mode, set]);

  const hotspot = component.hotspots.find((item) => item.id === selectedHotspot);
  const explanation = mode === "thermal" ? component.analysis.thermalExplanation : mode === "wear" ? component.analysis.wearExplanation : mode === "critical" ? "Criticality highlights where geometry, loading and inspection requirements deserve the most attention. Select a zone to locate it on the model." : component.analysis.stressExplanation;
  const title = mode === "thermal" ? component.modelKind === "coil" ? "Steel workpiece / thermal" : "Thermal response" : mode === "wear" ? "Surface & contact" : mode === "critical" ? "Design-critical regions" : "Load & stress";
  const selectMode = (analysis: AnalysisMode) => set({ analysis, playing: false });
  const curve = useMemo(() => Array.from({ length: 21 }, (_, index) => {
    const position = index * 5;
    const shape = 0.3 + 0.7 * Math.exp(-Math.pow((position - 60) / 18, 2));
    return { position, stress: Math.round(component.analysis.maxStress * shape), temperature: Number(temperatureAt(component, position / 100).toFixed(1)) };
  }), [component]);
  const visibleThermalCurve = useMemo(() => {
    const current = progress * 100;
    const history = curve.filter((point) => point.position < current);
    return [...history, { position: current, temperature: Number(temperatureAt(component, progress).toFixed(1)) }];
  }, [component, curve, progress]);
  const hotspotData = component.hotspots.map((item, index) => ({ name: `Z${String(index + 1).padStart(2, "0")}`, value: riskIndex[item.criticality] }));

  return <>
    <div className={styles.modeBar}>
      <div className={styles.modes} aria-label="Analysis overlay">{modes.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={mode === id} className={`${styles.mode} ${mode === id ? styles.activeMode : ""}`} onClick={() => selectMode(id)}><Icon size={15}/>{label}</button>)}</div>
      <span className={styles.simulationLabel}><span/>CONCEPTUAL SIMULATION</span>
    </div>
    <div className={styles.analysisGrid}>
      <section className={styles.modelPanel} aria-label={`${component.name} analysis model`}>
        <div className={styles.modelHeading}><div><Eyebrow>{component.partNumber}</Eyebrow><h2>{component.name}</h2></div><span className={styles.viewLabel}>LIVE 3D / {mode.toUpperCase()}</span></div>
        <div className={styles.viewport}><ModelViewport component={component}/></div>
        <div className={styles.legend}><span>{mode === "thermal" ? `${ambientTemperature} °C` : "LOW"}</span><i className={mode === "thermal" ? styles.thermalGradient : styles.stressGradient}/><span>{mode === "thermal" ? `${component.analysis.maxTemperature} °C` : "HIGH"}</span><small>Illustrative overlay · not a solved field</small></div>
        <div className={styles.toolbar}><ViewerToolbar/></div>
      </section>
      <aside className={styles.inspector}>
        <Eyebrow>01 / {title}</Eyebrow>
        <div className={styles.mainMetric}>{mode === "thermal" ? <><strong>{temperatureAt(component, progress).toFixed(0)}</strong><span>°C</span></> : mode === "wear" ? <><strong className={styles.wordMetric}>{component.analysis.wearRisk}</strong><span>wear risk</span></> : mode === "critical" ? <><strong>{component.hotspots.filter((item) => item.criticality === "High").length.toString().padStart(2, "0")}</strong><span>high-priority zones</span></> : <><strong>{component.analysis.maxStress}</strong><span>MPa / peak</span></>}</div>
        <p className={styles.explanation}>{explanation}</p>
        <div className={styles.metrics}>{mode === "thermal" ? <><TechnicalValue label="Peak temperature" value={component.analysis.maxTemperature} unit="°C"/><TechnicalValue label="Ramp completion" value={Math.round(progress * 100)} unit="%"/></> : mode === "wear" ? <><TechnicalValue label="Material wear index" value={component.material.wearResistance} unit="/ 10"/><TechnicalValue label="Material hardness" value={component.material.hardness}/></> : mode === "critical" ? <><TechnicalValue label="Component criticality" value={component.criticality}/><TechnicalValue label="Mapped regions" value={component.hotspots.length}/></> : <><TechnicalValue label="Material yield strength" value={component.material.yieldStrength} unit="MPa"/><TechnicalValue label="Critical region" value={component.analysis.criticalArea}/></>}</div>
        <div className={styles.zonesHeading}><Eyebrow>Focus a region</Eyebrow><Crosshair size={14}/></div>
        <div className={styles.hotspots}>{component.hotspots.map((item, index) => <button key={item.id} className={`${styles.hotspot} ${selectedHotspot === item.id ? styles.selectedHotspot : ""}`} onClick={() => focus(item)} aria-pressed={selectedHotspot === item.id}><span className={styles.zoneNumber}>{String(index + 1).padStart(2, "0")}</span><span><strong>{item.name}</strong><small>{item.criticality} criticality</small></span><ArrowUpRight size={15}/></button>)}</div>
        {hotspot && <div className={styles.focusDetail} aria-live="polite"><strong>{hotspot.name}</strong><p>{hotspot.description}</p><span>{hotspot.surfaceFinish} · {hotspot.tolerance}</span></div>}
        <Link href={`/ai?component=${component.id}`} className={styles.assistantLink}>Ask about this component <ArrowUpRight size={15}/></Link>
      </aside>
    </div>
    <div className={styles.bottomGrid}>
      <section className={styles.chartPanel}>
        <div className={styles.chartHeading}><div><Eyebrow>02 / Response profile</Eyebrow><h3>{mode === "thermal" ? "A progressive thermal ramp" : mode === "wear" ? "Inspection attention by region" : mode === "critical" ? "Regional criticality index" : "Along the conceptual load path"}</h3></div><span className={styles.chartUnit}>{mode === "thermal" ? "TEMPERATURE / °C" : mode === "stress" || mode === "none" ? "STRESS / MPa" : "ORDINAL INDEX / 100"}</span></div>
        <div className={styles.chart} role="img" aria-label={mode === "thermal" ? `Illustrative temperature curve, currently ${Math.round(temperatureAt(component, progress))} degrees Celsius at ${Math.round(progress * 100)} percent completion.` : mode === "stress" || mode === "none" ? `Conceptual stress profile with peak ${component.analysis.maxStress} megapascals.` : "Illustrative regional attention index: low 25, medium 55, high 85. See the focus region list for each region’s criticality."}>
          <ResponsiveContainer width="100%" height="100%">
            {mode === "wear" || mode === "critical" ? <BarChart data={hotspotData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}><CartesianGrid stroke="#25292d" vertical={false}/><XAxis dataKey="name" tick={{ fill: "#858c95", fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis domain={[0, 100]} tick={{ fill: "#858c95", fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={chartStyle} cursor={{ fill: "#ffffff05" }}/><Bar dataKey="value" name="Attention index" fill="#899aa8" maxBarSize={50} radius={[2, 2, 0, 0]}/></BarChart> : <AreaChart data={mode === "thermal" ? visibleThermalCurve : curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="analysis-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7e9bb6" stopOpacity={0.22}/><stop offset="100%" stopColor="#7e9bb6" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#25292d" vertical={false}/><XAxis type="number" dataKey="position" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: "#858c95", fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis domain={mode === "thermal" ? [0, Math.ceil(component.analysis.maxTemperature / 20) * 20] : [0, Math.ceil(component.analysis.maxStress / 50) * 50]} tick={{ fill: "#858c95", fontSize: 11 }} axisLine={false} tickLine={false}/><Tooltip contentStyle={chartStyle} labelFormatter={(value) => `${Number(value).toFixed(0)}% ${mode === "thermal" ? "ramp completion" : "load path"}`}/>{mode === "thermal" && <ReferenceLine x={progress * 100} stroke="#778c9e" strokeDasharray="3 3"/>}<Area type="monotone" dataKey={mode === "thermal" ? "temperature" : "stress"} name={mode === "thermal" ? "Temperature (°C)" : "Stress (MPa)"} stroke="#92aac1" strokeWidth={2} fill="url(#analysis-chart-fill)" isAnimationActive={false}/></AreaChart>}
          </ResponsiveContainer>
        </div>
        {mode === "thermal" ? <div className={styles.playback}><button className={styles.playButton} onClick={() => { if (progress >= 1) { progressRef.current = 0; set({ thermalProgress: 0, playing: true }); } else set({ playing: !playing }); }} aria-label={playing ? "Pause thermal ramp" : "Play thermal ramp"}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button><label htmlFor="thermal-progress">RAMP</label><input id="thermal-progress" aria-label="Thermal ramp completion" type="range" min="0" max="1" step="0.01" value={progress} onChange={(event) => { const value = Number(event.target.value); progressRef.current = value; set({ thermalProgress: value, playing: false }); }}/><output htmlFor="thermal-progress">{Math.round(progress * 100)}%</output></div> : <p className={styles.chartCaption}>{mode === "stress" || mode === "none" ? "Normalized load-path position, not a measured section coordinate." : `Z01–Z${String(component.hotspots.length).padStart(2, "0")} correspond to the numbered model regions. Low = 25 · Medium = 55 · High = 85. These are ordinal attention bands, not probabilities.`}</p>}
      </section>
      <section className={styles.methodPanel}><Eyebrow>03 / Read with context</Eyebrow><h3>A visual hypothesis.<br/>Not a validation.</h3><p>{mode === "thermal" ? "The ramp starts at an assumed 22 °C and approaches the illustrative peak. Playback is a normalized progression, not elapsed physical time or a transient heat-transfer solution." : mode === "wear" ? "Material wear resistance is an illustrative index. Regional bars reuse mapped criticality as inspection attention; they do not estimate contact pressure, friction, lubrication or service life." : mode === "critical" ? "Mapped regions are curated engineering observations. Their priority is qualitative and does not represent a failure probability or a certified risk assessment." : "The curve is a synthetic profile scaled to the component’s illustrative peak. The color field is procedural, not a finite-element result. No loads, constraints or mesh have been solved."}</p><p>Validate with the actual geometry, load case, material condition and a qualified engineering review before making design decisions.</p><Disclaimer/></section>
    </div>
  </>;
}
