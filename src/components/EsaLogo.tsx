import { AGENT_META, type AgentKey } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export function EsaLogo({ size = 28, withWord = true, className = "" }: { size?: number; withWord?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <svg width={size} height={size} viewBox="0 0 36 36" className="shrink-0" fill="none">
        <defs>
          <linearGradient id="esa-poly-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F6EF7" />
            <stop offset="50%" stopColor="#9B72F7" />
            <stop offset="100%" stopColor="#F7924A" />
          </linearGradient>
          <filter id="esa-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#4F6EF7" floodOpacity="0.2" />
          </filter>
        </defs>
        
        {/* Glowing Geometric Strategy Hexagon Loop */}
        <path 
          d="M18 3.5 L31 11 L31 25 L18 32.5 L5 25 L5 11 Z" 
          stroke="url(#esa-poly-grad)" 
          strokeWidth="2.5" 
          fill="rgba(79,110,247,0.03)" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          filter="url(#esa-glow)"
        />
        
        {/* Inner intersecting hexagon node */}
        <path 
          d="M18 10.5 L24.5 14.2 L24.5 21.8 L18 25.5 L11.5 21.8 L11.5 14.2 Z" 
          stroke="url(#esa-poly-grad)" 
          strokeWidth="1.2" 
          fill="rgba(155,114,247,0.06)" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          opacity="0.85"
        />
        
        {/* Central Core Orchestration Node */}
        <circle cx="18" cy="18" r="3.2" fill="url(#esa-poly-grad)" />
      </svg>
      {withWord && (
        <div className="flex flex-col select-none transition-all duration-300 animate-in fade-in zoom-in-95">
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#4F6EF7] via-[#9B72F7] to-[#F7924A] text-[18px] leading-none tracking-tight">
            ESA
          </span>
          <span className="text-[8px] font-extrabold text-text-tertiary uppercase tracking-[0.25em] leading-none mt-1">
            Agent
          </span>
        </div>
      )}
    </div>
  );
}

export function AgentBadge({ agent, size = "sm" }: { agent: AgentKey; size?: "xs" | "sm" }) {
  const meta = AGENT_META[agent];
  const px = size === "xs" ? "0 6px" : "0 8px";
  const fs = size === "xs" ? 10 : 11;
  return (
    <span
      className="inline-flex items-center rounded-full font-medium border whitespace-nowrap"
      style={{
        height: size === "xs" ? 18 : 20,
        padding: px,
        fontSize: fs,
        background: meta.color + "22",
        color: meta.color,
        borderColor: meta.color + "55",
      }}
    >
      {meta.name}
    </span>
  );
}

export function AgentDot({ agent, active = false }: { agent: AgentKey; active?: boolean }) {
  const meta = AGENT_META[agent];
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: 8, height: 8,
        background: meta.color,
        boxShadow: active ? `0 0 0 4px ${meta.color}33` : undefined,
      }}
    />
  );
}
