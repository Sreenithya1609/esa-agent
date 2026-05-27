import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Paperclip, Mic, MicOff, Send, TrendingUp, BarChart2, Search, Globe,
  Sparkles, ChevronRight, ChevronLeft, Bot, User, StopCircle, X, FileText,
  Upload, Link as LinkIcon, HardDrive, Lock, Folder, FolderOpen, ChevronDown, Plus, Play, Volume2, Shield,
  Sliders, Activity, CheckCircle2, Users
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  ToolCallRenderer, AgentWorkingCard, ESASearchCard, GapReportCard,
  DeepResearchCard, KnowledgeBaseUpdateCard, StrategyDocCard,
  MetricCards, GenLineChart, InsightCard, GenTable, ThinkingIndicator,
} from "@/components/GenUI";
import { UsageDrawer } from "@/components/chat/UsageDrawer";
import { AgentStatusCards } from "@/components/chat/AgentStatusCards";
import { AgentSidePanel } from "@/components/chat/AgentSidePanel";
import { MOCK_USER, SUGGESTED_PROMPTS, MOCK_CHART_REVENUE, MOCK_COMPETITORS, type AgentKey, AGENT_META } from "@/lib/mockData";
import { useRole } from "@/lib/roleContext";
import { cn } from "@/lib/utils";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";


export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ESA" }] }),
  component: Dashboard,
});

type DemoKey = "strategy" | "data" | "search" | "research";
type DemoMessage = { id: string; role: "user" | "assistant"; content?: string; component?: React.ReactNode; ts: string; };

const CAPABILITIES = [
  { icon: TrendingUp, color: "#4A6CF7", bg: "rgba(74,108,247,0.08)", title: "Strategy Agent",  desc: "GTM plans, competitive analysis, decision support",     prompt: "Build a GTM strategy for our new SaaS product",    demoKey: "strategy" as DemoKey },
  { icon: BarChart2,  color: "#0FC4A7", bg: "rgba(15,196,167,0.08)", title: "Data Analyst",    desc: "Revenue trends, cohort analysis, chart generation",     prompt: "Show Q3 revenue trends and forecast Q4",           demoKey: "data"     as DemoKey },
  { icon: Search,     color: "#9B72F7", bg: "rgba(155,114,247,0.08)",title: "Search Agent",    desc: "Semantic search across docs, policies, reports",        prompt: "Find our HR remote work leave policy",             demoKey: "search"   as DemoKey },
  { icon: Globe,      color: "#F7924A", bg: "rgba(247,146,74,0.08)", title: "Research Agent",  desc: "Market sizing, competitor benchmarks, industry trends", prompt: "Benchmark our SaaS pricing against competitors",   demoKey: "research" as DemoKey },
];

// ── Animated typewriter suggestions (replaces chip buttons) ──────────────────
function uid() { return Math.random().toString(36).slice(2); }
function timestamp() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
const EXAMPLE_PROMPTS = [
  "Show Q3 revenue trends and forecast Q4...",
  "Find our HR remote work leave policy...",
  "Benchmark our SaaS pricing against competitors...",
  "Analyze churn drivers over the last 6 months...",
  "Build a GTM strategy for our new product...",
  "Run a compliance gap analysis on our Q2 docs...",
];

function AnimatedPromptHint({ onClick }: { onClick: (text: string) => void }) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const full = EXAMPLE_PROMPTS[idx];
    if (!deleting) {
      if (displayed.length < full.length) {
        t.current = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 1)), 42);
      } else {
        t.current = setTimeout(() => setDeleting(true), 2400);
      }
    } else {
      if (displayed.length > 0) {
        t.current = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 18);
      } else {
        setDeleting(false);
        setIdx((i) => (i + 1) % EXAMPLE_PROMPTS.length);
      }
    }
    return () => clearTimeout(t.current);
  }, [displayed, deleting, idx]);

  return (
    <button
      onClick={() => onClick(EXAMPLE_PROMPTS[idx].replace("...", ""))}
      className="text-left text-[13px] text-text-tertiary hover:text-text-secondary transition-colors"
    >
      <span className="italic">{displayed}</span>
      <span className="inline-block w-[1.5px] h-[13px] bg-primary/50 align-middle ml-0.5 animate-pulse" />
    </button>
  );
}

function MdText({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="space-y-1 text-[14px] leading-[1.65]">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const html = line
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/`(.*?)`/g, "<code class='px-1 py-0.5 rounded bg-secondary text-[12px] font-mono'>$1</code>");
        if (/^\d+\./.test(line)) return <div key={i} className="pl-4" dangerouslySetInnerHTML={{ __html: html }} />;
        if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} className="pl-3 flex gap-2"><span className="text-text-tertiary mt-1">•</span><span dangerouslySetInnerHTML={{ __html: html.replace(/^[-•]\s/, "") }} /></div>;
        if (line.startsWith("#")) return <div key={i} className="font-semibold text-text-primary text-[15px]" dangerouslySetInnerHTML={{ __html: html.replace(/^#+\s/, "") }} />;
        return <div key={i} dangerouslySetInnerHTML={{ __html: html }} />;
      })}
    </div>
  );
}

