import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { SourcePopover } from './SourcePopover';
import type { Citation } from '@/mock/citations';

interface CitationBadgeProps {
  index: number;
  source: Citation;
  agentColor?: string;
}

export function CitationBadge({ index, source, agentColor = '#4A6CF7' }: CitationBadgeProps) {
  // Compute styling with agent color background tint
  // For dark mode compatibility, we use opacity values
  const bgStyle = {
    backgroundColor: `${agentColor}1a`, // 10% opacity hex
    color: agentColor,
    borderColor: `${agentColor}33`, // 20% opacity hex
  };

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <sup
              style={bgStyle}
              className="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded border leading-none mx-0.5 select-none hover:brightness-95 cursor-pointer shadow-sm"
            >
              {index}
            </sup>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] text-xs">
          <div className="space-y-1">
            <span className="font-bold text-white block truncate">{source.name}</span>
            <span className="text-[10px] text-primary-foreground/80 block line-clamp-2">
              {source.excerpt}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80 shadow-xl border border-border p-4 bg-popover" side="top" align="center">
        <SourcePopover source={source} />
      </PopoverContent>
    </Popover>
  );
}
