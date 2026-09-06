"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, ArrowUpRight, Box, Check, Cpu, Crosshair, Layers3, RefreshCcw, ScanLine, ShieldAlert, SlidersHorizontal, Square, X } from "lucide-react";
import { Eyebrow } from "@/components/ui/primitives";
import { mockAssistant } from "@/services/mock-assistant";
import { useViewer } from "@/stores/viewer-store";
import type { AssistantResponse, Component } from "@/types/engineering";
import styles from "./assistant.module.css";

const fastActions = [
  { label: "Explain geometry", prompt: "Explain the geometry and function of this component.", icon: Box },
  { label: "Critical regions", prompt: "Identify the critical regions and explain the stress concentrations.", icon: ShieldAlert },
  { label: "Manufacturing", prompt: "Explain the manufacturing process, key tolerances and inspection plan.", icon: Cpu },
  { label: "Material choices", prompt: "Compare the current material with suitable material alternatives.", icon: Layers3 },
  { label: "Failure modes", prompt: "What are the likely failure modes and how can they be prevented?", icon: ScanLine },
  { label: "Optimize design", prompt: "How would you optimize this design without compromising its function?", icon: SlidersHorizontal },
];
type Message = { id: number; role: "user" | "assistant" | "status"; content: string; response?: AssistantResponse; context?: string };

function thinkingTransition(signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const finish = () => { window.clearTimeout(timer); signal.removeEventListener("abort", finish); resolve(); };
    const timer = window.setTimeout(finish, 650);
    signal.addEventListener("abort", finish, { once: true });
    if (signal.aborted) finish();
  });
}

export function AssistantPanel({ component, onClose }: { component: Component; onClose?: () => void }) {
  return <AssistantConversation key={component.id} component={component} onClose={onClose}/>;
}

