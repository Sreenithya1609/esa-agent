import { useState } from "react";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentMetricsRow {
  agentName: string;
  tag: string;
  subAgentsCount: number;
  coinsUsed: number;
  tokensUsed: string;
  llmCalls: string;
  status: "Healthy" | "Degraded" | "Idle";
}

export function AgentPerformanceTable() {
  const [activeTab, setActiveTab] = useState<"workflows" | "agents" | "subagents">("agents");

  const rows: AgentMetricsRow[] = [
    {
      agentName: "AGP Strategy",
      tag: "AGP",
      subAgentsCount: 1,
      coinsUsed: 16.34,
      tokensUsed: "—",
      llmCalls: "—",
      status: "Healthy",
    },
    {
      agentName: "Data Analyst",
      tag: "DATA",
      subAgentsCount: 1,
      coinsUsed: 8.5,
      tokensUsed: "2.1k",
      llmCalls: "14",
      status: "Healthy",
    },
    {
      agentName: "Search Crawl",
      tag: "SRCH",
      subAgentsCount: 2,
      coinsUsed: 5.2,
      tokensUsed: "12.4k",
      llmCalls: "28",
      status: "Healthy",
    },
  ];

  return (
    <div className="space-y-4 select-none">
      {/* Tabs list */}
      <div className="flex border-b border-[#E4E8F4] gap-4">
        {[
          { id: "workflows", label: "Workflows" },
          { id: "agents", label: "Agents" },
          { id: "subagents", label: "Sub-agents" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "pb-2 text-[12px] font-bold border-b-2 -mb-px transition-colors cursor-pointer",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-tertiary hover:text-text-primary"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table grid */}
      <div className="bg-white border border-[#E4E8F4] rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#F7F8FC] border-b border-[#E4E8F4] text-text-secondary font-bold">
              <th className="py-2.5 px-3">AGENT</th>
              <th className="py-2.5 px-2">SUB-AGENTS</th>
              <th className="py-2.5 px-2">COINS</th>
              <th className="py-2.5 px-2">TOKENS</th>
              <th className="py-2.5 px-2">LLM CALLS</th>
              <th className="py-2.5 px-3 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8F4] text-text-primary font-medium">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-[#F7F8FC]/50 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-[12px]">{row.agentName}</span>
                    <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider mt-0.5">
                      {row.tag}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {row.subAgentsCount}
                  </div>
                </td>
                <td className="py-3 px-2 text-[#D97706] font-bold">
                  ⚡ {row.coinsUsed}
                </td>
                <td className="py-3 px-2 text-text-tertiary">{row.tokensUsed}</td>
                <td className="py-3 px-2 text-text-tertiary">{row.llmCalls}</td>
                <td className="py-3 px-3 text-right">
                  <span className="inline-flex items-center gap-1.5 text-success text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Footer Summary */}
        <div className="px-3 py-2.5 bg-[#F7F8FC] border-t border-[#E4E8F4] flex items-center justify-between text-[11px] text-text-secondary font-semibold">
          <span>{rows.length} agents monitored</span>
          <span className="text-[#D97706] flex items-center gap-1 font-bold">
            <Coins className="w-3.5 h-3.5" /> 30.04 total coins
          </span>
        </div>
      </div>
    </div>
  );
}
