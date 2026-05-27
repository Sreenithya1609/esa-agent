import { useState } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { TemplateEditor } from './TemplateEditor';
import { TEMPLATES, type Template } from '@/mock/templates';
import {
  FileText, BarChart2, Globe, Brain, Target, TrendingUp, Users, Shield, Zap, Layers, BookOpen, Star,
  Plus, Edit2, Play, CheckCircle
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  FileText,
  BarChart2,
  Globe,
  Brain,
  Target,
  TrendingUp,
  Users,
  Shield,
  Zap,
  Layers,
  BookOpen,
  Star,
};

export function TemplateLibrary() {
  const [templates, setTemplates] = useState<Template[]>(() => {
    try {
      const stored = localStorage.getItem('esa_custom_templates');
      return stored ? JSON.parse(stored) : TEMPLATES;
    } catch {
      return TEMPLATES;
    }
  });

  const [activeDialog, setActiveDialog] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const saveTemplatesToStorage = (updatedList: Template[]) => {
    setTemplates(updatedList);
    localStorage.setItem('esa_custom_templates', JSON.stringify(updatedList));
  };

  const handleUseTemplate = (tpl: Template) => {
    toast.success('Template applied', {
      description: `"${tpl.name}" will be used to structure your next query response.`,
    });
  };

  const handleSaveTemplate = (tpl: Template) => {
    const exists = templates.some((t) => t.id === tpl.id);
    let updated: Template[];
    if (exists) {
      updated = templates.map((t) => (t.id === tpl.id ? tpl : t));
    } else {
      updated = [...templates, tpl];
    }
    saveTemplatesToStorage(updated);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    saveTemplatesToStorage(updated);
  };

  const handleOpenEdit = (tpl: Template) => {
    setSelectedTemplate(tpl);
    setActiveDialog(true);
  };

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setActiveDialog(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border/50">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Template Library</h4>
          <p className="text-[11px] text-muted-foreground">
            Apply or edit execution templates defining multi-agent structures and content sections.
          </p>
        </div>

        {/* Dialog for Edit / Create */}
        <Dialog open={activeDialog} onOpenChange={setActiveDialog}>
          <DialogTrigger asChild>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          </DialogTrigger>
          <TemplateEditor
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onDelete={handleDeleteTemplate}
            onClose={() => setActiveDialog(false)}
          />
        </Dialog>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tpl) => {
          const Icon = ICON_MAP[tpl.icon] || FileText;
          return (
            <div
              key={tpl.id}
              className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between h-[180px] hover:border-border hover:shadow-sm transition-all"
            >
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-foreground truncate max-w-[130px]" title={tpl.name}>
                      {tpl.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(tpl)}
                    className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                    title="Edit Template"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Description */}
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {tpl.description}
                </p>

                {/* Sections Chips preview */}
                <div className="flex flex-wrap gap-1 items-center overflow-hidden max-h-12 pt-1">
                  {tpl.sections.slice(0, 3).map((sec) => (
                    <span
                      key={sec}
                      className="text-[9px] font-bold text-muted-foreground bg-muted border border-border/30 px-2 py-0.2 rounded-full truncate max-w-[80px]"
                    >
                      {sec}
                    </span>
                  ))}
                  {tpl.sections.length > 3 && (
                    <span className="text-[9px] font-bold text-primary px-1">
                      +{tpl.sections.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[10px]">
                <span className="text-muted-foreground font-semibold uppercase">
                  Format: <span className="text-foreground font-bold">{tpl.outputFormat}</span>
                </span>

                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="inline-flex items-center gap-1.5 py-1 px-3 bg-muted hover:bg-primary hover:text-primary-foreground border border-border rounded-lg font-bold transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  Use Template
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
