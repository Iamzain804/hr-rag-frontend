import React from "react";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Building2,
  FolderTree,
  Users,
  ShieldCheck,
  Bell,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

export function Sidebar({ activeTab, setActiveTab }) {
  const { hasPermission, hasAnyPermission } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  // Construct dynamic menu items purely from permissions
  const menuItems = [
    {
      id: "overview",
      label: "System Overview",
      icon: LayoutDashboard,
      visible: true,
    },
    {
      id: "rag-chat",
      label: "HR Assistant Chat",
      icon: MessageSquare,
      permission: "chat_rag",
      visible: hasPermission("chat_rag"),
    },
    {
      id: "branches",
      label: "Branches",
      icon: Building2,
      permission: "view_org",
      visible: hasAnyPermission(["view_org", "manage_org"]),
    },
    {
      id: "departments",
      label: "Departments",
      icon: FolderTree,
      permission: "view_org",
      visible: hasAnyPermission(["view_org", "manage_org"]),
    },
    {
      id: "ingestion",
      label: "Documents & Policies",
      icon: FileText,
      permission: "upload_documents",
      visible: hasPermission("upload_documents"),
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      permission: "view_users",
      visible: hasAnyPermission(["view_users", "manage_users"]),
    },
    {
      id: "rbac",
      label: "RBAC & Permissions",
      icon: ShieldCheck,
      permission: "manage_roles",
      visible: hasAnyPermission(["manage_roles", "manage_permissions"]),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      permission: "manage_notifications",
      visible: hasPermission("manage_notifications"),
    },
  ];

  const visibleItems = menuItems.filter((item) => item.visible);

  return (
    <aside
      className={`border-r border-border bg-surface flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Section */}
      <div className="p-3">
        {/* Navigation Header / Mini Toggle */}
        <div className="flex items-center justify-between px-2 mb-3 h-7">
          {!isCollapsed && (
            <span className="text-[11px] uppercase font-bold text-text-secondary tracking-wider">
              Workspace Menu
            </span>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className={`p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all ${
              isCollapsed ? "mx-auto" : ""
            }`}
            title={isCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
          >
            {isCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 text-left group relative select-none ${
                  isActive
                    ? "bg-cherry/10 dark:bg-lime/15 text-cherry dark:text-lime font-bold shadow-xs ring-1 ring-cherry/20 dark:ring-lime/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
              >
                <Icon
                  size={18}
                  className={`shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-cherry dark:text-lime" : "text-text-secondary group-hover:text-text-primary"
                  }`}
                />

                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Hover Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-surface border border-border text-text-primary text-xs font-semibold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