// Map demo key → which agents are active
const DEMO_AGENTS: Record<DemoKey, AgentKey[]> = {
  strategy: ["strategy", "data", "research"],
  data:     ["data"],
  search:   ["search"],
  research: ["research"],
};
function useDemoSequence() {
  const [demoMessages, setDemoMessages] = useState<DemoMessage[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [agentStates, setAgentStates] = useState<Record<string, "idle" | "active" | "done" | "error">>({
    strategy: "idle",
    data: "idle",
    search: "idle",
    research: "idle"
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  
  const clear = useCallback(() => { 
    timers.current.forEach(clearTimeout); 
    timers.current = []; 
    setAgentStates({ strategy: "idle", data: "idle", search: "idle", research: "idle" });
  }, []);
  
  const add = useCallback((msg: DemoMessage) => setDemoMessages((p) => [...p, msg]), []);

  const runDemo = useCallback((demoKey: DemoKey, prompt: string) => {
    clear(); setDemoMessages([]); setIsDemoMode(true);
    add({ id: uid(), role: "user", content: prompt, ts: timestamp() });

    if (demoKey === "strategy") {
      setAgentStates({ strategy: "active", data: "idle", search: "idle", research: "idle" });
      timers.current.push(
        // Step 1: thinking
        setTimeout(() => add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <ThinkingIndicator agentName="Strategy Agent" color="#4A6CF7" thoughts={[
            "Scanning 127 market signals from CRM, news feeds, and competitor data...",
            "Loading Q3 Data Analyst results and Research Agent findings...",
            "Comparing positioning vs Salesforce, HubSpot, Zoho, Pipedrive...",
            "Applying SOSTAC framework to build customized GTM strategy...",
            "Finalizing strategy document with risk assessment...",
          ]} />
        }), 600),
        // Step 2: working card (Strategy hands off to Data)
        setTimeout(() => {
          add({ id: uid(), role: "assistant", ts: timestamp(), component:
            <AgentWorkingCard agentName="Strategy Agent" color="#4A6CF7" title="Building GTM Strategy"
              steps={["Gathering market events","Loading previous agent results","Comparing with 12 competitors","Building customized strategy","Finalizing strategy document"]} />
          });
          setAgentStates({ strategy: "done", data: "active", search: "idle", research: "idle" });
        }, 1200),
        // Research agent takes over
        setTimeout(() => {
          setAgentStates({ strategy: "done", data: "done", search: "idle", research: "active" });
        }, 3200),
        // Step 3: final strategy doc (all complete)
        setTimeout(() => {
          add({ id: uid(), role: "assistant", ts: timestamp(), component:
            <StrategyDocCard title="GTM Strategy — New SaaS Product" sections={[
              { heading: "Executive Summary", content: "A focused land-and-expand motion targeting mid-market SaaS companies in APAC and North America, leveraging product-led growth with a sales-assist overlay for deals above $20K ARR." },
              { heading: "Target Segment", content: ["Mid-market SaaS (50–500 employees)","Revenue Operations & Strategy teams","Companies with existing CRM + BI stack","APAC-first, then North America expansion"] },
              { heading: "GTM Channels", content: ["Product-led growth: free tier with usage-based upgrade triggers","Content & SEO: benchmark reports, strategy templates","Partner ecosystem: CRM & BI integration partners","Outbound SDR for enterprise accounts (>500 employees)"] },
              { heading: "90-day Milestones", content: ["Month 1: Launch free tier, onboard 200 sign-ups","Month 2: Activate 3 integration partners, publish 4 benchmark reports","Month 3: Convert 15 free → paid, hit $45K new MRR"] },
              { heading: "Risk Factors", content: ["Competitive response from Salesforce Einstein (mitigate: speed + price)","Long enterprise sales cycles (mitigate: PLG bottom-up motion)","Data privacy regulations in APAC (mitigate: SOC2 + GDPR compliance)"] },
            ]} />
          });
          setAgentStates({ strategy: "done", data: "done", search: "idle", research: "done" });
        }, 5200)
      );
    }

    if (demoKey === "data") {
      setAgentStates({ strategy: "idle", data: "active", search: "idle", research: "idle" });
      timers.current.push(
        // Thinking
        setTimeout(() => add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <ThinkingIndicator agentName="Data Analyst" color="#0FC4A7" thoughts={[
            "Connecting to Q3_Revenue_2026.xlsx and Snowflake DW (4,821 rows)...",
            "Pulling revenue, churn, ARR, and NPS metrics across 6 months...",
            "Running cohort analysis — September spike detected (+5.8% vs target)...",
            "Detecting trend patterns and outliers in churn data...",
            "Generating 3 visualizations: revenue bars, churn trend, forecast...",
          ]} />
        }), 600),
        // Working card
        setTimeout(() => add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <AgentWorkingCard agentName="Data Analyst" color="#0FC4A7" title="Analyzing Revenue Data"
            steps={["Connecting to data sources","Gathering Q3 revenue data","Running statistical analysis","Creating visualizations"]} />
        }), 1200),
        // Metrics
        setTimeout(() => add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <MetricCards title="Q3 2026 — Key Metrics" metrics={[
            { label: "Total Revenue", value: "$61.4M", trend: "+14% QoQ", trendUp: true, color: "#0FC4A7" },
            { label: "Churn Rate",    value: "2.1%",   trend: "-0.8pp",   trendUp: true, color: "#4A6CF7" },
            { label: "New ARR",       value: "$3.1M",  trend: "+22% QoQ", trendUp: true, color: "#9B72F7" },
            { label: "NPS Score",     value: "62",     trend: "+4 pts",   trendUp: true, color: "#F7924A" },
          ]} />
        }), 4200),
        // Chart
        setTimeout(() => add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <GenLineChart title="Q3 Monthly Revenue vs Target ($M)" xKey="month"
            lines={[{ key: "revenue", label: "Actual", color: "#0FC4A7" }, { key: "target", label: "Target", color: "#D6DCF0" }]}
            data={MOCK_CHART_REVENUE} />
        }), 5200),
        // Insight
        setTimeout(() => {
          add({ id: uid(), role: "assistant", ts: timestamp(), component:
            <InsightCard type="opportunity" title="Q4 Forecast: $71.2M (+16%)"
              body="Based on Q3 momentum and pipeline data, Q4 revenue is projected at $71.2M. Key drivers: enterprise expansion (+$4.1M), new logo acquisition (+$3.8M), upsell motion (+$2.0M)."
              actions={["View Full Forecast","Export Report","Share with Team"]} />
          });
          setAgentStates({ strategy: "idle", data: "done", search: "idle", research: "idle" });
        }, 6200)
      );
    }

    if (demoKey === "search") {
      setAgentStates({ strategy: "idle", data: "idle", search: "active", research: "idle" });
      timers.current.push(
        // Thinking
        setTimeout(() => add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <ThinkingIndicator agentName="Search Agent" color="#9B72F7" thoughts={[
            "Scanning 247 documents across HR Drive, Policy DB, and Compliance Vault...",
            "Extracting 1,842 named entities (people, policies, dates, clauses)...",
            "Mapping 5,631 entity relationships and cross-references...",
            "Deploying 7 sub-agents for parallel analysis...",
            "Combining sub-agent results and detecting coverage gaps...",
          ]} />
        }), 600),
        // ESA Search card with 7 sub-agents
        setTimeout(() => add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <ESASearchCard docsScanned={247} entitiesChecked={1842} relationshipsMapped={5631}
            subAgents={["Policy Extractor","Entity Recognizer","Relationship Mapper","Context Builder","Gap Analyzer","Compliance Checker","Summary Generator"]} />
        }), 1200),
        // Gap report
        setTimeout(() => {
          add({ id: uid(), role: "assistant", ts: timestamp(), component:
            <GapReportCard coverageScore={87}
              gaps={[
                { title: "Remote Work Equipment Allowance", severity: "medium", description: "Policy does not specify reimbursement limits for home office equipment purchases." },
                { title: "Cross-border Remote Work",        severity: "high",   description: "No guidance on tax or compliance implications for employees working from a different country." },
                { title: "Mental Health Leave Provisions",  severity: "low",    description: "Mental health days are mentioned but not formally defined or quantified." },
              ]}
              recommendations={["Add equipment allowance clause","Define cross-border policy","Formalize mental health leave","Annual policy review cycle"]} />
          });
          setAgentStates({ strategy: "idle", data: "idle", search: "done", research: "idle" });
        }, 6000)
      );
    }

    if (demoKey === "research") {
      setAgentStates({ strategy: "idle", data: "idle", search: "idle", research: "active" });
      const sources = [
        { title: "SaaS Pricing Benchmark Report 2026",       domain: "gartner.com",           url: "https://gartner.com", snippet: "Median SaaS pricing for mid-market CRM tools sits at $65/seat/month, up 12% from 2025." },
        { title: "Competitor Pricing Analysis — CRM Vendors", domain: "g2.com",                url: "https://g2.com",      snippet: "Salesforce Enterprise averages $165/user/month; HubSpot Professional at $90/user/month." },
        { title: "India SaaS Market Pricing Trends",          domain: "nasscom.in",             url: "https://nasscom.in",  snippet: "India-based SaaS companies price 30–40% below global benchmarks to capture domestic market." },
        { title: "PLG Pricing Strategies for B2B SaaS",       domain: "openviewpartners.com",   url: "https://openviewpartners.com", snippet: "Usage-based pricing models show 2.3x higher NRR compared to seat-based models." },
        { title: "2026 SaaS Pricing Survey Results",           domain: "priceintelligently.com", url: "https://priceintelligently.com", snippet: "Only 18% of SaaS companies review pricing annually; those that do grow 30% faster." },
        { title: "Competitive Intelligence: APAC CRM Market",  domain: "idc.com",               url: "https://idc.com",     snippet: "APAC CRM market growing at 19% CAGR; Zoho and Freshworks dominate SMB segment." },
      ];
      let approved = false;
      const onApprove = () => {
        if (approved) return; approved = true;
        setAgentStates({ strategy: "idle", data: "active", search: "idle", research: "done" });
        add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <KnowledgeBaseUpdateCard steps={["Downloading 6 documents","Chunking into segments","Building embedding vectors","Updating knowledge graph"]} />
        });
        const t = setTimeout(() => {
          add({ id: uid(), role: "assistant", ts: timestamp(), component:
            <GenTable title="Competitor Pricing Benchmark"
              headers={["Vendor","Price/Seat","Users","API","SSO","NPS"]}
              rows={MOCK_COMPETITORS.map((c) => [c.name, c.price, c.users, c.api ? "✓" : "—", c.sso ? "✓" : "—", String(c.nps)])}
              highlightRow={0} />
          });
          setAgentStates({ strategy: "idle", data: "done", search: "idle", research: "done" });
        }, 4000);
        timers.current.push(t);
      };
      timers.current.push(
        // Thinking first
        setTimeout(() => add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <ThinkingIndicator agentName="Research Agent" color="#F7924A" thoughts={[
            "Querying 6 external intelligence sources across Gartner, G2, NASSCOM...",
            "Extracting pricing data for 12 CRM vendors in APAC and North America...",
            "Cross-referencing NPS scores and feature matrices...",
            "Identifying pricing gaps and positioning opportunities...",
            "Preparing sources for review before updating knowledge base...",
          ]} />
        }), 600),
        // Deep research card
        setTimeout(() => add({ id: uid(), role: "assistant", ts: timestamp(), component:
          <DeepResearchCard sources={sources} onApprove={onApprove} />
        }), 1400),
        // Auto-approve after 7s if user doesn't click
        setTimeout(onApprove, 7000),
      );
    }
  }, [add, clear]);

  const exitDemo = useCallback(() => { 
    clear(); 
    setIsDemoMode(false); 
    setDemoMessages([]); 
    setAgentStates({ strategy: "idle", data: "idle", search: "idle", research: "idle" });
  }, [clear]);

  return { demoMessages, setDemoMessages, isDemoMode, setIsDemoMode, runDemo, exitDemo, agentStates, setAgentStates };
}

