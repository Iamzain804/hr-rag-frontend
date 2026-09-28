import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 border border-border bg-surface text-text-primary rounded-sm hover:opacity-85 transition-opacity flex items-center justify-center ${className}`}
      aria-label="Toggle light and dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={16} className="text-text-primary" /> : <Moon size={16} className="text-text-primary" />}
    </button>
  );
}
