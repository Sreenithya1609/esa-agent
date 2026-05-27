import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Send, Paperclip, Mic, MicOff, StopCircle, Sparkles, Bot, User,
  FileText, Upload, HardDrive, Link as LinkIcon, X, Zap,
  TrendingUp, BarChart2, Globe, Search, ArrowRight, Brain, Settings,
  AlertTriangle
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useChatContext } from "@/lib/ChatContext";
import { usePersona } from "@/lib/PersonaContext";
import { useMemory } from "@/lib/MemoryContext";
import { OrchestrationTrace } from "@/components/chat/OrchestrationTrace";
import { GenerativeResponse } from "@/components/chat/GenerativeResponse";
import { AGENT_META, type AgentKey } from "@/lib/mockData";
import { TEMPLATES } from "@/mock/templates";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "AI Chat — ESA" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  component: ChatPage,
});

const AGENT_ICONS: Record<AgentKey, any> = {
  strategy: TrendingUp,
  data: BarChart2,
  search: Search,
  research: Globe,
};

// ── Agent status bar — pulses while streaming ─────────────────────────────────
function AgentBar({ streaming }: { streaming: boolean }) {
  const { activePersona } = usePersona();
  const [activeIdx, setActiveIdx] = useState<number[]>([]);

  // Filter agents by current active persona capabilities
  const activeAgents = activePersona?.agents ?? (Object.keys(AGENT_META) as AgentKey[]);

  useEffect(() => {
    if (!streaming) { setActiveIdx([]); return; }
    // Stagger agents lighting up
    const timers: ReturnType<typeof setTimeout>[] = [];
    activeAgents.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveIdx((p) => [...p, i]), i * 400));
    });
    return () => timers.forEach(clearTimeout);
  }, [streaming, activeAgents]);

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 overflow-x-auto shrink-0 bg-background/95 backdrop-blur-md">
      <span className="text-[11px] text-muted-foreground font-semibold shrink-0 mr-1 uppercase tracking-wider">Active Agents</span>
      {activeAgents.map((k, i) => {
        const m = AGENT_META[k];
        const isActive = streaming && activeIdx.includes(i);
        const Icon = AGENT_ICONS[k] || Sparkles;
        return (
          <div key={k}
               className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all duration-300 border"
               style={{
                 background: isActive ? m.color + "15" : "transparent",
                 borderColor: isActive ? m.color + "55" : "var(--color-border)",
                 color: isActive ? m.color : "var(--color-muted-foreground)",
                 transform: isActive ? "scale(1.02)" : "scale(1)",
               }}>
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {m.name}
          </div>
        );
      })}
      {streaming && (
        <div className="ml-auto flex items-center gap-1.5 text-[11.5px] text-primary font-bold shrink-0 animate-pulse">
          <Zap className="w-3.5 h-3.5" />
          ESA is orchestrating...
        </div>
      )}
    </div>
  );
}

function ts() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

// ── File modal ────────────────────────────────────────────────────────────────
function FileModal({ onClose, onAttach }: { onClose: () => void; onAttach: (n: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const opts = [
    { icon: Upload,    label: "Upload from device",  sub: "CSV, Excel, PDF, Word, PPT, JSON", fn: () => ref.current?.click() },
    { icon: HardDrive, label: "Google Drive",         sub: "Browse your Drive files",          fn: () => { onAttach("Google Drive file"); onClose(); } },
    { icon: HardDrive, label: "Dropbox",              sub: "Import from Dropbox",              fn: () => { onAttach("Dropbox file"); onClose(); } },
    { icon: LinkIcon,  label: "Paste a URL",          sub: "Fetch from any public URL",        fn: () => { const u = prompt("Enter URL:"); if (u) { onAttach(u); onClose(); } } },
    { icon: FileText,  label: "Paste text / code",    sub: "Raw text, JSON, or code",          fn: () => { onAttach("Pasted content"); onClose(); } },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0" onClick={onClose}>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" />
      <div className="relative w-full max-w-sm bg-popover rounded-2xl border border-border overflow-hidden shadow-2xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <span className="text-sm font-bold text-foreground">Attach a file</span>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-2 space-y-0.5">
          {opts.map((o) => { const Icon = o.icon; return (
            <button key={o.label} onClick={o.fn} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/80 transition-all text-left cursor-pointer">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted/60 text-primary">
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[13px] font-bold text-foreground leading-snug">{o.label}</div>
                <div className="text-[11px] text-muted-foreground">{o.sub}</div>
              </div>
            </button>
          ); })}
        </div>
        <input ref={ref} type="file" className="hidden" accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.ppt,.pptx,.json,.txt"
               onChange={(e) => { const f = e.target.files?.[0]; if (f) { onAttach(f.name); onClose(); } }} />
      </div>
    </div>
  );
}

// ── Voice hook ────────────────────────────────────────────────────────────────
function useVoice(onResult: (t: string) => void) {
  const [listening, setListening] = useState(false);
  const rec = useRef<any>(null);
  const toggle = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported. Try Chrome."); return; }
    if (listening) { (rec.current as any)?.stop(); setListening(false); return; }
    const r = new SR() as any;
    r.lang = "en-US"; r.interimResults = false;
    r.onresult = (e: any) => onResult(e.results[0][0].transcript);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r; r.start(); setListening(true);
  }, [listening, onResult]);
  return { listening, toggle };
}

