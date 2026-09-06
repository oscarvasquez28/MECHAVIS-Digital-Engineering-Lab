"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Activity, Blocks, Box, ChevronRight, Command, Cpu, FlaskConical, GitCompareArrows, Hexagon, Layers3, MoveUpRight, Ruler, Search, Settings2, Sparkles } from "lucide-react";
import { MotionConfig } from "motion/react";
import { useAppStore } from "@/stores/app-store";
import { CommandPalette } from "./command-palette";
import { ToolPanels } from "./tool-panels";
const navigation = [{ href:"/", label:"Overview", icon:Hexagon },{ href:"/components", label:"Components", icon:Blocks },{ href:"/analysis", label:"Analysis", icon:Activity },{ href:"/compare", label:"Compare", icon:GitCompareArrows },{ href:"/ai", label:"AI Assistant", icon:Sparkles }];
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const set = useAppStore((s) => s.set);
  const active = useAppStore((s) => s.activeComponent);
  const reduced = useAppStore((s) => s.reducedMotion);
  const detail = pathname.startsWith("/components/");
  const label = navigation.find((n) => n.href !== "/" && pathname.startsWith(n.href))?.label || "Overview";
  useEffect(() => { void useAppStore.persist.rehydrate(); const onKey = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); set({ commandOpen:!useAppStore.getState().commandOpen }); } }; window.addEventListener("keydown",onKey); return () => window.removeEventListener("keydown",onKey); },[set]);
  return <MotionConfig reducedMotion={reduced ? "always" : "user"}><div className={`app-shell ${detail ? "focused-shell" : ""}`}>
    <aside className="sidebar"><Link href="/" className="brand" aria-label="MECHAVIS overview"><div className="brand-symbol"><svg viewBox="0 0 30 30" fill="none"><path d="M4 23V7l11 8L26 7v16M4 7l11 16L26 7" stroke="currentColor" strokeWidth="2"/></svg></div><span>MECHAVIS<small>DIGITAL ENGINEERING LAB</small></span></Link><div className="workspace-label"><span className="workspace-symbol"><Box size={14}/></span><span>Engineering workspace<small>PERSONAL LAB</small></span><ChevronRight size={13}/></div><div className="nav-group-label">LAB</div><nav aria-label="Main navigation">{navigation.map(({href,label,icon:Icon}) => <Link title={label} className={`nav-item ${(href === "/" ? pathname === "/" : pathname.startsWith(href)) ? "active" : ""}`} href={href} key={href}><Icon size={17}/><span>{label}</span>{label === "AI Assistant" && <small className="nav-badge">BETA</small>}</Link>)}</nav><div className="nav-group-label">TOOLS</div><nav aria-label="Engineering tools"><button className="nav-item" title="Measurements" onClick={() => { if(detail || pathname === "/analysis" || pathname === "/ai") window.dispatchEvent(new CustomEvent("mechavis:command",{detail:"measure"})); else router.push(`/components/${active}?tool=measure`); }}><Ruler size={17}/><span>Measurements</span></button><button className="nav-item" title="Materials" onClick={() => set({panel:"materials"})}><Layers3 size={17}/><span>Materials</span></button><button className="nav-item" title="Manufacturing" onClick={() => set({panel:"manufacturing"})}><FlaskConical size={17}/><span>Manufacturing</span></button></nav><div className="sidebar-bottom"><div className="nav-group-label">SYSTEM</div><button className="nav-item" title="Settings" onClick={() => set({panel:"settings"})}><Settings2 size={17}/><span>Settings</span></button><div className="lab-version"><span className="status-dot"/><span>SYSTEM STATUS<small>All systems operational</small></span></div><div className="sidebar-footer"><span>MECHAVIS LAB</span><span>v1.0.0</span></div></div></aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb"><span className="mobile-brand">M/</span><span className="desktop-label">Workspace</span><ChevronRight size={12}/><span>{detail ? "Engineering Viewer" : label}</span></div><div className="topbar-actions"><span className="local-indicator"><span className="status-dot"/> LOCAL ENVIRONMENT</span><button className="search-trigger" onClick={() => set({commandOpen:true})} aria-label="Open command palette"><Search size={14}/><span>Search anything...</span><kbd>⌘ K</kbd></button><span className="topbar-divider"/><span className="avatar">OE</span></div></header><main className="main-content">{children}</main><footer className="app-footer"><span><Cpu size={11}/> MECHAVIS GEOMETRY ENGINE</span><span>CONCEPTUAL ENGINEERING ENVIRONMENT <MoveUpRight size={11}/></span></footer></div>
    <nav className="mobile-nav" aria-label="Mobile navigation">{navigation.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={(href === "/" ? pathname === "/" : pathname.startsWith(href)) ? "active" : ""}><Icon size={18}/><span>{label === "AI Assistant" ? "AI" : label}</span></Link>)}<button onClick={() => set({commandOpen:true})} aria-label="Search commands"><Command size={18}/><span>Search</span></button></nav>
    <CommandPalette/><ToolPanels/>
  </div></MotionConfig>;
}
