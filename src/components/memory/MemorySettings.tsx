import { useState, useEffect } from 'react';
import { useMemory, type GlossaryItem, type ReportSectionItem } from '@/lib/MemoryContext';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { Slider } from '@/components/ui/slider';
import {
  Brain, Trash2, Eye, EyeOff, Plus, GripVertical, Save,
  BarChart2, LineChart, PieChart, Grid, ScatterChart
} from 'lucide-react';
import { toast } from 'sonner';

export function MemorySettings() {
  const {
    brandVoice, setBrandVoice,
    glossary, addGlossaryTerm, removeGlossaryTerm,
    reportSections, reorderReportSections, toggleSectionVisibility,
    preferredChartTypes, setPreferredChartTypes,
    outputLevel, setOutputLevel
  } = useMemory();

  // Brand Voice state
  const [voiceText, setVoiceText] = useState(brandVoice);

  // Glossary states
  const [newTerm, setNewTerm] = useState('');
  const [newDef, setNewDef] = useState('');

  // Drag and drop states for Report Structure
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Editing state for section names
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionValue, setEditingSectionValue] = useState('');

  // Sync state if context changes externally
  useEffect(() => {
    setVoiceText(brandVoice);
  }, [brandVoice]);

  // Debounced onChange for Brand Voice Guidelines
  useEffect(() => {
    const timer = setTimeout(() => {
      if (voiceText !== brandVoice) {
        setBrandVoice(voiceText);
      }
    }, 600); // 600ms debounce
    return () => clearTimeout(timer);
  }, [voiceText, brandVoice, setBrandVoice]);

  const handleSaveBrandVoice = () => {
    setBrandVoice(voiceText);
    toast.success('Brand voice saved', {
      description: 'ESA will now align all generated copy to these stylistic rules.',
    });
  };

  const handleAddGlossary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDef.trim()) return;

    addGlossaryTerm(newTerm.trim(), newDef.trim());
    setNewTerm('');
    setNewDef('');
    toast.success('Glossary term added');
  };

  // Drag & Drop handlers
  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId === null || draggedId === id) return;
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId === null || draggedId === id) {
      setDragOverId(null);
      setDraggedId(null);
      return;
    }

    const draggedIndex = reportSections.findIndex((item) => item.id === draggedId);
    const dropIndex = reportSections.findIndex((item) => item.id === id);

    if (draggedIndex !== -1 && dropIndex !== -1) {
      const updated = [...reportSections];
      const [draggedItem] = updated.splice(draggedIndex, 1);
      updated.splice(dropIndex, 0, draggedItem);
      reorderReportSections(updated);
      toast.success('Report sections reordered');
    }

    setDragOverId(null);
    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDeleteSection = (id: string) => {
    const updated = reportSections.filter((sec) => sec.id !== id);
    reorderReportSections(updated);
    toast.info('Section deleted');
  };

  const handleAddSection = () => {
    const name = prompt('Enter section name:');
    if (!name?.trim()) return;
    const newSec: ReportSectionItem = {
      id: `sec_${Date.now()}`,
      name: name.trim(),
      visible: true,
    };
    reorderReportSections([...reportSections, newSec]);
    toast.success(`Section "${name}" added`);
  };

  const startRenameSection = (sec: ReportSectionItem) => {
    setEditingSectionId(sec.id);
    setEditingSectionValue(sec.name);
  };

  const saveRenameSection = (id: string) => {
    const trimmed = editingSectionValue.trim();
    if (!trimmed) {
      setEditingSectionId(null);
      return;
    }
    const updated = reportSections.map((sec) =>
      sec.id === id ? { ...sec, name: trimmed } : sec
    );
    reorderReportSections(updated);
    setEditingSectionId(null);
    toast.success('Section renamed');
  };

  // Determine readability category for badge
  const getReadabilityCategory = (val: number) => {
    if (val < 34) return 'Technical';
    if (val < 67) return 'Balanced';
    return 'Executive';
  };

  return (
    <div className="space-y-6">
      {/* Brand Voice Editor */}
      <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-xs relative">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Brand Voice Guidelines</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Configure linguistic guidelines to alter copy parameters. (e.g. Write formally, lead with insights).
            </p>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground bg-muted border border-border/20 px-2 py-0.5 rounded">
            {voiceText.length}/500
          </span>
        </div>

        <div className="space-y-2">
          <textarea
            value={voiceText}
            onChange={(e) => setVoiceText(e.target.value.slice(0, 500))}
            placeholder="Describe how ESA should write: formal/concise, avoid jargon, always lead with the insight not the process..."
            className="w-full h-24 bg-muted/40 border border-border rounded-lg p-2.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 resize-y"
            maxLength={500}
          />
          <div className="flex justify-end items-center">
            <button
              onClick={handleSaveBrandVoice}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              Save Guidelines
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Glossary Terms */}
        <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-xs flex flex-col h-[400px]">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Company Glossary</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Define proprietary industry terms and acronyms for the LLM agents to inject contextual answers.
            </p>
          </div>

          {/* Add Term Form */}
          <form onSubmit={handleAddGlossary} className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto] gap-2 pt-1">
            <input
              type="text"
              placeholder="ARR"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/50 font-bold"
            />
            <input
              type="text"
              placeholder="Annual Recurring Revenue..."
              value={newDef}
              onChange={(e) => setNewDef(e.target.value)}
              className="bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Terms List */}
          <div className="flex-1 overflow-y-auto border border-border/50 rounded-xl p-2.5 bg-muted/5 divide-y divide-border/30 space-y-2">
            {glossary.map((item) => (
              <div key={item.id} className="pt-2 pb-1.5 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground bg-primary/10 border border-primary/20 px-1.5 py-0.2 rounded text-[10px]">
                    {item.term}
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-[11px] mt-1">
                    {item.definition}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeGlossaryTerm(item.id)}
                  className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Report Structure Drag & Drop */}
        <div className="bg-card border border-border/80 rounded-xl p-5 space-y-4 shadow-xs flex flex-col h-[400px]">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Report Structure Builder</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Drag sections to reorder default outputs. Toggle visibility settings dynamically. Double-click to rename.
              </p>
            </div>
            <button
              onClick={handleAddSection}
              className="p-1.5 bg-muted border border-border hover:bg-muted/80 rounded-lg text-foreground transition-all cursor-pointer"
              title="Add Custom Section"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Drag Container */}
          <div className="flex-1 overflow-y-auto border border-border/50 rounded-xl p-2 bg-muted/5 space-y-1.5">
            {reportSections.map((sec) => {
              const isDragged = draggedId === sec.id;
              const isDragOver = dragOverId === sec.id;
              const isEditing = editingSectionId === sec.id;

              return (
                <div
                  key={sec.id}
                  draggable
                  onDragStart={() => handleDragStart(sec.id)}
                  onDragOver={(e) => handleDragOver(e, sec.id)}
                  onDrop={(e) => handleDrop(e, sec.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-2 bg-background border rounded-lg text-xs transition-all shadow-xs cursor-move ${
                    isDragged ? 'opacity-50 border-primary' : 'border-border/80 hover:border-border'
                  } ${isDragOver ? 'border-t-2 border-t-primary' : ''}`}
                >
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0 cursor-grab" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingSectionValue}
                        onChange={(e) => setEditingSectionValue(e.target.value)}
                        onBlur={() => saveRenameSection(sec.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveRenameSection(sec.id);
                          } else if (e.key === 'Escape') {
                            setEditingSectionId(null);
                          }
                        }}
                        autoFocus
                        className="bg-transparent border-b border-primary/50 outline-none w-full text-xs font-semibold py-0"
                      />
                    ) : (
                      <span
                        onDoubleClick={() => startRenameSection(sec)}
                        className={`font-semibold cursor-pointer select-none ${sec.visible ? 'text-foreground' : 'text-muted-foreground line-through'}`}
                        title="Double-click to rename"
                      >
                        {sec.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleSectionVisibility(sec.id)}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart & Slider Controls */}
      <div className="bg-card border border-border/80 rounded-xl p-5 space-y-6 shadow-xs">
        {/* Preferred Chart Types */}
        <div className="space-y-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Preferred Chart Visuals</h4>
            <p className="text-[11px] text-muted-foreground">
              Select which charts should populate the data analyst model responses by default.
            </p>
          </div>

          <ToggleGroup.Root
            type="multiple"
            value={preferredChartTypes}
            onValueChange={(val) => {
              if (val.length > 0) setPreferredChartTypes(val);
            }}
            className="flex flex-wrap gap-2"
          >
            {[
              { id: 'Bar', icon: BarChart2 },
              { id: 'Line', icon: LineChart },
              { id: 'Pie', icon: PieChart },
              { id: 'Scatter', icon: ScatterChart },
              { id: 'Heatmap', icon: Grid },
            ].map((chart) => {
              const ChartIcon = chart.icon;
              const isSelected = preferredChartTypes.includes(chart.id);
              return (
                <ToggleGroup.Item
                  key={chart.id}
                  value={chart.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 text-primary shadow-xs'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                >
                  <ChartIcon className="w-3.5 h-3.5" />
                  {chart.id}
                </ToggleGroup.Item>
              );
            })}
          </ToggleGroup.Root>
        </div>

        {/* Output Slider */}
        <div className="space-y-3.5 pt-4 border-t border-border/50">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Output Readability Level</h4>
              <p className="text-[11px] text-muted-foreground">
                Slide to configure LLM readability guidelines (from raw calculations to board briefings).
              </p>
            </div>
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-md">
              {outputLevel}% ({getReadabilityCategory(outputLevel)})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Technical</span>
            <Slider
              value={[outputLevel]}
              onValueChange={(val) => setOutputLevel(val[0])}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Executive</span>
          </div>
        </div>
      </div>
    </div>
  );
}
