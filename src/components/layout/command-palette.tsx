"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, Box, Command, Search } from "lucide-react";
import { components } from "@/data/components";
import { useAppStore } from "@/stores/app-store";
import { Modal } from "@/components/ui/primitives";
export function CommandPalette() {
  const open = useAppStore((s) => s.commandOpen);
  const set = useAppStore((s) => s.set);
  const active = useAppStore((s) => s.activeComponent);
  const [query,setQuery] = useState("");
  const [index,setIndex] = useState(0);
  const router = useRouter(); const pathname = usePathname();
  const close = () => { set({ commandOpen:false }); setQuery(""); setIndex(0); };
  function route(href:string) { close(); router.push(href); }
  function tool(action:string) { close(); if(pathname.startsWith("/components/") || pathname === "/analysis" || pathname === "/ai") window.dispatchEvent(new CustomEvent("mechavis:command",{ detail:action })); else router.push(`/components/${active}?tool=${action}`); }
  const commands = [
    { label:"Search components", detail:"Component library", action:() => route("/components") },
    ...components.map((c) => ({ label:`Open ${c.name}`, detail:c.partNumber, action:() => route(`/components/${c.id}`) })),
    { label:"Compare components", detail:"Side-by-side inspection", action:() => route("/compare") },
    { label:"Open AI Assistant", detail:"Contextual engineering", action:() => route(`/ai?component=${active}`) },
    { label:"Toggle wireframe", detail:"Viewer control", action:() => tool("wireframe") },
    { label:"Toggle exploded view", detail:"Viewer control", action:() => tool("explode") },
    { label:"Start measurement", detail:"Viewer control", action:() => tool("measure") },
    { label:"Reset camera", detail:"Viewer control", action:() => tool("reset") },
    { label:"Open settings", detail:"Visualization preferences", action:() => {close();set({panel:"settings"});} },
  ].filter((c) => `${c.label} ${c.detail}`.toLowerCase().includes(query.toLowerCase()));
  return <Modal open={open} onOpenChange={(value) => { if(!value) close(); }} title="Command center" description="Navigate the lab. Control your viewport." className="command-dialog"><div className="command-input"><Search size={18}/><input aria-label="Search commands" autoFocus value={query} onChange={(e) => {setQuery(e.target.value);setIndex(0);}} onKeyDown={(e) => {if(e.key === "ArrowDown") {e.preventDefault();setIndex((i) => Math.min(i+1,commands.length-1));} if(e.key === "ArrowUp") {e.preventDefault();setIndex((i) => Math.max(0,i-1));} if(e.key === "Enter") {e.preventDefault();commands[index]?.action();}}} placeholder="Type a command or component name..."/><kbd>ESC</kbd></div><div className="command-results" role="listbox" aria-label="Commands">{commands.map((c,i) => <button role="option" aria-selected={index === i} className={index === i ? "selected" : ""} onMouseEnter={() => setIndex(i)} onClick={c.action} key={c.label}><Box size={16}/><span>{c.label}<small>{c.detail}</small></span><ArrowUpRight size={15}/></button>)}{!commands.length && <p className="muted">No commands match “{query}”. Try a part number or “wireframe”.</p>}</div><div className="command-footer"><Command size={12}/> ENGINEERING AT YOUR FINGERTIPS <span>↑ ↓ navigate · ↵ open</span></div></Modal>;
}
