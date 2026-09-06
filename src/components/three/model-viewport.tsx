"use client";

import dynamic from "next/dynamic";
import type { Component } from "@/types/engineering";
const CanvasScene = dynamic(() => import("./canvas-scene").then((m) => m.CanvasScene), { ssr: false, loading: () => <div className="scene-loading"><span className="technical-spinner"/><span>INITIALIZING GEOMETRY ENGINE</span></div> });
export interface ModelViewportProps { component: Component; hero?: boolean; compact?: boolean; className?: string; onReady?: () => void }
export function ModelViewport(props: ModelViewportProps) { return <CanvasScene {...props} />; }
