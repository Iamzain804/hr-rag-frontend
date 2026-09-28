import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="p-3 mb-4 border border-border bg-surface text-text-primary rounded-sm flex items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-text-primary" />
        <span className="text-sm font-medium leading-5">{message}</span>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs font-semibold underline text-text-primary flex items-center gap-1 hover:opacity-80 shrink-0"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  );
}
