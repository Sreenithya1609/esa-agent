import { useState } from 'react';
import { motion } from 'framer-motion';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { CitationBadge } from '@/components/chat/CitationBadge';
import { SourcesPanel } from '@/components/chat/SourcesPanel';
import { getCitationsById, type StrategyResponseData, type StrategySection, type ActionPlanRow } from '@/mock/responses';
import { FileText, FileSpreadsheet, Play, CheckCircle, RefreshCw, Send, Check } from 'lucide-react';
import { toast } from 'sonner';

interface StrategyCardProps {
  data: StrategyResponseData;
}

const CONFIDENCE_COLORS = {
  high: '#16A34A',   // green
  medium: '#D97706', // amber
  low: '#DC2626',    // red
};

const CONFIDENCE_TEXT = {
  high: 'High Confidence (sourced from 3+ documents)',
  medium: 'Medium Confidence (sourced from 1-2 documents)',
  low: 'Low Confidence (inferred, no direct source)',
};

export function StrategyCard({ data }: StrategyCardProps) {
  const [sections, setSections] = useState<StrategySection[]>(data.sections);
  const [actionPlan, setActionPlan] = useState<ActionPlanRow[]>(data.actionPlan);
  const [refineInputs, setRefineInputs] = useState<Record<string, string>>({});
  const [loadingSections, setLoadingSections] = useState<Record<string, boolean>>({});

  // Get all unique citation IDs across all sections to display in the SourcesPanel
  const allCitationIds = Array.from(
    new Set(sections.flatMap((s) => s.citations || []))
  );
  const citations = getCitationsById(allCitationIds);

  const handleExport = (type: 'PDF' | 'PPT') => {
    toast.success(`Exporting strategy plan`, {
      description: `Your strategy document is being generated as a ${type}.`,
    });
  };

  const handleRefineSubmit = (sectionId: string) => {
    const userInput = refineInputs[sectionId]?.trim();
    if (!userInput) return;

    // Trigger simulation
    setLoadingSections((prev) => ({ ...prev, [sectionId]: true }));

    setTimeout(() => {
      setSections((prev) =>
        prev.map((s) => {
          if (s.id === sectionId) {
            return {
              ...s,
              content: `${s.content} [Refined with focus on: "${userInput}"]. Based on this refinement, we recommend accelerating local hiring and allocating 15% more budget to targeted regional marketing.`,
              confidence: 'high', // refinement usually increases confidence
            };
          }
          return s;
        })
      );
      setLoadingSections((prev) => ({ ...prev, [sectionId]: false }));
      setRefineInputs((prev) => ({ ...prev, [sectionId]: '' }));
      toast.success('Section refined successfully', {
        description: 'Applied user feedback to the strategic plan.',
      });
    }, 1200);
  };

  const handleActionPlanChange = (index: number, field: keyof ActionPlanRow, value: string) => {
    setActionPlan((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border shadow-md rounded-2xl p-5 space-y-6 overflow-hidden"
    >
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <h3 className="text-base font-bold text-foreground tracking-tight">{data.title}</h3>
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Strategy Plan
        </span>
      </div>

      {/* Accordion Sections */}
      <TooltipProvider>
        <Accordion type="single" collapsible defaultValue="s3" className="w-full">
          {sections.map((section) => (
            <AccordionItem key={section.id} value={section.id} className="border-border/50">
              <AccordionTrigger className="hover:no-underline py-3 cursor-pointer">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  {/* Confidence Dot */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CONFIDENCE_COLORS[section.confidence] }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      {CONFIDENCE_TEXT[section.confidence]}
                    </TooltipContent>
                  </Tooltip>
                  {section.title}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed text-xs space-y-3 pb-4">
                {loadingSections[section.id] ? (
                  <div className="flex items-center gap-2 text-primary py-2 italic animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ESA is refining this section based on your guidance...
                  </div>
                ) : (
                  <div>
                    <p className="text-foreground/90 font-medium leading-relaxed">
                      {section.content}
                      {/* Citation Badges appended at end of text */}
                      {section.citations?.map((cId) => {
                        const citation = citations.find((c) => c.id === cId);
                        if (!citation) return null;
                        // find relative index in page's loaded citations list
                        const relIdx = citations.indexOf(citation) + 1;
                        return (
                          <CitationBadge
                            key={cId}
                            index={relIdx}
                            source={citation}
                            agentColor="#4A6CF7"
                          />
                        );
                      })}
                    </p>

                    {/* Refinement input */}
                    <div className="mt-3.5 flex gap-2">
                      <input
                        type="text"
                        value={refineInputs[section.id] || ''}
                        onChange={(e) =>
                          setRefineInputs((prev) => ({ ...prev, [section.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRefineSubmit(section.id);
                        }}
                        placeholder="Refine this section (e.g. Focus on India SMBs instead)..."
                        className="flex-1 bg-muted/40 border border-border/80 rounded-lg px-2.5 py-1 text-[11px] text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                      />
                      <button
                        onClick={() => handleRefineSubmit(section.id)}
                        className="p-1 px-2 bg-muted hover:bg-primary hover:text-white rounded-lg text-foreground border border-border/80 transition-all flex items-center justify-center cursor-pointer"
                        title="Submit refinement"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </TooltipProvider>

      {/* Action Plan Table */}
      <div className="space-y-3 pt-3 border-t border-border/50">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Action Plan</h4>
        <div className="border border-border/80 rounded-xl overflow-hidden bg-muted/10 shadow-sm max-w-full overflow-x-auto">
          <table className="w-full text-[11px] border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                <th className="text-left py-2 px-3">Owner</th>
                <th className="text-left py-2 px-3">Step</th>
                <th className="text-left py-2 px-3">Timeline</th>
                <th className="text-left py-2 px-3 w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {actionPlan.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/20 text-foreground">
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={row.owner}
                      onChange={(e) => handleActionPlanChange(idx, 'owner', e.target.value)}
                      className="bg-transparent border-0 outline-none w-full text-[11px] focus:bg-muted/40 px-1 py-0.5 rounded"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={row.step}
                      onChange={(e) => handleActionPlanChange(idx, 'step', e.target.value)}
                      className="bg-transparent border-0 outline-none w-full text-[11px] focus:bg-muted/40 px-1 py-0.5 rounded"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={row.timeline}
                      onChange={(e) => handleActionPlanChange(idx, 'timeline', e.target.value)}
                      className="bg-transparent border-0 outline-none w-full text-[11px] focus:bg-muted/40 px-1 py-0.5 rounded"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={row.status}
                      onChange={(e) => handleActionPlanChange(idx, 'status', e.target.value as any)}
                      className="bg-transparent border border-border/80 rounded px-1.5 py-0.5 outline-none text-[10px] font-medium"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citations Collapsible Panel */}
      <SourcesPanel sources={citations} />

      {/* Footer Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/50">
        <button
          onClick={() => handleExport('PDF')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-muted hover:bg-muted/80 text-foreground border border-border/80 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-primary" />
          Export PDF
        </button>
        <button
          onClick={() => handleExport('PPT')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-muted hover:bg-muted/80 text-foreground border border-border/80 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
          Export PPT
        </button>
      </div>
    </motion.div>
  );
}
