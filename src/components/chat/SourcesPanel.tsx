import { useState } from 'react';
import { FileText, Globe, Database, ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { Citation } from '@/mock/citations';
import { toast } from 'sonner';

interface SourcesPanelProps {
  sources: Citation[];
}

const TYPE_ICONS = {
  document: FileText,
  web: Globe,
  database: Database,
};

export function SourcesPanel({ sources }: SourcesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportSources = () => {
    toast.success('Sources exported successfully', {
      description: 'Exported references list as a CSV file.',
    });
  };

  if (!sources || sources.length === 0) return null;

  return (
    <div className="border-t border-border/50 pt-4 mt-5 space-y-3">
      {/* Header Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 px-3 hover:bg-muted/40 rounded-lg transition-colors cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <span className="flex items-center gap-1.5">
          Sources ({sources.length})
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Collapsible List */}
      {isOpen && (
        <div className="space-y-2 px-1">
          <div className="flex justify-end pb-1 border-b border-border/30">
            <button
              onClick={handleExportSources}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Export Sources as CSV
            </button>
          </div>
          <div className="divide-y divide-border/30 max-h-60 overflow-y-auto pr-1">
            {sources.map((src, i) => {
              const Icon = TYPE_ICONS[src.type] || FileText;
              return (
                <div key={src.id} className="py-3 flex items-start gap-3 justify-between">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[11px] font-bold text-muted-foreground w-4 text-right">
                      [{i + 1}]
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-semibold text-xs text-foreground leading-tight">
                          {src.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed pl-5 line-clamp-2">
                        {src.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0 pl-4 text-right">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`w-1.5 h-1.5 rounded-full ${
                            star <= src.reliabilityScore
                              ? 'bg-primary'
                              : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      Indexed: {src.dateIndexed}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
