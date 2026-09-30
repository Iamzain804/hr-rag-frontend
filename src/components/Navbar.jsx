import React from "react";
import { LogOut, User as UserIcon, Building, PanelLeftClose, PanelLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggle } from "./ThemeToggle";
import { CrocodileLogo } from "./CrocodileLogo";

export function Navbar() {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <header className="h-16 border-b border-border/70 bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      {/* Left: Sidebar Toggle + Crocodile Mascot Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 border border-border/80 bg-bg hover:bg-surface-hover rounded-xl text-text-secondary hover:text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cherry/30 dark:focus:ring-lime/30 shadow-2xs active:scale-95"
          title={isCollapsed ? "Expand Sidebar Menu (Ctrl+B)" : "Collapse Sidebar Menu (Ctrl+B)"}
        >
          {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Mascot Brand */}
        <CrocodileLogo size="md" withText={true} subtitle="Enterprise Assistant" />

        <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 border border-border/80 bg-bg text-text-secondary rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>HR Workplace Hub</span>
        </span>
      </div>

      {/* Right: User Context + Theme Toggle + Sign Out */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Context Info Badge */}
        {user && (
          <div className="flex items-center gap-3 text-xs text-text-secondary border-r border-border/70 pr-3 sm:pr-4">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-text-primary text-xs sm:text-sm truncate max-w-[160px] lg:max-w-[200px]">
                {user.first_name} {user.last_name || ""}
              </div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className="px-2 py-0.5 border border-border/80 bg-bg text-cherry dark:text-lime font-bold rounded-full text-[10px] uppercase">
                  {user.role}
                </span>
                {user.branch && (
                  <span className="hidden md:flex items-center gap-1 text-[11px] text-text-secondary">
                    <Building size={11} /> {user.branch.name}
                  </span>
                )}
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-cherry/10 dark:bg-lime/10 border border-cherry/30 dark:border-lime/30 text-cherry dark:text-lime font-bold flex items-center justify-center text-sm shadow-2xs">
              {(user.first_name?.[0] || "U").toUpperCase()}
            </div>
          </div>
        )}

        {/* Light/Dark Mode Toggle */}
        <ThemeToggle />

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-border/80 bg-bg text-text-primary rounded-xl hover:border-cherry dark:hover:border-vibrantRed hover:text-cherry dark:hover:text-vibrantRed hover:bg-surface transition-all shadow-2xs active:scale-95"
          title="Sign Out"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
