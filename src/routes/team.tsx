import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, X, Check, Clock, Search } from "lucide-react";
import { MOCK_TEAM } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/roleContext";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team — ESA" }] }),
  component: Team,
});

const ROLES = ["Super Admin", "Admin", "Analyst", "Researcher", "Viewer"];

// Mock pending invites — Abc and Xyz from Simplify
const INITIAL_INVITES = [
  { id: "inv_1", name: "Abc Kumar",  email: "abc@simplify.io",  role: "Analyst",    sent: "2 hours ago",  status: "pending" as const },
  { id: "inv_2", name: "Xyz Sharma", email: "xyz@simplify.io",  role: "Viewer",     sent: "yesterday",    status: "pending" as const },
];

function InviteModal({ onClose, onInvite }: {
  onClose: () => void;
  onInvite: (email: string, role: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Analyst");
  const [sent, setSent] = useState(false);

  function handleSend() {
    if (!email.trim()) return;
    onInvite(email.trim(), role);
    setSent(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#D6DCF0] overflow-hidden"
           style={{ boxShadow: "0 20px 64px rgba(79,110,247,0.14)" }}
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E8F4]">
          <span className="text-[15px] font-semibold text-[#0F1117]">Invite a teammate</span>
          <button onClick={onClose} className="p-1 hover:bg-[#F0F2FA] rounded-md text-[#8A93B0]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4 text-xs">
          {sent ? (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
                <Check className="w-6 h-6 text-[#16A34A]" />
              </div>
              <p className="text-[14px] font-medium text-[#0F1117]">Invite sent to {email}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-[13px] font-medium text-[#0F1117] mb-1.5 block">Email address</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="colleague@company.com"
                  className="w-full h-10 px-3.5 rounded-lg border border-[#D6DCF0] text-[14px] text-[#0F1117] placeholder:text-[#8A93B0] focus:outline-none focus:border-[#4F6EF7] transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-[#0F1117] mb-1.5 block">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-[#D6DCF0] text-[14px] text-[#0F1117] focus:outline-none focus:border-[#4F6EF7] transition-colors appearance-none"
                >
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
                <p className="text-[11px] text-[#8A93B0] mt-1 font-medium leading-relaxed">
                  {role === "Viewer" && "Can view shared reports and charts only."}
                  {role === "Analyst" && "Can upload data and run AI queries."}
                  {role === "Researcher" && "Can run queries and export research reports."}
                  {role === "Admin" && "Can manage team, data sources, and LLM keys."}
                  {role === "Super Admin" && "Full access across all workspaces."}
                </p>
              </div>
              <button
                onClick={handleSend}
                disabled={!email.trim()}
                className="w-full h-10 rounded-lg bg-[#4F6EF7] hover:bg-[#3D5BE8] text-white text-[14px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Send Invite
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const TABS = ["Members", "Pending Invites"];

function Team() {
  const [tab, setTab] = useState("Members");
  const [showInvite, setShowInvite] = useState(false);
  const [invites, setInvites] = useState(INITIAL_INVITES);
  const [members, setMembers] = useState(MOCK_TEAM);
  
  // New split pane and team management states
  const [teams, setTeams] = useState<{ id: string; name: string; description: string; membersCount: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [showManageUsers, setShowManageUsers] = useState(false);

  const { can } = useRole();
  const canInvite = can("invite_users");
  const canAssign = can("assign_roles");

  function handleInvite(email: string, role: string) {
    const name = email.split("@")[0];
    setInvites((prev) => [...prev, {
      id: `inv_${Date.now()}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      role,
      sent: "just now",
      status: "pending" as const,
    }]);
  }

  function handleRoleChange(id: string, role: string) {
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
  }

  function handleRevoke(id: string) {
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }

  function handleCreateTeam() {
    if (!newTeamName.trim()) return;
    const newTeam = {
      id: `team_${Date.now()}`,
      name: newTeamName.trim(),
      description: newTeamDesc.trim() || "Collaborative agency team",
      membersCount: 1
    };
    setTeams((prev) => [...prev, newTeam]);
    setNewTeamName("");
    setNewTeamDesc("");
    setShowNewTeamModal(false);
  }

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Team">
      <div className="flex flex-col min-h-0 bg-[#F8F9FD] h-[calc(100vh-56px)] select-none">
        
        {/* ── HEADER ── */}
        <div className="h-16 px-6 border-b border-[#E4E8F4] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-text-primary">Teams</h2>
              <p className="text-[11px] text-text-tertiary font-semibold leading-none mt-0.5">
                Collaborate across agents, workflows and projects — 1 person online now
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* 1 online pill */}
            <div className="h-7.5 px-3 rounded-full border border-success/20 bg-success/5 flex items-center gap-1.5 text-[11.5px] font-bold text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              1 online
              <div className="w-4.5 h-4.5 rounded-full bg-[#9B72F7] text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                AM
              </div>
            </div>

            {/* Manage Users Button */}
            <button 
              onClick={() => setShowManageUsers(true)}
              className="h-8.5 px-3.5 rounded-lg border border-[#D6DCF0] hover:bg-[#F0F2FA] bg-white text-[12px] font-bold text-text-secondary cursor-pointer transition-all shadow-2xs"
            >
              Manage Users
            </button>

            {/* New Team Button */}
            <button 
              onClick={() => setShowNewTeamModal(true)}
              className="h-8.5 px-3.5 rounded-lg bg-primary hover:bg-[#3D5BE8] text-white text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            >
              + New Team
            </button>
          </div>
        </div>

        {/* ── SPLIT-PANE WORKSPACE ── */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left panel: search and list */}
          <div className="w-72 border-r border-[#E4E8F4] bg-[#F8F9FD] p-3 flex flex-col gap-3 shrink-0 h-full">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-2.5" />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#D6DCF0] bg-white text-[12px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-all"
              />
            </div>

            {/* Teams List */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredTeams.length === 0 ? (
                /* No teams found empty state */
                <div className="text-center py-12 px-4 space-y-1">
                  <span className="text-[12px] font-bold text-text-secondary block">
                    No teams found
                  </span>
                  <span className="text-[10px] text-text-tertiary block font-semibold leading-snug">
                    Try searching another term or create a new team using the button above.
                  </span>
                </div>
              ) : (
                filteredTeams.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTeam(t.id)}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer",
                      selectedTeam === t.id
                        ? "bg-primary/5 border-primary/25 text-primary"
                        : "bg-white border-[#E4E8F4] text-text-secondary hover:border-text-tertiary/40 hover:text-text-primary"
                    )}
                  >
                    <div>
                      <span className="text-[12.5px] font-bold block leading-none">{t.name}</span>
                      <span className="text-[10px] text-text-tertiary block mt-1 font-semibold">
                        {t.description.length > 25 ? t.description.slice(0, 23) + "..." : t.description}
                      </span>
                    </div>
                    <span className="text-[10px] bg-secondary border border-[#D6DCF0] text-text-secondary px-2 py-0.5 rounded font-bold">
                      {t.membersCount} memb
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Details view */}
          <div className="flex-1 bg-white h-full overflow-y-auto flex flex-col">
            {selectedTeam ? (
              /* Selected Team detail card */
              <div className="p-6 max-w-2xl w-full mx-auto space-y-6">
                {(() => {
                  const teamObj = teams.find(t => t.id === selectedTeam);
                  if (!teamObj) return null;
                  return (
                    <>
                      <div className="border-b border-[#E4E8F4] pb-4 space-y-1">
                        <span className="text-[11px] uppercase tracking-wider text-primary font-bold">Active Team</span>
                        <h3 className="text-[20px] font-bold text-text-primary">{teamObj.name}</h3>
                        <p className="text-[12px] text-text-secondary">{teamObj.description}</p>
                      </div>

                      {/* Team workspace mock statistics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border border-[#E4E8F4] rounded-xl p-4 bg-[#F8F9FD]">
                          <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider block">Assigned Agents</span>
                          <span className="text-[18px] font-bold text-text-primary mt-1 block">Strategy & Data</span>
                        </div>
                        <div className="border border-[#E4E8F4] rounded-xl p-4 bg-[#F8F9FD]">
                          <span className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider block">Workflow integrations</span>
                          <span className="text-[18px] font-bold text-text-primary mt-1 block">Active</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              /* Default right panel placeholder matching screenshot */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 animate-in fade-in-50 duration-300">
                <div className="w-14 h-14 rounded-full bg-[#F0F2FA] flex items-center justify-center text-[#8A93B0] shadow-2xs shrink-0">
                  <Plus className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[13.5px] font-bold text-text-secondary block">
                    Select a team to view details
                  </span>
                  <span className="text-[11px] text-text-tertiary block font-semibold max-w-xs leading-relaxed mt-0.5">
                    Click on a team in the sidebar to review active agents, workflow assignments, and team workspace details.
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ── NEW TEAM DIALOG MODAL ── */}
      {showNewTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowNewTeamModal(false)}>
          <div className="absolute inset-0 bg-black/35" />
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl border border-[#D6DCF0] overflow-hidden animate-in zoom-in-95"
            style={{ boxShadow: "0 20px 64px rgba(79,110,247,0.12)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E8F4]">
              <span className="text-[14px] font-bold text-[#0F1117]">Create a new team</span>
              <button onClick={() => setShowNewTeamModal(false)} className="p-1 hover:bg-[#F0F2FA] rounded-md text-[#8A93B0]">
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-[11.5px] font-bold text-text-secondary mb-1.5 block">Team Name *</label>
                <input 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Strategy Operations"
                  className="w-full h-10 px-3 rounded-lg border border-[#D6DCF0] text-[13px] text-text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[11.5px] font-bold text-text-secondary mb-1.5 block">Description</label>
                <textarea 
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="e.g. Focus on e-commerce GTM strategy reviews"
                  className="w-full h-16 p-3 rounded-lg border border-[#D6DCF0] text-[13px] text-text-primary resize-none focus:outline-none focus:border-primary"
                />
              </div>
              <button
                onClick={handleCreateTeam}
                disabled={!newTeamName.trim()}
                className="w-full h-10 rounded-lg bg-primary hover:bg-[#3D5BE8] text-white text-[13px] font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MANAGE USERS MODAL OVERLAY ── */}
      {showManageUsers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowManageUsers(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div 
            className="relative w-full max-w-4xl bg-white rounded-2xl border border-[#D6DCF0] overflow-hidden animate-in zoom-in-95 flex flex-col h-[85vh]"
            style={{ boxShadow: "0 24px 72px rgba(79,110,247,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E8F4] shrink-0">
              <div>
                <span className="text-[15px] font-bold text-[#0F1117] block">Manage Workspace Users</span>
                <span className="text-[11px] text-text-tertiary font-medium">Add, invite and adjust member access roles</span>
              </div>
              <div className="flex gap-2 items-center">
                {canInvite && (
                  <button
                    onClick={() => setShowInvite(true)}
                    className="h-8 px-3 rounded-lg bg-primary hover:bg-[#3D5BE8] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    + Invite User
                  </button>
                )}
                <button onClick={() => setShowManageUsers(false)} className="p-1 hover:bg-[#F0F2FA] rounded-md text-[#8A93B0]">
                  ✕
                </button>
              </div>
            </div>

            {/* Tabs & Table Panel */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex border-b border-[#E4E8F4] gap-4 shrink-0">
                {TABS.map((t) => (
                  <button 
                    key={t} 
                    onClick={() => setTab(t)}
                    className={cn(
                      "pb-2 text-[12.5px] font-bold border-b-2 -mb-px transition-colors cursor-pointer",
                      tab === t ? "text-[#0F1117] border-[#4F6EF7]" : "text-[#8A93B0] border-transparent"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Members Table */}
              {tab === "Members" && (
                <div className="bg-white border border-[#E4E8F4] rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-[12px] text-left">
                    <thead>
                      <tr className="bg-[#F7F8FC] border-b border-[#E4E8F4] text-text-secondary font-semibold">
                        <th className="px-4 py-2.5">Member</th>
                        <th className="px-4 py-2.5">Role</th>
                        <th className="px-4 py-2.5">Team</th>
                        <th className="px-4 py-2.5">Last Active</th>
                        <th className="px-4 py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E8F4] text-text-primary">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-[#F7F8FC]/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                   style={{ background: "linear-gradient(135deg,#4F6EF7,#9B72F7)" }}>
                                {m.initials}
                              </div>
                              <div>
                                <div className="text-[12.5px] font-bold">{m.name}</div>
                                <div className="text-[10px] text-text-tertiary font-semibold">{m.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {canAssign ? (
                              <select
                                value={m.role}
                                onChange={(e) => handleRoleChange(m.id, e.target.value)}
                                className="bg-[#F0F2FA] border border-[#E4E8F4] rounded-lg px-2 py-1 text-[11px] text-[#0F1117] focus:outline-none focus:border-primary transition-colors cursor-pointer"
                              >
                                {ROLES.map((r) => <option key={r}>{r}</option>)}
                              </select>
                            ) : (
                              <span className="text-[11px] text-text-secondary font-bold bg-[#F0F2FA] px-2 py-0.5 rounded border border-[#E4E8F4]">
                                {m.role}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-text-secondary font-medium">{m.team}</td>
                          <td className="px-4 py-3 text-text-tertiary font-medium">{m.lastActive}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold",
                              m.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                            )}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pending Invites */}
              {tab === "Pending Invites" && (
                <div className="space-y-2">
                  {invites.length === 0 && (
                    <div className="text-center py-12 text-[13px] text-text-tertiary font-medium">No pending invites.</div>
                  )}
                  {invites.map((inv) => (
                    <div key={inv.id} className="bg-white border border-[#E4E8F4] rounded-xl px-4 py-3 flex items-center justify-between gap-4 shadow-2xs hover:border-text-tertiary/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 bg-primary/10 text-primary">
                          {inv.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[12.5px] font-bold text-text-primary leading-none">{inv.name}</div>
                          <div className="text-[10px] text-text-tertiary font-semibold mt-1">{inv.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/10 font-bold uppercase tracking-wider">
                          {inv.role}
                        </span>
                        {canInvite && (
                          <button 
                            onClick={() => handleRevoke(inv.id)}
                            className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvite={handleInvite}
        />
      )}
    </DashboardLayout>
  );
}
