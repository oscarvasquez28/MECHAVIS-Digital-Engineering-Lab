"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowUpRight, Check, Info, Scale, ShieldCheck, TriangleAlert, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { components, getComponent } from "@/data/components";
import { PreviewGallery } from "@/components/three/preview-gallery";
import { Disclaimer, Eyebrow, SectionHeading } from "@/components/ui/primitives";
import type { Component } from "@/types/engineering";
import styles from "./comparison.module.css";

type Priority = "balance" | "strength" | "cost";
const criteria = [
  { key: "strength", label: "Strength", detail: "Material yield strength", read: (item: Component) => item.material.yieldStrength, lower: false },
  { key: "fatigue", label: "Fatigue", detail: "Illustrative fatigue index", read: (item: Component) => item.material.fatigueResistance, lower: false },
  { key: "wear", label: "Wear", detail: "Illustrative wear index", read: (item: Component) => item.material.wearResistance, lower: false },
  { key: "lightness", label: "Lightness", detail: "Lower component mass", read: (item: Component) => item.weight, lower: true },
  { key: "economy", label: "Economy", detail: "Lower raw-material cost index", read: (item: Component) => item.material.costIndex, lower: true },
] as const;
const priorities = [
  { id: "balance", label: "Balanced", icon: Scale, weights: [25, 20, 20, 15, 20], description: "A balanced view of strength, durability, mass and material economy." },
  { id: "strength", label: "Strength first", icon: ShieldCheck, weights: [45, 25, 15, 10, 5], description: "Yield strength and fatigue resistance lead; cost is secondary." },
  { id: "cost", label: "Cost first", icon: Wallet, weights: [10, 10, 10, 10, 60], description: "Raw-material economy leads. This is not a finished-part cost estimate." },
] as const;
const bounds = criteria.map((criterion) => {
  const values = components.map(criterion.read);
  return { min: Math.min(...values), max: Math.max(...values) };
});
const scoreCriterion = (component: Component, index: number) => {
  const { min, max } = bounds[index];
  if (max === min) return 50;
  const value = (criteria[index].read(component) - min) / (max - min);
  return Math.max(0, Math.min(100, (criteria[index].lower ? 1 - value : value) * 100));
};
const format = (value: number, digits = 0) => new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
const chartStyle = { background: "#151a20", border: "1px solid #34404e", borderRadius: 4, color: "#dce6f0", fontSize: 11 };

