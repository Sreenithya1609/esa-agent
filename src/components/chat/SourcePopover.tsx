import { FileText, Globe, Database, Check } from 'lucide-react';
import type { Citation } from '@/mock/citations';
import { toast } from 'sonner';

interface SourcePopoverProps {
  source: Citation;
}

const TYPE_ICONS = {
  document: FileText,
  web: Globe,
  database: Database,
};

export function SourcePopover({ source }: SourcePopoverProps) {
  const Icon = TYPE_ICONS[source.type] || FileText;

  const handleOpenSource = () => {
    toast.success(`Opening source: ${source.name}`, {
      description: `Navigating mock URL: ${source.url}`,
    });
  };

  const handleFlagInaccurate = () => {
    toast.info('Feedback submitted', {
      description: `Thank you. Flagged "${source.name}" for verification.`,
    });
  };

  return (
    <div className="space-y-3.5 text-sm max-w-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-primary/10 text-primary">
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-bold text-foreground text-sm leading-tight block break-words">
            {source.name}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
          {source.type}
        </span>
      </div>

      {/* Reliability Dots */}
      <div className="flex items-center gap-2 border-t border-border/50 pt-2.5">
        <span className="text-[11px] font-semibold text-muted-foreground">Reliability Score:</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`w-2.5 h-2.5 rounded-full ${
                star <= source.reliabilityScore
                  ? 'bg-primary'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-bold text-foreground">
          {source.reliabilityScore}/5
        </span>
      </div>

      {/* Excerpt */}
      <div className="bg-muted/30 border border-border/30 rounded-lg p-2.5 text-xs text-muted-foreground leading-relaxed italic select-all">
        "{source.excerpt}"
      </div>

      {/* Footer Info */}
      <div className="text-[10px] text-muted-foreground">
        Indexed on: <span className="font-semibold">{source.dateIndexed}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border/50">
        <button
          onClick={handleOpenSource}
          className="flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all cursor-pointer"
        >
          Open Source
        </button>
        <button
          onClick={handleFlagInaccurate}
          className="text-center py-1.5 px-3 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground border border-border transition-all cursor-pointer"
        >
          Flag Inaccurate
        </button>
      </div>
    </div>
  );
}
