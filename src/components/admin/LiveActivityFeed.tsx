import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTIVITY_POOL, type ActivityEntry } from '@/mock/liveActivity';
import type { AgentKey } from '@/lib/mockData';
import { FileText, Database, FolderOpen, Globe, Cloud, Sparkles, Activity } from 'lucide-react';

const AGENT_LABELS: Record<AgentKey, { name: string; color: string }> = {
  strategy: { name: 'Strategy', color: '#4A6CF7' },
  data: { name: 'Data', color: '#0FC4A7' },
  search: { name: 'Search', color: '#9B72F7' },
  research: { name: 'Research', color: '#F7924A' },
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

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-teal-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-indigo-500',
];

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityEntry[]>(() => {
    // Populate with 4 initial items
    return [
      {
        id: 'act_1',
        userName: 'Arjun Mehta',
        userInitials: 'AM',
        querySummary: 'Build GTM strategy for APAC enterprise segment',
        activeAgents: ['strategy', 'research'],
        dataSources: ['ds_3', 'ds_5'],
        startedAt: Date.now() - 45000, // 45s ago
        status: 'running',
      },
      {
        id: 'act_2',
        userName: 'Priya Nair',
        userInitials: 'PN',
        querySummary: 'Show Q3 revenue trends with anomaly detection',
        activeAgents: ['data'],
        dataSources: ['ds_1', 'ds_4'],
        startedAt: Date.now() - 15000, // 15s ago
        status: 'running',
      },
      {
        id: 'act_3',
        userName: 'Rohan Sharma',
        userInitials: 'RS',
        querySummary: 'Find HR leave policy for contract employees',
        activeAgents: ['search'],
        dataSources: ['ds_2'],
        startedAt: Date.now() - 120000, // 2m ago
        status: 'complete',
      },
      {
        id: 'act_4',
        userName: 'Karan Bose',
        userInitials: 'KB',
        querySummary: 'Search compliance documentation for Q2 audit',
        activeAgents: ['search'],
        dataSources: ['ds_2'],
        startedAt: Date.now() - 180000,
        status: 'failed',
      },
    ];
  });

  // Ticker for ticking up elapsed seconds of running tasks
  const [timeTicker, setTimeTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTicker((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Interval to add new activity entries
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick random item from pool
      const randomItem = ACTIVITY_POOL[Math.floor(Math.random() * ACTIVITY_POOL.length)];
      
      const newEntry: ActivityEntry = {
        ...randomItem,
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        startedAt: Date.now(),
      };

      setActivities((prev) => {
        const updated = [newEntry, ...prev];
        // cap at 20 items
        if (updated.length > 20) {
          updated.pop();
        }
        return updated;
      });

      // After 3-5 seconds, if the status was 'running', let's mock-complete it
      if (newEntry.status === 'running') {
        const completionTime = Math.floor(Math.random() * 8000) + 4000; // 4-12s
        setTimeout(() => {
          setActivities((prev) =>
            prev.map((act) =>
              act.id === newEntry.id
                ? { ...act, status: Math.random() > 0.08 ? 'complete' : 'failed' }
                : act
            )
          );
        }, completionTime);
      }
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  const getElapsedTime = (startedAt: number, status: string) => {
    const diff = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    if (status !== 'running') {
      // return a fixed final time for completed/failed tasks
      return `${Math.min(diff, 12)}s`;
    }
    return `${diff}s`;
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto pr-1">
      <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
        <Activity className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Live Activity Feed</h4>
      </div>

      <div className="space-y-3.5 pr-0.5">
        <AnimatePresence initial={false}>
          {activities.map((act, idx) => {
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                key={act.id}
                className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs space-y-2.5 hover:border-border hover:shadow-sm transition-all"
              >
                {/* User + Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${avatarColor}`}>
                      {act.userInitials}
                    </div>
                    <span className="font-bold text-xs text-foreground">{act.userName}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {getElapsedTime(act.startedAt, act.status)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        act.status === 'running'
                          ? 'bg-blue-500/10 text-blue-500'
                          : act.status === 'complete'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {act.status === 'running' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      {act.status}
                    </span>
                  </div>
                </div>

                {/* Query Summary */}
                <p className="text-[11px] text-foreground font-medium leading-relaxed truncate" title={act.querySummary}>
                  "{act.querySummary}"
                </p>

                {/* Agents + Sources Row */}
                <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px]">
                  {/* Agents */}
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground font-semibold">Agents:</span>
                    <div className="flex gap-0.5">
                      {act.activeAgents.map((agKey) => {
                        const meta = AGENT_LABELS[agKey];
                        if (!meta) return null;
                        return (
                          <span
                            key={agKey}
                            style={{ backgroundColor: `${meta.color}15`, color: meta.color, borderColor: `${meta.color}30` }}
                            className="px-1.5 py-0.2 rounded border text-[9px] font-bold"
                          >
                            {meta.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sources */}
                  {act.dataSources.length > 0 && (
                    <div className="text-muted-foreground font-semibold flex items-center gap-0.5">
                      <span>Sources:</span>
                      <span className="text-foreground font-bold">{act.dataSources.length}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
