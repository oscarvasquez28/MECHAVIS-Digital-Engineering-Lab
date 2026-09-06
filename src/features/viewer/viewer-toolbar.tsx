"use client";

import { Box, Expand, Focus, Hand, Layers3, Maximize, Move3D, RotateCcw, Ruler, ScanLine, ZoomIn } from "lucide-react";
import { useViewer } from "@/stores/viewer-store";
export function ViewerToolbar() {
  const s = useViewer((state) => state);
  const tools = [
    { label:"Rotate", icon:Move3D, active:s.interaction === "rotate", action:() => s.set({ interaction:"rotate" }) },
    { label:"Pan", icon:Hand, active:s.interaction === "pan", action:() => s.set({ interaction:"pan" }) },
    { label:"Zoom", icon:ZoomIn, active:s.interaction === "zoom", action:() => s.set({ interaction:"zoom" }) },
    { label:"Reset", icon:RotateCcw, active:false, action:s.reset },
    { label:"Explode", icon:Expand, active:s.explode > 0, action:() => s.set({ explode:s.explode ? 0 : 0.65 }) },
    { label:"Section", icon:ScanLine, active:s.section, action:() => s.set({ section:!s.section }) },
    { label:"Wireframe", icon:Box, active:s.wireframe, action:() => s.set({ wireframe:!s.wireframe }) },
    { label:"Edges", icon:Layers3, active:s.edges, action:() => s.set({ edges:!s.edges }) },
    { label:"Measure", icon:Ruler, active:s.measure, action:() => s.set({ measure:!s.measure }) },
  ];
  return <div className="viewer-control-area">
    {s.explode > 0 && <div className="mode-adjustment"><Expand size={13}/><span>EXPLODED VIEW</span><input aria-label="Exploded view percentage" type="range" min="0" max="100" value={s.explode*100} onChange={(e) => s.set({ explode:Number(e.target.value)/100 })}/><strong>{Math.round(s.explode*100)}%</strong></div>}
    {s.section && <div className="mode-adjustment"><ScanLine size={13}/><span>VISUAL SECTION</span><select aria-label="Section axis" value={s.sectionAxis} onChange={(e) => s.set({ sectionAxis:e.target.value as "x"|"y"|"z" })}><option value="x">X</option><option value="y">Y</option><option value="z">Z</option></select><input aria-label="Section position" type="range" min="-3" max="3" step="0.05" value={s.sectionOffset} onChange={(e) => s.set({ sectionOffset:Number(e.target.value) })}/></div>}
    {s.measure && <div className="mode-adjustment"><Ruler size={13}/><span>{s.points.length === 0 ? "SELECT FIRST POINT ON THE MODEL" : s.points.length === 1 ? "SELECT SECOND POINT" : "SELECT TO START A NEW MEASUREMENT"}</span><button onClick={() => s.set({ points:[] })}>Clear</button></div>}
    <div className="viewer-toolbar" aria-label="3D controls">{tools.map(({ label,icon:Icon,active,action }) => <button key={label} title={label} aria-label={label} aria-pressed={active} className={active ? "active" : ""} onClick={action}><Icon size={16}/><span>{label}</span></button>)}<div className="toolbar-separator"/><label className="camera-select"><Focus size={15}/><select aria-label="Camera view" value={s.cameraPreset} onChange={(e) => s.set({ cameraPreset:e.target.value as typeof s.cameraPreset })}><option value="iso">ISO</option><option value="front">FRONT</option><option value="side">SIDE</option><option value="top">TOP</option></select></label><button aria-label="Fit model" title="Fit model" onClick={s.reset}><Maximize size={16}/></button></div>
  </div>;
}
