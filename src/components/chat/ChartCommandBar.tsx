import { useState, type KeyboardEvent } from 'react';
import { CornerDownLeft, AlertCircle, X, RotateCcw } from 'lucide-react';
import { parseChartCommand, describeCommand, UNKNOWN_COMMAND_MESSAGE, type ChartCommandAction } from '@/lib/parseChartCommand';

export interface ChartState {
  chartType: 'bar' | 'line' | 'pie' | 'scatter';
  data: any[];
  highlights: string[];
  trendline: boolean;
}

export interface CommandHistoryItem {
  command: ChartCommandAction;
  prevState: ChartState; // state before this command was applied
}

interface ChartCommandBarProps {
  currentState: ChartState;
  onStateChange: (newState: ChartState) => void;
  initialState: ChartState;
  history: CommandHistoryItem[];
  onHistoryChange: (newHistory: CommandHistoryItem[]) => void;
}

export function ChartCommandBar({
  currentState,
  onStateChange,
  initialState,
  history,
  onHistoryChange,
}: ChartCommandBarProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const applyCommand = (command: ChartCommandAction) => {
    setError(null);
    const prevState = { ...currentState };
    let newState = { ...currentState };

    switch (command.action) {
      case 'changeType':
        newState.chartType = command.chartType;
        break;

      case 'highlight':
        // Find if label exists in data (case-insensitive check)
        const labelToHighlight = currentState.data.find(
          (d) =>
            Object.values(d).some(
              (val) => String(val).toLowerCase() === command.label.toLowerCase()
            )
        );

        if (labelToHighlight) {
          // get the actual key name (usually the first key, e.g. week: 'W8')
          const firstVal = Object.values(labelToHighlight)[0] as string;
          newState.highlights = [...newState.highlights, firstVal];
        } else {
          setError(`Could not find label "${command.label}" to highlight.`);
          return;
        }
        break;

      case 'addTrendline':
        newState.trendline = true;
        break;

      case 'filter':
        const filteredData = currentState.data.filter((d) =>
          Object.values(d).some(
            (val) => String(val).toLowerCase() === command.label.toLowerCase()
          )
        );
        if (filteredData.length > 0) {
          newState.data = filteredData;
        } else {
          setError(`No data points found matching "${command.label}".`);
          return;
        }
        break;

      case 'compare':
        const [a, b] = command.labels;
        const comparedData = currentState.data.filter((d) =>
          Object.values(d).some((val) => {
            const s = String(val).toLowerCase();
            return s === a.toLowerCase() || s === b.toLowerCase();
          })
        );
        if (comparedData.length > 0) {
          newState.data = comparedData;
        } else {
          setError(`No data points matching comparison labels.`);
          return;
        }
        break;

      case 'remove':
        const remainingData = currentState.data.filter(
          (d) =>
            !Object.values(d).some(
              (val) => String(val).toLowerCase() === command.label.toLowerCase()
            )
        );
        if (remainingData.length < currentState.data.length) {
          newState.data = remainingData;
        } else {
          setError(`Label "${command.label}" not found to remove.`);
          return;
        }
        break;

      case 'sort':
        // Sort descending by the first numeric field (usually revenue or value)
        const sortedData = [...currentState.data].sort((x, y) => {
          const valX = Number(x.revenue ?? x.value ?? 0);
          const valY = Number(y.revenue ?? y.value ?? 0);
          return valY - valX;
        });
        newState.data = sortedData;
        break;

      case 'reset':
        newState = { ...initialState };
        onHistoryChange([]);
        onStateChange(newState);
        return;
    }

    // Add to history and update state
    onHistoryChange([...history, { command, prevState }]);
    onStateChange(newState);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const command = parseChartCommand(input);
      if (command) {
        applyCommand(command);
        setInput('');
      } else {
        setError(UNKNOWN_COMMAND_MESSAGE);
      }
    }
  };

  const handleUndo = (index: number) => {
    // Revert to the state just BEFORE the clicked command was applied
    const item = history[index];
    onStateChange(item.prevState);
    // Slice history to remove this and any subsequent commands
    onHistoryChange(history.slice(0, index));
    setError(null);
  };

  return (
    <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
      {/* Input bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Edit chart with natural language (e.g. change to bar chart, add trendline, sort descending)..."
          className="w-full bg-muted/30 border border-border/80 focus:border-primary/80 focus:ring-1 focus:ring-primary/20 rounded-xl py-2 px-3 pr-10 text-xs text-foreground placeholder-muted-foreground outline-none transition-all"
        />
        <button
          onClick={() => {
            const command = parseChartCommand(input);
            if (command) {
              applyCommand(command);
              setInput('');
            } else {
              setError(UNKNOWN_COMMAND_MESSAGE);
            }
          }}
          className="absolute right-2 p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-1.5 text-[11px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 leading-relaxed">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Command History / Chips */}
      {history.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase tracking-wider">
            History:
          </span>
          <div className="flex items-center gap-1.5">
            {history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleUndo(idx)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 hover:bg-destructive/10 text-primary hover:text-destructive border border-primary/20 hover:border-destructive/20 px-2 py-0.5 rounded-full transition-all cursor-pointer group"
                title="Click to undo this command"
              >
                {describeCommand(item.command)}
                <X className="w-2.5 h-2.5 text-primary/60 group-hover:text-destructive transition-colors" />
              </button>
            ))}

            <button
              onClick={() => applyCommand({ action: 'reset' })}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted border border-border px-2 py-0.5 rounded-full transition-all cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
