import { createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AgentRoster } from '@/components/admin/AgentRoster';
import { PermissionMatrix } from '@/components/admin/PermissionMatrix';
import { LiveActivityFeed } from '@/components/admin/LiveActivityFeed';
import { InstructionProvenance } from '@/components/admin/InstructionProvenance';
import { FunctionLog } from '@/components/admin/FunctionLog';
import { Shield, Settings, History, Terminal } from 'lucide-react';
import { useRole } from '@/lib/roleContext';

export const Route = createFileRoute('/admin/control-room')({
  head: () => ({ meta: [{ title: 'Admin Control Room — ESA' }] }),
  component: ControlRoomPage,
});

function ControlRoomPage() {
  const { user } = useRole();
  const isAdmin = user.role === 'super_admin' || user.role === 'admin';

  if (!isAdmin) {
    return (
      <DashboardLayout title="Control Room">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">Access Denied</h3>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
            You require Administrator permissions to access the ESA Orchestration Control Room. Please request access from your workspace owner.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Control Room">
      <div className="flex flex-col h-[calc(100vh-56px)] bg-muted/5">
        <ResizablePanelGroup direction="horizontal" className="flex-1 h-full">
          
          {/* Left panel: Agent Roster */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35} className="p-4 border-r border-border/40 bg-card">
            <AgentRoster />
          </ResizablePanel>
          
          <ResizableHandle withHandle />

          {/* Centre panel: Admin Tabs */}
          <ResizablePanel defaultSize={45} minSize={35} maxSize={60} className="p-5 overflow-y-auto">
            <Tabs defaultValue="permissions" className="w-full space-y-5">
              
              {/* Tabs List */}
              <TabsList className="bg-muted/40 border border-border/40 p-1 w-full md:w-auto overflow-x-auto flex justify-start">
                <TabsTrigger value="permissions" className="flex items-center gap-1.5 text-xs font-semibold px-4 cursor-pointer">
                  <Settings className="w-3.5 h-3.5" />
                  Access Matrix
                </TabsTrigger>
                <TabsTrigger value="provenance" className="flex items-center gap-1.5 text-xs font-semibold px-4 cursor-pointer">
                  <History className="w-3.5 h-3.5" />
                  Prompt History
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-1.5 text-xs font-semibold px-4 cursor-pointer">
                  <Terminal className="w-3.5 h-3.5" />
                  Function Logs
                </TabsTrigger>
              </TabsList>

              {/* Matrix Tab */}
              <TabsContent value="permissions" className="outline-none">
                <PermissionMatrix />
              </TabsContent>

              {/* Provenance Tab */}
              <TabsContent value="provenance" className="outline-none">
                <InstructionProvenance />
              </TabsContent>

              {/* Function Logs Tab */}
              <TabsContent value="logs" className="outline-none">
                <FunctionLog />
              </TabsContent>

            </Tabs>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right panel: Live Activity Feed */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={40} className="p-4 border-l border-border/40 bg-card">
            <LiveActivityFeed />
          </ResizablePanel>

        </ResizablePanelGroup>
      </div>
    </DashboardLayout>
  );
}
