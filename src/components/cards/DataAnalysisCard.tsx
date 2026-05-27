import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
} from 'recharts';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { ChartCommandBar, type ChartState, type CommandHistoryItem } from '@/components/chat/ChartCommandBar';
import { SourcesPanel } from '@/components/chat/SourcesPanel';
import { getCitationsById, type DataAnalysisResponseData } from '@/mock/responses';
import { BarChart3, LineChart as LineIcon, PieChart as PieIcon, Grid, AlertCircle, FileImage, Download, Pin } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface DataAnalysisCardProps {
  data: DataAnalysisResponseData;
}

interface StickyAnnotation {
  x: number;
  y: number;
  label: string;
  value: string | number;
  note: string;
}

export function DataAnalysisCard({ data }: DataAnalysisCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Chart state managed locally, synced with command bar
  const [chartState, setChartState] = useState<ChartState>({
    chartType: data.chartType,
    data: data.chartData,
    highlights: [],
    trendline: false,
  });

  const [history, setHistory] = useState<CommandHistoryItem[]>([]);
  const [annotations, setAnnotations] = useState<StickyAnnotation[]>([]);
  const [activeAnnotationInput, setActiveAnnotationInput] = useState<{
    x: number;
    y: number;
    label: string;
    value: string | number;
  } | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Reset chart when mock response data changes
  useEffect(() => {
    setChartState({
      chartType: data.chartType,
      data: data.chartData,
      highlights: [],
      trendline: false,
    });
    setHistory([]);
    setAnnotations([]);
    setActiveAnnotationInput(null);
  }, [data]);

  const citations = getCitationsById(data.citations);

  const handleExport = (format: 'PNG' | 'CSV') => {
    toast.success('Chart exported successfully', {
      description: `Saved chart visualizations as a ${format} file.`,
    });
  };

  // Click handler on chart elements to add annotations
  const handleChartClick = (payload: any, event: any) => {
    if (!payload || !event) return;
    
    // Attempt to parse coordinates from the click event
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get coordinates relative to the card container
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determine target label and value
    const activeLabel = payload.week || payload.name || payload.month || 'Data Point';
    const activeValue = payload.revenue || payload.value || payload.churn || '';

    setActiveAnnotationInput({
      x,
      y,
      label: activeLabel,
      value: activeValue,
    });
  };

  const saveAnnotation = () => {
    if (!activeAnnotationInput) return;
    if (!newNoteText.trim()) {
      setActiveAnnotationInput(null);
      return;
    }

    setAnnotations((prev) => [
      ...prev,
      {
        ...activeAnnotationInput,
        note: newNoteText,
      },
    ]);
    setNewNoteText('');
    setActiveAnnotationInput(null);
    toast.success('Annotation pinned to chart', {
      description: 'The note has been attached to the data point.',
    });
  };

  const removeAnnotation = (idx: number) => {
    setAnnotations((prev) => prev.filter((_, i) => i !== idx));
  };

  // Custom cell coloring to support highlights
  const getCellColor = (entry: any, index: number, defaultColor: string) => {
    const labelVal = String(entry.week || entry.name || entry.month || '');
    const isHighlighted = chartState.highlights.some(
      (h) => h.toLowerCase() === labelVal.toLowerCase()
    );
    return isHighlighted ? '#EF4444' : defaultColor; // Red for highlighted, else default
  };

  // Custom Heatmap implementation
  const renderHeatmap = () => {
    // We map W1-W12 across columns, and metrics (Revenue, Churn) as rows
    const metrics = [
      { key: 'revenue', label: 'Revenue ($M)', max: 10, color: 'text-[#0FC4A7]' },
      { key: 'churn', label: 'Churn Rate (%)', max: 5, color: 'text-amber-500' },
    ];

    return (
      <div className="space-y-4 py-4 overflow-x-auto">
        <h5 className="text-xs font-bold text-foreground tracking-tight uppercase">
          Activity Heatmap Matrix
        </h5>
        <div className="min-w-[600px] space-y-2">
          {/* Column headers (Weeks) */}
          <div className="grid grid-cols-[100px_repeat(12,1fr)] gap-1 text-center">
            <span className="text-[10px] font-bold text-muted-foreground text-left">Metric</span>
            {chartState.data.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-foreground">
                {d.week}
              </span>
            ))}
          </div>

          {/* Row cells */}
          {metrics.map((metric) => (
            <div key={metric.key} className="grid grid-cols-[100px_repeat(12,1fr)] gap-1 items-center">
              <span className={`text-[10px] font-bold ${metric.color} text-left`}>
                {metric.label}
              </span>
              {chartState.data.map((d, i) => {
                const value = Number(d[metric.key] || 0);
                const opacity = Math.min(value / metric.max, 1);
                const intensityBg = metric.key === 'revenue' 
                  ? `rgba(15, 196, 167, ${Math.max(opacity, 0.15)})` 
                  : `rgba(245, 158, 11, ${Math.max(opacity, 0.15)})`;

                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className="h-8 rounded-md flex items-center justify-center text-[10px] font-bold text-foreground/80 border border-border/20 cursor-pointer hover:border-foreground/45 transition-colors"
                        style={{ backgroundColor: intensityBg }}
                        onClick={(e) => handleChartClick(d, e)}
                      >
                        {value.toFixed(1)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold block">{d.week}</span>
                        <span>{metric.label}: {value}</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActiveChart = () => {
    const type = chartState.chartType;

    if (type === 'heatmap' as any) {
      return renderHeatmap();
    }

    return (
      <div className="h-64 w-full">
        {type === 'line' && (
          <LineChart
            data={chartState.data}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload[0]) {
                handleChartClick(e.activePayload[0].payload, e.chartX && e.chartY ? { clientX: e.chartX + (containerRef.current?.getBoundingClientRect().left || 0), clientY: e.chartY + (containerRef.current?.getBoundingClientRect().top || 0) } : null);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey={data.xKey} fontSize={10} tickLine={false} />
            <YAxis fontSize={10} tickLine={false} />
            <RechartsTooltip />
            <Legend verticalAlign="top" height={36} />
            {data.yKeys.map((y) => (
              <Line
                key={y.key}
                type="monotone"
                dataKey={y.key}
                name={y.label}
                stroke={y.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
            {chartState.trendline && (
              <Line
                type="linear"
                dataKey="revenue"
                stroke="#EF4444"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                name="Trendline"
                dot={false}
              />
            )}
          </LineChart>
        )}

        {type === 'bar' && (
          <BarChart
            data={chartState.data}
            onClick={(e) => {
              if (e && e.activePayload && e.activePayload[0]) {
                handleChartClick(e.activePayload[0].payload, e.chartX && e.chartY ? { clientX: e.chartX + (containerRef.current?.getBoundingClientRect().left || 0), clientY: e.chartY + (containerRef.current?.getBoundingClientRect().top || 0) } : null);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey={data.xKey} fontSize={10} tickLine={false} />
            <YAxis fontSize={10} tickLine={false} />
            <RechartsTooltip />
            <Legend verticalAlign="top" height={36} />
            {data.yKeys.map((y) => (
              <Bar key={y.key} dataKey={y.key} name={y.label} fill={y.color} radius={[4, 4, 0, 0]}>
                {chartState.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCellColor(entry, index, y.color)} />
                ))}
              </Bar>
            ))}
          </BarChart>
        )}

        {type === 'pie' && (
          <PieChart>
            <Pie
              data={chartState.data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="revenue"
              nameKey={data.xKey}
              onClick={(entry, idx, e) => handleChartClick(entry, e)}
            >
              {chartState.data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getCellColor(entry, index, index % 2 === 0 ? '#0FC4A7' : '#4A6CF7')}
                />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        )}

        {type === 'scatter' && (
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey={data.xKey} name="Week" fontSize={10} />
            <YAxis dataKey="revenue" name="Revenue ($M)" fontSize={10} />
            <RechartsTooltip />
            <Legend verticalAlign="top" height={36} />
            <Scatter
              name="Revenue"
              data={chartState.data}
              fill="#0FC4A7"
              onClick={(entry, e) => handleChartClick(entry, e)}
            >
              {chartState.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCellColor(entry, index, '#0FC4A7')} />
              ))}
            </Scatter>
          </ScatterChart>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      ref={containerRef}
      className="bg-card border border-border shadow-md rounded-2xl p-5 space-y-6 overflow-hidden relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground tracking-tight">{data.title}</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {data.summary}
          </p>
        </div>
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Data Chart
        </span>
      </div>

      {/* Chart Settings / Toggle Button Group */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground">Chart Type</span>
        <ToggleGroup.Root
          type="single"
          value={chartState.chartType}
          onValueChange={(val) => {
            if (val) setChartState((prev) => ({ ...prev, chartType: val as any }));
          }}
          className="inline-flex bg-muted/60 p-0.5 rounded-lg border border-border/40 gap-0.5"
        >
          <ToggleGroup.Item
            value="line"
            className="p-1 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1 hover:bg-muted text-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer"
          >
            <LineIcon className="w-3.5 h-3.5" />
            Line
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="bar"
            className="p-1 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1 hover:bg-muted text-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Bar
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="pie"
            className="p-1 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1 hover:bg-muted text-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer"
          >
            <PieIcon className="w-3.5 h-3.5" />
            Pie
          </ToggleGroup.Item>
          <ToggleGroup.Item
            value="heatmap"
            className="p-1 px-2.5 rounded-md text-[11px] font-semibold flex items-center gap-1 hover:bg-muted text-foreground data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5" />
            Heatmap
          </ToggleGroup.Item>
        </ToggleGroup.Root>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative border border-border/50 rounded-xl p-3.5 bg-muted/5 min-h-[250px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height={260}>
          {renderActiveChart()}
        </ResponsiveContainer>

        {/* Sticky note input tooltip */}
        <AnimatePresence>
          {activeAnnotationInput && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute z-20 bg-popover border border-border p-3 rounded-xl shadow-lg w-52 space-y-2 text-xs"
              style={{ top: activeAnnotationInput.y - 120, left: activeAnnotationInput.x - 100 }}
            >
              <div className="font-bold flex items-center gap-1">
                <Pin className="w-3 h-3 text-primary shrink-0" />
                Add note for: {activeAnnotationInput.label} ({activeAnnotationInput.value})
              </div>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Type note text..."
                className="w-full h-12 bg-muted/40 border border-border rounded-lg p-1 text-[11px] text-foreground outline-none resize-none focus:border-primary/50"
              />
              <div className="flex gap-1.5 justify-end">
                <button
                  onClick={() => setActiveAnnotationInput(null)}
                  className="px-2 py-1 bg-muted hover:bg-muted/80 rounded font-semibold text-[10px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAnnotation}
                  className="px-2 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded font-semibold text-[10px] cursor-pointer"
                >
                  Save Pin
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pinned Sticky Notes rendering */}
        {annotations.map((note, idx) => (
          <div
            key={idx}
            className="absolute z-10 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 p-2.5 rounded-xl shadow-sm text-[10px] leading-relaxed max-w-[120px] pointer-events-auto"
            style={{ top: note.y - 30, left: note.x }}
          >
            <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-400 gap-1 pb-0.5 border-b border-amber-500/20">
              <span className="truncate">{note.label}: {note.value}</span>
              <button
                onClick={() => removeAnnotation(idx)}
                className="text-[9px] hover:text-red-500 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-foreground/90 font-medium break-words mt-1">
              {note.note}
            </p>
          </div>
        ))}
      </div>

      {/* Anomalies alert banner */}
      {data.anomalies.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Anomalies Detected
          </span>
          <div className="space-y-1">
            {data.anomalies.map((anom, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-xl p-2.5 text-xs text-foreground"
              >
                <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-destructive">{anom.label}: </span>
                  {anom.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chart Command Input Bar */}
      <ChartCommandBar
        currentState={chartState}
        onStateChange={setChartState}
        initialState={{
          chartType: data.chartType,
          data: data.chartData,
          highlights: [],
          trendline: false,
        }}
        history={history}
        onHistoryChange={setHistory}
      />

      {/* Citations list */}
      <SourcesPanel sources={citations} />

      {/* Footer Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/50">
        <button
          onClick={() => handleExport('PNG')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-muted hover:bg-muted/80 text-foreground border border-border/80 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <FileImage className="w-3.5 h-3.5 text-primary" />
          Export PNG
        </button>
        <button
          onClick={() => handleExport('CSV')}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-muted hover:bg-muted/80 text-foreground border border-border/80 rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-primary" />
          Export CSV
        </button>
      </div>
    </motion.div>
  );
}
