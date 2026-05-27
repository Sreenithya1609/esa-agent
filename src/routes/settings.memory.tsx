import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MemorySettings } from '@/components/memory/MemorySettings';
import { TemplateLibrary } from '@/components/memory/TemplateLibrary';
import { AnalystPreferences } from '@/components/memory/AnalystPreferences';
import { useMemory } from '@/lib/MemoryContext';
import { useRole } from '@/lib/roleContext';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Brain, Sliders, Database, ShieldAlert, Download, Trash2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/settings/memory')({
  head: () => ({ meta: [{ title: 'System Memory — ESA' }] }),
  component: MemorySettingsPage,
});

function MemorySettingsPage() {
  const { user } = useRole();
  const { governance, setGovernance, clearAllMemory } = useMemory();

  // Dialog step states for Super Admin clear memory
  const [governanceDialogOpen, setGovernanceDialogOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState<1 | 2>(1);
  const [clearText, setClearText] = useState('');

  const isSuperAdmin = user.role === 'super_admin';

  const handleExportAllMemory = () => {
    // Generate mock JSON blob
    const data = {
      brandVoice: localStorage.getItem('esa_brand_voice') || '',
      glossary: JSON.parse(localStorage.getItem('esa_glossary') || '[]'),
      reportSections: JSON.parse(localStorage.getItem('esa_report_sections') || '[]'),
      preferences: JSON.parse(localStorage.getItem('esa_analyst_preferences') || '[]'),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'esa-workspace-memory.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Workspace memory exported', {
      description: 'Downloaded backup configuration file.',
    });
  };

  const handleGovernanceToggle = (field: keyof typeof governance, value: boolean) => {
    setGovernance({
      ...governance,
      [field]: value,
    });
    toast.info('Governance policy updated');
  };

  const handleRetentionChange = (days: number) => {
    setGovernance({
      ...governance,
      retentionDays: days as any,
    });
    toast.success('Data retention period updated', {
      description: `Analytics database logs will be retained for ${days} days.`,
    });
  };

  const triggerClearMemoryFlow = () => {
    setConfirmStep(1);
    setClearText('');
    setGovernanceDialogOpen(true);
  };

  const executeWorkspaceClear = () => {
    clearAllMemory();
    setGovernanceDialogOpen(false);
    toast.success('Workspace memory cleared', {
      description: 'Resets complete. Brand voice, templates, and glossary restored to defaults.',
    });
  };

  return (
    <DashboardLayout title="System Memory">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Tabs defaultValue="org-memory" className="w-full space-y-5">
          {/* Tabs header */}
          <TabsList className="bg-muted/40 border border-border/40 p-1 w-full md:w-auto overflow-x-auto flex justify-start">
            <TabsTrigger value="org-memory" className="flex items-center gap-1.5 text-xs font-semibold px-4 cursor-pointer">
              <Brain className="w-3.5 h-3.5" />
              Organization Memory
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1.5 text-xs font-semibold px-4 cursor-pointer">
              <Sliders className="w-3.5 h-3.5" />
              Templates Library
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-1.5 text-xs font-semibold px-4 cursor-pointer">
              <HelpCircle className="w-3.5 h-3.5" />
              Analyst Preferences
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-1.5 text-xs font-semibold px-4 cursor-pointer">
              <ShieldAlert className="w-3.5 h-3.5" />
              Memory Governance
            </TabsTrigger>
          </TabsList>

          {/* Org Memory */}
          <TabsContent value="org-memory" className="outline-none">
            <MemorySettings />
          </TabsContent>

          {/* Templates Library */}
          <TabsContent value="templates" className="outline-none">
            <TemplateLibrary />
          </TabsContent>

          {/* Habits */}
          <TabsContent value="habits" className="outline-none">
            <AnalystPreferences />
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="outline-none">
            {isSuperAdmin ? (
              <div className="bg-card border border-border/80 rounded-xl p-5 space-y-6 shadow-xs">
                <div className="space-y-0.5 border-b border-border/50 pb-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Memory Governance Policies</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Configure data collection limits, team suggestion rules, and retention settings across the workspace (Super Admin access granted).
                  </p>
                </div>

                {/* Toggles */}
                <div className="space-y-4 text-xs font-semibold text-foreground">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="block">Allow ESA to remember analyst query patterns</span>
                      <span className="text-[10px] text-muted-foreground font-medium block">
                        Stores frequent searches and preferred metrics for personalization.
                      </span>
                    </div>
                    <Switch
                      checked={governance.allowQueryPatterns}
                      onCheckedChange={(val) => handleGovernanceToggle('allowQueryPatterns', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="space-y-0.5">
                      <span className="block">Allow ESA to learn from report feedback</span>
                      <span className="text-[10px] text-muted-foreground font-medium block">
                        Optimizes draft generation using inline refinement actions.
                      </span>
                    </div>
                    <Switch
                      checked={governance.allowFeedbackLearning}
                      onCheckedChange={(val) => handleGovernanceToggle('allowFeedbackLearning', val)}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="space-y-0.5">
                      <span className="block">Include team templates in memory suggestions</span>
                      <span className="text-[10px] text-muted-foreground font-medium block">
                        Enables cross-department sharing of customized analytics widgets.
                      </span>
                    </div>
                    <Switch
                      checked={governance.includeTeamTemplates}
                      onCheckedChange={(val) => handleGovernanceToggle('includeTeamTemplates', val)}
                    />
                  </div>
                </div>

                {/* Retention days */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold">Session Logs Retention Period</span>
                    <span className="text-[10px] text-muted-foreground block">
                      Automatic pruning schedule for older strategy documents and datasets.
                    </span>
                  </div>

                  <select
                    value={governance.retentionDays}
                    onChange={(e) => handleRetentionChange(Number(e.target.value))}
                    className="bg-muted/50 border border-border rounded-lg px-2.5 py-1 outline-none text-xs font-bold"
                  >
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">180 Days</option>
                  </select>
                </div>

                {/* Backup + Destructive */}
                <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-border/50">
                  <button
                    onClick={handleExportAllMemory}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-muted hover:bg-muted/80 border border-border rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    Export All Memory Data
                  </button>
                  <button
                    onClick={triggerClearMemoryFlow}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Workspace Memory
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border/80 rounded-xl p-6 space-y-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Super Admin Access Required</h3>
                <p className="text-[11px] text-muted-foreground max-w-sm leading-relaxed">
                  Only users with Super Administrator privileges can modify organization memory policies and delete workspace databases.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Double confirmation Modal for workspace memory clear */}
      <AlertDialog open={governanceDialogOpen} onOpenChange={setGovernanceDialogOpen}>
        <AlertDialogContent className="bg-background rounded-2xl shadow-xl p-6 max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              {confirmStep === 1 ? 'Clear Workspace Memory?' : 'Confirm Workspace Erase'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {confirmStep === 1 ? (
                'You are about to erase the entire corporate memory system for this workspace. This will reset the Brand Voice Guidelines, delete all custom glossary entries, and remove custom templates.'
              ) : (
                'This action is IRREVERSIBLE. To proceed with the deletion, please type "CLEAR" in the field below to confirm.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {confirmStep === 2 && (
            <div className="py-2 space-y-1">
              <input
                type="text"
                value={clearText}
                onChange={(e) => setClearText(e.target.value)}
                placeholder="Type CLEAR to confirm"
                className="w-full bg-muted/40 border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-destructive/40"
              />
            </div>
          )}

          <AlertDialogFooter className="pt-4 flex gap-2">
            <AlertDialogCancel className="cursor-pointer text-xs font-semibold py-1.5 px-3">
              Cancel
            </AlertDialogCancel>
            
            {confirmStep === 1 ? (
              <button
                onClick={() => setConfirmStep(2)}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-1.5 px-4 rounded-md text-xs cursor-pointer"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={executeWorkspaceClear}
                disabled={clearText !== 'CLEAR'}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-1.5 px-4 rounded-md text-xs disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                Erase Everything
              </button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
