import { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { DATA_SOURCES } from '@/mock/dataSources';
import type { AgentKey } from '@/lib/mockData';
import type { Template } from '@/mock/templates';
import {
  FileText, BarChart2, Globe, Brain, Target, TrendingUp, Users, Shield, Zap, Layers, BookOpen, Star,
  Plus, Trash2, GripVertical, Check, Database, Folder
} from 'lucide-react';
import { toast } from 'sonner';

interface TemplateEditorProps {
  template: Template | null; // null means creating a new template
  onSave: (tpl: Template) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

const ICON_LIST = [
  { name: 'FileText', icon: FileText },
  { name: 'BarChart2', icon: BarChart2 },
  { name: 'Globe', icon: Globe },
  { name: 'Brain', icon: Brain },
  { name: 'Target', icon: Target },
  { name: 'TrendingUp', icon: TrendingUp },
  { name: 'Users', icon: Users },
  { name: 'Shield', icon: Shield },
  { name: 'Zap', icon: Zap },
  { name: 'Layers', icon: Layers },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Star', icon: Star },
];

const AGENT_LABELS: Record<AgentKey, string> = {
  strategy: 'Strategy Agent',
  data: 'Data Analyst Agent',
  search: 'Search Agent',
  research: 'Research Agent',
};

const AGENT_COLORS: Record<AgentKey, string> = {
  strategy: '#1E3A8A', // Navy Blue
  data: '#0D9488',     // Teal
  search: '#7C3AED',   // Purple
  research: '#EA580C', // Orange
};

export function TemplateEditor({ template, onSave, onDelete, onClose }: TemplateEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('FileText');
  const [sections, setSections] = useState<string[]>([]);
  const [newSectionText, setNewSectionText] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<AgentKey[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'ppt' | 'doc'>('pdf');

  // Drag and drop states for sections
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [editingSectionValue, setEditingSectionValue] = useState('');

  // Delete dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Load template fields if editing
  useEffect(() => {
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setSelectedIcon(template.icon);
      setSections(template.sections);
      setSelectedAgents(template.defaultAgents);
      setSelectedSources(template.defaultSources);
      setOutputFormat(template.outputFormat);
    } else {
      setName('');
      setDescription('');
      setSelectedIcon('FileText');
      setSections(['Executive Summary', 'Analysis', 'Recommendations']);
      setSelectedAgents(['strategy']);
      setSelectedSources([]);
      setOutputFormat('pdf');
    }
  }, [template]);

  const handleAddSection = () => {
    if (!newSectionText.trim()) return;
    if (sections.includes(newSectionText.trim())) {
      toast.error('Section already exists');
      return;
    }
    setSections([...sections, newSectionText.trim()]);
    setNewSectionText('');
  };

  const handleRemoveSection = (sectionName: string) => {
    setSections(sections.filter((s) => s !== sectionName));
  };

  const handleRenameSection = (idx: number) => {
    const trimmed = editingSectionValue.trim();
    if (!trimmed) {
      setEditingSectionIndex(null);
      return;
    }
    const updated = [...sections];
    updated[idx] = trimmed;
    setSections(updated);
    setEditingSectionIndex(null);
  };

  const handleAgentToggle = (key: AgentKey) => {
    setSelectedAgents((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const handleSourceToggle = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Drag & Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...sections];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setSections(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Template name is required');
      return;
    }
    if (sections.length === 0) {
      toast.error('At least one section is required');
      return;
    }
    if (selectedAgents.length === 0) {
      toast.error('At least one default agent is required');
      return;
    }

    const tpl: Template = {
      id: template?.id || `tpl_${Date.now()}`,
      name: name.trim(),
      icon: selectedIcon,
      description: description.trim(),
      sections,
      defaultAgents: selectedAgents,
      defaultSources: selectedSources,
      outputFormat,
    };

    onSave(tpl);
    toast.success(template ? 'Template updated' : 'Template created');
    onClose();
  };

  const executeDelete = () => {
    if (template && onDelete) {
      onDelete(template.id);
      toast.info('Template deleted');
      setDeleteConfirmOpen(false);
      onClose();
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-background rounded-2xl shadow-xl text-xs">
      <DialogHeader>
        <DialogTitle className="text-base font-bold text-foreground">
          {template ? 'Edit Execution Template' : 'Create Custom Template'}
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Configure default section builders, agent allocations, and target output formats.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Name + Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quarterly Business Review"
              className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarize when this template is best applied..."
              className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/50"
            />
          </div>
        </div>

        {/* Icon Picker (3x4 Grid) */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">Select Icon</label>
          <div className="grid grid-cols-4 gap-2 border border-border/50 rounded-xl p-2 bg-muted/5 max-w-sm">
            {ICON_LIST.map((ico) => {
              const IconComp = ico.icon;
              const isSelected = selectedIcon === ico.name;
              return (
                <button
                  key={ico.name}
                  type="button"
                  onClick={() => setSelectedIcon(ico.name)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary shadow-xs'
                      : 'border-border hover:bg-muted text-muted-foreground'
                  }`}
                  title={ico.name}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Drag-and-drop vertical Sections Builder */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">
            Sections Structure (Drag to reorder, double-click to rename)
          </label>
          <div className="flex gap-2 max-w-md mb-2">
            <input
              type="text"
              value={newSectionText}
              onChange={(e) => setNewSectionText(e.target.value)}
              placeholder="Add section (e.g. Market Size)..."
              className="flex-1 bg-muted/40 border border-border rounded-lg px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSection();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSection}
              className="p-1 px-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="border border-border/50 rounded-xl p-2 bg-muted/5 space-y-1.5 max-h-48 overflow-y-auto">
            {sections.map((sec, idx) => {
              const isEditing = editingSectionIndex === idx;
              return (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center justify-between p-2 bg-background border border-border/80 rounded-lg text-xs transition-all shadow-xs cursor-move ${
                    draggedIndex === idx ? 'opacity-40 scale-95 border-primary' : 'hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0 cursor-grab" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingSectionValue}
                        onChange={(e) => setEditingSectionValue(e.target.value)}
                        onBlur={() => handleRenameSection(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleRenameSection(idx);
                          } else if (e.key === 'Escape') {
                            setEditingSectionIndex(null);
                          }
                        }}
                        autoFocus
                        className="bg-transparent border-b border-primary/50 outline-none w-full text-xs font-semibold py-0"
                      />
                    ) : (
                      <span
                        onDoubleClick={() => {
                          setEditingSectionIndex(idx);
                          setEditingSectionValue(sec);
                        }}
                        className="font-semibold text-foreground cursor-pointer select-none"
                        title="Double click to rename"
                      >
                        {sec}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSection(sec)}
                    className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent Select Checklist with Colored Dots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase block">Default Models</label>
            <div className="space-y-1.5 border border-border/50 rounded-xl p-2.5 bg-muted/5">
              {(Object.keys(AGENT_LABELS) as AgentKey[]).map((key) => {
                const dotColor = AGENT_COLORS[key];
                return (
                  <label key={key} className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(key)}
                      onChange={() => handleAgentToggle(key)}
                      className="rounded border-border text-primary focus:ring-primary/20"
                    />
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                    <span>{AGENT_LABELS[key]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Data Sources select list */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase block">Default Data Sources</label>
            <div className="space-y-1.5 border border-border/50 rounded-xl p-2.5 bg-muted/5 max-h-36 overflow-y-auto">
              {DATA_SOURCES.map((ds) => (
                <label key={ds.id} className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(ds.id)}
                    onChange={() => handleSourceToggle(ds.id)}
                    className="rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span>{ds.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Output format radio group */}
        <div className="space-y-2 pt-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase block">Output File Format</label>
          <div className="flex gap-4">
            {['pdf', 'ppt', 'doc'].map((fmt) => (
              <label key={fmt} className="flex items-center gap-1.5 cursor-pointer font-semibold text-foreground">
                <input
                  type="radio"
                  name="format"
                  value={fmt}
                  checked={outputFormat === fmt}
                  onChange={() => setOutputFormat(fmt as any)}
                  className="text-primary focus:ring-primary/20 border-border"
                />
                {fmt.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="flex items-center justify-between border-t border-border/50 pt-4 gap-2">
        {template && onDelete && (
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-destructive/10 hover:bg-destructive/15 text-destructive border border-destructive/20 cursor-pointer mr-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Template
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background rounded-2xl shadow-xl p-6 max-w-sm text-xs">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-bold text-foreground">Delete Template?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground">
                  Are you sure you want to delete the "{template.name}" template? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-2 pt-4">
                <AlertDialogCancel className="cursor-pointer text-xs font-semibold py-1.5 px-3">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={executeDelete}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-1.5 px-4 rounded-md text-xs cursor-pointer"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <div className="flex gap-2 ml-auto font-semibold">
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-3 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-1.5 px-4 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            Save Template
          </button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
