import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MOCK_USER, MOCK_REPORTS, MOCK_AUDIT, type AgentKey, AGENT_META } from "@/lib/mockData";
import {
  User, Building2, Bot, Database, Bell, Shield, Key, CreditCard, Palette, BookOpen,
  Eye, Copy, Zap, Camera, MapPin, Calendar, Clock, ArrowRight, Plus,
  Trash2, EyeOff, Save, CheckCircle2, AlertTriangle, AlertCircle, FileText, Globe,
  Search, ArrowUpDown, ExternalLink, UserMinus, MoreHorizontal, Check, X, LogOut,
  ShieldAlert, Download, Sliders, Edit2, Lock, CheckCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — ESA" }] }),
  component: ProfilePage,
});

// Helper functions for local storage persistence
const getStored = (key: string, fallback: any) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key: string, val: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

const inputClass = "w-full h-9 px-3 rounded-lg bg-surface border border-border-strong text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

function ProfilePage() {
  // Tab states
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Profile Photo state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => localStorage.getItem("esa_profile_photo") || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal Info state
  const [personalInfo, setPersonalInfo] = useState(() => getStored("esa_personal_info", {
    name: MOCK_USER.name,
    designation: MOCK_USER.designation,
    department: "Strategy",
    manager: "Rahul Sharma",
    phone: "+91 98765 43210",
  }));
  const [tempPersonalInfo, setTempPersonalInfo] = useState({ ...personalInfo });
  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);

  // Organization state
  const [orgInfo, setOrgInfo] = useState(() => getStored("esa_org_info", {
    workspace: MOCK_USER.workspace,
    industry: MOCK_USER.industry,
    teamSize: "11-50",
    country: MOCK_USER.country,
    timezone: "GMT+5:30 (Asia/Kolkata)",
  }));
  const [tempOrgInfo, setTempOrgInfo] = useState({ ...orgInfo });
  const [editingOrgInfo, setEditingOrgInfo] = useState(false);

  // Agent Preferences state
  const [agentPreferences, setAgentPreferences] = useState<Record<AgentKey, boolean>>(() => getStored("esa_agent_preferences", {
    strategy: true,
    data: true,
    search: true,
    research: true,
  }));

  // Activity tab filters
  const [activitySearch, setActivitySearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("All");
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 5;

  // Reports state
  const [reports, setReports] = useState(() => getStored("esa_user_reports", MOCK_REPORTS));
  const [reportsSearch, setReportsSearch] = useState("");
  const [reportsFormat, setReportsFormat] = useState("All");

  // Preferences tab state
  const [notifications, setNotifications] = useState(() => getStored("esa_notifications_pref", {
    queryComplete: true,
    reportReady: true,
    teamDigest: false,
    productUpdates: false,
  }));
  const [language, setLanguage] = useState(() => getStored("esa_language_pref", "English"));
  const [currency, setCurrency] = useState<"INR" | "USD">(() => getStored("esa_currency_pref", "INR"));
  const [exportFormat, setExportFormat] = useState(() => getStored("esa_export_pref", "PDF"));

  // Security states
  const [sessions, setSessions] = useState(() => getStored("esa_active_sessions", [
    { id: "s1", device: "MacBook Pro", browser: "Chrome", location: "Mumbai, India", lastActive: "Active Now", ip: "103.45.12.88", current: true },
    { id: "s2", device: "iPhone 15 Pro", browser: "Safari", location: "Mumbai, India", lastActive: "2 hours ago", ip: "103.45.12.91", current: false },
    { id: "s3", device: "Windows Desktop", browser: "Edge", location: "Delhi, India", lastActive: "1 day ago", ip: "182.73.4.22", current: false }
  ]));
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => getStored("esa_2fa_enabled", false));
  const [showQrCode, setShowQrCode] = useState(false);
  const [tfCode, setTfCode] = useState("");
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState(() => getStored("esa_api_keys", [
    { id: "k1", name: "Zapier Integration", scope: "Read, Query", created: "Apr 2, 2026", lastUsed: "2 days ago", status: "Active", key: "esa_live_pk_********************8f2a" },
    { id: "k2", name: "Internal Dashboard", scope: "Read", created: "Mar 18, 2026", lastUsed: "1 hour ago", status: "Active", key: "esa_live_pk_********************cd4e" }
  ]));
  const [apiKeysModalOpen, setApiKeysModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<Record<string, boolean>>({ read: true, query: true, write: false });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Sync state changes with localStorage
  useEffect(() => { setStored("esa_personal_info", personalInfo); }, [personalInfo]);
  useEffect(() => { setStored("esa_org_info", orgInfo); }, [orgInfo]);
  useEffect(() => { setStored("esa_agent_preferences", agentPreferences); }, [agentPreferences]);
  useEffect(() => { setStored("esa_user_reports", reports); }, [reports]);
  useEffect(() => { setStored("esa_notifications_pref", notifications); }, [notifications]);
  useEffect(() => { setStored("esa_language_pref", language); }, [language]);
  useEffect(() => { setStored("esa_currency_pref", currency); }, [currency]);
  useEffect(() => { setStored("esa_export_pref", exportFormat); }, [exportFormat]);
  useEffect(() => { setStored("esa_active_sessions", sessions); }, [sessions]);
  useEffect(() => { setStored("esa_2fa_enabled", twoFactorEnabled); }, [twoFactorEnabled]);
  useEffect(() => { setStored("esa_api_keys", apiKeys); }, [apiKeys]);

  // Profile photo upload handler
  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large", { description: "Please upload an image smaller than 2MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setProfilePhoto(dataUrl);
        localStorage.setItem("esa_profile_photo", dataUrl);
        toast.success("Profile photo updated");
      };
      reader.readAsDataURL(file);
    }
  };

  // Personal Info save/cancel
  const savePersonalInfo = () => {
    if (!tempPersonalInfo.name.trim() || !tempPersonalInfo.designation.trim()) {
      toast.error("Required fields empty", { description: "Name and designation cannot be blank." });
      return;
    }
    setPersonalInfo({ ...tempPersonalInfo });
    setEditingPersonalInfo(false);
    toast.success("Personal information updated");
  };

  const cancelPersonalInfo = () => {
    setTempPersonalInfo({ ...personalInfo });
    setEditingPersonalInfo(false);
  };

  // Org Info save/cancel
  const saveOrgInfo = () => {
    if (!tempOrgInfo.workspace.trim() || !tempOrgInfo.industry.trim()) {
      toast.error("Required fields empty", { description: "Workspace and industry fields are required." });
      return;
    }
    setOrgInfo({ ...tempOrgInfo });
    setEditingOrgInfo(false);
    toast.success("Organization details updated");
  };

  const cancelOrgInfo = () => {
    setTempOrgInfo({ ...orgInfo });
    setEditingOrgInfo(false);
  };

  // Toggle Agent Preference
  const toggleAgent = (key: AgentKey) => {
    setAgentPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      toast.success(`${AGENT_META[key].name} preference updated`, {
        description: `Agent will be ${next[key] ? "included in" : "excluded from"} queries by default.`
      });
      return next;
    });
  };

  // Activity filter logic
  const filteredActivities = MOCK_AUDIT.filter((a) => {
    const matchesSearch =
      a.action.toLowerCase().includes(activitySearch.toLowerCase()) ||
      a.module.toLowerCase().includes(activitySearch.toLowerCase()) ||
      a.ip.includes(activitySearch);
    const matchesType = activityFilter === "All" || a.action.toLowerCase().includes(activityFilter.toLowerCase()) || (activityFilter === "Config" && a.action === "Config Change");
    return matchesSearch && matchesType;
  });

  const paginatedActivities = filteredActivities.slice(
    (activityPage - 1) * activitiesPerPage,
    activityPage * activitiesPerPage
  );
  const totalActivityPages = Math.ceil(filteredActivities.length / activitiesPerPage);

  const exportActivityCsv = () => {
    const headers = "Timestamp,User,Action,Module,IP Address,Status\n";
    const rows = MOCK_AUDIT.map(a => `"${a.time}","${a.user}","${a.action}","${a.module}","${a.ip}","${a.status}"`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `esa-activity-log-${personalInfo.name.replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Activity log CSV generated", { description: "Downloaded backup copy." });
  };

  // Reports filter logic
  const filteredReports = reports.filter((r: any) => {
    const matchesSearch = r.title.toLowerCase().includes(reportsSearch.toLowerCase());
    const matchesFormat = reportsFormat === "All" || r.type === reportsFormat;
    return matchesSearch && matchesFormat;
  });

  const deleteReport = (id: string) => {
    const updated = reports.filter((r: any) => r.id !== id);
    setReports(updated);
    toast.success("Report deleted from workspace");
  };

  // Preferences save
  const handleSavePreferences = () => {
    toast.success("Preferences saved successfully", {
      description: "Default language, currency, and notifications updated."
    });
  };

  // Session revoke
  const revokeSession = (id: string) => {
    const sessionToRevoke = sessions.find((s: any) => s.id === id);
    if (sessionToRevoke?.current) {
      toast.error("Cannot revoke current session", { description: "To log out of this device, please use the Logout button." });
      return;
    }
    setSessions(sessions.filter((s: any) => s.id !== id));
    toast.success("Session revoked", { description: `Access from ${sessionToRevoke?.device} has been terminated.` });
  };

  // 2FA Verification mock
  const handleVerify2fa = () => {
    if (tfCode === "123456") {
      setTwoFactorEnabled(true);
      setShowQrCode(false);
      setTfCode("");
      toast.success("Two-Factor Authentication Enabled", { description: "Your account is now secured with 2FA." });
    } else {
      toast.error("Invalid Code", { description: "Please enter verification code '123456' to verify." });
    }
  };

  // API Key creation
  const handleGenerateApiKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Key name required", { description: "Provide a descriptive label for your key." });
      return;
    }
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const keyString = `esa_live_pk_${randomHex}`;
    setGeneratedKey(keyString);
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast.success("API Key copied to clipboard");
    }
  };

  const handleDoneApiKey = () => {
    if (newKeyName.trim() && generatedKey) {
      const activeScopes = Object.entries(newKeyScopes)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1))
        .join(", ");
      
      const newEntry = {
        id: `k_${Date.now()}`,
        name: newKeyName.trim(),
        scope: activeScopes || "None",
        created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        lastUsed: "Never",
        status: "Active",
        key: `esa_live_pk_${"********************" + generatedKey.slice(-4)}`
      };

      setApiKeys([...apiKeys, newEntry]);
    }
    
    // Reset key generator
    setNewKeyName("");
    setGeneratedKey(null);
    setNewKeyScopes({ read: true, query: true, write: false });
    setApiKeysModalOpen(false);
  };

  const revokeApiKey = (id: string) => {
    const target = apiKeys.find((k: any) => k.id === id);
    setApiKeys(apiKeys.filter((k: any) => k.id !== id));
    toast.success("API Key revoked", { description: `Credentials for "${target?.name}" are no longer active.` });
  };

  // 7-day query activity chart dataset
  const weeklyQueryData = [
    { day: "Mon", queries: 12 },
    { day: "Tue", queries: 19 },
    { day: "Wed", queries: 15 },
    { day: "Thu", queries: 25 },
    { day: "Fri", queries: 18 },
    { day: "Sat", queries: 8 },
    { day: "Sun", queries: 10 },
  ];

  // Initials for avatar fallback
  const initials = personalInfo.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <DashboardLayout title="User Profile" hideRight>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        
        {/* PROFILE HEADER CARD */}
        <div className="relative rounded-2xl border border-border bg-card p-6 md:p-8 overflow-hidden shadow-l1"
             style={{ background: "linear-gradient(135deg, rgba(79,110,247,0.06) 0%, rgba(15,196,167,0.04) 100%)" }}>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Photo Avatar / camera overlay */}
            <div className="relative group shrink-0 cursor-pointer" onClick={handlePhotoClick}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover border border-border shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-[24px] font-semibold shadow-md"
                     style={{ background: "linear-gradient(135deg,#4F6EF7,#9B72F7)" }}>
                  {initials}
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </div>

            {/* Identity details */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-text-primary" style={{ fontFamily: "var(--font-display)" }}>
                  {personalInfo.name}
                </h2>
                <p className="text-xs font-semibold text-text-secondary mt-0.5">
                  {personalInfo.designation} · {orgInfo.workspace}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-text-tertiary">
                    <MapPin className="w-3.5 h-3.5" />
                    {orgInfo.country}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    {MOCK_USER.plan} Plan
                  </span>
                  <span className="text-[11px] text-text-tertiary">
                    Member since Sep 2024
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Toggles */}
            <div className="flex gap-2 shrink-0 md:self-start">
              <button
                onClick={() => setEditingPersonalInfo(true)}
                className="h-8 px-3 rounded-lg border border-border bg-surface hover:bg-secondary text-text-secondary text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border mt-6 pt-5">
            {[
              { label: "Queries this month", value: MOCK_USER.queriesThisMonth, icon: FileText, color: "text-[#4F6EF7]" },
              { label: "Reports generated", value: reports.length, icon: Download, color: "text-[#0FC4A7]" },
              { label: "Agents configured", value: Object.values(agentPreferences).filter(Boolean).length, icon: Zap, color: "text-[#F7924A]" },
              { label: "Session status", value: "Active", icon: Shield, color: "text-[#9B72F7]" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center bg-card shadow-xs border border-border/80 shrink-0", stat.color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">{stat.label}</span>
                    <span className="text-sm font-bold text-text-primary mt-0.5 block leading-none">{stat.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="border-b border-border flex gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview", icon: User },
            { id: "activity", label: "Activity Logs", icon: Clock },
            { id: "reports", label: "Reports", icon: FileText },
            { id: "preferences", label: "Preferences", icon: Sliders },
            { id: "security", label: "Security & API", icon: Shield }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "pb-3.5 text-xs font-bold border-b-2 tracking-wide flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all duration-200",
                  isSelected
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                )}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <div>
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left Column (Forms) */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Personal Information */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Personal Information</h3>
                    {!editingPersonalInfo && (
                      <button onClick={() => setEditingPersonalInfo(true)} className="text-primary hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </div>
                  
                  {editingPersonalInfo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-text-secondary block">Full Name *</label>
                          <input type="text" className={inputClass} value={tempPersonalInfo.name} onChange={(e) => setTempPersonalInfo({ ...tempPersonalInfo, name: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-text-secondary block">Designation *</label>
                          <input type="text" className={inputClass} value={tempPersonalInfo.designation} onChange={(e) => setTempPersonalInfo({ ...tempPersonalInfo, designation: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-text-secondary block">Department</label>
                          <input type="text" className={inputClass} value={tempPersonalInfo.department} onChange={(e) => setTempPersonalInfo({ ...tempPersonalInfo, department: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-text-secondary block">Direct Manager</label>
                          <input type="text" className={inputClass} value={tempPersonalInfo.manager} onChange={(e) => setTempPersonalInfo({ ...tempPersonalInfo, manager: e.target.value })} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[11px] font-bold text-text-secondary block">Phone Number</label>
                          <input type="text" className={inputClass} value={tempPersonalInfo.phone} onChange={(e) => setTempPersonalInfo({ ...tempPersonalInfo, phone: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button onClick={cancelPersonalInfo} className="h-8 px-4 rounded-lg border border-border hover:bg-secondary text-text-secondary text-xs font-semibold cursor-pointer">Cancel</button>
                        <button onClick={savePersonalInfo} className="h-8 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"><Save className="w-3.5 h-3.5" /> Save Changes</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {[
                        { label: "Full Name", value: personalInfo.name },
                        { label: "Email Address", value: MOCK_USER.email, locked: true },
                        { label: "Role / Designation", value: personalInfo.designation },
                        { label: "Department", value: personalInfo.department },
                        { label: "Direct Manager", value: personalInfo.manager },
                        { label: "Phone Number", value: personalInfo.phone },
                      ].map((field, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">{field.label}</span>
                          <div className="flex items-center gap-1.5 text-xs text-text-primary font-medium">
                            {field.value}
                            {field.locked && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-text-tertiary bg-muted px-1.5 py-0.2 rounded">
                                <Lock className="w-2.5 h-2.5" /> SSO Locked
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Organization details */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Organization & Workspace</h3>
                    {!editingOrgInfo && (
                      <button onClick={() => setEditingOrgInfo(true)} className="text-primary hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </div>

                  {editingOrgInfo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-text-secondary block">Workspace Name *</label>
                          <input type="text" className={inputClass} value={tempOrgInfo.workspace} onChange={(e) => setTempOrgInfo({ ...tempOrgInfo, workspace: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-text-secondary block">Industry *</label>
                          <input type="text" className={inputClass} value={tempOrgInfo.industry} onChange={(e) => setTempOrgInfo({ ...tempOrgInfo, industry: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-text-secondary block">Team Size</label>
                          <select className={inputClass} value={tempOrgInfo.teamSize} onChange={(e) => setTempOrgInfo({ ...tempOrgInfo, teamSize: e.target.value })}>
                            <option>1-10</option>
                            <option>11-50</option>
                            <option>51-200</option>
                            <option>200+</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-text-secondary block">Location Country</label>
                          <input type="text" className={inputClass} value={tempOrgInfo.country} onChange={(e) => setTempOrgInfo({ ...tempOrgInfo, country: e.target.value })} />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[11px] font-bold text-text-secondary block">Workspace Timezone</label>
                          <input type="text" className={inputClass} value={tempOrgInfo.timezone} onChange={(e) => setTempOrgInfo({ ...tempOrgInfo, timezone: e.target.value })} />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-2">
                        <button onClick={cancelOrgInfo} className="h-8 px-4 rounded-lg border border-border hover:bg-secondary text-text-secondary text-xs font-semibold cursor-pointer">Cancel</button>
                        <button onClick={saveOrgInfo} className="h-8 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"><Save className="w-3.5 h-3.5" /> Save Changes</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {[
                        { label: "Workspace Hub", value: orgInfo.workspace },
                        { label: "Corporate Industry", value: orgInfo.industry },
                        { label: "Team Size Allocation", value: orgInfo.teamSize },
                        { label: "Operating Country", value: orgInfo.country },
                        { label: "Corporate Timezone", value: orgInfo.timezone },
                      ].map((field, idx) => (
                        <div key={idx} className="space-y-1">
                          <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider block">{field.label}</span>
                          <span className="text-xs text-text-primary font-medium block">{field.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (Preferences & Sparkline) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Agent Preferences */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-4">
                  <div className="pb-2 border-b border-border/50">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Preferred Agents</h3>
                    <p className="text-[10px] text-text-tertiary mt-0.5">Toggle active modules query routing defaults.</p>
                  </div>
                  
                  <div className="space-y-3 pt-1">
                    {(Object.keys(agentPreferences) as AgentKey[]).map((key) => {
                      const meta = AGENT_META[key];
                      const checked = agentPreferences[key];
                      return (
                        <div key={key} className="flex items-center justify-between gap-3 text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
                            <div>
                              <span className="text-text-primary block font-bold leading-none">{meta.name} Agent</span>
                              <span className="text-[9px] text-text-tertiary font-medium">{meta.name === "Search" ? "Internal Docs" : meta.name === "Research" ? "Competitors" : meta.name + " model"}</span>
                            </div>
                          </div>
                          <Switch checked={checked} onCheckedChange={() => toggleAgent(key)} className="scale-90" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Query volume chart */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-4">
                  <div className="pb-2 border-b border-border/50">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">My Query Volume — Last 7 Days</h3>
                  </div>

                  <div className="h-[140px] w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyQueryData}>
                        <XAxis dataKey="day" stroke="#8A93B0" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="#8A93B0" fontSize={9} width={18} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: "rgba(79,110,247,0.04)" }} contentStyle={{ background: "#fff", border: "0.5px solid #D6DCF0", borderRadius: 8, fontSize: 10 }} />
                        <Bar dataKey="queries" fill="#4F6EF7" radius={[4, 4, 0, 0]}>
                          {weeklyQueryData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={index === 3 ? "#4F6EF7" : "rgba(79,110,247,0.6)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ACTIVITY LOGS TAB */}
          {activeTab === "activity" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-4">
              
              {/* Header and filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/50">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">User Activity Audit Logs</h3>
                  <p className="text-[10px] text-text-tertiary">Real-time trails of requests and state actions taken by your identity.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      className={cn(inputClass, "pl-8 w-44 h-8 text-[11px]")}
                      value={activitySearch}
                      onChange={(e) => { setActivitySearch(e.target.value); setActivityPage(1); }}
                    />
                  </div>
                  
                  <select
                    className={cn(inputClass, "w-32 h-8 text-[11px] font-semibold py-0")}
                    value={activityFilter}
                    onChange={(e) => { setActivityFilter(e.target.value); setActivityPage(1); }}
                  >
                    <option value="All">All Actions</option>
                    <option value="Query">Queries</option>
                    <option value="Upload">Uploads</option>
                    <option value="Report">Report Downloads</option>
                    <option value="Login">Logins</option>
                  </select>
                  
                  <button onClick={exportActivityCsv} className="h-8 px-3 rounded-lg border border-border hover:bg-secondary text-xs text-primary font-bold flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <Download className="w-3.5 h-3.5" /> CSV Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-border/60 rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/60 text-text-secondary font-bold text-[10.5px]">
                      <th className="py-2.5 px-4">Timestamp</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Module</th>
                      <th className="py-2.5 px-3">IP Address</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-text-primary">
                    {paginatedActivities.length > 0 ? (
                      paginatedActivities.map((log, idx) => {
                        const isQuery = log.action === "Query";
                        const isUpload = log.action === "Upload";
                        const isDownload = log.action === "Report Download";
                        const isLogin = log.action === "Login";
                        
                        return (
                          <tr key={idx} className="hover:bg-muted/5 font-medium">
                            <td className="py-3 px-4 text-text-tertiary flex items-center gap-1 font-semibold text-[11px] leading-none h-full">
                              <Calendar className="w-3 h-3" /> {log.time.split(" ")[0]} <Clock className="w-3 h-3 ml-1" /> {log.time.split(" ")[1]}
                            </td>
                            <td className="py-3 px-3">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs",
                                isQuery ? "bg-primary/10 border-primary/20 text-primary" :
                                isUpload ? "bg-success/10 border-success/20 text-success" :
                                isDownload ? "bg-info/10 border-info/20 text-info" :
                                isLogin ? "bg-secondary border-border-strong text-text-secondary" :
                                "bg-warning/10 border-warning/20 text-warning"
                              )}>
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-text-primary text-[11px] uppercase tracking-wider">{log.module}</td>
                            <td className="py-3 px-3 text-text-secondary font-mono">{log.ip}</td>
                            <td className="py-3 px-3 text-text-tertiary font-mono">2.4s</td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center gap-1 text-[11px] text-success font-semibold">
                                <CheckCircle className="w-3.5 h-3.5 text-success" /> Success
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-text-tertiary font-medium">No actions matching your filter logs.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalActivityPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] text-text-tertiary font-semibold">Showing {paginatedActivities.length} of {filteredActivities.length} logs</span>
                  <div className="flex gap-1.5">
                    <button
                      disabled={activityPage === 1}
                      onClick={() => setActivityPage(activityPage - 1)}
                      className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary cursor-pointer flex items-center"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalActivityPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setActivityPage(i + 1)}
                        className={cn(
                          "h-8 w-8 rounded-lg text-xs font-bold cursor-pointer",
                          activityPage === i + 1 ? "bg-primary text-white" : "border border-border bg-card hover:bg-secondary"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={activityPage === totalActivityPages}
                      onClick={() => setActivityPage(activityPage + 1)}
                      className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary cursor-pointer flex items-center"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* REPORTS TAB */}
          {activeTab === "reports" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-4">
              
              {/* Filter bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/50">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">My Generated Reports</h3>
                  <p className="text-[10px] text-text-tertiary">Quick access to strategy briefs and exported calculations scoped to you.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search reports..."
                      className={cn(inputClass, "pl-8 w-44 h-8 text-[11px]")}
                      value={reportsSearch}
                      onChange={(e) => setReportsSearch(e.target.value)}
                    />
                  </div>
                  
                  <select
                    className={cn(inputClass, "w-32 h-8 text-[11px] font-semibold py-0")}
                    value={reportsFormat}
                    onChange={(e) => setReportsFormat(e.target.value)}
                  >
                    <option value="All">All Formats</option>
                    <option value="PDF">PDF</option>
                    <option value="PPT">PowerPoint</option>
                    <option value="CSV">CSV Data</option>
                  </select>
                </div>
              </div>

              {/* Grid of Report Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReports.length > 0 ? (
                  filteredReports.map((report: any) => (
                    <div key={report.id} className="bg-surface border border-border rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-2">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-md",
                            report.type === "PDF" ? "bg-red-500/10 text-red-500" :
                            report.type === "PPT" ? "bg-warning/10 text-warning" :
                            "bg-success/10 text-success"
                          )}>
                            {report.type}
                          </span>
                          <span className="text-[10px] text-text-tertiary font-medium">{report.time}</span>
                        </div>
                        <h4 className="text-xs font-bold text-text-primary leading-snug line-clamp-2">{report.title}</h4>
                      </div>
                      
                      <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
                        <div className="flex -space-x-1.5">
                          {report.agents?.map((k: AgentKey) => {
                            const meta = AGENT_META[k];
                            return (
                              <div
                                key={k}
                                className="w-5 h-5 rounded-full flex items-center justify-center border border-background shadow-xs text-[9px] text-white font-bold"
                                style={{ backgroundColor: meta?.color || "#4F6EF7" }}
                                title={meta?.name}
                              >
                                {meta?.name[0]}
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="flex gap-2">
                          <button onClick={() => toast.success(`Downloading ${report.title}`)} className="p-1.5 hover:bg-muted text-text-secondary hover:text-primary rounded-lg transition-colors cursor-pointer" title="Download">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => toast.success("Share link copied to clipboard")} className="p-1.5 hover:bg-muted text-text-secondary hover:text-primary rounded-lg transition-colors cursor-pointer" title="Share link">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteReport(report.id)} className="p-1.5 hover:bg-destructive/10 text-text-secondary hover:text-destructive rounded-lg transition-colors cursor-pointer" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center text-text-tertiary font-medium">No reports found matching your parameters.</div>
                )}
              </div>
            </div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === "preferences" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-6">
              <div className="pb-2 border-b border-border/50">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">User Preferences</h3>
                <p className="text-[10px] text-text-tertiary mt-0.5">Customize interface language, notifications frequency, and export settings.</p>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wide block">Notifications Alerts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs font-semibold text-text-primary">
                  {[
                    { id: "queryComplete", label: "Email when query completes", sub: "Get alerts when long running strategy drafts finalize." },
                    { id: "reportReady", label: "Email when reports generate", sub: "Receive copies of PPT and PDF exports directly in mail." },
                    { id: "teamDigest", label: "Weekly team digest summary", sub: "Weekly analytics dashboard query volume summary." },
                    { id: "productUpdates", label: "Product and feature announcements", sub: "Stay informed on new agent models added to ESA." },
                  ].map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5">
                        <span className="block">{item.label}</span>
                        <span className="text-[9.5px] text-text-tertiary font-medium block leading-normal">{item.sub}</span>
                      </div>
                      <Switch
                        checked={(notifications as any)[item.id]}
                        onCheckedChange={(val) => setNotifications({ ...notifications, [item.id]: val })}
                        className="scale-90"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Select configurations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-border pt-6">
                
                {/* Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary block">Interface Language</label>
                  <select
                    className={inputClass}
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>Telugu</option>
                    <option>Spanish</option>
                  </select>
                </div>

                {/* Currency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary block">Display Currency</label>
                  <div className="inline-flex rounded-lg p-1 bg-surface border border-border-strong w-full" style={{ height: "36px" }}>
                    {(["INR", "USD"] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className={cn(
                          "flex-1 rounded-md text-xs font-bold cursor-pointer transition-colors leading-none flex items-center justify-center",
                          currency === c ? "bg-primary text-white" : "text-text-tertiary hover:text-text-primary"
                        )}
                      >
                        {c === "INR" ? "₹ INR" : "$ USD"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default format */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-secondary block">Default Export Format</label>
                  <div className="grid grid-cols-4 gap-1">
                    {["PDF", "PPT", "CSV", "PNG"].map((format) => (
                      <button
                        key={format}
                        onClick={() => setExportFormat(format)}
                        className={cn(
                          "h-9 border rounded-lg text-[11px] font-bold cursor-pointer transition-all",
                          exportFormat === format
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-secondary text-text-secondary"
                        )}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Save row */}
              <div className="border-t border-border pt-4 flex justify-end">
                <button
                  onClick={handleSavePreferences}
                  className="h-9 px-5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* SECURITY & API TAB */}
          {activeTab === "security" && (
            <div className="space-y-6">
              
              {/* SSO card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0 shadow-xs border border-success/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Authentication Identity</h4>
                    <p className="text-[11px] text-text-secondary font-medium leading-relaxed">
                      Your identity is synced to the organization's SSO directory database.
                    </p>
                    <span className="text-[10px] text-text-tertiary block pt-0.5">Connected via Microsoft Azure Directory</span>
                  </div>
                </div>
                
                <span className="text-[11px] font-bold px-3 py-1 bg-success/15 border border-success/35 text-success rounded-full flex items-center gap-1 shadow-2xs self-start md:self-center leading-none">
                  <CheckCircle2 className="w-3.5 h-3.5" /> SSO Authenticated
                </span>
              </div>

              {/* Two Column details: Sessions & 2FA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Sessions */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-4">
                  <div className="pb-1 border-b border-border/50">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Active Device Sessions</h3>
                    <p className="text-[10px] text-text-tertiary mt-0.5">Manage active connection states to your account profile.</p>
                  </div>
                  
                  <div className="space-y-3.5">
                    {sessions.map((sess: any) => (
                      <div key={sess.id} className="flex justify-between items-start gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-text-primary block leading-none">
                            {sess.device} · {sess.browser}
                            {sess.current && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-success/10 text-success rounded border border-success/20 ml-1">Current</span>
                            )}
                          </span>
                          <span className="text-[9.5px] text-text-tertiary font-medium block">
                            {sess.location} • IP: {sess.ip} • Last active: {sess.lastActive}
                          </span>
                        </div>
                        
                        {!sess.current && (
                          <button
                            onClick={() => revokeSession(sess.id)}
                            className="p-1 hover:bg-destructive/10 text-text-tertiary hover:text-destructive rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Revoke access"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="pb-1 border-b border-border/50">
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Two-Factor Security</h3>
                      <p className="text-[10px] text-text-tertiary mt-0.5">Secure your strategical database files with 2FA codes.</p>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs font-semibold pt-4">
                      <div className="space-y-0.5">
                        <span className="block">Enable 2FA OTP Codes</span>
                        <span className="text-[9.5px] text-text-tertiary font-medium block leading-normal">
                          Requires authentication codes from an app like Authenticator.
                        </span>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={(val) => {
                          if (val) {
                            setShowQrCode(true);
                          } else {
                            setTwoFactorEnabled(false);
                            toast.info("Two-Factor Authentication Disabled");
                          }
                        }}
                        className="scale-90"
                      />
                    </div>
                  </div>

                  {showQrCode && (
                    <div className="border border-border/80 bg-muted/20 p-4 rounded-xl space-y-3 mt-4 animate-in fade-in-0 duration-300">
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-foreground flex items-center justify-center shrink-0 rounded border border-border">
                          {/* Simulated QR Code */}
                          <div className="w-16 h-16 bg-white flex flex-wrap p-1">
                            {Array.from({ length: 256 }).map((_, i) => (
                              <div key={i} className={cn("w-1 h-1", (i * 7 + 13) % 5 === 0 || (i * 3 + 47) % 7 === 0 ? "bg-black" : "bg-white")} />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <span className="font-bold text-text-primary block leading-none">Scan QR Code</span>
                          <span className="text-[10px] text-text-tertiary block leading-normal">
                            Scan with Google Authenticator. Verify with code <strong>123456</strong> below.
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Verification Code"
                          maxLength={6}
                          className={cn(inputClass, "font-mono font-bold tracking-widest text-center text-sm")}
                          value={tfCode}
                          onChange={(e) => setTfCode(e.target.value.replace(/\D/g, ""))}
                        />
                        <button onClick={handleVerify2fa} className="h-9 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs">Verify</button>
                      </div>
                    </div>
                  )}

                  {twoFactorEnabled && (
                    <div className="bg-success/5 border border-success/20 p-3 rounded-xl flex items-center gap-2 mt-4 text-xs font-semibold text-success">
                      <CheckCircle2 className="w-4 h-4" /> Account secured with 2FA Authenticator.
                    </div>
                  )}
                </div>
              </div>

              {/* Developer API Keys */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-l1 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Developer API Access Keys</h3>
                    <p className="text-[10px] text-text-tertiary">Integrate workspace calculations and strategy databases via REST endpoints.</p>
                  </div>
                  
                  <Dialog open={apiKeysModalOpen} onOpenChange={(open) => { setApiKeysModalOpen(open); if(!open) { setGeneratedKey(null); setNewKeyName(""); } }}>
                    <DialogTrigger asChild>
                      <button className="h-8 px-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm">
                        <Key className="w-3.5 h-3.5" /> Generate Key
                      </button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-md bg-background rounded-2xl border border-border shadow-2xl p-6">
                      <DialogHeader className="space-y-1">
                        <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wide">Generate REST API Key</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground leading-normal">
                          Create personal developer API credentials. Save the key immediately as it will not be displayed again.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {generatedKey ? (
                        <div className="space-y-4 py-2">
                          <div className="bg-warning/5 border border-warning/35 rounded-xl p-3.5 text-xs text-warning flex gap-3">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-warning" />
                            <div className="space-y-1 font-semibold leading-normal">
                              <span>Copy Key & Secure It</span>
                              <span className="text-[10.5px] text-text-secondary font-medium block">
                                For security compliance, you cannot retrieve this key hash after closing this modal.
                              </span>
                            </div>
                          </div>
                          
                          <div className="relative">
                            <pre className="p-3 bg-muted border border-border rounded-xl font-mono text-[11px] text-foreground font-semibold overflow-x-auto whitespace-pre-wrap select-all pr-12 leading-relaxed">
                              {generatedKey}
                            </pre>
                            <button
                              onClick={handleCopyKey}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 hover:bg-background/80 border border-border-strong bg-background text-text-secondary hover:text-text-primary rounded-lg transition-colors cursor-pointer shadow-xs"
                              title="Copy API Key"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <DialogFooter className="pt-2">
                            <button onClick={handleDoneApiKey} className="w-full h-9 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer">Done</button>
                          </DialogFooter>
                        </div>
                      ) : (
                        <div className="space-y-4 py-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-text-secondary block">Description Label</label>
                            <input
                              type="text"
                              placeholder="e.g. Jenkins Workflow Integration"
                              className={inputClass}
                              value={newKeyName}
                              onChange={(e) => setNewKeyName(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="text-xs font-bold text-text-secondary block">Key Permissions (Scope)</span>
                            <div className="flex gap-4 text-xs font-semibold text-text-primary pt-1">
                              {["read", "query", "write"].map((scope) => (
                                <label key={scope} className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={newKeyScopes[scope]}
                                    onChange={() => setNewKeyScopes({ ...newKeyScopes, [scope]: !newKeyScopes[scope] })}
                                    className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                                  />
                                  <span className="capitalize">{scope}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          
                          <DialogFooter className="pt-4 flex gap-2">
                            <DialogClose asChild>
                              <button className="h-9 px-4 border border-border bg-card hover:bg-secondary text-text-secondary text-xs font-semibold rounded-lg cursor-pointer">Cancel</button>
                            </DialogClose>
                            <button onClick={handleGenerateApiKey} className="h-9 px-5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm">Generate Key</button>
                          </DialogFooter>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                {/* API Keys Table */}
                <div className="overflow-x-auto border border-border/60 rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/60 text-text-secondary font-bold text-[10.5px]">
                        <th className="py-2.5 px-4">Key Label</th>
                        <th className="py-2.5 px-3">Scope</th>
                        <th className="py-2.5 px-3">Created</th>
                        <th className="py-2.5 px-3">Last Used</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-text-primary">
                      {apiKeys.length > 0 ? (
                        apiKeys.map((k: any) => (
                          <tr key={k.id} className="hover:bg-muted/5 font-medium">
                            <td className="py-3 px-4">
                              <span className="font-bold text-text-primary block leading-none">{k.name}</span>
                              <span className="text-[10px] text-text-tertiary font-mono block mt-1">{k.key}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-muted text-text-secondary rounded border border-border-strong">
                                {k.scope}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-text-tertiary font-semibold">{k.created}</td>
                            <td className="py-3 px-3 text-text-secondary font-mono">{k.lastUsed}</td>
                            <td className="py-3 px-3">
                              <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-success/15 border border-success/35 text-success rounded-full">
                                {k.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => revokeApiKey(k.id)}
                                className="text-destructive font-bold hover:underline cursor-pointer"
                              >
                                Revoke
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-text-tertiary font-medium">No API keys created yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
