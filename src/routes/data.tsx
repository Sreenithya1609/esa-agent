import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Upload, FolderOpen, FileSpreadsheet, Database, Cloud, Eye, RefreshCw, Edit2, Trash2, Plus, ShieldAlert } from "lucide-react";
import { MOCK_DATA_SOURCES } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/roleContext";

export const Route = createFileRoute("/data")({
  head: () => ({ meta: [{ title: "Data Sources — ESA" }] }),
  component: DataPage,
});

const CONNECTORS = [
  { name: "Google Drive", desc: "Documents, sheets, slides" },
  { name: "SharePoint", desc: "Microsoft 365 content" },
  { name: "AWS S3", desc: "Object storage buckets" },
  { name: "PostgreSQL", desc: "Relational DB connector" },
  { name: "Snowflake", desc: "Cloud data warehouse" },
  { name: "BigQuery", desc: "Google Cloud DW" },
  { name: "Notion", desc: "Workspace pages & DBs" },
  { name: "HubSpot", desc: "CRM contacts & deals" },
  { name: "Salesforce", desc: "CRM data sync" },
];

function DataPage() {
  const { can } = useRole();
  const canUpload = can("upload_datasets");

  return (
    <DashboardLayout title="Data Sources">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-text-secondary">Connect, upload, and manage everything ESA can reason about.</p>
          {canUpload && (
            <button className="h-9 px-4 rounded-md bg-primary text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Connect Source
            </button>
          )}
        </div>

        {/* Upload Zone (Role-restricted) */}
        {!canUpload ? (
          <div className="rounded-2xl flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-border bg-muted/5">
            <ShieldAlert className="w-8 h-8 text-muted-foreground/50 shrink-0" strokeWidth={1.5} />
            <div className="mt-3 text-[14px] font-bold text-foreground">Upload Access Restricted</div>
            <p className="mt-1 text-[11.5px] text-muted-foreground max-w-md leading-relaxed">
              Your role does not have authorization to upload corporate datasets to this workspace. Please contact your workspace administrator to modify file indexing parameters.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl flex flex-col items-center justify-center text-center py-12 hover:bg-primary/[0.04] transition-colors cursor-pointer"
               style={{ background: "rgba(79,110,247,0.03)", border: "1.5px dashed rgba(79,110,247,0.22)" }}>
            <Upload className="w-8 h-8 text-primary" strokeWidth={1.5} />
            <div className="mt-3 text-[15px] text-text-primary font-semibold">Drop files here or click to browse</div>
            <div className="mt-1 text-[13px] text-text-tertiary">CSV, Excel, JSON, PDF, Word, PPT · Max 50MB</div>
            <button className="mt-4 h-9 px-4 rounded-md border border-border bg-surface text-[13px] text-text-primary flex items-center gap-2 cursor-pointer">
              <FolderOpen className="w-3.5 h-3.5" /> Browse files
            </button>
          </div>
        )}

        <div>
          <h3 className="text-[13px] font-semibold text-text-secondary mb-3">Cloud & Database Connectors</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CONNECTORS.map((c, i) => (
              <div key={c.name} className="bg-surface border border-border-strong rounded-xl p-5 shadow-l1 hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center mb-3">
                    {c.name.includes("PostgreSQL") || c.name.includes("Snowflake") || c.name.includes("BigQuery") ? <Database className="w-4 h-4 text-primary" /> : <Cloud className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="text-[14px] font-semibold text-text-primary">{c.name}</div>
                  <div className="text-[12px] text-text-tertiary mt-1">{c.desc}</div>
                </div>
                <button 
                  disabled={!canUpload}
                  className={cn(
                    "mt-4 h-8 px-3 rounded-md text-[12px] font-medium transition-all w-fit cursor-pointer",
                    i < 2 
                      ? "bg-success/10 text-success cursor-default" 
                      : canUpload 
                        ? "bg-primary text-white hover:bg-primary/90" 
                        : "bg-muted text-muted-foreground/60 cursor-not-allowed"
                  )}
                >
                  {i < 2 ? "Connected ✓" : canUpload ? "Connect" : "Locked 🔒"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[13px] font-semibold text-text-secondary mb-3">Connected Sources</h3>
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-l1 max-w-full overflow-x-auto">
            <table className="w-full text-[13px] min-w-[650px]">
              <thead>
                <tr className="bg-secondary text-[12px] text-text-secondary text-left">
                  {["Name", "Type", "Status", "Last Synced", "Size", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA_SOURCES.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-3 flex items-center gap-2 text-text-primary font-medium">
                      {s.type === "Database" ? <Database className="w-4 h-4 text-text-tertiary" /> :
                       s.type === "Cloud" || s.type === "Google Drive" ? <Cloud className="w-4 h-4 text-text-tertiary" /> :
                       <FileSpreadsheet className="w-4 h-4 text-text-tertiary" />}
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{s.type}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium",
                        s.status === "Active" && "bg-success/10 text-success",
                        s.status === "Syncing" && "bg-warning/10 text-warning",
                        s.status === "Error" && "bg-danger/10 text-danger",
                      )}>
                        {s.status === "Syncing" && <RefreshCw className="inline w-3 h-3 animate-spin mr-1" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-tertiary">{s.lastSync}</td>
                    <td className="px-4 py-3 text-text-tertiary">{s.size}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 text-text-tertiary">
                        <button className="p-1.5 hover:bg-secondary rounded cursor-pointer" title="View Source"><Eye className="w-3.5 h-3.5" /></button>
                        {canUpload && (
                          <>
                            <button className="p-1.5 hover:bg-secondary rounded cursor-pointer" title="Sync Source"><RefreshCw className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 hover:bg-secondary rounded cursor-pointer" title="Edit Connector"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button className="p-1.5 hover:bg-secondary rounded text-danger cursor-pointer" title="Delete Connector"><Trash2 className="w-3.5 h-3.5" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
