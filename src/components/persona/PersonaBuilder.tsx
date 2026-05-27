import { useState } from 'react';
import { usePersona, type Persona } from '@/lib/PersonaContext';
import { TEMPLATES } from '@/mock/templates';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  FileText, BarChart2, Globe, Brain, Target, TrendingUp, Users, Shield, Zap, Layers, BookOpen, Star,
  Plus, Trash2, Edit2, Sparkles, Check, Info, ShieldAlert
} from 'lucide-react';
import type { AgentKey } from '@/lib/mockData';
import { toast } from 'sonner';

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

const ICON_MAP = ICON_LIST.reduce((acc, item) => {
  acc[item.name] = item.icon;
  return acc;
}, {} as Record<string, any>);

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

export function PersonaBuilder() {
  const { personas, addPersona, updatePersona, deletePersona } = usePersona();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('TrendingUp');
  const [agents, setAgents] = useState<AgentKey[]>([]);
  const [template, setTemplate] = useState('tpl_2');
  const [customContext, setCustomContext] = useState('');
  const [outputLevel, setOutputLevel] = useState<'technical' | 'executive'>('executive');
  const [assignedTeams, setAssignedTeams] = useState<string[]>([]);
  const [teamInput, setTeamInput] = useState('');

  const handleOpenEdit = (p: Persona) => {
    setSelectedPersona(p);
    setName(p.name);
    setSelectedIcon(p.icon);
    setAgents(p.agents);
    setTemplate(p.defaultTemplate);
    setCustomContext(p.customContext || '');
    setOutputLevel(p.outputLevel);
    setAssignedTeams(p.assignedTeams || []);
    setTeamInput('');
    setEditorOpen(true);
  };

  const handleOpenCreate = () => {
    setSelectedPersona(null);
    setName('');
    setSelectedIcon('TrendingUp');
    setAgents(['strategy']);
    setTemplate('tpl_2');
    setCustomContext('');
    setOutputLevel('executive');
    setAssignedTeams([]);
    setTeamInput('');
    setEditorOpen(true);
  };

  const handleAgentToggle = (key: AgentKey) => {
    setAgents((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );
  };

  const handleTeamAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = teamInput.trim();
      if (val) {
        if (!assignedTeams.includes(val)) {
          setAssignedTeams([...assignedTeams, val]);
        }
        setTeamInput('');
      }
    }
  };

  const handleRemoveTeam = (teamName: string) => {
    setAssignedTeams(assignedTeams.filter((t) => t !== teamName));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Persona name is required');
      return;
    }
    if (agents.length === 0) {
      toast.error('At least one agent must be selected');
      return;
    }

    const payload: Persona = {
      id: selectedPersona?.id || `per_${Date.now()}`,
      name: name.trim(),
      icon: selectedIcon,
      agents,
      suggestedPrompts: selectedPersona?.suggestedPrompts || [
        `Analyze marketing metrics for ${name}`,
        `Find strategic opportunities related to ${name}`,
      ],
      defaultTemplate: template,
      outputLevel,
      customContext: customContext.trim(),
      assignedTeams,
      isDefault: selectedPersona?.isDefault || false,
    };

    if (selectedPersona) {
      updatePersona(selectedPersona.id, payload);
      toast.success('Persona updated successfully');
    } else {
      addPersona(payload);
      toast.success('Custom persona created');
    }
    setEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this custom persona?')) {
      deletePersona(id);
      toast.success('Persona deleted');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-border/50">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Persona Management</h4>
          <p className="text-[11px] text-muted-foreground">
            Configure custom user personas that restrict active agent subsets, default dashboards, and custom context templates.
          </p>
        </div>

        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogTrigger asChild>
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Persona
            </button>
          </DialogTrigger>

          {/* Editor Modal */}
          <DialogContent className="max-w-md p-6 bg-background rounded-2xl shadow-xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                {selectedPersona ? 'Edit User Persona' : 'Create Custom Persona'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Define the model parameters and custom instructions override for this profile.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Persona Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sales Director"
                  disabled={selectedPersona?.isDefault}
                  className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary/50 disabled:opacity-50"
                />
              </div>

              {/* Icon Picker (3x4 Grid) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block">Select Icon</label>
                <div className="grid grid-cols-4 gap-2 border border-border/50 rounded-xl p-2 bg-muted/5">
                  {ICON_LIST.map((ico) => {
                    const Icon = ico.icon;
                    const isSelected = selectedIcon === ico.name;
                    return (
                      <button
                        key={ico.name}
                        type="button"
                        onClick={() => setSelectedIcon(ico.name)}
                        disabled={selectedPersona?.isDefault}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary shadow-xs'
                            : 'border-border hover:bg-muted text-muted-foreground'
                        } disabled:opacity-50`}
                        title={ico.name}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Agents list checklist with colored dots */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block">Active Agents Allocation</label>
                <div className="space-y-1.5 border border-border/50 rounded-xl p-2.5 bg-muted/5">
                  {(Object.keys(AGENT_LABELS) as AgentKey[]).map((key) => {
                    const dotColor = AGENT_COLORS[key];
                    return (
                      <label key={key} className="flex items-center gap-2.5 text-xs font-semibold text-foreground cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={agents.includes(key)}
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

              {/* Teams Tag Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block">Assign to Teams</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-muted/20 border border-border rounded-lg min-h-[36px] items-center">
                  {assignedTeams.map((team) => (
                    <span
                      key={team}
                      className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary px-2 py-0.5 rounded-full"
                    >
                      {team}
                      <button
                        type="button"
                        onClick={() => handleRemoveTeam(team)}
                        className="hover:text-destructive text-primary/70 shrink-0 cursor-pointer font-bold"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={teamInput}
                    onChange={(e) => setTeamInput(e.target.value)}
                    onKeyDown={handleTeamAdd}
                    placeholder={assignedTeams.length === 0 ? "Type and press Enter" : "Add team..."}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder-muted-foreground min-w-[80px]"
                  />
                </div>
              </div>

              {/* Default Template */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block">Default Template Layout</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-lg px-2 py-1.5 outline-none text-xs"
                >
                  {TEMPLATES.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Output Level */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase block">Output Level</label>
                <div className="flex gap-4">
                  {['technical', 'executive'].map((lvl) => (
                    <label key={lvl} className="flex items-center gap-1.5 cursor-pointer font-semibold text-foreground">
                      <input
                        type="radio"
                        name="outputLevel"
                        value={lvl}
                        checked={outputLevel === lvl}
                        onChange={() => setOutputLevel(lvl as any)}
                        className="text-primary focus:ring-primary/20 border-border"
                      />
                      {lvl.toUpperCase()}
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom context prompt */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Custom Context Guidelines</label>
                <textarea
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  placeholder="e.g. Always consider India market first. Our fiscal year ends March 31."
                  className="w-full h-16 bg-muted/40 border border-border rounded-lg p-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50 resize-none"
                />
              </div>
            </div>

            <DialogFooter className="flex items-center justify-end border-t border-border/50 pt-4 gap-2">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="py-1.5 px-3 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="py-1.5 px-4 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                Save Persona
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid of Personas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {personas.map((p) => {
          const Icon = ICON_MAP[p.icon] || Sparkles;
          return (
            <div
              key={p.id}
              className="bg-card border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between min-h-[220px] hover:border-border hover:shadow-sm transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-foreground block truncate max-w-[100px]" title={p.name}>
                        {p.name}
                      </span>
                      {p.isDefault && (
                        <span className="text-[8px] bg-muted text-muted-foreground border border-border/20 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                          Built-In
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {!p.isDefault && (
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Agents list with colored dots */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block">Allocated Agents</span>
                  <div className="flex flex-wrap gap-1">
                    {p.agents.map((ag) => (
                      <span
                        key={ag}
                        className="inline-flex items-center gap-1 text-[9px] font-semibold bg-muted border border-border/30 px-1.5 py-0.2 rounded"
                      >
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: AGENT_COLORS[ag] }} />
                        <span>{AGENT_LABELS[ag]?.replace(' Agent', '')}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assigned Teams */}
                {p.assignedTeams && p.assignedTeams.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase block">Assigned Teams</span>
                    <div className="flex flex-wrap gap-1">
                      {p.assignedTeams.map((team) => (
                        <span
                          key={team}
                          className="text-[9px] font-bold bg-primary/5 text-primary border border-primary/20 px-1.5 py-0.2 rounded-full"
                        >
                          {team}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Template Layout */}
                <div className="text-[10px] leading-relaxed text-muted-foreground">
                  Default Layout:{' '}
                  <span className="font-bold text-foreground">
                    {TEMPLATES.find((t) => t.id === p.defaultTemplate)?.name || p.defaultTemplate}
                  </span>
                </div>
              </div>

              {/* Bottom detail */}
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground border-t border-border/30 pt-2 font-medium">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">
                  {p.customContext || 'No custom instructions override configured.'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
