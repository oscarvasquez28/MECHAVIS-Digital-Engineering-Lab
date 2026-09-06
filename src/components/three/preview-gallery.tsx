"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { Component } from "@/types/engineering";
export interface PreviewGalleryProps { items: Component[]; renderItem: (item: Component, preview: ReactNode) => ReactNode }
const SharedGallery = dynamic(() => import("./shared-gallery").then((m) => m.SharedGallery), { ssr:false, loading:() => <div className="scene-loading"><span className="technical-spinner"/>PREPARING COMPONENT LIBRARY</div> });
export function PreviewGallery(props: PreviewGalleryProps) { return <SharedGallery {...props}/>; }
