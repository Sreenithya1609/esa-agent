import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Search as SearchIcon, FileText, Eye, Download, ExternalLink, X, ShieldAlert } from "lucide-react";
import { useRole } from "@/lib/roleContext";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — ESA" }] }),
  component: SearchPage,
});

const RESULTS = [
  { title: "Remote Work Leave Policy v3.2", source: "HR Drive", score: 94, type: "PDF",
    excerpt: "Employees in Tier 2 cities are entitled to 24 paid leaves per year plus 12 sick leaves. Remote work is allowed for up to 60% of work days per month...",
    content: "REMOTE WORK LEAVE POLICY v3.2\n\nSection 1: Eligibility\nAll permanent employees in Tier 2 cities are entitled to 24 paid leaves per calendar year, plus 12 sick leaves.\n\nSection 2: Remote Work\nRemote work is allowed for up to 60% of work days. Core hours: 10am–4pm local time.\n\nSection 3: Equipment Allowance\nAnnual remote work allowance: ₹25,000. Manager approval required for full-remote arrangements." },
  { title: "Q3 Pricing Review — APAC", source: "Strategy Folder", score: 88, type: "PPT",
    excerpt: "Recommended pricing adjustments for the APAC region following competitive analysis. Growth tier underpriced by 18% vs market median...",
    content: "Q3 PRICING REVIEW — APAC\n\nKey Finding: Growth tier is underpriced by 18% vs market median.\nRecommendation: 10–15% price increase on Growth tier in Q4.\nCompetitor Analysis: Salesforce $165, HubSpot $90, Zoho $35, Acme $49." },
  { title: "Customer NPS Q1 2026", source: "Analytics DW", score: 82, type: "CSV",
    excerpt: "NPS climbed from 41 to 54 driven by improved onboarding and faster support resolution times...",
    content: "Month,NPS,Responses\nJan 2026,41,124\nFeb 2026,47,138\nMar 2026,54,156\nApr 2026,58,162\nMay 2026,62,171" },
  { title: "Vendor Compliance Checklist", source: "Legal Drive", score: 76, type: "PDF",
    excerpt: "All vendor agreements must include SOC2 attestation, DPA, and named DPO contact details...",
    content: "VENDOR COMPLIANCE CHECKLIST\n\n☑ SOC2 Type II attestation\n☑ Data Processing Agreement (DPA)\n☑ Named DPO contact\n☑ GDPR compliance declaration\n☑ Penetration test report (< 12 months)\n☑ Business continuity plan" },
];

function PreviewModal({ result, onClose }: { result: typeof RESULTS[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#D6DCF0] overflow-hidden max-h-[80vh] flex flex-col"
           style={{ boxShadow: "0 20px 64px rgba(79,110,247,0.14)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E8F4]">
          <div>
            <div className="text-[15px] font-semibold text-[#0F1117]">{result.title}</div>
            <div className="text-[12px] text-[#8A93B0] mt-0.5">{result.source} · {result.type}</div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-[#F0F2FA] rounded-lg"><X className="w-4 h-4 text-[#8A93B0]" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <pre className="text-[13px] text-[#4B526B] leading-[1.7] whitespace-pre-wrap font-sans">{result.content}</pre>
        </div>
        <div className="px-5 py-3 border-t border-[#E4E8F4] flex gap-2">
          <button onClick={() => mockDownload(result.title, result.content, result.type)}
                  className="h-8 px-3 rounded-lg bg-[#4F6EF7] text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-[#3D5BE8] transition-colors">
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

function mockDownload(title: string, content: string, type: string) {
  const ext = type === "CSV" ? "csv" : type === "PPT" ? "txt" : "txt";
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${title.replace(/\s+/g, "_")}.${ext}`; a.click();
  URL.revokeObjectURL(url);
}

function SearchPage() {
  const { can } = useRole();
  const hasAccess = can("run_queries");
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<typeof RESULTS[0] | null>(null);

  const filtered = query
    ? RESULTS.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()) || r.excerpt.toLowerCase().includes(query.toLowerCase()))
    : RESULTS;

  if (!hasAccess) {
    return (
      <DashboardLayout title="Enterprise Search">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Access Denied</h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            You require Query Execution permissions to run searches. Viewer accounts do not have access to search or query workspace databases and files.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Enterprise Search">
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <div className="relative">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A93B0]" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="Search across all your data..."
                 className="w-full h-[52px] pl-12 pr-16 rounded-2xl bg-white border border-[#D6DCF0] text-[15px] focus:outline-none focus:border-[#4F6EF7] transition-colors"
                 style={{ boxShadow: "0 1px 6px rgba(79,110,247,0.07)" }} />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] text-[#8A93B0] px-1.5 py-0.5 rounded border border-[#E4E8F4]">⌘K</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All sources", "All types", "Any date", "All teams"].map((f) => (
            <button key={f} className="h-8 px-3 rounded-lg bg-white border border-[#E4E8F4] text-[12px] text-[#4B526B] hover:border-[#4F6EF7] transition-colors">{f} ▾</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.title} className="bg-white border border-[#E4E8F4] rounded-xl p-5 hover:-translate-y-0.5 transition-all"
                 style={{ boxShadow: "0 1px 6px rgba(79,110,247,0.07)" }}>
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#8A93B0]">
                  <FileText className="w-3.5 h-3.5" /> {r.source}
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-[#F0F2FA] text-[10px] font-medium">{r.type}</span>
                </div>
                <span className="text-[#16A34A] font-semibold">{r.score}%</span>
              </div>
              <h3 className="text-[15px] font-semibold text-[#0F1117] mt-1.5">{r.title}</h3>
              <p className="text-[13px] text-[#4B526B] mt-1 leading-[1.6]">{r.excerpt}</p>
              <div className="mt-3 flex gap-3 text-[12px] text-[#4B526B]">
                <button onClick={() => setPreview(r)} className="flex items-center gap-1 hover:text-[#4F6EF7] transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button onClick={() => mockDownload(r.title, r.content, r.type)} className="flex items-center gap-1 hover:text-[#4F6EF7] transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                <button onClick={() => setPreview(r)} className="flex items-center gap-1 hover:text-[#4F6EF7] transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Open
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[14px] text-[#8A93B0]">No results for "{query}"</div>
          )}
        </div>
      </div>

      {preview && <PreviewModal result={preview} onClose={() => setPreview(null)} />}
    </DashboardLayout>
  );
}
