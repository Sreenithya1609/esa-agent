import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  FolderOpen,
  Globe,
  Cloud,
  Terminal,
  Sparkles,
  TrendingUp,
  BarChart2,
  Search,
  CheckCircle2,
  StopCircle
} from 'lucide-react';
import type { AgentKey } from '@/lib/mockData';
import { useChatContext, type OrchestrationTraceData } from '@/lib/ChatContext';
import { ThinkingDot } from './ThinkingDot';

const AGENT_ICONS: Record<AgentKey, any> = {
  strategy: TrendingUp,
  data: BarChart2,
  search: Search,
  research: Globe,
};

const SOURCE_ICONS: Record<string, any> = {
  csv: FileText,
  pdf: FileText,
  drive: FolderOpen,
  database: Database,
  api: Cloud,
  document: FileText,
  web: Globe,
};

interface OrchestrationTraceProps {
  trace: OrchestrationTraceData;
  isActive?: boolean;
}

export function OrchestrationTrace({ trace, isActive = false }: OrchestrationTraceProps) {
  const { traceStep, interruptQuery } = useChatContext();
  const [isExpanded, setIsExpanded] = useState(!trace.isCollapsed);
  const [currentActivities, setCurrentActivities] = useState<Record<AgentKey, string>>({
    strategy: 'Initializing...',
    data: 'Initializing...',
    search: 'Initializing...',
    research: 'Initializing...',
  });

  // Cycle mock activity text for active agents
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCurrentActivities((prev) => {
        const next = { ...prev };
        trace.agents.forEach((agent) => {
          const activities = {
            strategy: [
              'Analyzing competitive landscape...',
              'Evaluating market positioning...',
              'Building strategic framework...',
              'Generating action plan...',
              'Assessing risk factors...',
            ],
            data: [
              'Reading sales_q3.csv...',
              'Detected 3 anomalies in Q3 revenue...',
              'Computing trend analysis...',
              'Generating visualization...',
              'Building forecast model...',
            ],
            search: [
              'Scanning 2,847 internal documents...',
              'Ranking results by relevance...',
              'Extracting matching passages...',
              'Filtering by team and date...',
              'Compiling search results...',
            ],
            research: [
              'Searching external market databases...',
              'Analyzing competitor filings...',
              'Cross-referencing industry benchmarks...',
              'Building competitive matrix...',
              'Verifying source reliability...',
            ],
          }[agent.key];

          const currentIdx = activities.indexOf(prev[agent.key]);
          const nextIdx = (currentIdx + 1) % activities.length;
          next[agent.key] = activities[nextIdx];
        });
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isActive, trace.agents]);

  const currentStep = isActive ? traceStep : 4;
  const elapsedSeconds = (trace.totalDuration / 1000).toFixed(1);

  if (!isExpanded) {
    return (
      <div className="flex items-center justify-between py-2.5 px-4 bg-muted/30 border border-border/50 rounded-xl mb-4 text-sm transition-all duration-300 hover:bg-muted/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-medium text-foreground">
            Processed in {elapsedSeconds}s using {trace.agents.length} agent{trace.agents.length > 1 ? 's' : ''}
          </span>
          <div className="flex -space-x-1.5 ml-2">
            {trace.agents.map((agent) => {
              const Icon = AGENT_ICONS[agent.key] || Sparkles;
              return (
                <div
                  key={agent.key}
                  className="w-5 h-5 rounded-full flex items-center justify-center border border-background shadow-sm text-[10px] text-white"
                  style={{ backgroundColor: agent.color }}
                  title={agent.name}
                >
                  <Icon className="w-3 h-3" />
                </div>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          See how ESA reasoned
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-muted/10 border border-border/80 rounded-2xl p-5 mb-5 shadow-sm overflow-hidden relative transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground text-sm tracking-tight">Agentic Orchestration Trace</span>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <button
              onClick={interruptQuery}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 hover:border-destructive/30 rounded-lg transition-all cursor-pointer"
            >
              <StopCircle className="w-3.5 h-3.5" />
              Refine Query
            </button>
          )}
          {!isActive && (
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Collapse Trace
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {/* Step 1: Intent Detection */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-all ${
              currentStep >= 0 ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-muted-foreground/30 text-muted-foreground'
            }`}>
              {currentStep > 0 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
            </div>
            <div className={`w-0.5 h-full my-1 transition-all ${currentStep > 0 ? 'bg-primary' : 'bg-border'}`} />
          </div>
          <div className="flex-1 pb-2">
            <h4 className="text-sm font-semibold text-foreground">Intent Classification</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentStep === 0 ? 'Analyzing query parameters...' : 'Query analyzed successfully.'}
            </p>
            {currentStep >= 0 && trace.intents.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {trace.intents.map((intent, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm text-white"
                    style={{ backgroundColor: intent.color, borderColor: intent.color }}
                  >
                    {intent.type}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Agent Dispatch */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-all ${
              currentStep >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-muted-foreground/30 text-muted-foreground'
            }`}>
              {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
            </div>
            <div className={`w-0.5 h-full my-1 transition-all ${currentStep > 1 ? 'bg-primary' : 'bg-border'}`} />
          </div>
          <div className="flex-1 pb-2">
            <h4 className="text-sm font-semibold text-foreground">Agent Dispatch</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentStep < 1 ? 'Waiting to route task...' : 'Activating agent modules...'}
            </p>
            {currentStep >= 1 && (
              <div className="space-y-1.5 mt-2">
                {trace.agents.map((agent, i) => {
                  const AgentIcon = AGENT_ICONS[agent.key] || Sparkles;
                  return (
                    <motion.div
                      initial={isActive ? { opacity: 0, x: -10 } : false}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      key={agent.key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: agent.color }}
                      >
                        <AgentIcon className="w-3 h-3" />
                      </div>
                      <span className="font-medium text-foreground">{agent.name}</span>
                      <span className="text-muted-foreground">• Dispatch approved</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Live Activity */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-all ${
              currentStep >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-muted-foreground/30 text-muted-foreground'
            }`}>
              {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
            </div>
            <div className={`w-0.5 h-full my-1 transition-all ${currentStep > 2 ? 'bg-primary' : 'bg-border'}`} />
          </div>
          <div className="flex-1 pb-2">
            <h4 className="text-sm font-semibold text-foreground">Live Agent Activity</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentStep < 2 ? 'Pending agent execution...' : currentStep === 2 ? 'Agents performing background tasks...' : 'Task execution complete.'}
            </p>
            {currentStep >= 2 && (
              <div className="space-y-2 mt-2">
                {trace.agents.map((agent) => {
                  const AgentIcon = AGENT_ICONS[agent.key] || Sparkles;
                  const activityText = isActive ? currentActivities[agent.key] : 'Completed execution';
                  const sources = {
                    strategy: ['market_analysis_2026.pdf', 'competitor_matrix.xlsx'],
                    data: ['sales_q3.csv', 'revenue_forecast.xlsx'],
                    search: ['hr_policy.pdf', 'leave_guidelines_2026.pdf'],
                    research: ['competitor_filings/', 'crm_api'],
                  }[agent.key] || [];

                  return (
                    <div key={agent.key} className="bg-muted/20 border border-border/30 rounded-xl p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: agent.color,
                              animation: currentStep === 2 ? 'pulse 1.5s infinite' : 'none'
                            }}
                          />
                          <span className="font-semibold text-xs text-foreground">{agent.name}</span>
                        </div>
                        {currentStep === 2 && (
                          <span className="text-[10px] text-primary flex items-center font-medium">
                            Working<ThinkingDot />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground italic pl-3 border-l border-border/80">
                        {activityText}
                      </p>
                      {sources.length > 0 && (
                        <div className="pl-3 flex flex-wrap gap-1.5">
                          {sources.map((src, i) => {
                            const ext = src.split('.').pop() || '';
                            const isFolder = src.endsWith('/');
                            const type = isFolder ? 'drive' : ext === 'csv' || ext === 'xlsx' ? 'csv' : 'pdf';
                            const SourceIcon = SOURCE_ICONS[type] || FileText;
                            return (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/40 border border-border/50 px-1.5 py-0.5 rounded"
                              >
                                <SourceIcon className="w-2.5 h-2.5 text-primary" />
                                {src}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Output Synthesis */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-all ${
              currentStep >= 3 ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted border-muted-foreground/30 text-muted-foreground'
            }`}>
              {currentStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : '4'}
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground">Synthesis & Merging</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentStep < 3 ? 'Awaiting agent outputs...' : currentStep === 3 ? 'Consolidating agent deliverables...' : 'Output synthesis complete.'}
            </p>
            {currentStep >= 3 && (
              <div className="mt-2.5 max-w-xs">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: currentStep > 3 ? '100%' : '75%' }}
                    transition={{ duration: currentStep === 3 ? 0.8 : 0.4 }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 block font-medium">
                  {currentStep > 3 ? '100% merged' : '75% merged...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
