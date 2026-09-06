"use client";

import { Component as ReactComponent, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CameraControls, Environment, Grid, Html, Lightformer, Line } from "@react-three/drei";
import { Group, Matrix4, Euler, Plane, Vector3 } from "three";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { MechanicalModel, getPartOffset } from "./models/mechanical-model";
import { useViewer } from "@/stores/viewer-store";
import { useAppStore } from "@/stores/app-store";
import type { ModelViewportProps } from "./model-viewport";
import type { Vec3 } from "@/types/engineering";

class SceneBoundary extends ReactComponent<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <SceneFallback onRetry={() => this.setState({ failed: false })}/> : this.props.children; }
}
function SceneFallback({ onRetry }: { onRetry?: () => void }) { return <div className="scene-fallback"><svg viewBox="0 0 300 160" aria-label="Technical shaft drawing"><g fill="none" stroke="currentColor"><path d="M20 68h40v-8h55V45h70v15h55v8h40v24h-40v8h-55v15h-70v-15H60v-8H20z"/><path d="M10 80h280M115 45v70M185 45v70M60 60v40M240 60v40" strokeDasharray="3 3"/><path d="M20 135h260m-260-5v10m260-10v10"/></g></svg><TriangleAlert size={18}/><h3>Geometry engine unavailable</h3><p>Your browser could not create a WebGL scene. Engineering data remains available.</p>{onRetry && <button className="button secondary" onClick={onRetry}><RotateCcw size={14}/> Retry visualization</button>}</div>; }
export function StudioLights() { return <><ambientLight intensity={0.45}/><directionalLight position={[3,7,5]} intensity={3.8} castShadow shadow-mapSize={[1024,1024]} shadow-bias={-0.001}/><directionalLight position={[-5,1,-2]} intensity={1.5} color="#aec3ec"/><Environment resolution={128}><Lightformer form="rect" intensity={5} position={[0,5,-3]} scale={[10,2,1]} rotation={[Math.PI/2,0,0]}/><Lightformer intensity={4} position={[-4,1,2]} scale={[2,9,1]} rotation={[0,Math.PI/2,0]}/><Lightformer intensity={3} position={[5,1,2]} scale={[3,10,1]} rotation={[0,-Math.PI/2,0]}/><Lightformer intensity={2} position={[0,0,6]} scale={[6,6,1]}/></Environment></>; }
function Scene({ component, hero, onReady }: ModelViewportProps) {
  const state = useViewer((s) => s);
  const root = useRef<Group>(null);
  const controls = useRef<CameraControls>(null);
  const userInteracted = useRef(false);
  const autoRotate = useAppStore((s) => s.autoRotate);
  const reduced = useAppStore((s) => s.reducedMotion);
  const { invalidate } = useThree();
  const planes = useMemo(() => {
    if (!state.section) return [];
    const normal = new Vector3(state.sectionAxis === "x" ? -1 : 0, state.sectionAxis === "y" ? -1 : 0, state.sectionAxis === "z" ? -1 : 0);
    return [new Plane(normal, state.sectionOffset).applyMatrix4(new Matrix4().makeRotationFromEuler(new Euler(0,0,-0.55)))];
  }, [state.section, state.sectionAxis, state.sectionOffset]);
  useEffect(() => { onReady?.(); }, [onReady]);
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const views = { iso: [6,3.5,9], front: [0,0,11], side: [11,0,0], top: [0,11,0.001] };
    const p = views[state.cameraPreset];
    void c.setLookAt(p[0],p[1],p[2],0,0,0,!reduced);
    userInteracted.current = false;
    invalidate();
  }, [state.cameraPreset, state.resetRevision, reduced, invalidate]);
  useEffect(() => {
    if (!state.focusTarget || !controls.current || !root.current) return;
    root.current.updateWorldMatrix(true, false);
    const offset = getPartOffset(component.modelKind, state.selectedPart || "", state.explode);
    const target = root.current.localToWorld(new Vector3(...state.focusTarget).add(new Vector3(...offset)));
    void controls.current.setLookAt(target.x+4.2,target.y+2.2,target.z+6,target.x,target.y,target.z,!reduced);
    userInteracted.current = true;
    invalidate();
  }, [state.focusTarget, state.focusRevision, state.explode, component.modelKind, state.selectedPart, reduced, invalidate]);
  useFrame((_, delta) => {
    if (hero && autoRotate && !reduced && !userInteracted.current && !state.measure && document.visibilityState === "visible") controls.current?.rotate(delta*0.09,0,false);
  });
  function select(partId: string, point: Vector3) {
    if (!root.current) return;
    const local = root.current.worldToLocal(point.clone()).toArray() as Vec3;
    if (state.measure) { state.addPoint(local); return; }
    const hotspot = component.hotspots.find((h) => h.partId === partId);
    state.set({ selectedPart: partId, selectedHotspot: hotspot?.id || null });
  }
  const distance = state.points.length === 2 ? new Vector3(...state.points[0]).distanceTo(new Vector3(...state.points[1])) * 50 : 0;
  return <>
    <StudioLights/>
    <group ref={root} rotation={[0,0,-0.55]}>
      <MechanicalModel kind={component.modelKind} explode={state.explode} wireframe={state.wireframe} edges={state.edges} selectedPart={state.selectedPart} analysis={state.analysis} thermalProgress={state.thermalProgress} clippingPlanes={planes} onSelect={select}/>
      {state.points.map((p,i) => <mesh key={i} position={p}><sphereGeometry args={[0.045,16,16]}/><meshBasicMaterial color="#78adff" depthTest={false}/></mesh>)}
      {state.points.length === 2 && <><Line points={state.points} color="#8dbaff" lineWidth={1.5} dashed dashSize={0.08} gapSize={0.04}/><Html position={new Vector3(...state.points[0]).lerp(new Vector3(...state.points[1]),0.5).toArray()} center><div className="measure-label"><span>DISTANCE</span><strong>{distance.toFixed(2)} mm</strong><small>Conceptual measurement</small></div></Html></>}
      {state.section && <mesh position={state.sectionAxis === "x" ? [state.sectionOffset,0,0] : state.sectionAxis === "y" ? [0,state.sectionOffset,0] : [0,0,state.sectionOffset]} rotation={state.sectionAxis === "x" ? [0,Math.PI/2,0] : state.sectionAxis === "y" ? [Math.PI/2,0,0] : [0,0,0]}><planeGeometry args={[6.5,6.5]}/><meshBasicMaterial color="#6c9fff" transparent opacity={0.055} side={2} depthWrite={false}/></mesh>}
    </group>
    <Grid position={[0,-3.5,0]} args={[30,30]} cellSize={0.6} sectionSize={3} cellColor="#272b31" sectionColor="#3b414b" cellThickness={0.5} sectionThickness={0.65} fadeDistance={20} fadeStrength={1.5} infiniteGrid/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-3.51,0]} receiveShadow><planeGeometry args={[30,30]}/><shadowMaterial transparent opacity={0.2}/></mesh>
    <CameraControls ref={controls} makeDefault minDistance={3} maxDistance={22} dollySpeed={0.7} smoothTime={0.3} onControlStart={() => { userInteracted.current = true; }} mouseButtons={{ left: state.interaction === "pan" ? 2 : state.interaction === "zoom" ? 8 : 1, middle: 8, right: 2, wheel: 8 }}/>
  </>;
}
export function CanvasScene(props: ModelViewportProps) {
  const quality = useAppStore((s) => s.quality);
  const [lost, setLost] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (container.current) observer.observe(container.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={container} className={`model-viewport ${props.hero ? "hero-viewport" : ""} ${props.className || ""}`} aria-label={`${props.component.name} interactive 3D model`}>
    <SceneBoundary>{lost ? <SceneFallback onRetry={() => { setLost(false); setEpoch((n) => n+1); }}/> : <Canvas key={epoch} shadows={quality === "high"} dpr={quality === "high" ? [1,1.75] : 1} frameloop={visible ? "always" : "never"} camera={{ position:[6,3.5,9], fov:35, near:0.1, far:80 }} gl={{ antialias:true, alpha:true, powerPreference:"high-performance" }} fallback={<SceneFallback/>} onCreated={({gl}) => { gl.localClippingEnabled = true; gl.domElement.addEventListener("webglcontextlost", (e) => { e.preventDefault(); setLost(true); }, { once:true }); }}><Suspense fallback={null}><Scene {...props}/></Suspense></Canvas>}</SceneBoundary>
    <div className="viewport-axis" aria-hidden="true"><span className="axis-y">Y</span><span className="axis-z">Z</span><span className="axis-x">X</span><svg viewBox="0 0 60 60"><path d="M30 33V5M30 33L7 47M30 33L55 45"/></svg></div>
  </div>;
}
