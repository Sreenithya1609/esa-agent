import { usePermissions } from '@/lib/PermissionsContext';
import { DATA_SOURCES } from '@/mock/dataSources';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { FileSpreadsheet, FileText, FolderOpen, Database, Cloud, ShieldCheck, Download } from 'lucide-react';
import type { AgentKey } from '@/lib/mockData';
import { toast } from 'sonner';

const SOURCE_ICONS: Record<string, any> = {
  csv: FileSpreadsheet,
  pdf: FileText,
  drive: FolderOpen,
  database: Database,
  api: Cloud,
};

const AGENT_LABELS: Record<AgentKey, { name: string; color: string }> = {
  strategy: { name: 'Strategy Agent', color: '#4A6CF7' },
  data: { name: 'Data Analyst Agent', color: '#0FC4A7' },
  search: { name: 'Search Agent', color: '#9B72F7' },
  research: { name: 'Research Agent', color: '#F7924A' },
};

export function PermissionMatrix() {
  const { matrix, togglePermission } = usePermissions();

  const handleExport = () => {
    toast.success('Matrix exported', {
      description: 'The permissions settings matrix was saved as a CSV.',
    });
  };

  const handleToggle = (agent: AgentKey, sourceId: string) => {
    togglePermission(agent, sourceId);
    const isNowPermitted = !matrix[agent]?.[sourceId]?.permitted;
    toast.success('Permission updated', {
      description: `${AGENT_LABELS[agent].name} access to "${
        DATA_SOURCES.find((ds) => ds.id === sourceId)?.name
      }" is now ${isNowPermitted ? 'PERMITTED' : 'REVOKED'}.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Description header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Agent Data Access Permissions
          </h5>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Configure read-write and access permissions for individual agent models across company databases, directories, and files.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export as CSV
        </button>
      </div>

      {/* Grid Matrix Table */}
      <div className="border border-border/80 rounded-xl overflow-hidden shadow-xs bg-card max-w-full overflow-x-auto">
        <TooltipProvider>
          <table className="w-full text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                <th className="text-left py-2.5 px-4 font-bold">Agent Model</th>
                {DATA_SOURCES.map((ds) => {
                  const Icon = SOURCE_ICONS[ds.type] || FileText;
                  return (
                    <th key={ds.id} className="text-center py-2.5 px-3 font-bold w-28">
                      <div className="flex flex-col items-center gap-0.5">
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate max-w-[80px] font-semibold text-[10px] text-foreground">
                          {ds.name}
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase">
                          {ds.type}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {(Object.keys(AGENT_LABELS) as AgentKey[]).map((agentKey) => {
                const agent = AGENT_LABELS[agentKey];
                return (
                  <tr key={agentKey} className="hover:bg-muted/10">
                    {/* Row Header */}
                    <td className="py-3 px-4 font-bold text-foreground text-left flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: agent.color }}
                      />
                      {agent.name}
                    </td>

                    {/* Matrix Cells */}
                    {DATA_SOURCES.map((ds) => {
                      const perm = matrix[agentKey]?.[ds.id] || {
                        permitted: false,
                        grantedBy: 'System',
                        grantedDate: 'N/A',
                      };

                      return (
                        <td key={ds.id} className="py-3 px-3 text-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-flex justify-center items-center">
                                <Switch
                                  checked={perm.permitted}
                                  onCheckedChange={() => handleToggle(agentKey, ds.id)}
                                  className="scale-90"
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="text-[10px] p-2 space-y-0.5">
                              <div className="font-bold text-white">
                                {perm.permitted ? 'ACCESS PERMITTED' : 'ACCESS DENIED'}
                              </div>
                              <div className="text-primary-foreground/80">
                                Modified by: {perm.grantedBy}
                              </div>
                              <div className="text-primary-foreground/80">
                                Date: {perm.grantedDate}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TooltipProvider>
      </div>

      {/* Info indicator */}
      <div className="flex items-start gap-1.5 p-3 bg-muted/20 border border-border/80 rounded-xl text-[10.5px] text-muted-foreground leading-relaxed">
        <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
        <span>
          <strong>Strict Isolation Rule:</strong> Disabling a data source permission prevents the agent from parsing metadata or executing search indexing query functions on that source, throwing immediate provenance validation errors in the trace logs.
        </span>
      </div>
    </div>
  );
}
