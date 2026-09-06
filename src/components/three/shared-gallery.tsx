"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, View } from "@react-three/drei";
import { Group } from "three";
import { MechanicalModel } from "./models/mechanical-model";
import { StudioLights } from "./canvas-scene";
import type { PreviewGalleryProps } from "./preview-gallery";
import type { Component } from "@/types/engineering";
function PreviewScene({ item, active }: { item: Component; active: boolean }) {
  const group = useRef<Group>(null);
  useFrame((state,delta) => { if (active && group.current) { group.current.rotation.y += delta*0.35; state.invalidate(); } });
  return <><PerspectiveCamera makeDefault position={[5,3,9]} fov={item.modelKind === "shaft" || item.modelKind === "spindle" ? 34 : 28}/><StudioLights/><group ref={group} rotation={[0,0,-0.55]}><MechanicalModel kind={item.modelKind}/></group></>;
}
function Preview({ item }: { item: Component }) {
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting)); if(ref.current) observer.observe(ref.current); return () => observer.disconnect(); }, []);
  return <div ref={ref} className="component-preview" onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)}><View visible={visible} className="preview-view"><PreviewScene item={item} active={active}/></View><span className="preview-crosshair">+</span><span className="preview-tag">3D / {item.modelKind.toUpperCase()}</span></div>;
}
export function SharedGallery({ items, renderItem }: PreviewGalleryProps) {
  const container = useRef<HTMLDivElement>(null!);
  return <div className="preview-gallery" ref={container}><div className="component-grid">{items.map((item,i) => <Fragment key={`${item.id}-${i}`}>{renderItem(item,<Preview item={item}/>)}</Fragment>)}</div><Canvas className="gallery-canvas" eventSource={container} frameloop="demand" dpr={[1,1.25]} gl={{ alpha:true,antialias:true }}><View.Port/></Canvas></div>;
}
