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
        {/* Dynamic Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area - Full width with responsive fluid padding */}
        <main className={`flex-1 overflow-y-auto bg-bg transition-all duration-300 ${activeTab === "rag-chat" ? "p-0 overflow-hidden" : "p-4 sm:p-6 lg:p-8"}`}>
          {authError && <ErrorBanner message={authError} onRetry={refreshContext} />}
          {sectionError && <ErrorBanner message={sectionError} />}

          {/* Tab: Overview (Default for all authenticated users) */}
          {activeTab === "overview" && (
            <div className="space-y-6 w-full max-w-7xl mx-auto animate-fadeIn">
              <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  System Overview
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Contextual workspace anchored to your verified organizational identity
                </p>
              </div>

              {/* Context Summary Cards - Responsive Fluid Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* User Identity Card */}
                <div className="p-5 border border-border bg-surface rounded-sm hover:border-cherry/40 dark:hover:border-lime/40 transition-colors shadow-2xs">
                  <div className="text-xs uppercase font-bold text-text-secondary tracking-wider mb-2">
                    Identity & Role
                  </div>
                  <div className="text-xl font-bold text-text-primary">
                    {user?.first_name} {user?.last_name || ""}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5 font-mono">{user?.email}</div>
                  <div className="mt-4 inline-block px-2.5 py-0.5 border border-border bg-bg text-xs font-semibold rounded-sm text-cherry dark:text-lime">
                    {user?.role}
                  </div>
                </div>

                {/* Assigned Branch Card */}
                <div className="p-5 border border-border bg-surface rounded-sm hover:border-cherry/40 dark:hover:border-lime/40 transition-colors shadow-2xs">
                  <div className="text-xs uppercase font-bold text-text-secondary tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin size={14} className="text-cherry dark:text-lime" /> Assigned Branch
                  </div>
                  <div className="text-xl font-bold text-text-primary">
                    {user?.branch?.name || "Global / Unassigned"}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {user?.branch?.location || "Universal company-wide access"}
                  </div>
                  {user?.branch?.working_hours && (
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                      <Clock size={13} className="text-cherry dark:text-lime" /> {user.branch.working_hours}
                    </div>
                  )}
                </div>

                {/* Assigned Department Card */}
                <div className="p-5 border border-border bg-surface rounded-sm hover:border-cherry/40 dark:hover:border-lime/40 transition-colors shadow-2xs">
                  <div className="text-xs uppercase font-bold text-text-secondary tracking-wider mb-2 flex items-center gap-1.5">
                    <Building2 size={14} className="text-cherry dark:text-lime" /> Department
                  </div>
                  <div className="text-xl font-bold text-text-primary">
                    {user?.department?.name || "General Organization"}
                  </div>
                  <div className="text-xs text-text-secondary mt-0.5">
                    {user?.department?.description || "All-access corporate department"}
                  </div>
                  {user?.department?.duty_timings && (
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                      <Clock size={13} className="text-cherry dark:text-lime" /> {user.department.duty_timings}
                    </div>
                  )}
                </div>
              </div>

              {/* Verified Permissions Section */}
              <div className="p-6 border border-border bg-surface rounded-sm shadow-2xs">
                <h2 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-cherry dark:text-lime" /> Role Privileges & Permissions
                </h2>
                <p className="text-xs text-text-secondary mb-4">
                  The menu navigation and microservices available to you are dynamically governed by these server-verified permissions:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {permissions.map((perm) => (
                    <div
                      key={perm}
                      className="p-3 border border-border bg-bg rounded-sm flex items-center gap-2.5 text-xs hover:border-cherry/40 dark:hover:border-lime/40 transition-colors"
                    >
                      <CheckCircle2 size={15} className="text-cherry dark:text-lime shrink-0" />
                      <span className="font-mono font-medium truncate">{perm}</span>
                    </div>
                  ))}
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
          {activeTab === "rbac" && (
            <div className="space-y-6 w-full max-w-7xl mx-auto animate-fadeIn">
              <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  Roles & Permissions (RBAC)
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Role configurations and assigned privilege matrices
                </p>
              </div>

              {sectionLoading ? (
                <LoadingSpinner message="Loading RBAC matrix..." />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {rolesList.map((r) => (
                    <div key={r.id} className="p-5 border border-border bg-surface rounded-sm hover:border-cherry/40 dark:hover:border-lime/40 transition-colors shadow-2xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-text-primary text-base">{r.name}</div>
                          <span className="text-xs text-cherry dark:text-lime font-semibold">
                            {r.permissions?.length || 0} permissions
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mb-4 leading-relaxed">{r.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
                        {r.permissions?.map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-0.5 border border-border bg-bg text-[11px] font-mono rounded-sm text-cherry dark:text-lime"
                          >
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: RAG Chat */}
          {activeTab === "rag-chat" && <ChatView />}

          {/* Tab: Document Ingestion */}
          {activeTab === "ingestion" && <DocumentIngestionView />}

          {/* Tab: Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-6 w-full max-w-7xl mx-auto animate-fadeIn">
              <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  Notification Dispatcher
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Connected to Notification Service (Port 8002 via Gmail SMTP)
                </p>
              </div>
              <div className="p-6 border border-border bg-surface rounded-sm shadow-2xs space-y-3">
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
