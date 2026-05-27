import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatContext, type ChatMessage } from '@/lib/ChatContext';
import { useMemory } from '@/lib/MemoryContext';
import { StrategyCard } from '@/components/cards/StrategyCard';
import { DataAnalysisCard } from '@/components/cards/DataAnalysisCard';
import { ResearchCard } from '@/components/cards/ResearchCard';
import { SearchResultCard } from '@/components/cards/SearchResultCard';
import { MultiAgentCard } from '@/components/cards/MultiAgentCard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import * as Popover from '@radix-ui/react-popover';
import {
  Brain,
  RefreshCw,
  Sparkles,
  Table,
  LineChart as ChartIcon,
  Send,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import {
  INLINE_CHART_DATA,
  INLINE_TABLE_DATA,
  INLINE_FORM_FIELDS,
  STRATEGY_RESPONSE,
  DATA_ANALYSIS_RESPONSE,
  RESEARCH_RESPONSE,
  SEARCH_RESPONSE,
  MULTI_AGENT_RESPONSE
} from '@/mock/responses';
import { TEMPLATES } from '@/mock/templates';

interface GenerativeResponseProps {
  message: ChatMessage;
}

export function GenerativeResponse({ message }: GenerativeResponseProps) {
  const { sendMessage, regenerateResponse } = useChatContext();
  const { brandVoice, preferredChartTypes } = useMemory();
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({
    target_market: '',
    budget_range: '',
    timeline: '',
  });

  // Handle template change (regeneration override)
  const handleTemplateOverride = (templateId: string) => {
    setShowOverrideMenu(false);
    toast.success('Template override applied', {
      description: `Re-generating response using the selected layout.`,
    });
    // Triggers regeneration
    regenerateResponse(message.id);
  };

  const handleFormSubmit = () => {
    if (!formValues.target_market || !formValues.budget_range || !formValues.timeline) {
      toast.error('Please fill in all context fields');
      return;
    }
    setFormSubmitted(true);
    toast.success('Additional context applied', {
      description: 'Generating refined strategy recommendations.',
    });
    
    // Construct message to send
    const contextString = `Context details: Target Market: ${formValues.target_market}, Budget: ${formValues.budget_range}, Timeline: ${formValues.timeline}. Build GTM plan.`;
    sendMessage(contextString);
  };

  // Render the appropriate generative UI card based on responseType
  const renderCard = () => {
    switch (message.responseType) {
      case 'strategy':
        return <StrategyCard data={message.responseData as any || STRATEGY_RESPONSE} />;
      case 'data':
        return <DataAnalysisCard data={message.responseData as any || DATA_ANALYSIS_RESPONSE} />;
      case 'research':
        return <ResearchCard data={message.responseData as any || RESEARCH_RESPONSE} />;
      case 'search':
        return <SearchResultCard data={message.responseData as any || SEARCH_RESPONSE} />;
      case 'multi-agent':
        return <MultiAgentCard data={message.responseData as any || MULTI_AGENT_RESPONSE} />;
      default:
        return (
          <div className="p-4 border border-border rounded-xl text-xs text-muted-foreground italic">
            No generative component available.
          </div>
        );
    }
  };

  // Check if we should render inline table or chart based on message content or preceding user query
  const shouldRenderInlineTable = message.content?.toLowerCase().includes('compare') || 
                                  message.content?.toLowerCase().includes('smb');
  const shouldRenderInlineChart = message.content?.toLowerCase().includes('trend') || 
                                  message.content?.toLowerCase().includes('quick view');

  return (
    <div className="space-y-4 w-full">
      {/* 1. Memory Indicator Pills */}
      {message.memoryApplied && message.memoryApplied.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {message.memoryApplied.map((applied, idx) => (
            <Popover.Root key={idx}>
              <Popover.Trigger asChild>
                <button className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary/15 transition-all cursor-pointer shadow-sm">
                  <Brain className="w-3 h-3 animate-pulse" />
                  Using: {applied.label}
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="z-50 w-72 bg-popover border border-border p-3.5 rounded-xl shadow-lg text-xs space-y-2" side="top" align="start">
                  <div className="font-bold text-foreground flex items-center gap-1">
                    <Brain className="w-3.5 h-3.5 text-primary" />
                    Memory Context Applied
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {applied.detail}
                  </p>
                  {brandVoice && (
                    <p className="text-[10px] text-muted-foreground italic pt-1 border-t border-border/50">
                      Applied Brand Voice guidelines.
                    </p>
                  )}
                  <div className="flex gap-2 pt-1.5 border-t border-border/50">
                    <button
                      onClick={() => {
                        toast.success('Overriding memory templates for this session.');
                      }}
                      className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Override for this response
                    </button>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          ))}
        </div>
      )}

      {/* 2. Main Response Card */}
      {message.needsInlineForm && !formSubmitted ? (
        // Inline context request form
        <div className="border border-border bg-card shadow-sm rounded-2xl p-5 space-y-4 max-w-md">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              ESA needs more context to build your strategy
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please provide a few target parameters to ensure strategic recommendations are customized.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {INLINE_FORM_FIELDS.map((field) => (
              <div key={field.id} className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formValues[field.id]}
                  onChange={(e) =>
                    setFormValues((prev) => ({ ...prev, [field.id]: e.target.value }))
                  }
                  className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleFormSubmit}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Generate Strategy Recommendation
          </button>
        </div>
      ) : (
        renderCard()
      )}

      {/* 3. Inline Table Injection */}
      {shouldRenderInlineTable && (
        <div className="border border-border/50 bg-muted/5 rounded-2xl p-4 space-y-3 max-w-md shadow-sm">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-primary" />
            {INLINE_TABLE_DATA.title}
          </h4>
          <div className="border border-border/80 rounded-xl overflow-hidden text-[11px] bg-background">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                  {INLINE_TABLE_DATA.headers.map((h, i) => (
                    <th key={i} className="text-left py-1.5 px-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {INLINE_TABLE_DATA.rows.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/10 text-foreground">
                    <td className="py-1.5 px-3 font-semibold">{row[0]}</td>
                    <td className="py-1.5 px-3">{row[1]}</td>
                    <td className="py-1.5 px-3">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Inline Chart Injection */}
      {shouldRenderInlineChart && (
        <div className="border border-border/50 bg-muted/5 rounded-2xl p-4 space-y-3 max-w-md shadow-sm">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ChartIcon className="w-3.5 h-3.5 text-primary" />
            {INLINE_CHART_DATA.title}
          </h4>
          <div className="h-44 w-full bg-background border border-border/80 rounded-xl p-2.5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={INLINE_CHART_DATA.data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey={INLINE_CHART_DATA.xKey} fontSize={9} tickLine={false} />
                <YAxis fontSize={9} tickLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={INLINE_CHART_DATA.yKey}
                  stroke={INLINE_CHART_DATA.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 5. Follow-up suggestions & Action bar */}
      {!message.needsInlineForm && (
        <div className="space-y-3 pt-1">
          {/* Chips */}
          {message.followUpPrompts && message.followUpPrompts.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {message.followUpPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="text-[11px] font-semibold text-muted-foreground bg-muted/30 border border-border/85 hover:border-primary/50 hover:bg-primary/5 hover:text-primary px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Action Row: Regenerate & Try layout */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => regenerateResponse(message.id)}
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>

            {/* Template Dropdown switcher */}
            <div className="relative">
              <button
                onClick={() => setShowOverrideMenu(!showOverrideMenu)}
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer font-semibold"
              >
                <Sliders className="w-3.5 h-3.5" />
                Change Template
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {showOverrideMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowOverrideMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute z-40 right-0 mt-1 bg-popover border border-border shadow-xl rounded-xl w-52 py-1.5 text-xs text-foreground"
                    >
                      <div className="px-3 py-1 font-bold text-muted-foreground uppercase text-[9px] border-b border-border/50 mb-1">
                        Select layout format
                      </div>
                      {TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.id}
                          onClick={() => handleTemplateOverride(tpl.id)}
                          className="w-full text-left px-3 py-1.5 hover:bg-muted font-medium flex items-center justify-between cursor-pointer"
                        >
                          {tpl.name}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
