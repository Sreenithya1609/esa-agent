import { useState } from 'react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { usePermissions } from '@/lib/PermissionsContext';
import { AGENTS, type AgentDefinition } from '@/mock/agents';
import type { AgentKey } from '@/lib/mockData';
import { TrendingUp, BarChart2, Globe, Search, ChevronDown, ChevronUp, Cpu } from 'lucide-react';
import { toast } from 'sonner';

const AGENT_ICONS: Record<AgentKey, any> = {
  strategy: TrendingUp,
  data: BarChart2,
  search: Search,
  research: Globe,
};

export function AgentRoster() {
  const { agentStatus, toggleAgentStatus } = usePermissions();
  const [expandedAgent, setExpandedAgent] = useState<AgentKey | null>(null);

  const toggleExpand = (key: AgentKey) => {
    setExpandedAgent((prev) => (prev === key ? null : key));
  };

  const handleToggle = (key: AgentKey, name: string) => {
    const nextStatus = agentStatus[key] === 'active' ? 'disabled' : 'active';
    toggleAgentStatus(key);
    toast.success(`${name} Status Updated`, {
      description: `Agent is now ${nextStatus.toUpperCase()}.`,
    });
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto pr-1">
      <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
        <Cpu className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Agent Roster</h4>
      </div>

      <div className="space-y-3.5">
        {(Object.keys(AGENTS) as AgentKey[]).map((key) => {
          const agent = AGENTS[key];
          const Icon = AGENT_ICONS[key];
          const isExpanded = expandedAgent === key;
          const isActive = agentStatus[key] === 'active';

          return (
            <motion.div
              layout
              key={key}
              className={`bg-card border border-border/80 rounded-xl p-4 shadow-xs relative overflow-hidden transition-all duration-300 ${
                !isActive ? 'opacity-60 bg-muted/20' : ''
              }`}
              style={{ borderLeftWidth: '4px', borderLeftColor: isActive ? agent.color : '#9CA3AF' }}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-colors"
                      style={{ backgroundColor: isActive ? agent.color : '#9CA3AF' }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-foreground block">
                        {agent.fullName}
                      </span>
                      <span className="text-[9px] text-muted-foreground block font-medium">
                        Last edited by {agent.lastModified.by} • {agent.lastModified.date}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-green-500' : 'text-muted-foreground'
                    }`}>
                      {isActive ? 'Active' : 'Disabled'}
                    </span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => handleToggle(key, agent.fullName)}
                      className="scale-90"
                    />
                  </div>
                </div>

                {/* Capabilities list */}
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.slice(0, 3).map((cap) => (
                    <span
                      key={cap}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                        isActive
                          ? 'text-muted-foreground bg-muted border-border/30'
                          : 'text-muted-foreground/40 bg-muted/30 border-border/10 grayscale'
                      }`}
                    >
                      {cap}
                    </span>
                  ))}
                  {agent.capabilities.length > 3 && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 transition-all ${
                      isActive ? 'text-primary' : 'text-muted-foreground/40'
                    }`}>
                      +{agent.capabilities.length - 3} more
                    </span>
                  )}
                </div>

                {/* System Prompt Instructions */}
                <div className="bg-muted/10 border border-border/30 rounded-lg p-2.5 space-y-1.5">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">
                    System Instructions
                  </span>
                  
                  <div className={`text-[11px] text-foreground/80 leading-relaxed font-medium ${
                    isExpanded ? '' : 'line-clamp-2'
                  }`}>
                    {agent.systemPrompt}
                  </div>

                  <button
                    onClick={() => toggleExpand(key)}
                    className="inline-flex items-center gap-0.5 text-[9px] font-bold text-primary hover:underline cursor-pointer pt-1"
                  >
                    {isExpanded ? (
                      <>
                        Hide Instructions
                        <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        View Full Instructions
                        <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
