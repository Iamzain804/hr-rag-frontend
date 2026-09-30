import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  MessageSquare,
  FileText,
  Bell,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { ErrorBanner } from "../components/ErrorBanner";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { api } from "../api/client";
import { ChatView } from "../components/chat/ChatView";
import { BranchesView } from "../components/organization/BranchesView";
import { DepartmentsView } from "../components/organization/DepartmentsView";
import { DocumentIngestionView } from "../components/ingestion/DocumentIngestionView";
import { UserManagementView } from "../components/users/UserManagementView";
import { RolesManagementView } from "../components/rbac/RolesManagementView";

export function DashboardPage() {
  const { user, permissions, hasAnyPermission, error: authError, refreshContext } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Dynamic live data for sections
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [userList, setUserList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState("");

  // Fetch relevant section data when tab changes based on permissions
  useEffect(() => {
    let isMounted = true;
    async function loadSectionData() {
      setSectionError("");
      setSectionLoading(true);

      try {
        if (activeTab === "organization" && hasAnyPermission(["view_org", "manage_org"])) {
          const [bData, dData] = await Promise.all([api.getBranches(), api.getDepartments()]);
          if (isMounted) {
            setBranches(bData || []);
            setDepartments(dData || []);
          }
        } else if (activeTab === "users" && hasAnyPermission(["view_users", "manage_users"])) {
          const uData = await api.getUsers();
          if (isMounted) setUserList(uData || []);
        } else if (activeTab === "rbac" && hasAnyPermission(["manage_roles", "manage_permissions"])) {
          const [rData, pData] = await Promise.all([api.getRoles(), api.getPermissions()]);
          if (isMounted) setRolesList(rData || []);
        }
      } catch (err) {
        if (isMounted) setSectionError(err.message || "Failed to load section data from backend");
      } finally {
        if (isMounted) setSectionLoading(false);
      }
    }

    loadSectionData();
    return () => {
      isMounted = false;
    };
  }, [activeTab, hasAnyPermission]);

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main
          className={`flex-1 overflow-y-auto bg-bg transition-all duration-300 ${
            activeTab === "rag-chat" ? "p-0 overflow-hidden" : "p-4 sm:p-6 lg:p-8"
          }`}
        >
          {authError && <ErrorBanner message={authError} onRetry={refreshContext} />}
          {sectionError && <ErrorBanner message={sectionError} />}

          {/* Tab: Overview (Welcoming & Human-Friendly) */}
          {activeTab === "overview" && (
            <div className="space-y-8 w-full max-w-7xl mx-auto animate-fadeIn">
              {/* Top Clean Greeting Header (No Box) */}
              <div className="space-y-1.5 pt-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                  Welcome, {user?.first_name ? `${user.first_name} ${user?.last_name || ""}`.trim() : (user?.username || user?.role || "User")} 👋
                </h1>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Your workplace assistant is ready. Ask policy questions, check medical & leave benefits, or manage team directories with ease.
                </p>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab("rag-chat")}
                    className="p-4 rounded-2xl border border-border/80 bg-surface hover:border-cherry/50 dark:hover:border-lime/50 hover:bg-surface-hover transition-all text-left group shadow-xs hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="w-10 h-10 rounded-xl bg-cherry/10 dark:bg-lime/10 border border-cherry/20 dark:border-lime/20 flex items-center justify-center text-cherry dark:text-lime">
                        <MessageSquare size={18} />
                      </div>
                      <ArrowRight size={15} className="text-text-secondary group-hover:text-cherry dark:group-hover:text-lime group-hover:translate-x-1 transition-all" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-text-primary group-hover:text-cherry dark:group-hover:text-lime transition-colors">
                        Ask HR Assistant
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Instant answers on benefits & policies
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("branches")}
                    className="p-4 rounded-2xl border border-border/80 bg-surface hover:border-cherry/50 dark:hover:border-lime/50 hover:bg-surface-hover transition-all text-left group shadow-xs hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <MapPin size={18} />
                      </div>
                      <ArrowRight size={15} className="text-text-secondary group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-text-primary group-hover:text-blue-500 transition-colors">
                        Office Locations
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Global branches & working hours
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("users")}
                    className="p-4 rounded-2xl border border-border/80 bg-surface hover:border-cherry/50 dark:hover:border-lime/50 hover:bg-surface-hover transition-all text-left group shadow-xs hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                        <Users size={18} />
                      </div>
                      <ArrowRight size={15} className="text-text-secondary group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-text-primary group-hover:text-purple-500 transition-colors">
                        Team Directory
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Colleagues & assigned departments
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("ingestion")}
                    className="p-4 rounded-2xl border border-border/80 bg-surface hover:border-cherry/50 dark:hover:border-lime/50 hover:bg-surface-hover transition-all text-left group shadow-xs hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                        <FileText size={18} />
                      </div>
                      <ArrowRight size={15} className="text-text-secondary group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-text-primary group-hover:text-amber-500 transition-colors">
                        Knowledge Base
                      </div>
                      <p className="text-xs text-text-secondary mt-0.5">
                        Official company documents & policies
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Context Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* User Identity Card */}
                <div className="p-6 border border-border/80 bg-surface rounded-2xl hover:border-cherry/40 dark:hover:border-lime/40 transition-all shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-text-secondary tracking-wider">
                      Your Profile
                    </span>
                    <span className="px-2.5 py-0.5 border border-border/80 bg-bg text-xs font-bold rounded-full text-cherry dark:text-lime uppercase">
                      {user?.role}
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-text-primary">
                      {user?.first_name} {user?.last_name || ""}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5 font-mono">{user?.email}</div>
                  </div>
                  <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <UserCheck size={14} />
                    <span>Active Verified Account</span>
                  </div>
                </div>

                {/* Assigned Branch Card */}
                <div className="p-6 border border-border/80 bg-surface rounded-2xl hover:border-cherry/40 dark:hover:border-lime/40 transition-all shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-text-secondary tracking-wider flex items-center gap-1.5">
                      <MapPin size={14} className="text-cherry dark:text-lime" /> Assigned Branch
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-text-primary">
                      {user?.branch?.name || "Global / Universal"}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">
                      {user?.branch?.location || "Company-wide access across all locations"}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-text-secondary font-medium">
                    <Clock size={13} className="text-cherry dark:text-lime" />
                    <span>Working Hours: {user?.branch?.working_hours || "09:00 - 18:00"}</span>
                  </div>
                </div>

                {/* Assigned Department Card */}
                <div className="p-6 border border-border/80 bg-surface rounded-2xl hover:border-cherry/40 dark:hover:border-lime/40 transition-all shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-text-secondary tracking-wider flex items-center gap-1.5">
                      <Building2 size={14} className="text-cherry dark:text-lime" /> Department
                    </span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-text-primary">
                      {user?.department?.name || "General Team"}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5 truncate">
                      {user?.department?.description || "All-access organizational department"}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border/60 flex items-center gap-2 text-xs text-text-secondary font-medium">
                    <Clock size={13} className="text-cherry dark:text-lime" />
                    <span>Duty Timings: {user?.department?.duty_timings || "Standard Schedule"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Branches Management */}
          {activeTab === "branches" && <BranchesView />}

          {/* Tab: Departments Management */}
          {activeTab === "departments" && <DepartmentsView />}

          {/* Tab: User Management */}
          {activeTab === "users" && <UserManagementView />}

          {/* Tab: RBAC */}
          {activeTab === "rbac" && <RolesManagementView />}

          {/* Tab: RAG Chat */}
          {activeTab === "rag-chat" && <ChatView />}

          {/* Tab: Document Ingestion */}
          {activeTab === "ingestion" && <DocumentIngestionView />}

          {/* Tab: Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-6 w-full max-w-7xl mx-auto animate-fadeIn">
              <div className="border-b border-border/70 pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  Notification Dispatcher
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Connected to Notification Service via Gmail SMTP
                </p>
              </div>
              <div className="p-6 border border-border/80 bg-surface rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-cherry dark:text-lime">
                  <Bell size={16} /> SMTP Status: Operational
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Automated onboarding credential dispatch, password reset emails, and notification broadcasts are configured and active through microservice event handlers.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

