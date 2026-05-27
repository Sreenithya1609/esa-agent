import { useState, useMemo } from 'react';
import { FUNCTION_LOG, type FunctionLogEntry } from '@/mock/auditLog';
import { Calendar, Terminal, ChevronDown, ChevronUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { AgentKey } from '@/lib/mockData';

const AGENT_COLORS: Record<AgentKey, string> = {
  strategy: '#4A6CF7',
  data: '#0FC4A7',
  search: '#9B72F7',
  research: '#F7924A',
};

export function FunctionLog() {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('All');

  // Filter agents list
  const agents = useMemo(() => {
    return ['All', ...Array.from(new Set(FUNCTION_LOG.map((f) => f.agentKey)))];
  }, []);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return FUNCTION_LOG.filter((log) => {
      return selectedAgent === 'All' || log.agentKey === selectedAgent;
    });
  }, [selectedAgent]);

  const toggleRow = (id: string) => {
    setSelectedLogId((prev) => (prev === id ? null : id));
  };

  // Helper to safely format JSON
  const formatJSON = (jsonStr: string) => {
    try {
      const obj = JSON.parse(jsonStr);
      return JSON.stringify(obj, null, 2);
    } catch {
      return jsonStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header + Dropdown */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Agent Function Execution Logs
          </h5>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Granular tool invocation outputs, duration benchmarks, and status payloads for every backend function execution.
          </p>
        </div>

        {/* Agent Filter dropdown */}
        <div className="flex items-center gap-1.5 shrink-0 bg-muted/30 border border-border/80 rounded-lg px-2.5 py-1 text-xs font-semibold">
          <span className="text-muted-foreground">Filter Agent:</span>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-transparent border-0 outline-none text-xs text-foreground cursor-pointer font-bold uppercase"
          >
            {agents.map((a) => (
              <option key={a} value={a}>
                {a === 'All' ? 'All Models' : a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Function Logs Table */}
      <div className="border border-border/80 rounded-xl overflow-hidden shadow-xs bg-card max-w-full overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold text-[11px]">
              <th className="text-left py-2.5 px-4 w-40">Timestamp</th>
              <th className="text-left py-2.5 px-3 w-44">Query</th>
              <th className="text-left py-2.5 px-3 w-28">Agent</th>
              <th className="text-left py-2.5 px-3">Function Name</th>
              <th className="text-center py-2.5 px-3 w-20">Duration</th>
              <th className="text-center py-2.5 px-3 w-24">Status</th>
              <th className="py-2.5 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filteredLogs.map((log) => {
              const isSelected = selectedLogId === log.id;
              const agentColor = AGENT_COLORS[log.agentKey] || '#4F6EF7';

              return (
                <>
                  <tr
                    key={log.id}
                    onClick={() => toggleRow(log.id)}
                    className="hover:bg-muted/10 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-muted-foreground flex items-center gap-1.5 font-semibold text-[11px]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground truncate max-w-[150px]" title={log.queryText}>
                      "{log.queryText}"
                    </td>
                    <td className="py-3 px-3 text-[10px] font-bold uppercase">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: agentColor }}
                        />
                        {log.agentKey}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10.5px] text-primary font-semibold">
                      {log.functionName}
                    </td>
                    <td className="py-3 px-3 text-center text-[10px] font-bold text-muted-foreground flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                      {log.duration}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          log.status === 'success'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {log.status === 'success' ? (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        ) : (
                          <AlertTriangle className="w-2.5 h-2.5" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isSelected ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </td>
                  </tr>

                  {/* Expanded JSON Detail Row */}
                  {isSelected && (
                    <tr>
                      <td colSpan={7} className="bg-muted/5 p-4 border-t border-b border-border/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Input Parameters */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                              Input Arguments
                            </span>
                            <pre className="text-[10.5px] font-mono leading-relaxed p-3.5 bg-background border border-border/80 rounded-xl overflow-x-auto max-h-56 text-foreground font-semibold">
                              {formatJSON(log.input)}
                            </pre>
                          </div>

                          {/* Output Payload */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                              Output Payload / Return Value
                            </span>
                            <pre className={`text-[10.5px] font-mono leading-relaxed p-3.5 bg-background border border-border/80 rounded-xl overflow-x-auto max-h-56 font-semibold ${
                              log.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {formatJSON(log.output)}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
