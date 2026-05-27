import { TrendingUp, BarChart2, Search, Globe, Play, Zap, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AGENT_META, type AgentKey } from "@/lib/mockData";

interface AgentSidePanelProps {
  agentStates: Record<string, "idle" | "active" | "done" | "error">;
  onRunDemo: (key: string, prompt: string) => void;
  completedTasks: number;
  inProgressTasks: number;
  inQueueTasks: number;
}

const AGENT_ICONS: Record<AgentKey, React.ElementType> = {
  strategy: TrendingUp,
  data: BarChart2,
  search: Search,
  research: Globe,
};

const AGENT_PROMPTS: Record<AgentKey, string> = {
  strategy: "Build a GTM strategy for our new SaaS product",
  data: "Show Q3 revenue trends and forecast Q4",
  search: "Find our HR remote work leave policy",
  research: "Benchmark our SaaS pricing against competitors",
};

export function AgentSidePanel({
  agentStates,
  onRunDemo,
  completedTasks,
  inProgressTasks,
  inQueueTasks,
}: AgentSidePanelProps) {
  const agents = Object.keys(AGENT_META) as AgentKey[];

  const activeCount = agents.filter((k) => agentStates[k] === "active").length;
  const doneCount = agents.filter((k) => agentStates[k] === "done").length;

  return (
    <div className="h-full flex flex-col bg-[#F8F9FD] border-l border-[#E4E8F4] overflow-hidden select-none">
      {/* Header */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[#E4E8F4] bg-white shrink-0">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
          <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
            Agent Pipeline
          </span>
        </div>
        {activeCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-primary animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Running
          </span>
        )}
        {activeCount === 0 && doneCount > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-success">
            <CheckCircle2 className="w-3 h-3" />
            Done
          </span>
        )}
        {activeCount === 0 && doneCount === 0 && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Ready
          </span>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* Task summary row */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Done", value: completedTasks, color: "#0FC4A7", icon: <CheckCircle2 className="w-3 h-3" /> },
            { label: "Active", value: inProgressTasks, color: "#4F6EF7", icon: <Loader2 className={cn("w-3 h-3", inProgressTasks > 0 && "animate-spin")} /> },
            { label: "Queue", value: inQueueTasks, color: "#9B72F7", icon: <Clock className="w-3 h-3" /> },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border bg-white p-2 flex flex-col items-center gap-0.5"
              style={{ borderColor: s.color + "30" }}
            >
              <span style={{ color: s.color }}>{s.icon}</span>
              <span className="text-[14px] font-bold leading-none" style={{ color: s.color }}>
                {s.value}
              </span>
              <span className="text-[9px] text-text-tertiary font-semibold uppercase tracking-wide">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E4E8F4]" />

        {/* Agent cards */}
        <div className="space-y-2">
          <span className="text-[9.5px] font-bold text-text-tertiary uppercase tracking-wider block px-0.5">
            Agents
          </span>
          {agents.map((key) => {
            const meta = AGENT_META[key];
            const state = agentStates[key] || "idle";
            const Icon = AGENT_ICONS[key];
            const prompt = AGENT_PROMPTS[key];

            return (
              <div
                key={key}
                className={cn(
                  "rounded-xl border bg-white p-2.5 transition-all duration-300",
                  state === "active" && "shadow-sm",
                  state === "done" && "opacity-80"
                )}
                style={{
                  borderColor: state === "active" ? meta.color + "55" : state === "done" ? meta.color + "30" : "#E4E8F4",
                  background: state === "active" ? meta.color + "06" : "white",
                }}
              >
                {/* Agent header row */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{
                      background: state === "idle"
                        ? "#E4E8F4"
                        : `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: state === "idle" ? "#8A93B0" : "white" }}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11.5px] font-bold text-text-primary block truncate leading-tight">
                      {meta.name}
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wide",
                        state === "active" && "animate-pulse",
                      )}
                      style={{
                        color: state === "idle" ? "#8A93B0" : state === "active" ? meta.color : "#0FC4A7",
                      }}
                    >
                      {state === "idle" ? "Ready" : state === "active" ? "Working…" : state === "done" ? "Done" : "Error"}
                    </span>
                  </div>

                  {/* Status indicator */}
                  <span
                    className={cn("w-2 h-2 rounded-full shrink-0", state === "active" && "animate-pulse")}
                    style={{
                      background: state === "idle" ? "#D6DCF0" : state === "active" ? meta.color : state === "done" ? "#0FC4A7" : "#EF4444",
                      boxShadow: state === "active" ? `0 0 6px ${meta.color}88` : "none",
                    }}
                  />
                </div>

                {/* Run button */}
                <button
                  onClick={() => onRunDemo(key, prompt)}
                  disabled={state === "active"}
                  className={cn(
                    "w-full h-7 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border",
                    state === "active"
                      ? "opacity-50 cursor-not-allowed border-transparent bg-transparent text-text-tertiary"
                      : "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                  style={
                    state !== "active"
                      ? {
                          background: meta.color + "12",
                          borderColor: meta.color + "30",
                          color: meta.color,
                        }
                      : {}
                  }
                >
                  {state === "active" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Play className="w-3 h-3 fill-current" />
                  )}
                  {state === "active" ? "Running…" : "Run Demo"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E4E8F4]" />

        {/* Pipeline flow mini-viz */}
        <div className="space-y-1.5">
          <span className="text-[9.5px] font-bold text-text-tertiary uppercase tracking-wider block px-0.5">
            Pipeline Flow
          </span>
          <div className="bg-white rounded-xl border border-[#E4E8F4] p-2.5">
            <svg viewBox="0 0 180 90" className="w-full h-[72px]">
              {/* Orchestrator node */}
              <circle cx="22" cy="45" r="14" fill="#F0F2FA" stroke="#D6DCF0" strokeWidth="1" />
              <text x="22" y="49" textAnchor="middle" fontSize="9" fontWeight="700" fill="#4B526B">ESA</text>

              {agents.map((k, i) => {
                const meta = AGENT_META[k];
                const state = agentStates[k] || "idle";
                const isActive = state === "active";
                const isDone = state === "done";
                const cy = 12 + i * 22;
                return (
                  <g key={k}>
                    <path
                      d={`M 36 45 Q 100 45 158 ${cy}`}
                      fill="none"
                      stroke={isActive ? meta.color : isDone ? meta.color + "88" : "#E4E8F4"}
                      strokeWidth={isActive ? 1.5 : 1}
                      strokeDasharray={isActive ? "4 2" : isDone ? "none" : "2 3"}
                      opacity={isActive ? 0.9 : isDone ? 0.6 : 0.4}
                    />
                    <circle
                      cx="162"
                      cy={cy}
                      r="10"
                      fill={isActive ? meta.color : isDone ? meta.color + "22" : "#F7F8FC"}
                      stroke={isActive ? meta.color : isDone ? meta.color + "55" : "#E4E8F4"}
                      strokeWidth="1"
                    />
                    <text
                      x="162"
                      y={cy + 3.5}
                      textAnchor="middle"
                      fontSize="8"
                      fill={isActive ? "white" : isDone ? meta.color : "#8A93B0"}
                      fontWeight="700"
                    >
                      {meta.name[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
