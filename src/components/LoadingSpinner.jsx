import React from "react";

export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="w-8 h-8 border-2 border-border border-t-text-primary rounded-full animate-spin" />
      {message && <p className="text-sm text-text-secondary">{message}</p>}
    </div>
  );
}
