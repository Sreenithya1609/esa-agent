import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, MessageSquare, BarChart2, Database, FileText, Users,
  Settings, CreditCard, ClipboardList, Bell, Search, ChevronDown,
  PanelLeftClose, PanelLeftOpen, Menu, PanelRightClose, PanelRightOpen,
  Shield, Brain, Sliders
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { EsaLogo, AgentDot } from "./EsaLogo";
import { MOCK_DATA_SOURCES, AGENT_META, type AgentKey } from "@/lib/mockData";
import { useRole, ROLE_LABELS, ROLE_COLORS, type Permission } from "@/lib/roleContext";
import { cn } from "@/lib/utils";
import { PersonaSwitcher } from "./persona/PersonaSwitcher";
import { usePersona } from "@/lib/PersonaContext";

const ALL_NAV = [
  // Main
  { to: "/dashboard", label: "Dashboard",   icon: LayoutDashboard, permission: null, category: "Main" },
  { to: "/chat",      label: "AI Chat",      icon: MessageSquare,   permission: "run_queries" as Permission, category: "Main" },
  { to: "/search",    label: "Search",       icon: Search,          permission: null, category: "Main" },
  { to: "/reports",   label: "Reports",      icon: FileText,        permission: null, category: "Main" },
  { to: "/data",      label: "Data Sources", icon: Database,        permission: null, category: "Main" },
  { to: "/analytics", label: "Analytics",    icon: BarChart2,       permission: "view_analytics" as Permission, category: "Main" },
  
  // Admin Tools
  { to: "/admin/control-room", label: "Control Room", icon: Shield, permission: "view_audit_logs" as Permission, category: "Admin Tools" },
  { to: "/team",      label: "Team",         icon: Users,           permission: "invite_users" as Permission, category: "Admin Tools" },
  { to: "/audit",     label: "Audit Logs",   icon: ClipboardList,   permission: "view_audit_logs" as Permission, category: "Admin Tools" },
  
  // Settings
  { to: "/settings",  label: "Settings",     icon: Settings,        permission: null, category: "Settings" },
  { to: "/settings/memory", label: "Memory", icon: Brain,           permission: "configure_llm" as Permission, category: "Settings" },
  { to: "/settings/personas", label: "Personas", icon: Sliders,     permission: "configure_llm" as Permission, category: "Settings" },
  { to: "/billing",   label: "Billing",      icon: CreditCard,      permission: "manage_billing" as Permission, category: "Settings" },
];

