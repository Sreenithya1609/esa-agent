import { useState } from 'react';
import { motion } from 'framer-motion';
import { CitationBadge } from '@/components/chat/CitationBadge';
import { SourcesPanel } from '@/components/chat/SourcesPanel';
import { getCitationsById, type ResearchResponseData, type ResearchSection } from '@/mock/responses';
import { Check, X, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface ResearchCardProps {
  data: ResearchResponseData;
}

const CONFIDENCE_COLORS = {
  high: '#16A34A',
  medium: '#D97706',
  low: '#DC2626',
};

const CONFIDENCE_TEXT = {
  high: 'High Confidence (sourced from 3+ documents)',
  medium: 'Medium Confidence (sourced from 1-2 documents)',
  low: 'Low Confidence (inferred, no direct source)',
};

export function ResearchCard({ data }: ResearchCardProps) {
  // Extract all citations from sections
  const allCitationIds = Array.from(
    new Set(data.sections.flatMap((s) => s.citations || []))
  );
  const citations = getCitationsById(allCitationIds);

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border shadow-md rounded-2xl p-5 space-y-6 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <h3 className="text-base font-bold text-foreground tracking-tight">{data.title}</h3>
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Market Research
        </span>
      </div>

      {/* Staggered Sections */}
      <TooltipProvider>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {data.sections.map((section) => (
            <motion.div
              key={section.id}
              variants={itemVariants}
              className="bg-muted/10 border border-border/50 hover:border-border rounded-xl p-4 space-y-2 transition-all"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {section.title}
                </h4>
                {/* Confidence indicator dot */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className="w-2.5 h-2.5 rounded-full cursor-pointer shrink-0"
                      style={{ backgroundColor: CONFIDENCE_COLORS[section.confidence] }}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="text-xs">
                    {CONFIDENCE_TEXT[section.confidence]}
                  </TooltipContent>
                </Tooltip>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {section.content}
                {section.citations?.map((cId) => {
                  const citation = citations.find((c) => c.id === cId);
                  if (!citation) return null;
                  const relIdx = citations.indexOf(citation) + 1;
                  return (
                    <CitationBadge
                      key={cId}
                      index={relIdx}
                      source={citation}
                      agentColor="#F7924A"
                    />
                  );
                })}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </TooltipProvider>

      {/* Competitor Matrix Table */}
      {data.competitorMatrix && data.competitorMatrix.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-border/50">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Competitive Benchmarking Matrix
          </h4>
          <div className="border border-border/80 rounded-xl overflow-hidden bg-muted/10 shadow-sm max-w-full overflow-x-auto">
            <table className="w-full text-[11px] border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                  <th className="text-left py-2 px-3">Company</th>
                  <th className="text-left py-2 px-3">Price Point</th>
                  <th className="text-left py-2 px-3">User Seats</th>
                  <th className="text-center py-2 px-3 w-24">AI Features</th>
                  <th className="text-center py-2 px-3 w-20">NPS Score</th>
                  <th className="text-right py-2 px-3">Market Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {data.competitorMatrix.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`hover:bg-muted/20 ${
                      row.isYou
                        ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary font-bold text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <td className="py-2.5 px-3 flex items-center gap-1.5 font-bold text-foreground">
                      {row.name}
                      {row.isYou && (
                        <span className="text-[9px] bg-primary/20 text-primary border border-primary/20 px-1 py-0.2 rounded font-bold uppercase">
                          YOU
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">{row.price}</td>
                    <td className="py-2.5 px-3">{row.users}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex justify-center">
                        {row.aiFeatures ? (
                          <Check className="w-4 h-4 text-green-500 font-bold" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground/50" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block w-8 py-0.5 text-center rounded font-semibold text-[10px] ${
                          row.nps >= 60
                            ? 'bg-green-500/10 text-green-600'
                            : row.nps >= 45
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {row.nps}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-foreground">{row.marketShare}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sources panel */}
      <SourcesPanel sources={citations} />
    </motion.div>
  );
}