// ── Chat page ─────────────────────────────────────────────────────────────────
function ChatPage() {
  const { q } = Route.useSearch();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [showFile, setShowFile] = useState(false);

  const {
    messages,
    sendMessage,
    isProcessing,
    currentTrace,
    interruptQuery,
    clearHistory
  } = useChatContext();

  const { activePersona } = usePersona();

  // Stepwise prompter state (Empty State with Intent)
  const [exploreStep, setExploreStep] = useState<string | null>(null);
  const [contextInput, setContextInput] = useState("");

  const { listening, toggle: toggleVoice } = useVoice((t) => setInput((p) => p + (p ? " " : "") + t));

  // Auto-send query from URL query params
  useEffect(() => {
    if (q && messages.length === 0) {
      sendMessage(q);
    }
  }, [q]);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [messages.length, isProcessing]);

  function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg) return;
    sendMessage(msg);
    setInput("");
    setFiles([]);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const handleStepSubmit = () => {
    if (!exploreStep) return;
    const finalQuery = `${exploreStep} ${contextInput.trim() ? `— focusing on ${contextInput.trim()}` : ''}`;
    sendMessage(finalQuery);
    // Reset wizard
    setExploreStep(null);
    setContextInput('');
  };

  return (
    <DashboardLayout title="AI Chat" hideRight>
      <div className="flex flex-col min-h-0" style={{ height: "calc(100vh - 56px)" }}>

        {/* Agent status bar */}
        <AgentBar streaming={isProcessing} />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-muted/5">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Empty state with Intent (Persona-Aware & Wizard) */}
            {messages.length === 0 && !isProcessing && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-8">
                
                {/* Persona Header */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary shadow-sm">
                    <Sparkles className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Ask ESA anything as <span className="text-primary">{activePersona.name}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                      Tailored workspace prompts and execution templates are active.
                    </p>
                  </div>
                </div>

                {/* Suggested Persona Prompts */}
                <div className="space-y-2.5 max-w-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Suggested Prompts for {activePersona.name}
                  </span>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {activePersona.suggestedPrompts.map((p) => (
                      <button key={p} onClick={() => send(p)}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground border border-border/80 bg-card hover:border-primary/50 hover:text-primary transition-all cursor-pointer shadow-xs">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recently used Templates */}
                <div className="space-y-2.5 w-full max-w-xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Recently Used Templates
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TEMPLATES.slice(0, 3).map((tpl) => (
                      <button
                        key={tpl.id}
                        onClick={() => send(`Build a report using the ${tpl.name} template`)}
                        className="bg-card hover:bg-muted/10 border border-border/80 hover:border-border rounded-xl p-3 text-left space-y-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
                          <Brain className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{tpl.name}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stepwise Prompter (Wizard) */}
                <div className="bg-card border border-border shadow-sm rounded-2xl p-5 w-full max-w-xl text-left space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">Quick Start Stepwise Prompter</span>
                  </div>

                  {/* Step 1: Select category */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Step 1: What would you like to explore?</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: 'GTM Strategy', query: 'Build GTM strategy' },
                        { label: 'Revenue Trends', query: 'Show Q3 revenue trends' },
                        { label: 'Market sizing', query: 'Research SaaS market sizing' },
                        { label: 'Policy Search', query: 'Search HR leave policy' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => setExploreStep(item.query)}
                          className={`py-2 px-3 border rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                            exploreStep === item.query
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border hover:bg-muted/40 text-muted-foreground'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Add context details */}
                  {exploreStep && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 pt-1"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase block">
                          Step 2: Add optional context (Target market, budget, specific competitor)
                        </label>
                        <input
                          type="text"
                          value={contextInput}
                          onChange={(e) => setContextInput(e.target.value)}
                          placeholder="e.g. Focus on India SMBs with a $20K budget..."
                          className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                        />
                      </div>

                      <button
                        onClick={handleStepSubmit}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                      >
                        Submit Request
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </div>

              </div>
            )}

            {/* Active Message History */}
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>

                {m.role === "assistant" && (
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5 border border-primary/20 text-white shadow-sm"
                       style={{ background: "linear-gradient(135deg,#4F6EF7,#9B72F7)" }}>
                    <Bot className="w-4.5 h-4.5" strokeWidth={1.5} />
                  </div>
                )}

                <div className={`max-w-[85%] min-w-0 ${m.role === "user" ? "" : "flex-1"}`}>
                  <div className={`rounded-2xl px-4 py-3.5 ${
                    m.role === "user"
                      ? "text-white rounded-tr-sm"
                      : "bg-card rounded-tl-sm"
                  }`}
                  style={m.role === "user"
                    ? { background: "linear-gradient(135deg,#4F6EF7,#6B82F7)", boxShadow: "0 4px 16px rgba(79,110,247,0.15)" }
                    : { boxShadow: "0 2px 12px rgba(79,110,247,0.06)", border: "1px solid var(--color-border)" }}>

                    {m.role === "user" ? (
                      <p className="text-xs font-semibold leading-relaxed">
                        {m.content}
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {/* 1. Rendering of trace inside assistant bubble, collapsed by default */}
                        {m.trace && (
                          <OrchestrationTrace trace={m.trace} />
                        )}
                        {/* 1.5. Notice if agent is disabled */}
                        {m.unavailableAgentMessage && (
                          <div className="bg-amber-500/10 border border-amber-500/25 text-amber-600 rounded-xl p-3.5 text-xs flex items-start gap-2.5 shadow-xs">
                            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className="font-semibold">Agent Access Notice</span>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{m.unavailableAgentMessage}</p>
                            </div>
                          </div>
                        )}
                        {/* 2. Rendering of the structured response card */}
                        <GenerativeResponse message={m} />
                      </div>
                    )}

                    <div className={`text-[10px] mt-2.5 ${m.role === "user" ? "text-white/60 text-right" : "text-muted-foreground"}`}>
                      {m.timestamp}
                    </div>
                  </div>
                </div>

                {m.role === "user" && (
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5 text-white border border-primary/20 shadow-sm"
                       style={{ background: "linear-gradient(135deg,#4F6EF7,#9B72F7)" }}>
                    <User className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            ))}

            {/* Active Orchestration Trace (Processing state) */}
            {isProcessing && currentTrace && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5 border border-primary/20 text-white shadow-sm"
                     style={{ background: "linear-gradient(135deg,#4F6EF7,#9B72F7)" }}>
                  <Bot className="w-4.5 h-4.5" strokeWidth={1.5} />
                </div>
                <div className="flex-1 bg-card border border-border shadow-sm rounded-2xl rounded-tl-sm px-4 py-3.5">
                  <OrchestrationTrace trace={currentTrace} isActive={true} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-border/40 px-4 sm:px-6 py-4 shrink-0 bg-background/95 backdrop-blur-md">
          <div className="max-w-3xl mx-auto">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {files.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary bg-primary/10 border border-primary/20">
                    <FileText className="w-3.5 h-3.5" />
                    {f.length > 28 ? f.slice(0, 25) + "…" : f}
                    <button onClick={() => setFiles((a) => a.filter((_, j) => j !== i))} className="hover:text-red-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-border/80 bg-card shadow-sm transition-all focus-within:border-primary/50">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder="Ask ESA anything about your business..."
                rows={1} className="w-full resize-none bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground px-4 pt-3.5 pb-1 min-h-[52px] max-h-[160px]"
                style={{ fieldSizing: "content" } as React.CSSProperties} />
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <button type="button" onClick={() => setShowFile(true)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors cursor-pointer" title="Attach file">
                    <Paperclip className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button type="button" onClick={toggleVoice}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${listening ? "bg-red-500/10 text-red-500" : "hover:bg-muted"}`}
                          title={listening ? "Stop" : "Voice input"}>
                    {listening ? <MicOff className="w-4 h-4" strokeWidth={1.5} /> : <Mic className="w-4 h-4" strokeWidth={1.5} />}
                  </button>
                  {listening && <span className="text-[10px] text-red-500 font-bold animate-pulse ml-1">Listening…</span>}
                  
                  {/* Clear history button */}
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={clearHistory}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground py-1 px-2 hover:bg-muted rounded transition-colors cursor-pointer"
                    >
                      Clear Chat
                    </button>
                  )}
                </div>
                
                {isProcessing
                  ? <button type="button" onClick={interruptQuery}
                            className="w-9 h-9 rounded-xl bg-destructive hover:bg-destructive/95 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm">
                      <StopCircle className="w-4 h-4" />
                    </button>
                  : <button type="button" onClick={() => send()} disabled={!input.trim() && files.length === 0}
                            className="w-9 h-9 rounded-xl text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                            style={{ background: "linear-gradient(135deg,#4F6EF7,#6B82F7)" }}>
                      <Send className="w-4 h-4" />
                    </button>}
              </div>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              <kbd className="px-1.5 py-0.5 rounded text-[9px] bg-muted border border-border/80">Enter</kbd> to send ·{" "}
              <kbd className="px-1.5 py-0.5 rounded text-[9px] bg-muted border border-border/80">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      </div>

      {showFile && <FileModal onClose={() => setShowFile(false)} onAttach={(n) => setFiles((a) => [...a, n])} />}
    </DashboardLayout>
  );
}