export function ComparisonWorkspace() {
  const [leftId, setLeftId] = useState("input-shaft");
  const [rightId, setRightId] = useState("alloy-shaft");
  const [priority, setPriority] = useState<Priority>("balance");
  const [chartView, setChartView] = useState<"radar" | "bars">("radar");
  const left = getComponent(leftId) || components[0];
  const right = getComponent(rightId) || components.find((item) => item.id !== left.id)!;
  const items = useMemo(() => [left, right], [left, right]);
  const selectedPriority = priorities.find((item) => item.id === priority)!;
  const scores = items.map((item) => criteria.reduce((total, _, index) => total + scoreCriterion(item, index) * selectedPriority.weights[index] / 100, 0));
  const winnerIndex = scores[0] >= scores[1] ? 0 : 1;
  const winner = items[winnerIndex];
  const other = items[1 - winnerIndex];
  const tied = Math.abs(scores[0] - scores[1]) < 0.5;
  const equivalentFamily = left.modelKind === right.modelKind;
  const chartData = criteria.map((criterion, index) => ({ subject: criterion.label, left: Number(scoreCriterion(left, index).toFixed(1)), right: Number(scoreCriterion(right, index).toFixed(1)) }));
  const advantages = criteria.map((criterion, index) => ({ label: criterion.label.toLowerCase(), delta: scoreCriterion(winner, index) - scoreCriterion(other, index) })).filter((item) => item.delta > 1).sort((a, b) => b.delta - a.delta).slice(0, 2);
  const rows: { label: string; unit?: string; read: (item: Component) => string }[] = [
    { label: "Component family", read: (item) => item.category },
    { label: "Material", read: (item) => item.material.name },
    { label: "Overall length", unit: "mm", read: (item) => format(item.overallLength, 1) },
    { label: "Envelope diameter", unit: "mm", read: (item) => format(item.diameter, 1) },
    { label: "Component mass", unit: "kg", read: (item) => format(item.weight, 2) },
    { label: "Material density", unit: "kg/m³", read: (item) => format(item.material.density) },
    { label: "Yield strength", unit: "MPa", read: (item) => format(item.material.yieldStrength) },
    { label: "Tensile strength", unit: "MPa", read: (item) => format(item.material.tensileStrength) },
    { label: "Hardness / condition", read: (item) => item.material.hardness },
    { label: "Wear resistance", unit: "index / 10", read: (item) => format(item.material.wearResistance) },
    { label: "Fatigue resistance", unit: "index / 10", read: (item) => format(item.material.fatigueResistance) },
    { label: "Raw-material cost", unit: "relative index", read: (item) => item.material.costIndex.toFixed(2) },
    { label: "Design tolerance", read: (item) => item.tolerance },
    { label: "Criticality", read: (item) => item.criticality },
    { label: "Manufacturing route", read: (item) => item.manufacturingProcess.map((process) => process.name).join(" → ") },
  ];
  const selectComponent = (slot: "left" | "right", id: string) => {
    if (slot === "left") { if (id === right.id) setRightId(left.id); setLeftId(id); }
    else { if (id === left.id) setLeftId(right.id); setRightId(id); }
  };

  return <div className={styles.workspace}>
    <SectionHeading eyebrow="Engineering / Comparison" title="Every choice is a trade-off" description="Bring two components into focus. Compare the data. Understand the decision."><span className={styles.libraryCount}>{components.length.toString().padStart(2, "0")} COMPONENTS / ONE PERSPECTIVE</span></SectionHeading>
    <div className={styles.selectionBar}><label className={styles.selector}><span><i className={styles.dotA}/>COMPONENT A</span><select aria-label="Component A" value={left.id} onChange={(event) => selectComponent("left", event.target.value)}>{components.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className={styles.swap} onClick={() => { setLeftId(right.id); setRightId(left.id); }} aria-label="Swap compared components" title="Swap components"><ArrowLeftRight size={17}/></button><label className={styles.selector}><span><i className={styles.dotB}/>COMPONENT B</span><select aria-label="Component B" value={right.id} onChange={(event) => selectComponent("right", event.target.value)}>{components.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
    {!equivalentFamily && <div className={styles.familyWarning} role="status"><TriangleAlert size={16}/><div><strong>Different component families — not interchangeable.</strong><p>{left.name} and {right.name} serve different functions. Compare material and geometry attributes for reference only; rankings do not establish equivalent duty or suitability.</p></div></div>}
    <div className={styles.previews}><PreviewGallery items={items} renderItem={(item, preview) => <article className={styles.previewCard}><div className={styles.previewMeta}><Eyebrow><i className={item.id === left.id ? styles.dotA : styles.dotB}/>{item.id === left.id ? "A" : "B"} / {item.partNumber}</Eyebrow><span>{item.modelKind.toUpperCase()}</span></div><div className={styles.previewModel}>{preview}</div><div className={styles.previewInfo}><div><h2>{item.name}</h2><p>{item.material.name}</p></div><Link href={`/components/${item.id}`} aria-label={`Explore ${item.name}`}><ArrowUpRight size={20}/></Link></div><div className={styles.previewStats}><div><span>MASS</span><strong>{format(item.weight, 2)}<small> kg</small></strong></div><div><span>YIELD STRENGTH</span><strong>{format(item.material.yieldStrength)}<small> MPa</small></strong></div><div><span>MATERIAL COST</span><strong>{item.material.costIndex.toFixed(2)}<small> ×</small></strong></div></div></article>}/></div>
    <div className={styles.decisionGrid}>
      <section className={styles.chartPanel}>
        <div className={styles.chartHeader}><div><Eyebrow>01 / Relative performance</Eyebrow><h3>Different strengths.<br/>One common scale.</h3></div><div className={styles.chartToggle} aria-label="Comparison chart type"><button type="button" onClick={() => setChartView("radar")} aria-pressed={chartView === "radar"}>Radar</button><button type="button" onClick={() => setChartView("bars")} aria-pressed={chartView === "bars"}>Bars</button></div></div>
        <div className={styles.chart} role="img" aria-label={`Illustrative relative comparison, zero to one hundred. ${criteria.map((criterion, index) => `${criterion.label}: component A ${Math.round(scoreCriterion(left, index))}, component B ${Math.round(scoreCriterion(right, index))}`).join(". ")}.`}>
          <ResponsiveContainer width="100%" height="100%">{chartView === "radar" ? <RadarChart data={chartData} outerRadius="72%"><PolarGrid stroke="#303943"/><PolarAngleAxis dataKey="subject" tick={{ fill: "#96a6b7", fontSize: 11 }}/><PolarRadiusAxis domain={[0, 100]} ticks={[25, 50, 75, 100]} axisLine={false} tick={{ fill: "#607488", fontSize: 9 }}/><Radar name={left.name} dataKey="left" stroke="#82a4c7" fill="#82a4c7" fillOpacity={0.13} strokeWidth={1.7} isAnimationActive={false}/><Radar name={right.name} dataKey="right" stroke="#c7c9ca" fill="#c7c9ca" fillOpacity={0.04} strokeWidth={1.5} strokeDasharray="4 3" isAnimationActive={false}/><Tooltip contentStyle={chartStyle}/></RadarChart> : <BarChart data={chartData} layout="vertical" margin={{ top: 15, right: 25, left: 5, bottom: 10 }}><CartesianGrid stroke="#29333e" horizontal={false}/><XAxis type="number" domain={[0, 100]} tick={{ fill: "#6c8197", fontSize: 10 }} tickLine={false} axisLine={false}/><YAxis dataKey="subject" type="category" width={70} tick={{ fill: "#96a6b7", fontSize: 10 }} tickLine={false} axisLine={false}/><Tooltip contentStyle={chartStyle} cursor={{ fill: "#ffffff04" }}/><Bar name={left.name} dataKey="left" fill="#82a4c7" radius={[0, 2, 2, 0]} maxBarSize={12} isAnimationActive={false}/><Bar name={right.name} dataKey="right" fill="#c7c9ca" radius={[0, 2, 2, 0]} maxBarSize={12} isAnimationActive={false}/></BarChart>}</ResponsiveContainer>
        </div>
        <div className={styles.chartLegend}><span><i className={styles.dotA}/>{left.name}</span><span><i className={styles.dotB}/>{right.name}</span></div>
        <p className={styles.normalization}><Info size={13}/><span>Illustrative 0–100 scores, normalized across all {components.length} library components. Higher is favorable on every axis; mass and material cost are inverted. These are relative attributes, not engineering ratings.</span></p>
        <details className={styles.methodology}><summary>How the scores are calculated</summary><p>Each axis uses the catalog minimum and maximum: 100 × (value − minimum) / (maximum − minimum). Lightness and economy use 100 minus that result. An equal-valued axis receives 50. The radar does not change when the decision priority changes; only the weighted recommendation does.</p><ul>{criteria.map((criterion, index) => <li key={criterion.key}><strong>{criterion.label}:</strong> {criterion.detail}. Catalog range {format(bounds[index].min, 2)}–{format(bounds[index].max, 2)}.</li>)}</ul><p>Mass is component-level, so geometry and size affect the lightness score. Material properties describe illustrative conditions. Raw-material cost excludes mass, processing, yield, tooling, region and order quantity.</p></details>
      </section>
      <section className={styles.recommendation} aria-label="Priority-based recommendation">
        <Eyebrow>02 / Decision lens</Eyebrow><h3>What matters most?</h3><p className={styles.priorityDescription}>Set a priority to see how the trade-off changes.</p>
        <div className={styles.priorities}>{priorities.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setPriority(id)} aria-pressed={priority === id}><Icon size={14}/>{label}</button>)}</div>
        <div className={styles.recommendationResult} aria-live="polite"><span className={styles.resultLabel}>{!equivalentFamily ? "REFERENCE LEAD / NOT A SUBSTITUTE" : tied ? "CLOSE RESULT / REVIEW BOTH" : "ILLUSTRATIVE SHORTLIST"}</span><h4>{tied ? "Too close to call." : winner.name}</h4><p>{tied ? "The weighted scores are within 0.5 points. Real loading, dimensional compatibility and manufacturing requirements should drive the choice." : `${winner.name} leads this ${priority === "balance" ? "balanced" : priority === "strength" ? "strength-focused" : "cost-focused"} view by ${Math.abs(scores[0] - scores[1]).toFixed(1)} points.${advantages.length ? ` Its clearest relative advantages are ${advantages.map((item) => item.label).join(" and ")}.` : ""}`}</p><p>{selectedPriority.description}</p></div>
        <div className={styles.scoreList}>{items.map((item, index) => <div className={styles.scoreRow} key={item.id}><div><i className={index === 0 ? styles.dotA : styles.dotB}/><span>{item.name}</span>{index === winnerIndex && !tied && <Check size={13}/>}<strong>{scores[index].toFixed(1)}<small> / 100</small></strong></div><div className={styles.scoreTrack}><span style={{ width: `${scores[index]}%`, background: index === 0 ? "#82a4c7" : "#b9bfc6" }}/></div></div>)}</div>
        <div className={styles.weights}><Eyebrow>Applied weights</Eyebrow>{criteria.map((criterion, index) => <div key={criterion.key}><span>{criterion.label}</span><span>{selectedPriority.weights[index]}%</span></div>)}</div>
        <p className={styles.recommendationLimit}>{equivalentFamily ? "Same model family does not guarantee fit or interchangeability. Confirm interfaces, load cases and material conditions." : "Different functions cannot be reduced to a single score. This lead is for exploration only, not component selection."}</p>
      </section>
    </div>
    <section className={styles.specificationPanel}><div className={styles.tableHeading}><div><Eyebrow>03 / Side by side</Eyebrow><h3>The numbers behind the decision.</h3></div><Disclaimer compact/></div><div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Component specifications comparison"><table className={styles.table}><caption>Raw illustrative component data. Wear and fatigue are ordinal 1–10 indices. Raw-material cost is relative to AISI 4140 at 1.00.</caption><thead><tr><th scope="col">PROPERTY <span>/ UNIT</span></th><th scope="col"><i className={styles.dotA}/>{left.name}</th><th scope="col"><i className={styles.dotB}/>{right.name}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}{row.unit && <small>{row.unit}</small>}</th><td>{row.read(left)}</td><td>{row.read(right)}</td></tr>)}</tbody></table></div><div className={styles.conditions}>{items.map((item, index) => <p key={item.id}><strong>{index === 0 ? "A" : "B"} / MATERIAL CONDITION</strong>{item.material.condition}</p>)}</div><Disclaimer/></section>
  </div>;
}
