import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PersonaBuilder } from '@/components/persona/PersonaBuilder';
import { Users, Shield } from 'lucide-react';
import { useRole } from '@/lib/roleContext';

export const Route = createFileRoute('/settings/personas')({
  head: () => ({ meta: [{ title: 'Persona Management — ESA' }] }),
  component: PersonaSettingsPage,
});

function PersonaSettingsPage() {
  const { user, can } = useRole();
  const hasAccess = can('configure_llm');

  if (!hasAccess) {
    return (
      <DashboardLayout title="Persona Management">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Access Denied</h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            You require LLM configuration permissions to access the Persona Builder page. Please request access from your administrator.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Persona Management">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-border/50">
          <Users className="w-5 h-5 text-primary shrink-0" />
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">User Personas Configuration</h3>
        </div>

        <PersonaBuilder />
      </div>
    </DashboardLayout>
  );
}
