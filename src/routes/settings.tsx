import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User, Building2, Bot, Database, Bell, Shield, Key, CreditCard, Palette, BookOpen, Eye, Copy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

import { useRole } from "@/lib/roleContext";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — ESA" }] }),
  component: Settings,
});

const NAV = [
  { key: "profile", label: "Profile", icon: User },
  { key: "workspace", label: "Workspace", icon: Building2 },
  { key: "llm", label: "LLM Configuration", icon: Bot },
  { key: "data", label: "Data Sources", icon: Database },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
  { key: "api", label: "API Keys", icon: Key },
  { key: "billing", label: "Plans & Billing", icon: CreditCard },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "resources", label: "Resources", icon: BookOpen },
];

const inputClass = "w-full h-10 px-3.5 rounded-md bg-surface border border-border-strong text-[14px] focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

function Settings() {
  const { can } = useRole();
  const hasAdminAccess = can("configure_llm");
  
  // Filter settings tabs based on authorization level
  const allowedNav = NAV.filter((n) => {
    if (["llm", "workspace", "api", "security"].includes(n.key)) {
      return hasAdminAccess;
    }
    return true;
  });

  const [active, setActive] = useState(hasAdminAccess ? "llm" : "profile");

  return (
    <DashboardLayout title="Settings" hideRight>
      <div className="flex">
        <aside className="w-[220px] border-r border-border bg-surface min-h-[calc(100vh-56px)] p-2 shrink-0">
          {allowedNav.map((n) => {
            const Icon = n.icon;
            const on = active === n.key;
            return (
              <button key={n.key} onClick={() => setActive(n.key)} className={cn(
                "w-full flex items-center gap-2.5 h-9 px-3 rounded-md text-[13px] text-left cursor-pointer",
                on ? "text-primary font-medium" : "text-text-secondary hover:bg-secondary hover:text-text-primary"
              )} style={on ? { background: "rgba(79,110,247,0.08)" } : undefined}>
                <Icon className="w-4 h-4" strokeWidth={1.5} /> {n.label}
              </button>
            );
          })}
        </aside>
        <div className="flex-1 p-8 max-w-3xl">
          {active === "profile" && (
            <div className="bg-surface border border-border rounded-xl p-6 shadow-l1 space-y-4">
              <h2 className="text-[20px] font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>Profile Settings</h2>
              <p className="text-[14px] text-text-secondary">Update your personal account credentials and details.</p>
              <div className="space-y-4 pt-2 text-xs">
                <div>
                  <label className="text-[13px] font-medium text-text-primary mb-1.5 block">Full Name</label>
                  <input type="text" className={inputClass} defaultValue="Arjun Mehta" />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-text-primary mb-1.5 block">Email Address</label>
                  <input type="email" className={inputClass} defaultValue="arjun.mehta@acmecorp.com" />
                </div>
                <button className="h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium cursor-pointer">
                  Save Changes
                </button>
              </div>
            </div>
          )}
          {active === "llm" && <LlmConfig />}
          {active === "api" && <ApiKeys />}
          {active === "appearance" && <Appearance />}
          {active !== "profile" && active !== "llm" && active !== "api" && active !== "appearance" && (
            <div className="bg-surface border border-border rounded-xl p-8 shadow-l1 text-[14px] text-text-secondary font-semibold">
              {NAV.find(n => n.key === active)?.label} settings — coming soon.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function LlmConfig() {
  const [temp, setTemp] = useState(0.4);
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[20px] font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>LLM Configuration</h2>
        <p className="text-[14px] text-text-secondary">Configure AI providers for your workspace</p>
      </div>
      <div className="bg-surface border border-border rounded-xl p-5 shadow-l1 flex items-center justify-between">
        <div>
          <div className="text-[13px] text-text-tertiary">Active provider</div>
          <div className="text-[14px] font-semibold text-text-primary">OpenAI · gpt-4o · sk-····4f2a</div>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-full bg-success/10 text-success font-semibold">Connected</span>
      </div>
      <div className="bg-surface border border-border rounded-xl p-6 shadow-l1 space-y-4">
        <div>
          <label className="text-[13px] font-medium text-text-primary mb-1.5 block">Provider</label>
          <select className={inputClass}><option>OpenAI</option><option>Anthropic</option><option>Azure OpenAI</option><option>Google Gemini</option></select>
        </div>
        <div>
          <label className="text-[13px] font-medium text-text-primary mb-1.5 block">API Key</label>
          <div className="relative">
            <input type="password" className={inputClass} defaultValue="sk-1234567890abcdef" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 text-text-tertiary">
              <button className="p-1.5 hover:bg-secondary rounded"><Eye className="w-3.5 h-3.5" /></button>
              <button className="p-1.5 hover:bg-secondary rounded"><Copy className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <p className="text-[12px] text-text-tertiary mt-1">Stored encrypted (AES-256). Never logged.</p>
        </div>
        <div>
          <label className="text-[13px] font-medium text-text-primary mb-1.5 block">Model</label>
          <select className={inputClass}><option>gpt-4o</option><option>gpt-4-turbo</option><option>gpt-3.5-turbo</option></select>
        </div>
        <div>
          <label className="text-[13px] font-medium text-text-primary mb-1.5 block">Temperature: {temp.toFixed(1)}</label>
          <input type="range" min={0} max={1} step={0.1} value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))}
                 className="w-full" style={{ accentColor: "#4F6EF7" }} />
          <div className="flex justify-between text-[11px] text-text-tertiary mt-1"><span>Creative</span><span>Precise</span></div>
        </div>
        <div>
          <label className="text-[13px] font-medium text-text-primary mb-1.5 block">Max Tokens</label>
          <input type="number" defaultValue={4096} className={inputClass} />
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-4 rounded-md border border-border text-[13px] flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> Test Connection</button>
          <button className="h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium ml-auto">Save Configuration</button>
        </div>
      </div>
    </div>
  );
}

function ApiKeys() {
  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>API Keys</h2>
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-l1">
        <table className="w-full text-[13px]">
          <thead><tr className="bg-secondary text-[12px] text-text-secondary text-left">
            {["Name","Scope","Created","Last Used","Status",""].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {[["Zapier Integration","Read, Query","Apr 2","2 days ago","Active"],
              ["Internal Dashboard","Read","Mar 18","1 hour ago","Active"]].map((r,i) => (
              <tr key={i} className="border-t border-border">
                {r.map((c,j) => <td key={j} className="px-4 py-3 text-text-primary">{j===4 ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/10 text-success">{c}</span> : c}</td>)}
                <td className="px-4 py-3"><button className="text-danger text-[12px]">Revoke</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium">+ Generate New Key</button>
    </div>
  );
}

function Appearance() {
  const [theme, setTheme] = useState("light");
  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>Appearance</h2>
      <div className="grid grid-cols-3 gap-4">
        {["light","dark","system"].map((t) => (
          <button key={t} onClick={() => setTheme(t)}
                  className={cn("rounded-xl p-4 border-2 text-left bg-surface shadow-l1", theme === t ? "border-primary" : "border-border")}>
            <div className="h-20 rounded-md mb-2" style={{ background: t === "dark" ? "#0A0B0E" : t === "system" ? "linear-gradient(90deg,#fff 50%,#0A0B0E 50%)" : "#F0F2FA" }} />
            <div className="text-[13px] font-medium capitalize text-text-primary">{t}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