function AssistantConversation({ component, onClose }: { component: Component; onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [thinking, setThinking] = useState(false);
  const [latestResponse, setLatestResponse] = useState<AssistantResponse | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const requestRef = useRef(0);
  const messageId = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedHotspotId = useViewer((state) => state.selectedHotspot);
  const focus = useViewer((state) => state.focus);
  const setViewer = useViewer((state) => state.set);
  const selectedHotspot = component.hotspots.find((item) => item.id === selectedHotspotId);

  useEffect(() => () => { controllerRef.current?.abort(); requestRef.current += 1; }, []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  const focusReference = (id: string) => {
    const hotspot = component.hotspots.find((item) => item.id === id);
    if (hotspot) focus(hotspot);
  };
  const cancelRequest = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    requestRef.current += 1;
    setThinking(false);
  };
  const resetConversation = () => {
    cancelRequest();
    setMessages([]);
    setLatestResponse(null);
    setPrompt("");
    textareaRef.current?.focus();
  };
  const ask = async (input: string) => {
    const question = input.trim();
    if (!question || controllerRef.current) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    const request = ++requestRef.current;
    setMessages((current) => [...current, { id: ++messageId.current, role: "user", content: question, context: selectedHotspot?.name }]);
    setPrompt("");
    setThinking(true);
    try {
      const [response] = await Promise.all([mockAssistant.respond(component, question, selectedHotspotId || undefined, controller.signal), thinkingTransition(controller.signal)]);
      if (controller.signal.aborted || request !== requestRef.current) return;
      setMessages((current) => [...current, { id: ++messageId.current, role: "assistant", content: response.message, response }]);
      setLatestResponse(response);
      const action = response.actions.find((item) => item.type === "focus" && component.hotspots.some((hotspot) => hotspot.id === item.hotspotId));
      const reference = response.referencedHotspotIds.find((id) => component.hotspots.some((hotspot) => hotspot.id === id));
      if (action) focusReference(action.hotspotId);
      else if (reference) focusReference(reference);
    } catch {
      if (!controller.signal.aborted && request === requestRef.current) setMessages((current) => [...current, { id: ++messageId.current, role: "status", content: "The local assistant could not complete that request. Try a fast action or rephrase your question." }]);
    } finally {
      if (request === requestRef.current) {
        controllerRef.current = null;
        setThinking(false);
        textareaRef.current?.focus();
      }
    }
  };
  const submit = (event: FormEvent) => { event.preventDefault(); void ask(prompt); };
  const insights = latestResponse?.insights || [];

  return <section className={styles.panel} aria-label="Engineering assistant">
    <header className={styles.panelHeader}><div><Eyebrow><span className="tiny-square"/>MECHAVIS / INTELLIGENCE</Eyebrow><h2>Engineering copilot<span>.</span></h2></div><div className={styles.headerActions}><button className="icon-button" type="button" onClick={resetConversation} aria-label="Start a new conversation" title="New conversation"><RefreshCcw size={15}/></button>{onClose && <button className="icon-button" type="button" onClick={onClose} aria-label="Close assistant"><X size={17}/></button>}</div></header>
    <div className={styles.context}><Box size={13}/><span>{component.name}</span><span className={styles.localLabel}>LOCAL SIMULATION</span></div>
    {selectedHotspot && <div className={styles.selectedContext}><Crosshair size={13}/><span>Focused: {selectedHotspot.name}</span><button type="button" onClick={() => setViewer({ selectedHotspot: null, selectedPart: null, focusTarget: null })} aria-label="Clear selected region"><X size={12}/></button></div>}
    <div className={styles.conversation} ref={scrollRef}>
      {messages.length === 0 && <div className={styles.welcome}><div className={styles.welcomeMark}><Layers3 size={23} strokeWidth={1.25}/></div><h3>From geometry<br/>to understanding.</h3><p>Explore {component.name.toLowerCase()} with a context-aware engineering guide. Select a region in the model, or start with a question below.</p></div>}
      <div className={styles.fastActions} aria-label="Suggested engineering questions">{fastActions.map(({ label, prompt: actionPrompt, icon: Icon }) => <button key={label} type="button" disabled={thinking} onClick={() => void ask(actionPrompt)}><Icon size={14}/><span>{label}</span><ArrowUpRight size={12}/></button>)}</div>
      <div className={styles.messages} role="log" aria-label="Assistant conversation" aria-live="polite" aria-relevant="additions text">
        {messages.map((message) => <article key={message.id} className={`${styles.message} ${message.role === "user" ? styles.userMessage : message.role === "status" ? styles.statusMessage : styles.assistantMessage}`}>
          <span className={styles.messageRole}>{message.role === "user" ? "YOU" : message.role === "status" ? "SYSTEM" : "MECHAVIS / SIMULATED RESPONSE"}{message.context && <small> · {message.context}</small>}</span>
          <p className={styles.messageText}>{message.content}</p>
          {message.response && <>
            {Array.from(new Set([...message.response.referencedHotspotIds, ...message.response.actions.filter((action) => action.type === "focus").map((action) => action.hotspotId)])).map((id) => {
              const hotspot = component.hotspots.find((item) => item.id === id);
              return hotspot ? <button type="button" className={styles.reference} key={id} onClick={() => focus(hotspot)} aria-pressed={selectedHotspotId === id}><Crosshair size={12}/><span>{hotspot.name}</span>{selectedHotspotId === id ? <Check size={12}/> : <ArrowUpRight size={12}/>}</button> : null;
            })}
            {message.response.assumptions.length > 0 && <details className={styles.assumptions}><summary>Assumptions & limits ({message.response.assumptions.length})</summary><ul>{message.response.assumptions.map((assumption, index) => <li key={`${index}-${assumption}`}>{assumption}</li>)}</ul></details>}
          </>}
        </article>)}
      </div>
      {thinking && <div className={styles.thinking} role="status"><span className={styles.thinkingBars}><i/><i/><i/></span><span>Reviewing component context<span className={styles.thinkingSub}>Geometry · material · mapped regions</span></span><button type="button" onClick={() => { cancelRequest(); setMessages((current) => [...current, { id: ++messageId.current, role: "status", content: "Request canceled. Select a different region or ask another question to continue." }]); }}><Square size={10}/>Cancel</button></div>}
      {insights.length > 0 && <section className={styles.insights} aria-label="Contextual engineering insights"><Eyebrow>Engineering notes / {insights.length.toString().padStart(2, "0")}</Eyebrow>{insights.map((insight, index) => <div className={styles.insight} key={`${insight.title}-${index}`}><span>{insight.category}</span><h4>{insight.title}</h4><p>{insight.description}</p>{insight.hotspotId && component.hotspots.some((item) => item.id === insight.hotspotId) && <button type="button" onClick={() => focusReference(insight.hotspotId!)}>Locate on model <ArrowUpRight size={12}/></button>}</div>)}</section>}
    </div>
    <div className={styles.composerWrapper}><form onSubmit={submit} className={styles.composer}><label className={styles.inputLabel} htmlFor={`assistant-prompt-${component.id}`}>Ask an engineering question</label><textarea id={`assistant-prompt-${component.id}`} ref={textareaRef} value={prompt} maxLength={1600} rows={2} placeholder={selectedHotspot ? `Ask about ${selectedHotspot.name.toLowerCase()}…` : "Ask about geometry, materials, or manufacturing…"} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); if (!thinking) void ask(prompt); } }} aria-describedby={`assistant-disclaimer-${component.id}`}/><div className={styles.composerBottom}><span>ENTER TO SEND · SHIFT + ENTER FOR A NEW LINE</span><button type="submit" disabled={thinking || !prompt.trim()} aria-label="Send question"><ArrowUp size={17}/></button></div></form><p id={`assistant-disclaimer-${component.id}`} className={styles.disclaimer}>Simulated AI · curated component knowledge, not a live model. Responses are illustrative, not design approval.</p></div>
  </section>;
}