export function DashboardLayout({
  title,
  children,
  right,
  hideRight = false,
  activeAgents = [],
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
  hideRight?: boolean;
  activeAgents?: AgentKey[];
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(!hideRight);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leftSidebarExpanded, setLeftSidebarExpanded] = useState(false);
  const location = useLocation();
  const { user, can } = useRole();

  // Filter nav by role permissions
  const NAV = ALL_NAV.filter((item) => item.permission === null || can(item.permission));

  return (
    <div className="min-h-screen flex bg-[#F7F8FC]">

      {/* ── SIDEBAR ── */}
      <>
        {/* mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={cn(
            "bg-white border-r border-[#E4E8F4] flex flex-col shrink-0 py-5 h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out relative overflow-hidden",
            leftSidebarExpanded ? "w-[clamp(180px,14vw,220px)]" : "w-16"
          )}
        >
          {/* Inner clip wrapper */}
          <div className={cn("flex flex-col h-full shrink-0 transition-all duration-300 w-full", leftSidebarExpanded ? "px-3" : "px-2")}>
            {/* logo */}
            <div className={cn("mb-8 flex items-center shrink-0 w-full transition-all duration-300", leftSidebarExpanded ? "px-2.5 justify-start" : "justify-center")}>
              <Link to="/dashboard">
                <EsaLogo size={28} withWord={leftSidebarExpanded} />
              </Link>
            </div>

            {/* navigation icons */}
            <nav className="flex-1 flex flex-col gap-4 w-full">
              {[
                { to: "/dashboard", label: "Home", icon: LayoutDashboard },
                { to: "/chat", label: "AI Chat / Agents", icon: MessageSquare },
                { to: "/team", label: "Teams", icon: Users },
              ].map((item) => {
                const active = location.pathname === item.to || (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "relative h-11 rounded-xl flex items-center gap-3.5 transition-all group w-full px-3.5",
                      active
                        ? "bg-primary/10 text-primary shadow-xs"
                        : "text-text-secondary hover:bg-secondary hover:text-text-primary"
                    )}
                    title={leftSidebarExpanded ? "" : item.label}
                  >
                    <Icon className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" strokeWidth={1.5} />
                    <span 
                      className={cn(
                        "text-[12.5px] font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 flex-1 text-left",
                        leftSidebarExpanded ? "opacity-100 max-w-[160px] translate-x-0" : "opacity-0 max-w-0 -translate-x-2 pointer-events-none"
                      )}
                    >
                      {item.label}
                    </span>
                    {active && (
                      <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-primary" />
                    )}
                    {/* Tooltip hint when collapsed only */}
                    {!leftSidebarExpanded && (
                      <span className="absolute left-14 bg-text-primary text-white text-[11px] font-semibold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* bottom area */}
            <div className="flex flex-col gap-4 mt-auto w-full relative">
              {/* Coins / Billing */}
              <Link
                to="/billing"
                className={cn(
                  "relative h-11 rounded-xl flex items-center gap-3.5 transition-all group w-full px-3.5",
                  location.pathname.startsWith("/billing")
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-secondary hover:text-text-primary"
                )}
                title={leftSidebarExpanded ? "" : "Plans & credits"}
              >
                <CreditCard className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-105" strokeWidth={1.5} />
                <span
                  className={cn(
                    "text-[12.5px] font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 flex-1 text-left",
                    leftSidebarExpanded ? "opacity-100 max-w-[160px] translate-x-0" : "opacity-0 max-w-0 -translate-x-2 pointer-events-none"
                  )}
                >
                  Plans & credits
                </span>
                {!leftSidebarExpanded && (
                  <span className="absolute left-14 bg-text-primary text-white text-[11px] font-semibold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    Plans & credits
                  </span>
                )}
              </Link>

              {/* Settings Gear Popover */}
              <div className="relative w-full">
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className={cn(
                    "h-11 rounded-xl flex items-center gap-3.5 transition-all cursor-pointer w-full px-3.5",
                    settingsOpen 
                      ? "bg-secondary text-text-primary" 
                      : "text-text-secondary hover:bg-secondary hover:text-text-primary"
                  )}
                  title={leftSidebarExpanded ? "" : "Settings & Account"}
                >
                  <Settings className={cn("w-5 h-5 shrink-0 transition-transform duration-300", settingsOpen && "rotate-45")} strokeWidth={1.5} />
                  <span
                    className={cn(
                      "text-[12.5px] font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 flex-1 text-left",
                      leftSidebarExpanded ? "opacity-100 max-w-[160px] translate-x-0" : "opacity-0 max-w-0 -translate-x-2 pointer-events-none"
                    )}
                  >
                    Settings
                  </span>
                  {!leftSidebarExpanded && (
                    <span className="absolute left-14 bg-text-primary text-white text-[11px] font-semibold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      Settings & Account
                    </span>
                  )}
                </button>

                {/* Popover Menu matching screenshot exactly */}
                {settingsOpen && (
                  <>
                    {/* Backdrop to close click */}
                    <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                    <div
                      className={cn(
                        "absolute bottom-0 bg-white rounded-xl border border-[#D6DCF0] py-2 shadow-lg z-50 animate-in fade-in-50 zoom-in-95 w-52",
                        leftSidebarExpanded ? "left-[clamp(180px,14vw,220px)]" : "left-12"
                      )}
                      style={{ filter: "drop-shadow(0 10px 24px rgba(79,110,247,0.08))" }}
                    >
                      {[
                        { to: "/profile", label: "Account" },
                        { to: "/billing", label: "Plans & credits" },
                        { to: "/settings", label: "Support", action: () => { alert("Support ticket system is ready. Contact arjun.mehta@acmecorp.com"); setSettingsOpen(false); } },
                        { to: "/analytics", label: "Observability" },
                        { to: "/settings/memory", label: "Key Vault" },
                        { to: "/admin/control-room", label: "Key Integration" },
                        { to: "/login", label: "Sign out", className: "text-red-500 hover:bg-red-50" },
                      ].map((opt, i) => (
                        opt.action ? (
                          <button
                            key={i}
                            onClick={opt.action}
                            className="w-full text-left px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-secondary hover:text-text-primary cursor-pointer"
                          >
                            {opt.label}
                          </button>
                        ) : (
                          <Link
                            key={i}
                            to={opt.to}
                            onClick={() => setSettingsOpen(false)}
                            className={cn(
                              "block px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-secondary hover:text-text-primary",
                              opt.className
                            )}
                          >
                            {opt.label}
                          </Link>
                        )
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar Expand/Shrink Action Button */}
              <button
                onClick={() => setLeftSidebarExpanded(!leftSidebarExpanded)}
                className={cn(
                  "h-11 rounded-xl flex items-center transition-all cursor-pointer text-text-secondary hover:bg-secondary hover:text-text-primary shrink-0 w-full px-3.5 gap-3.5",
                  leftSidebarExpanded ? "justify-start" : "justify-center"
                )}
                title={leftSidebarExpanded ? "Collapse navigation" : "Expand navigation"}
              >
                {leftSidebarExpanded ? (
                  <>
                    <PanelLeftClose className="w-5 h-5 shrink-0 animate-in fade-in duration-300" strokeWidth={1.5} />
                    <span className="text-[12px] font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 text-left">
                      Collapse
                    </span>
                  </>
                ) : (
                  <PanelLeftOpen className="w-5 h-5 shrink-0 animate-in fade-in duration-300" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>
        </aside>
      </>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* topbar */}
        <div
          className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}
        >
          <div className="flex items-center gap-3">
            {/* hamburger — always visible to open sidebar */}
            <button
              className="p-1.5 hover:bg-secondary rounded-md text-text-secondary"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <h1 className="text-[15px] font-semibold text-text-primary">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-secondary rounded-md text-text-secondary">
              <Search className="w-4.5 h-4.5" strokeWidth={1.5} />
            </button>
            
            <PersonaSwitcher />
            
            <button className="p-2 hover:bg-secondary rounded-md text-text-secondary relative">
              <Bell className="w-4.5 h-4.5" strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
            </button>
            <Link to="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-semibold"
              style={{ background: "linear-gradient(135deg,#4F6EF7,#9B72F7)" }}>
              {user.initials}
            </Link>
          </div>
        </div>

        {/* page content */}
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </main>

      {/* ── OPTIONAL RIGHT PANEL ── */}
      {!hideRight && rightOpen && (
        <aside style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column" }}
               className="bg-surface border-l border-border">
          <div className="h-10 px-4 flex items-center justify-between border-b border-border shrink-0">
            <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Workspace</span>
            <button
              onClick={() => setRightOpen(false)}
              className="p-1 hover:bg-secondary rounded text-text-tertiary hover:text-text-primary"
              aria-label="Close panel"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {right ?? <DefaultRightPanel activeAgents={activeAgents} />}
          </div>
        </aside>
      )}

      {/* re-open button when panel is closed */}
      {!hideRight && !rightOpen && (
        <button
          onClick={() => setRightOpen(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 w-5 h-14 bg-surface border border-border border-r-0 rounded-l-lg shadow-l1 flex items-center justify-center text-text-tertiary hover:text-text-primary z-20"
          aria-label="Open panel"
        >
          <PanelRightOpen className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function DefaultRightPanel({ activeAgents = [] as AgentKey[] }: { activeAgents?: AgentKey[] }) {
  return (
    <>
      {/* Agent Orchestration — like the chat page panel */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">Agent Orchestration</h3>
          {activeAgents.length > 0 && (
            <span className="flex gap-1">
              {[0,1,2].map((d) => (
                <span key={d} className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d*0.15}s` }} />
              ))}
            </span>
          )}
        </div>

        {/* SVG flow diagram */}
        <div className="rounded-xl border border-border bg-secondary/40 p-3 mb-3">
          <svg viewBox="0 0 220 110" className="w-full h-[90px]">
            {/* Query node */}
            <circle cx="28" cy="55" r="16" fill="#F0F2FA" stroke="#D6DCF0" strokeWidth="1" />
            <text x="28" y="59" textAnchor="middle" fontSize="10" fontWeight="600" fill="#4B526B">Q</text>
            {/* Agent nodes */}
            {(Object.keys(AGENT_META) as AgentKey[]).map((k, i) => {
              const meta = AGENT_META[k];
              const isActive = activeAgents.includes(k);
              const cy = 18 + i * 24;
              return (
                <g key={k}>
                  <path d={`M 44 55 Q 130 55 188 ${cy}`} fill="none"
                        stroke={isActive ? meta.color : "#E4E8F4"}
                        strokeWidth={isActive ? 1.5 : 1}
                        strokeDasharray={isActive ? "5 3" : "2 4"}
                        opacity={isActive ? 0.8 : 0.4} />
                  <circle cx="192" cy={cy} r="12"
                          fill={isActive ? meta.color : "#F7F8FC"}
                          stroke={isActive ? meta.color : "#E4E8F4"}
                          strokeWidth="1" />
                  <text x="192" y={cy + 4} textAnchor="middle" fontSize="9"
                        fill={isActive ? "white" : "#8A93B0"} fontWeight="600">
                    {meta.name[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Agent list */}
        <div className="space-y-2">
          {(Object.keys(AGENT_META) as AgentKey[]).map((k) => {
            const meta = AGENT_META[k];
            const { activePersona } = usePersona();
            const isPersonaAgent = activePersona?.agents.includes(k);
            const isActive = activeAgents.includes(k);

            // Hide agents not active in current persona
            if (!isPersonaAgent) return null;

            return (
              <div key={k} className="flex items-center gap-2 text-[12px]">
                <span className="w-2 h-2 rounded-full shrink-0 transition-all"
                      style={{
                        background: isActive ? meta.color : "#D6DCF0",
                        boxShadow: isActive ? `0 0 6px ${meta.color}88` : "none",
                      }} />
                <span className={`font-medium flex-1 ${isActive ? "text-text-primary" : "text-text-tertiary"}`}>
                  {meta.name} Agent
                </span>
                {isActive ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium"
                        style={{ background: meta.color }}>Used</span>
                ) : (
                  <span className="text-[10px] text-text-tertiary">Ready</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-border" />

      {/* Data Sources */}
      <section>
        <h3 className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">Data Sources</h3>
        <div className="space-y-1.5">
          {MOCK_DATA_SOURCES.slice(0, 4).map((s) => (
            <div key={s.id} className="flex items-center gap-2 text-[12px]">
              <Database className="w-3.5 h-3.5 text-text-tertiary shrink-0" strokeWidth={1.5} />
              <span className="text-text-primary truncate flex-1">{s.name}</span>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                s.status === "Active" ? "bg-success" : s.status === "Syncing" ? "bg-warning" : "bg-danger",
              )} />
            </div>
          ))}
          <Link to="/data" className="block text-[12px] text-primary mt-2 hover:underline">+ Add Source</Link>
        </div>
      </section>
    </>
  );
}
