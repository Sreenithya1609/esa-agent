import { AlertTriangle } from 'lucide-react';

interface ConflictBannerProps {
  description: string;
  onShowDetails?: () => void;
}

export function ConflictBanner({ description, onShowDetails }: ConflictBannerProps) {
  return (
    <div className="flex items-start gap-3 bg-amber-500/5 dark:bg-amber-500/10 border-l-4 border-amber-500 rounded-r-xl p-3.5 shadow-sm mb-4">
      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 leading-relaxed">
          {description}
        </p>
        {onShowDetails && (
          <button
            onClick={onShowDetails}
            className="text-[10px] font-bold text-amber-600 dark:text-amber-500 hover:underline cursor-pointer"
          >
            Show conflicting details
          </button>
        )}
      </div>
    </div>
  );
}
