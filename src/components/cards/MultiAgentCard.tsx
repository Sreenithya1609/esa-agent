import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ConflictBanner } from '@/components/chat/ConflictBanner';
import { StrategyCard } from './StrategyCard';
import { DataAnalysisCard } from './DataAnalysisCard';
import { ResearchCard } from './ResearchCard';
import { SearchResultCard } from './SearchResultCard';
import { CitationBadge } from '@/components/chat/CitationBadge';
import { getCitationsById, type MultiAgentResponseData } from '@/mock/responses';
import {
  STRATEGY_RESPONSE,
  DATA_ANALYSIS_RESPONSE,
  RESEARCH_RESPONSE,
  SEARCH_RESPONSE
} from '@/mock/responses';
import { Sparkles, ArrowRight } from 'lucide-react';

interface MultiAgentCardProps {
  data: MultiAgentResponseData;
}

export function MultiAgentCard({ data }: MultiAgentCardProps) {
  const [activeTab, setActiveTab] = useState<string>('summary');

  // Load summary level citations
  const citations = getCitationsById([1, 2, 4, 5, 8, 9]);

  const renderAgentSubCard = (type: 'strategy' | 'data' | 'research' | 'search') => {
    switch (type) {
      case 'strategy':
        return <StrategyCard data={STRATEGY_RESPONSE} />;
      case 'data':
        return <DataAnalysisCard data={DATA_ANALYSIS_RESPONSE} />;
      case 'research':
        return <ResearchCard data={RESEARCH_RESPONSE} />;
      case 'search':
        return <SearchResultCard data={SEARCH_RESPONSE} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border shadow-md rounded-2xl p-5 space-y-5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground tracking-tight">{data.title}</h3>
          <p className="text-[11px] text-muted-foreground">
            Multi-agent consensus check • {data.agentOutputs.length} modules aggregated
          </p>
        </div>
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Multi-Agent Output
        </span>
      </div>

      {/* Conflict Banner alert */}
      {data.hasConflict && (
        <ConflictBanner
          description={data.conflictDescription}
          onShowDetails={() => {
            // Switch to a conflicting tab
            setActiveTab('data');
          }}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="bg-muted/50 w-full md:w-auto overflow-x-auto justify-start border border-border/50 p-1 flex">
          <TabsTrigger
            value="summary"
            className="flex items-center gap-1.5 text-xs font-semibold px-4 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Consolidated Summary
          </TabsTrigger>
          {data.agentOutputs.map((out) => (
            <TabsTrigger
              key={out.agentKey}
              value={out.agentKey}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 cursor-pointer shrink-0"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: out.agentColor }}
              />
              {out.agentName}
              <span className="text-[9px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                {out.executionTime}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Summary Tab Content */}
        <TabsContent value="summary" className="space-y-4 pt-1 outline-none">
          <div className="bg-muted/10 border border-border/50 rounded-xl p-4 leading-relaxed text-xs text-muted-foreground space-y-3">
            <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              Synthesis Overview
            </h4>
            <p className="text-foreground/90 font-medium text-xs leading-relaxed">
              Our agents have compiled a unified response. The Data Analyst Agent analyzed historical Q3 performance, confirming robust revenue targets while warning of segment-specific churn. The Strategy Agent has overlayed these findings with a Q4 market expansion plan, mapping objectives and resources.
            </p>
            <p className="text-foreground/80 leading-relaxed text-xs">
              Key benchmarks indicate that pricing flexibility is required for emerging markets
              <CitationBadge index={1} source={citations[1]} agentColor="#9B72F7" />
              and CRM system integration is crucial for local sales teams
              <CitationBadge index={2} source={citations[2]} agentColor="#F7924A" />.
              Action steps have been assigned to regional team leads to reconcile the margin expectations
              <CitationBadge index={3} source={citations[4]} agentColor="#4A6CF7" />.
            </p>
          </div>

          {/* Quick links to sections */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Explore Individual Agent Contributions
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.agentOutputs.map((out) => (
                <button
                  key={out.agentKey}
                  onClick={() => setActiveTab(out.agentKey)}
                  className="flex items-center justify-between p-3 border border-border/60 hover:border-border hover:bg-muted/10 rounded-xl transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: out.agentColor }}
                    />
                    <span className="font-semibold text-xs text-foreground">{out.agentName}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Sub-Agent Content Tabs */}
        {data.agentOutputs.map((out) => (
          <TabsContent key={out.agentKey} value={out.agentKey} className="outline-none pt-1">
            {renderAgentSubCard(out.responseType)}
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
}