// ── Message bubble ────────────────────────────────────────────────────────────
function Bubble({ role, ts, children }: { role: "user" | "assistant"; ts: string; children: React.ReactNode }) {
  return (
    <div className={`flex gap-3 ${role === "user" ? "justify-end" : "justify-start"}`}
         style={{ animation: "fadeSlideIn 0.25s ease-out both" }}>
      {role === "assistant" && (
        <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5"
             style={{ background: "linear-gradient(135deg,#4F6EF7,#9B72F7)", boxShadow: "0 4px 12px rgba(79,110,247,0.3)" }}>
          <Bot className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
      )}
      <div className={`max-w-[85%] min-w-0 ${role === "user" ? "" : "flex-1"}`}>
        <div className={`rounded-2xl px-4 py-3.5 ${role === "user" ? "text-white rounded-tr-sm inline-block" : "bg-white rounded-tl-sm"}`}
             style={role === "user"
               ? { background: "linear-gradient(135deg,#4F6EF7,#6B82F7)", boxShadow: "0 4px 16px rgba(79,110,247,0.25)" }
               : { boxShadow: "0 2px 12px rgba(79,110,247,0.08)", border: "1px solid rgba(79,110,247,0.1)" }}>
          {children}
          <div className={`text-[11px] mt-2 ${role === "user" ? "text-white/60 text-right" : "text-[#8A93B0]"}`}>{ts}</div>
        </div>
      </div>
      {role === "user" && (
        <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5 text-white"
             style={{ background: "linear-gradient(135deg,#4F6EF7,#9B72F7)" }}>
          <User className="w-4 h-4" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}

// ── File attachment modal ─────────────────────────────────────────────────────
function FileAttachModal({ onClose, onAttach }: { onClose: () => void; onAttach: (name: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const OPTIONS = [
    { icon: Upload,    label: "Upload from device",  sub: "CSV, Excel, PDF, Word, PPT, JSON", action: () => fileRef.current?.click() },
    { icon: HardDrive, label: "Google Drive",         sub: "Connect and browse your Drive files", action: () => { onAttach("Google Drive file"); onClose(); } },
    { icon: HardDrive, label: "Dropbox",              sub: "Import from your Dropbox", action: () => { onAttach("Dropbox file"); onClose(); } },
    { icon: LinkIcon,  label: "Paste a URL",          sub: "Fetch content from any public URL", action: () => { const u = prompt("Enter URL:"); if (u) { onAttach(u); onClose(); } } },
    { icon: FileText,  label: "Paste text / code",    sub: "Paste raw text, JSON, or code snippet", action: () => { onAttach("Pasted content"); onClose(); } },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-sm bg-white rounded-2xl border border-[#D6DCF0] overflow-hidden"
           style={{ boxShadow: "0 20px 64px rgba(79,110,247,0.14)" }}
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E8F4]">
          <span className="text-[14px] font-semibold text-[#0F1117]">Attach a file</span>
          <button onClick={onClose} className="p-1 hover:bg-[#F0F2FA] rounded-md text-[#8A93B0]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2">
          {OPTIONS.map((o) => {
            const Icon = o.icon;
            return (
              <button key={o.label} onClick={o.action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F0F2FA] transition-colors text-left">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#F0F2FA]">
                  <Icon className="w-4 h-4 text-[#4F6EF7]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-[#0F1117]">{o.label}</div>
                  <div className="text-[11px] text-[#8A93B0]">{o.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
        <input ref={fileRef} type="file" className="hidden"
               accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.ppt,.pptx,.json,.txt"
               onChange={(e) => { const f = e.target.files?.[0]; if (f) { onAttach(f.name); onClose(); } }} />
      </div>
    </div>
  );
}

// ── Voice hook (Web Speech API) ───────────────────────────────────────────────
function useVoice(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recRef = useRef<unknown>(null);

  const toggle = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser. Try Chrome."); return; }
    if (listening) { (recRef.current as { stop: () => void })?.stop(); setListening(false); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new SR() as any;
    rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => { onResult(e.results[0][0].transcript); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, onResult]);

  return { listening, toggle };
}

function Dashboard() {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [showFileModal, setShowFileModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const nav = useNavigate();
  const { user } = useRole();
  const { 
    demoMessages, 
    setDemoMessages, 
    isDemoMode, 
    setIsDemoMode, 
    runDemo, 
    exitDemo, 
    agentStates, 
    setAgentStates 
  } = useDemoSequence();

  const [treeExpanded, setTreeExpanded] = useState({
    project: true,
    workflow: true,
    agents: true
  });
  
  // Right drawer state: null | "usage" | "output"
  const [rightDrawer, setRightDrawer] = useState<"usage" | "output" | null>(null);
  
  // Active tree node state
  const [activeNode, setActiveNode] = useState<"chat" | "usage" | "agp" | "welcome">("welcome");
  const [workspaceSidebarOpen, setWorkspaceSidebarOpen] = useState(true);

  // Panel refs for programmatic collapse/expand
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  // ── Responsive panel sizes based on viewport width ──────────────────────────
  // Breakpoints: mobile <768, tablet 768-1024, laptop 1024-1440, desktop 1440-1920, ultrawide >1920
  function getPanelSizes(w: number): { left: number; center: number; right: number; showLeft: boolean; breakpoint: string } {
    if (w < 768) {
      // Mobile: hide left sidebar, center takes full width, no right spacer
      return { left: 0, center: 100, right: 0, showLeft: false, breakpoint: "mobile" };
    } else if (w < 1024) {
      // Tablet: narrow left, center fills most, no right spacer
      return { left: 20, center: 80, right: 0, showLeft: true, breakpoint: "tablet" };
    } else if (w < 1280) {
      // Small laptop: left 22%, center 55%, right spacer 23%
      return { left: 22, center: 55, right: 23, showLeft: true, breakpoint: "laptop-sm" };
    } else if (w < 1600) {
      // Laptop/desktop: left 20%, center 55%, right spacer 25%
      return { left: 20, center: 55, right: 25, showLeft: true, breakpoint: "laptop" };
    } else if (w < 1920) {
      // Large desktop: left 18%, center 55%, right spacer 27%
      return { left: 18, center: 55, right: 27, showLeft: true, breakpoint: "desktop" };
    } else {
      // Ultrawide: left 15%, center 55%, right spacer 30%
      return { left: 15, center: 55, right: 30, showLeft: true, breakpoint: "ultrawide" };
    }
  }

  const [panelSizes, setPanelSizes] = useState(() => getPanelSizes(typeof window !== "undefined" ? window.innerWidth : 1280));

  useEffect(() => {
    function onResize() {
      const next = getPanelSizes(window.innerWidth);
      setPanelSizes((prev) => {
        // Only update (and remount panels) when breakpoint category changes
        if (prev.breakpoint !== next.breakpoint) return next;
        return prev;
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sync sidebar open state with breakpoint
  useEffect(() => {
    if (!panelSizes.showLeft) {
      setWorkspaceSidebarOpen(false);
      leftPanelRef.current?.collapse();
    } else {
      setWorkspaceSidebarOpen(true);
      leftPanelRef.current?.expand();
    }
  }, [panelSizes.breakpoint]);

  // Dynamic Workspace List State
  interface WorkspaceItem {
    id: string;
    name: string;
    date: string;
    activeNode: "chat" | "usage" | "agp" | "welcome";
    messages: DemoMessage[];
    agentStates: Record<string, "idle" | "active" | "done" | "error">;
    isDemoMode: boolean;
    completedTasks: number;
    inProgressTasks: number;
    inQueueTasks: number;
  }

  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([
    {
      id: "ecommerce-agp",
      name: "Ecommerce AGP API Rules",
      date: "May 27",
      activeNode: "welcome",
      messages: [],
      agentStates: { strategy: "idle", data: "idle", search: "idle", research: "idle" },
      isDemoMode: false,
      completedTasks: 17,
      inProgressTasks: 0,
      inQueueTasks: 1
    },
    {
      id: "cybersecurity-audit",
      name: "Cybersecurity Audit Q2",
      date: "May 26",
      activeNode: "chat",
      messages: [
        { id: "c1", role: "user", content: "Analyze our cybersecurity policy compliance for SOC2", ts: "10:12 AM" },
        { id: "c2", role: "assistant", content: "Cybersecurity compliance audit completed. 8/8 controls verified successfully. All systems green.", ts: "10:14 AM" }
      ],
      agentStates: { strategy: "done", data: "idle", search: "done", research: "idle" },
      isDemoMode: true,
      completedTasks: 8,
      inProgressTasks: 0,
      inQueueTasks: 0
    },
    {
      id: "hr-policy-search",
      name: "HR Policy Gap Search",
      date: "May 25",
      activeNode: "chat",
      messages: [
        { id: "h1", role: "user", content: "Search for remote work leave guidelines", ts: "02:30 PM" },
        { id: "h2", role: "assistant", content: "Found 3 files matching 'remote work leave guidelines'. The primary policy allows up to 15 days of remote work travel per quarter.", ts: "02:31 PM" }
      ],
      agentStates: { strategy: "idle", data: "idle", search: "done", research: "idle" },
      isDemoMode: true,
      completedTasks: 3,
      inProgressTasks: 0,
      inQueueTasks: 0
    }
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("ecommerce-agp");
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];

  // Dynamic Workspace Creator State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [newWorkspaceTemplate, setNewWorkspaceTemplate] = useState("strategy");
  const [newWorkspaceAgents, setNewWorkspaceAgents] = useState<string[]>(["strategy", "research"]);

  const CREATOR_TEMPLATES = [
    { id: "strategy", label: "Strategy & GTM", desc: "GTM plans, competitive, marketing", color: "#4A6CF7", agents: ["strategy", "research"] },
    { id: "data", label: "Data Analytics", desc: "Revenue trends, charts, forecasting", color: "#0FC4A7", agents: ["data"] },
    { id: "search", label: "Semantic Search", desc: "Scan HR drive, documents, policies", color: "#9B72F7", agents: ["search"] },
    { id: "full", label: "Orchestrated Suite", desc: "Run all four specialized agents", color: "#F7924A", agents: ["strategy", "data", "search", "research"] }
  ];

  const selectWorkspace = (id: string) => {
    // Save state of current workspace
    setWorkspaces((prev) =>
      prev.map((w) =>
        w.id === activeWorkspaceId
          ? {
              ...w,
              messages: demoMessages,
              agentStates: agentStates,
              activeNode: activeNode,
              isDemoMode: isDemoMode,
            }
          : w
      )
    );

    // Load state of new workspace
    const nextW = workspaces.find((w) => w.id === id);
    if (nextW) {
      setDemoMessages(nextW.messages);
      setAgentStates(nextW.agentStates);
      setActiveNode(nextW.activeNode);
      setIsDemoMode(nextW.isDemoMode);
    }
    
    setActiveWorkspaceId(id);
  };

  const { messages, sendMessage, stop, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: () => {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const { listening, toggle: toggleVoice } = useVoice((text) => {
    setInputText((prev) => prev + (prev ? " " : "") + text);
  });

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  }, [demoMessages.length, messages.length]);

  const hasMessages = isDemoMode ? demoMessages.length > 0 : messages.length > 0;

  function submitReal(text: string) {
    if (!text.trim()) return;
    if (isDemoMode) exitDemo();
    // Simulate query in chat pane
    setActiveNode("chat");
    setRightDrawer(null);
    runDemo("research", text);
    setInputText("");
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReal(inputText); }
  }

  return (
    <DashboardLayout title="Dashboard" hideRight>
      <div className="flex-1 flex overflow-hidden bg-[#F8F9FD] select-none" style={{ height: "calc(100vh - 56px)" }}>
        
        {/* ── COLUMN 2: WORKSPACE TREE PANEL (Collapsible Sidebar) ── */}
        <ResizablePanelGroup key={panelSizes.breakpoint} direction="horizontal" className="flex-1 h-full">
          <ResizablePanel 
            ref={leftPanelRef}
            defaultSize={panelSizes.left} 
            minSize={panelSizes.showLeft ? 14 : 0} 
            maxSize={30}
            collapsible
            collapsedSize={0}
            onCollapse={() => setWorkspaceSidebarOpen(false)}
            onExpand={() => setWorkspaceSidebarOpen(true)}
            className="bg-[#F8F9FD] border-r border-[#E4E8F4] flex flex-col h-full overflow-hidden"
          >
                {/* Header */}
                <div className="p-3 border-b border-[#E4E8F4] flex items-center justify-between bg-white/50 gap-2 shrink-0">
              <button 
                onClick={() => {
                  setNewWorkspaceName("");
                  setShowCreateModal(true);
                }}
                className="h-9 px-3 rounded-lg bg-white border border-[#D6DCF0] hover:bg-[#F0F2FA] text-text-primary text-[12px] font-bold flex-1 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
              >
                <span>+ New Workspace</span>
                <Sliders className="w-3.5 h-3.5 text-text-tertiary" />
              </button>
              
              {/* Collapse Sidebar Button */}
              <button
                onClick={() => { leftPanelRef.current?.collapse(); setWorkspaceSidebarOpen(false); }}
                className="w-9 h-9 rounded-lg border border-[#D6DCF0] bg-white hover:bg-[#F0F2FA] flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer transition-all shadow-2xs shrink-0"
                title="Collapse workspace panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Collapsible Tree Navigation */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              
              {/* Mock History Workspaces */}
              <div className="text-[10px] font-bold text-text-tertiary px-2 py-1.5 uppercase tracking-wider">
                Workspaces & Projects
              </div>
              
              <div className="space-y-0.5 mb-2">
                {workspaces.map((w) => {
                  const isActive = w.id === activeWorkspaceId;
                  return (
                    <div 
                      key={w.id}
                      className="group relative flex items-center w-full"
                    >
                      <button 
                        onClick={() => selectWorkspace(w.id)}
                        className={cn(
                          "w-full text-left px-2 py-1.5 rounded-lg text-[12px] font-semibold flex items-center justify-between transition-all cursor-pointer min-w-0 pr-8",
                          isActive 
                            ? "bg-primary/8 text-primary font-bold shadow-2xs border-l-2 border-primary" 
                            : "text-text-secondary hover:bg-secondary hover:text-text-primary"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Folder className={cn("w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-primary" : "text-text-tertiary")} />
                          <span className="truncate">{w.name}</span>
                        </div>
                        <span className="text-[9.5px] text-text-tertiary shrink-0 ml-1.5 opacity-60 group-hover:opacity-0 transition-opacity">
                          {w.date}
                        </span>
                      </button>
                      
                      {/* Delete workspace button */}
                      {workspaces.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete workspace "${w.name}"?`)) {
                              const remaining = workspaces.filter((x) => x.id !== w.id);
                              setWorkspaces(remaining);
                              if (isActive) {
                                const fallback = remaining[0];
                                setActiveWorkspaceId(fallback.id);
                                setDemoMessages(fallback.messages);
                                setAgentStates(fallback.agentStates);
                                setActiveNode(fallback.activeNode);
                                setIsDemoMode(fallback.isDemoMode);
                              }
                            }
                          }}
                          className="absolute right-2 opacity-0 group-hover:opacity-100 hover:text-red-500 text-text-tertiary p-1 transition-all rounded-md hover:bg-red-50 cursor-pointer"
                          title="Delete workspace"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected Active Project Node (collapsible tree) */}
              <div className="pt-2 border-t border-[#E4E8F4]/60">
                <button 
                  onClick={() => setTreeExpanded(p => ({ ...p, project: !p.project }))}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer",
                    activeNode !== "welcome" ? "bg-primary/5 text-primary" : "text-text-primary hover:bg-secondary"
                  )}
                >
                  {treeExpanded.project ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <FolderOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate text-left">{activeWorkspace.name}</span>
                </button>

                {treeExpanded.project && (
                  <div className="pl-4 mt-0.5 space-y-0.5 border-l border-[#E4E8F4] ml-3.5">
                    
                    {/* Default Workflow */}
                    <button 
                      onClick={() => setTreeExpanded(p => ({ ...p, workflow: !p.workflow }))}
                      className="w-full text-left px-2 py-1 rounded hover:bg-secondary text-text-secondary text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {treeExpanded.workflow ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      <span>Default Workflow</span>
                    </button>

                    {treeExpanded.workflow && (
                      <div className="pl-3 mt-0.5 space-y-0.5 border-l border-[#E4E8F4] ml-2">
                        
                        {/* Agents folder */}
                        <button 
                          onClick={() => setTreeExpanded(p => ({ ...p, agents: !p.agents }))}
                          className="w-full text-left px-2 py-1 rounded hover:bg-secondary text-text-secondary text-[11px] font-semibold flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-1">
                            {treeExpanded.agents ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            <span>Agents</span>
                          </div>
                          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-bold">4</span>
                        </button>

                        {treeExpanded.agents && (
                          <div className="pl-3 mt-0.5 space-y-0.5 border-l border-[#E4E8F4] ml-2">
                            
                            {/* Main 4 Agents */}
                            {[
                              { id: "agent-strategy", label: "Strategy Agent", icon: TrendingUp, color: "#4A6CF7" },
                              { id: "agent-data", label: "Data Analyst", icon: BarChart2, color: "#0FC4A7" },
                              { id: "agent-search", label: "Search Agent", icon: Search, color: "#9B72F7" },
                              { id: "agent-research", label: "Research Agent", icon: Globe, color: "#F7924A" },
                            ].map((agent) => {
                              const isSelected = activeNode === agent.id;
                              const Icon = agent.icon;
                              return (
                                <button 
                                  key={agent.id}
                                  onClick={() => {
                                    setActiveNode(agent.id as any);
                                    setRightDrawer(null); // Close right drawer to focus on agent detail pane
                                  }}
                                  className={cn(
                                    "w-full text-left px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                                    isSelected ? "bg-primary/10 text-primary font-bold shadow-2xs" : "text-text-secondary hover:bg-secondary"
                                  )}
                                >
                                  <Icon className="w-3 h-3" style={{ color: agent.color }} />
                                  <span>{agent.label}</span>
                                </button>
                              );
                            })}

                            <div className="h-px bg-[#E4E8F4]/60 my-1" />

                            {/* AGP Output details link */}
                            <button 
                              onClick={() => {
                                setActiveNode("agp");
                                setRightDrawer("output");
                              }}
                              className={cn(
                                "w-full text-left px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                                activeNode === "agp" ? "bg-primary/10 text-primary font-bold" : "text-text-secondary hover:bg-secondary"
                              )}
                            >
                              <Shield className="w-3 h-3 text-[#9B72F7]" />
                              <span>AGP</span>
                            </button>

                            {/* Usage details link */}
                            <button 
                              onClick={() => {
                                setActiveNode("usage");
                                setRightDrawer("usage");
                              }}
                              className={cn(
                                "w-full text-left px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer",
                                activeNode === "usage" ? "bg-primary/10 text-primary font-bold" : "text-text-secondary hover:bg-secondary"
                              )}
                            >
                              <Activity className="w-3 h-3 text-[#0FC4A7]" />
                              <span>Usage</span>
                            </button>

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}
              </div>

            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />

    {/* ── CENTER WORKSPACE ── */}
    <ResizablePanel defaultSize={panelSizes.center} minSize={25} maxSize={panelSizes.right === 0 ? 100 : 75} className="flex flex-col bg-white h-full relative overflow-hidden min-w-0">
          
          {/* Floating Sidebar Expand Button */}
          {!workspaceSidebarOpen && (
            <button
              onClick={() => { leftPanelRef.current?.expand(); setWorkspaceSidebarOpen(true); }}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-14 bg-white border border-[#E4E8F4] border-l-0 rounded-r-lg shadow-l1 flex items-center justify-center text-text-tertiary hover:text-text-primary z-20 transition-all hover:w-6 cursor-pointer"
              title="Expand workspace panel"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Header */}
          <div className="h-14 px-4 sm:px-6 border-b border-[#E4E8F4] flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
            <span className="text-[14px] font-bold text-text-primary tracking-tight">
              {activeWorkspace.name}
            </span>
          </div>
          <div className="h-10 px-4 sm:px-6 border-b border-[#E4E8F4] flex items-center justify-between bg-[#F8F9FD]/80 backdrop-blur-md shrink-0 sticky top-14 z-10 select-none">
            {/* Left section: Agent Status Pills */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
              <span className="text-[9.5px] font-bold text-text-tertiary uppercase tracking-wider mr-1 shrink-0">
                Agent Pipeline:
              </span>
              
              {[
                { key: "strategy", name: "Strategy", icon: TrendingUp, color: "#4A6CF7" },
                { key: "data", name: "Data Analyst", icon: BarChart2, color: "#0FC4A7" },
                { key: "search", name: "Search", icon: Search, color: "#9B72F7" },
                { key: "research", name: "Research", icon: Globe, color: "#F7924A" }
              ].map((agent) => {
                const state = agentStates[agent.key] || "idle";
                const Icon = agent.icon;
                
                return (
                  <div 
                    key={agent.key}
                    className={cn(
                      "h-6 px-2.5 rounded-full border text-[10.5px] font-bold flex items-center gap-1.5 transition-all shrink-0 duration-300",
                      state === "idle" && "bg-white border-[#D6DCF0] text-text-secondary",
                      state === "active" && "animate-pulse shadow-sm border-current",
                      state === "done" && "bg-success/5 border-success/20 text-success"
                    )}
                    style={state === "active" ? {
                      backgroundColor: `${agent.color}15`,
                      color: agent.color,
                      borderColor: agent.color,
                      boxShadow: `0 0 8px ${agent.color}25`
                    } : {}}
                  >
                    <Icon className={cn("w-3.5 h-3.5", state === "idle" && "opacity-40")} />
                    <span>{agent.name}</span>
                    {state === "active" && (
                      <span className="text-[8.5px] font-mono opacity-80 animate-pulse">· working...</span>
                    )}
                    {state === "done" && (
                      <span className="text-[8.5px] font-mono text-success/80">· done</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right section: System Status */}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-tertiary shrink-0">
              {isLoading || isDemoMode ? (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F6EF7] animate-pulse" />
                  <span className="text-[#4F6EF7] font-bold">Orchestrating agents...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="text-text-tertiary">All agents ready</span>
                </div>
              )}
            </div>
          </div>

          {/* Workspace view toggling */}
          {activeNode.startsWith("agent-") ? (
            /* Selected Agent Details View */
            <div className="flex-1 overflow-y-auto p-6 bg-radial from-white to-[#EEF1FA]/20 flex items-center justify-center">
              <div className="max-w-xl w-full bg-white rounded-2xl border border-[#E4E8F4] p-8 shadow-md space-y-6 animate-in fade-in duration-300">
                {/* Agent Header */}
                {(() => {
                  const agentKey = activeNode.replace("agent-", "");
                  const meta = AGENT_META[agentKey as AgentKey];
                  const Icon = agentKey === "strategy" ? TrendingUp 
                             : agentKey === "data" ? BarChart2 
                             : agentKey === "search" ? Search 
                             : Globe;
                  const promptSuggestion = agentKey === "strategy" ? "Build a GTM strategy for our new SaaS product"
                                         : agentKey === "data" ? "Show Q3 revenue trends and forecast Q4"
                                         : agentKey === "search" ? "Find our HR remote work leave policy"
                                         : "Benchmark our SaaS pricing against competitors";
                  
                  return (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0"
                             style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}dd)` }}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-text-primary">{meta.name} Agent</h2>
                            <span className="text-[9.5px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-success/10 text-success">
                              Ready
                            </span>
                          </div>
                          <p className="text-[12.5px] text-text-secondary mt-1">Specialized ESA Autonomous Core</p>
                        </div>
                      </div>

                      <div className="h-px bg-[#E4E8F4]" />

                      {/* Capabilities */}
                      <div className="space-y-2">
                        <h3 className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Operational Capabilities</h3>
                        <div className="grid grid-cols-2 gap-2 text-[12px] text-text-secondary">
                          {agentKey === "strategy" && (
                            <>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4A6CF7]" /> GTM Planning</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4A6CF7]" /> Competitor Benchmarks</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4A6CF7]" /> Risk Assessment</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#4A6CF7]" /> 90-day Milestones</div>
                            </>
                          )}
                          {agentKey === "data" && (
                            <>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0FC4A7]" /> Cohort Analysis</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0FC4A7]" /> Revenue Forecasting</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0FC4A7]" /> Automated Charts</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#0FC4A7]" /> Snowflake DW Access</div>
                            </>
                          )}
                          {agentKey === "search" && (
                            <>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#9B72F7]" /> Semantic Indexing</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#9B72F7]" /> Policy Auditing</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#9B72F7]" /> Entities Relationships</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#9B72F7]" /> Cross-border Compliance</div>
                            </>
                          )}
                          {agentKey === "research" && (
                            <>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F7924A]" /> Market Sizing</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F7924A]" /> Pricing Benchmarks</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F7924A]" /> NRR Optimization</div>
                              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F7924A]" /> Industry Trend Reports</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Trigger query */}
                      <div className="space-y-3 pt-2">
                        <div className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">Query Orchestrator Demo</div>
                        <button
                          onClick={() => {
                            setActiveNode("chat");
                            runDemo(agentKey as DemoKey, promptSuggestion);
                          }}
                          className="w-full text-left p-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/8 transition-all flex items-center justify-between cursor-pointer group"
                        >
                          <div>
                            <span className="text-[10px] font-bold text-primary block uppercase tracking-wider">Suggested Demo Query</span>
                            <span className="text-[13px] text-text-primary font-medium block mt-1">"{promptSuggestion}"</span>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          </div>
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          ) : activeNode === "welcome" && !hasMessages ? (
            /* Branded Welcome view — responsive hero */
            <div
              className="flex-1 overflow-y-auto flex flex-col items-center justify-center animate-in fade-in-50 slide-in-from-bottom-4 duration-500 relative"
              style={{ padding: "clamp(12px, 2vw, 36px) clamp(12px, 2vw, 40px)" }}
            >
              {/* Layered background glow effects */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Primary center glow */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: "clamp(300px, 60%, 700px)",
                    height: "clamp(300px, 60%, 700px)",
                    background: "radial-gradient(circle at center, rgba(79,110,247,0.10) 0%, rgba(155,114,247,0.06) 40%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
                />
                {/* Secondary green accent glow */}
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: "clamp(200px, 40%, 500px)",
                    height: "clamp(200px, 40%, 500px)",
                    background: "radial-gradient(circle at center, rgba(15,196,167,0.12) 0%, transparent 60%)",
                    filter: "blur(60px)",
                    transform: "translate(-50%, -30%)",
                  }}
                />
                {/* Soft ambient top-left */}
                <div
                  className="absolute top-0 left-0 rounded-full"
                  style={{
                    width: "clamp(150px, 30%, 350px)",
                    height: "clamp(150px, 30%, 350px)",
                    background: "radial-gradient(circle at top left, rgba(79,110,247,0.07), transparent 70%)",
                    filter: "blur(50px)",
                  }}
                />
              </div>

              {/* Hero content */}
              <div
                className="relative z-10 w-full flex flex-col items-center text-center"
                style={{ maxWidth: "clamp(280px, 75%, 560px)", gap: "clamp(12px, 2vw, 28px)", display: "flex", flexDirection: "column" }}
              >
                {/* Logo badge */}
                <div className="flex justify-center">
                  <div
                    className="relative flex items-center justify-center rounded-xl bg-white border border-[#E4E8F4]"
                    style={{
                      padding: "clamp(7px, 1vw, 14px)",
                      boxShadow: "0 4px 20px rgba(79,110,247,0.12), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                    }}
                  >
                    <svg
                      viewBox="0 0 32 32"
                      fill="none"
                      style={{ width: "clamp(28px, 3vw, 44px)", height: "clamp(28px, 3vw, 44px)" }}
                    >
                      <defs>
                        <linearGradient id="logo-ribbon-hero" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4F6EF7" />
                          <stop offset="50%" stopColor="#9B72F7" />
                          <stop offset="100%" stopColor="#F7924A" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M16 3 L28 25 C29 27, 26 29, 23 26 L16 14 L9 26 C6 29, 3 27, 4 25 Z"
                        stroke="url(#logo-ribbon-hero)"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11 17 H21"
                        stroke="url(#logo-ribbon-hero)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Typography */}
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(4px, 0.6vw, 8px)" }}>
                  <h1
                    className="font-bold text-text-primary tracking-tight leading-tight"
                    style={{ fontSize: "clamp(1.1rem, 2vw, 1.75rem)" }}
                  >
                    Welcome to{" "}
                    <span
                      style={{
                        background: "linear-gradient(135deg, #4F6EF7, #9B72F7)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {activeWorkspace.name}
                    </span>
                  </h1>
                  <p
                    className="text-text-secondary mx-auto leading-relaxed"
                    style={{
                      fontSize: "clamp(10px, 1vw, 13px)",
                      maxWidth: "clamp(200px, 50%, 400px)",
                    }}
                  >
                    Your strategies, analytics, and semantic searches are organized here.
                    Start your orchestrations below.
                  </p>
                </div>

                {/* Circular stat cards */}
                <AgentStatusCards
                  completed={activeWorkspace.completedTasks}
                  inProgress={activeWorkspace.inProgressTasks}
                  inQueue={activeWorkspace.inQueueTasks}
                />

                {/* Quick-start capability chips */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "clamp(6px, 1vw, 12px)",
                    justifyContent: "center",
                  }}
                >
                  {CAPABILITIES.map((cap) => {
                    const Icon = cap.icon;
                    return (
                      <button
                        key={cap.demoKey}
                        onClick={() => {
                          setActiveNode("chat");
                          runDemo(cap.demoKey, cap.prompt);
                        }}
                        className="flex items-center gap-2 rounded-full border transition-all cursor-pointer hover:scale-105 active:scale-95"
                        style={{
                          padding: "clamp(6px, 0.8vw, 10px) clamp(12px, 1.5vw, 20px)",
                          fontSize: "clamp(10px, 1vw, 13px)",
                          fontWeight: 600,
                          background: cap.bg,
                          borderColor: cap.color + "33",
                          color: cap.color,
                          boxShadow: `0 2px 12px ${cap.color}18`,
                        }}
                      >
                        <Icon style={{ width: "clamp(12px, 1.2vw, 16px)", height: "clamp(12px, 1.2vw, 16px)" }} strokeWidth={2} />
                        {cap.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Active chat window pane */
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 bg-[#F8F9FD]">
              <div className="max-w-xl mx-auto space-y-4">
                
                {/* Demo banner */}
                {isDemoMode && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-medium bg-[#4F6EF7]/10 border border-[#4F6EF7]/20 select-none">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center bg-gradient-to-r from-primary to-[#9B72F7]">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-primary">Agent workflow active — compiling rule documents</span>
                    <button onClick={exitDemo} className="ml-auto flex items-center gap-1 text-[#8A93B0] hover:text-[#0F1117] transition-colors cursor-pointer">
                      <X className="w-3.5 h-3.5" /> Exit
                    </button>
                  </div>
                )}

                {/* Messages stream */}
                {isDemoMode && demoMessages.map((m) => (
                  <Bubble key={m.id} role={m.role} ts={m.ts}>
                    {m.role === "user"
                      ? <p className="text-[13px] leading-[1.65]">{m.content}</p>
                      : <div className="space-y-2">{m.content && <MdText text={m.content} />}{m.component}</div>}
                  </Bubble>
                ))}

                {!isDemoMode && messages.map((m) => (
                  <Bubble key={m.id} role={m.role as "user" | "assistant"} ts={timestamp()}>
                    {m.role === "user" ? (
                      <p className="text-[13px] leading-[1.65]">
                        {m.parts.filter((p) => p.type === "text").map((p) => (p as { type: "text"; text: string }).text).join("")}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {m.parts.map((part, pi) => {
                          const p = part as Record<string, unknown>;
                          if (p.type === "text") return <MdText key={pi} text={p.text as string} />;
                          if (typeof p.type === "string" && p.type.startsWith("tool-")) {
                            return <ToolCallRenderer key={pi} toolName={p.toolName as string} result={p.output ?? p.result} />;
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </Bubble>
                ))}

                {isLoading && (
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary/10">
                      <Bot className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3.5 border border-[#E4E8F4]">
                      <span className="text-[12px] text-text-tertiary">ESA is processing...</span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>
          )}

          {/* ── BOTTOM INPUT BAR ── */}
          <div className="border-t border-[#E4E8F4] px-3 sm:px-4 py-3 shrink-0 bg-white">
            <div className="max-w-xl mx-auto">
              
              {/* Attached file tags */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachedFiles.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 text-[11px] font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      {f}
                      <button onClick={() => setAttachedFiles(a => a.filter((_, j) => j !== i))} className="hover:text-red-500">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Text area and toolbar container */}
              <div className="rounded-2xl border border-[#D6DCF0] bg-white shadow-xs focus-within:border-primary transition-all">
                <textarea 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  onKeyDown={handleKey}
                  placeholder={activeNode === "welcome" ? "Ask Orchestrator to build..." : "Type query..."}
                  rows={1} 
                  className="w-full resize-none bg-transparent border-0 outline-none text-[13.5px] text-text-primary placeholder:text-text-tertiary px-4 pt-3.5 pb-1.5 min-h-[46px] max-h-[120px]"
                />
                
                {/* Toolbar */}
                <div className="flex items-center justify-between px-3 pb-2.5">
                  <div className="flex items-center gap-1.5 text-text-tertiary">
                    {/* Add File button */}
                    <button 
                      onClick={() => setShowFileModal(true)}
                      className="p-1 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Workflows Capsule Dropdown */}
                    <button 
                      onClick={() => alert("Configure workflows")}
                      className="px-2.5 py-1.5 rounded-full border border-[#D6DCF0] hover:bg-secondary text-[10px] font-bold text-text-secondary flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" /> Workflows (1) <ChevronDown className="w-3 h-3 text-text-tertiary" />
                    </button>

                    {/* Agents Capsule Dropdown */}
                    <button 
                      onClick={() => alert("Configure agents")}
                      className="px-2.5 py-1.5 rounded-full border border-[#D6DCF0] hover:bg-secondary text-[10px] font-bold text-text-secondary flex items-center gap-1 cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" /> Agents (1) <ChevronDown className="w-3 h-3 text-text-tertiary" />
                    </button>

                    {/* Team Capsule Dropdown */}
                    <button 
                      onClick={() => alert("Configure team settings")}
                      className="px-2.5 py-1.5 rounded-full border border-[#D6DCF0] hover:bg-secondary text-[10px] font-bold text-text-secondary flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" /> Team (1) <ChevronDown className="w-3 h-3 text-text-tertiary" />
                    </button>

                    {/* Soundwave/mic & lightning triggers */}
                    <button 
                      onClick={() => alert("Orchestrator tools active")}
                      className="p-1 hover:bg-secondary rounded-lg transition-colors cursor-pointer ml-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={toggleVoice}
                      className={cn(
                        "p-1 rounded-lg transition-colors cursor-pointer",
                        listening ? "bg-red-50 text-red-500" : "hover:bg-secondary"
                      )}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Send Button */}
                  <button 
                    onClick={() => submitReal(inputText)}
                    disabled={!inputText.trim() && attachedFiles.length === 0}
                    className="w-8 h-8 rounded-full bg-text-primary text-white flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed hover:bg-primary transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 rotate-[-45deg] translate-x-[1px] translate-y-[-1px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </ResizablePanel>

        {/* ── COLUMN 3: AGENT SIDE PANEL / DETAIL DRAWER ── */}
        {rightDrawer ? (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel 
              ref={rightPanelRef}
              defaultSize={panelSizes.right || 23} 
              minSize={20} 
              maxSize={45} 
              className="border-l border-[#E4E8F4] flex flex-col bg-[#F7F8FC] h-full overflow-hidden animate-in slide-in-from-right-10 duration-300"
            >
              <UsageDrawer 
                onClose={() => setRightDrawer(null)} 
                activeView={rightDrawer} 
              />
            </ResizablePanel>
          </>
        ) : panelSizes.right > 0 ? (
          /* Agent side panel — always visible on laptop+ */
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={panelSizes.right}
              minSize={16}
              maxSize={38}
              className="h-full overflow-hidden"
            >
              <AgentSidePanel
                agentStates={agentStates}
                onRunDemo={(key, prompt) => {
                  setActiveNode("chat");
                  runDemo(key as DemoKey, prompt);
                }}
                completedTasks={activeWorkspace.completedTasks}
                inProgressTasks={activeWorkspace.inProgressTasks}
                inQueueTasks={activeWorkspace.inQueueTasks}
              />
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>

    </div>

      {showFileModal && (
        <FileAttachModal
          onClose={() => setShowFileModal(false)}
          onAttach={(name) => setAttachedFiles((a) => [...a, name])}
        />
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F1117]/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in" onClick={() => setShowCreateModal(false)} />
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl border border-[#D6DCF0] p-6 overflow-hidden flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            style={{ boxShadow: "0 20px 64px rgba(79, 110, 247, 0.16)" }}
          >
            <div className="flex items-center justify-between border-b border-[#E4E8F4] pb-3">
              <span className="text-[14px] font-bold text-text-primary">Create New Workspace</span>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-secondary rounded-lg text-text-tertiary cursor-pointer transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Workspace Name Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Workspace Name</label>
                <input 
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="e.g. APAC Q3 Strategy Hub"
                  className="w-full border border-[#D6DCF0] focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl px-3.5 py-2.5 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none transition-all animate-in fade-in duration-300"
                />
              </div>

              {/* Template Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">Select Strategy Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {CREATOR_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setNewWorkspaceTemplate(t.id);
                        setNewWorkspaceAgents(t.agents);
                      }}
                      className={cn(
                        "text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1",
                        newWorkspaceTemplate === t.id 
                          ? "border-primary bg-primary/5 shadow-2xs" 
                          : "border-[#D6DCF0] bg-white hover:bg-secondary"
                      )}
                    >
                      <span className="text-[12px] font-bold text-text-primary block">{t.label}</span>
                      <span className="text-[9.5px] text-text-tertiary leading-tight block">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Agents Toggle */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block">Target Agent Team</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "strategy", name: "Strategy Agent", color: "#4A6CF7" },
                    { key: "data", name: "Data Analyst", color: "#0FC4A7" },
                    { key: "search", name: "Search Agent", color: "#9B72F7" },
                    { key: "research", name: "Research Agent", color: "#F7924A" }
                  ].map((agent) => {
                    const active = newWorkspaceAgents.includes(agent.key);
                    return (
                      <button
                        key={agent.key}
                        type="button"
                        onClick={() => {
                          if (active) {
                            if (newWorkspaceAgents.length > 1) {
                              setNewWorkspaceAgents(newWorkspaceAgents.filter((a) => a !== agent.key));
                            }
                          } else {
                            setNewWorkspaceAgents([...newWorkspaceAgents, agent.key]);
                          }
                        }}
                        className={cn(
                          "px-2.5 py-1.5 rounded-full border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5",
                          active ? "shadow-2xs" : "border-[#D6DCF0] bg-white text-text-secondary hover:bg-secondary"
                        )}
                        style={active ? {
                          borderColor: agent.color,
                          backgroundColor: `${agent.color}08`,
                          color: agent.color
                        } : {}}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
                        {agent.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end pt-3 border-t border-[#E4E8F4] mt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-[#D6DCF0] hover:bg-secondary text-[12.5px] font-bold text-text-secondary cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = newWorkspaceName.trim() || `New Workspace ${workspaces.length + 1}`;
                  const newWorkspace: WorkspaceItem = {
                    id: Math.random().toString(36).substring(2, 9),
                    name: name,
                    date: new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
                    activeNode: "welcome",
                    messages: [],
                    agentStates: {
                      strategy: newWorkspaceAgents.includes("strategy") ? "idle" : "idle",
                      data: newWorkspaceAgents.includes("data") ? "idle" : "idle",
                      search: newWorkspaceAgents.includes("search") ? "idle" : "idle",
                      research: newWorkspaceAgents.includes("research") ? "idle" : "idle"
                    },
                    isDemoMode: false,
                    completedTasks: 0,
                    inProgressTasks: 0,
                    inQueueTasks: 0
                  };
                  
                  setWorkspaces((prev) => [...prev, newWorkspace]);
                  // Activate immediately
                  setActiveWorkspaceId(newWorkspace.id);
                  setDemoMessages([]);
                  setAgentStates({ strategy: "idle", data: "idle", search: "idle", research: "idle" });
                  setActiveNode("welcome");
                  setIsDemoMode(false);
                  
                  // Automatically expand left sidebar!
                  leftPanelRef.current?.expand();
                  setWorkspaceSidebarOpen(true);
                  
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-[#9B72F7] text-white text-[12.5px] font-bold cursor-pointer hover:shadow-xs transition-all hover:scale-[1.02]"
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
