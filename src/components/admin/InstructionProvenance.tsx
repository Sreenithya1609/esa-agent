import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AUDIT_LOG, type AuditEntry } from '@/mock/auditLog';
import { Calendar, User, Cpu, ChevronDown, ChevronUp, History } from 'lucide-react';

export function InstructionProvenance() {
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  // Filter audit logs for prompt changes
  const promptLogs = AUDIT_LOG.filter((entry) => entry.action === 'prompt_change');

  const toggleRow = (id: string) => {
    setSelectedAuditId((prev) => (prev === id ? null : id));
  };

  // Simple word-by-word diff highlighters (CSS-based mock)
  const renderMockDiff = (before: string, after: string) => {
    // Splits by spaces
    const wordsBefore = before.split(' ');
    const wordsAfter = after.split(' ');

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono p-4 bg-muted/40 border border-border/50 rounded-xl leading-relaxed">
        {/* Left: Before */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider pb-1 border-b border-red-500/20">
            Previous Version (Removed)
          </div>
          <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-700 dark:text-red-300">
            {wordsBefore.map((word, i) => {
              const inAfter = wordsAfter.includes(word);
              return (
                <span
                  key={i}
                  className={inAfter ? '' : 'bg-red-500/20 dark:bg-red-500/35 line-through px-0.5 mx-0.5 rounded'}
                >
                  {word}{' '}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right: After */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-green-500 uppercase tracking-wider pb-1 border-b border-green-500/20">
            New Version (Added)
          </div>
          <div className="bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-700 dark:text-green-300">
            {wordsAfter.map((word, i) => {
              const inBefore = wordsBefore.includes(word);
              return (
                <span
                  key={i}
                  className={inBefore ? '' : 'bg-green-500/25 dark:bg-green-500/40 font-bold px-0.5 mx-0.5 rounded'}
                >
                  {word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-0.5">
        <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
          System Instructions Provenance
        </h5>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Historical trail of system prompt instructions modifications, showing before/after diffs for audit logging and version control.
        </p>
      </div>

      {/* Logs Table */}
      <div className="border border-border/80 rounded-xl overflow-hidden shadow-xs bg-card max-w-full overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold text-[11px]">
              <th className="text-left py-2.5 px-4 w-40">Timestamp</th>
              <th className="text-left py-2.5 px-3 w-32">User</th>
              <th className="text-left py-2.5 px-3 w-32">Agent Model</th>
              <th className="text-left py-2.5 px-3">Modification Details</th>
              <th className="py-2.5 px-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {promptLogs.map((entry) => {
              const isSelected = selectedAuditId === entry.id;
              return (
                <>
                  <tr
                    key={entry.id}
                    onClick={() => toggleRow(entry.id)}
                    className="hover:bg-muted/10 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-muted-foreground flex items-center gap-1.5 font-semibold text-[11px]">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {entry.timestamp}
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center">
                          {entry.userInitials}
                        </div>
                        {entry.user}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-foreground uppercase tracking-wider text-[10px]">
                      {entry.module}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-medium truncate max-w-xs">
                      {entry.details}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isSelected ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </td>
                  </tr>

                  {/* Expanded Diff Row */}
                  {isSelected && (
                    <tr>
                      <td colSpan={5} className="bg-muted/5 p-4 border-t border-b border-border/30">
                        {renderMockDiff(entry.before || '', entry.after || '')}
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
