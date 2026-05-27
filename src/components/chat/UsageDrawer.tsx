import { useState } from "react";
import { 
  Database, Shield, FileText, ExternalLink, X, ChevronRight, BarChart2, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentPerformanceTable } from "./AgentPerformanceTable";

interface UsageDrawerProps {
  onClose: () => void;
  activeView: "usage" | "output";
}

export function UsageDrawer({ onClose, activeView }: UsageDrawerProps) {
  const [outputTab, setOutputTab] = useState<"overview" | "output" | "questions" | "agents">("output");

  return (
    <div className="h-full flex flex-col bg-[#F7F8FC] border-l border-[#E4E8F4] overflow-hidden w-full select-none">
      
      {/* ── HEADER ── */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#E4E8F4] bg-white shrink-0">
        {activeView === "usage" ? (
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-bold text-text-primary uppercase tracking-wider">
              Usage — Ecommerce AGP API Rules
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#F0F2FA] flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="text-[14px] font-bold text-text-primary">
              AGP
            </span>
            <span className="text-[10px] bg-[#9B72F7]/10 text-[#9B72F7] px-2 py-0.5 rounded font-bold uppercase">
              AGP
            </span>
            <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Completed
            </span>
            <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-bold">
              16.34 coins
            </span>
          </div>
        )}

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-secondary rounded-lg text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeView === "usage" ? (
          <>
            {/* Agent Performance Section */}
            <div className="space-y-3">
              <h3 className="text-[12px] font-bold text-text-primary tracking-tight">
                Agent performance (last 30 days)
              </h3>

              <AgentPerformanceTable />
            </div>

            {/* Coin Breakdown Section */}
            <div className="space-y-3">
              <h3 className="text-[12px] font-bold text-text-primary tracking-tight">
                Coin breakdown by agent
              </h3>

              <div className="bg-white border border-[#E4E8F4] rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F0F2FA] flex items-center justify-center">
                      <Shield className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <span className="font-bold text-[12px] text-text-primary block">AGP</span>
                      <span className="text-[9px] text-text-tertiary uppercase font-bold">AGP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] font-bold text-warning block">⚡ 16.34</span>
                    <span className="inline-flex items-center gap-1 text-success text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" /> Healthy
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-[#E4E8F4] rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "54.4%" }} />
                  </div>
                  <span className="text-[10px] font-semibold text-text-tertiary block">
                    54.4% of total usage
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* AGP Output Tabs */}
            <div className="space-y-4">
              <div className="flex border-b border-[#E4E8F4] gap-4">
                {[
                  { id: "overview", label: "Overview" },
                  { id: "output", label: "Output" },
                  { id: "questions", label: "Questions" },
                  { id: "agents", label: "Agents 1" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOutputTab(tab.id as any)}
                    className={cn(
                      "pb-2 text-[12px] font-bold border-b-2 -mb-px transition-colors cursor-pointer",
                      outputTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-text-tertiary hover:text-text-primary"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {outputTab === "output" && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
                    RULE DOCUMENTS (1)
                  </h4>

                  {/* Document Card */}
                  <div className="bg-white border border-[#E4E8F4] rounded-xl p-4 shadow-xs space-y-3 hover:border-primary/25 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#E8F0FE] flex items-center justify-center shrink-0">
                        <FileText className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[13px] font-bold text-text-primary block truncate">
                          api-design-principles
                        </span>
                        <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider block">
                          document brief
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => alert("Viewing document content...")}
                        className="flex-1 h-8 rounded-lg border border-[#D6DCF0] hover:bg-[#F0F2FA] text-[11px] font-bold text-text-primary transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        View
                      </button>
                      <button 
                        onClick={() => alert("Opening file link...")}
                        className="flex-1 h-8 rounded-lg border border-[#D6DCF0] hover:bg-[#F0F2FA] text-[11px] font-bold text-text-primary transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {outputTab === "overview" && (
                <div className="bg-white border border-[#E4E8F4] rounded-xl p-4 shadow-xs text-xs text-text-secondary leading-relaxed space-y-2">
                  <p className="font-bold text-[#0F1117]">Document Overview</p>
                  <p>A comprehensive API governance principles set for B2C e-commerce, compiled dynamically by our AGP Strategy Agent.</p>
                  <div className="flex items-center gap-2 text-success font-semibold text-[11px] mt-2">
                    <CheckCircle2 className="w-4 h-4 text-success" /> Build output successfully verified.
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
