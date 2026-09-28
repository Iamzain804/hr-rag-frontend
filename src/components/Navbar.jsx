import React from "react";
import { LogOut, User as UserIcon, Building, PanelLeftClose, PanelLeft, Menu } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggle } from "./ThemeToggle";
import { CrocodileLogo } from "./CrocodileLogo";

export function Navbar() {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <header className="h-16 border-b border-border bg-surface px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Left: DeepSeek-style Toggle Button + Crocodile Mascot Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 border border-border bg-bg hover:bg-surface-hover rounded-sm text-text-secondary hover:text-text-primary transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-cherry dark:focus:ring-lime"
          title={isCollapsed ? "Expand Sidebar Menu (Ctrl+B)" : "Collapse Sidebar Menu (Ctrl+B)"}
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Crocodile Mascot Brand */}
        <CrocodileLogo size="md" withText={true} subtitle="Enterprise Assistant" />

        <span className="hidden md:inline-block text-[10px] px-2 py-0.5 border border-border bg-bg text-text-secondary rounded-sm uppercase tracking-wider font-semibold font-mono">
          Microservices RAG
        </span>
      </div>

      {/* Right: User Context + Theme Toggle + Sign Out */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Context Info Badge */}
        {user && (
          <div className="flex items-center gap-2.5 text-xs text-text-secondary border-r border-border pr-3 sm:pr-4">
            <div className="text-right">
              <div className="font-bold text-text-primary text-xs sm:text-sm flex items-center justify-end gap-1.5">
                <UserIcon size={14} className="text-cherry dark:text-lime" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {user.first_name} {user.last_name || ""}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="px-1.5 py-0.2 border border-border bg-bg text-cherry dark:text-lime font-bold rounded-sm text-[10px] uppercase">
                  {user.role}
                </span>
                {user.branch && (
                  <span className="hidden sm:flex items-center gap-1 text-[11px]">
                    <Building size={11} /> {user.branch.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Light/Dark Mode Toggle */}
        <ThemeToggle />

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2 border border-border bg-bg text-text-primary rounded-sm hover:border-cherry dark:hover:border-vibrantRed hover:text-cherry dark:hover:text-vibrantRed transition-all shadow-2xs active:scale-95"
          title="Sign Out"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
