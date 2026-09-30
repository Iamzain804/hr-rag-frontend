import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  User,
  Paperclip,
  AlertTriangle,
  CheckCircle2,
  Flag,
  Copy,
  Check,
} from "lucide-react";
import { CrocodileLogo } from "../CrocodileLogo";

/**
 * Clean internal citations from text before markdown rendering
 */
function cleanCitations(text) {
  if (!text) return "";
  return text
    .replace(/[\[【]\s*source\s*:\s*[^\]】]+[\]】]/gi, "")
    .replace(/[\[【]\s*verified company document\s*[^\]】]*[\]】]/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Detect if text contains native Arabic / Urdu Unicode script
 */
function isUrduScript(text) {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Custom Markdown Components with Tailwind Styling
 */
const MarkdownComponents = {
  h1: ({ node, ...props }) => (
    <h1 className="text-base font-bold text-text-primary mt-3 mb-1.5 border-b border-border/50 pb-1" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-sm font-bold text-text-primary mt-2.5 mb-1" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary mt-2 mb-1" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="text-sm leading-relaxed my-1" {...props} />
  ),
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-text-primary" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc list-inside space-y-1 my-1.5 text-sm pl-1" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal list-inside space-y-1 my-1.5 text-sm pl-1 font-mono text-xs" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="text-sm leading-relaxed" {...props} />
  ),
  table: ({ node, ...props }) => (
    <div className="overflow-x-auto my-3 border border-border rounded-sm">
      <table className="min-w-full divide-y divide-border text-xs" {...props} />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <thead className="bg-bg/80 text-text-primary font-bold uppercase tracking-wider" {...props} />
  ),
  tbody: ({ node, ...props }) => (
    <tbody className="divide-y divide-border/60 bg-surface/50" {...props} />
  ),
  tr: ({ node, ...props }) => (
    <tr className="hover:bg-bg/40 transition-colors" {...props} />
  ),
  th: ({ node, ...props }) => (
    <th className="px-3 py-2 text-left font-bold border-r last:border-r-0 border-border" {...props} />
  ),
  td: ({ node, ...props }) => (
    <td className="px-3 py-2 text-text-secondary border-r last:border-r-0 border-border/60 font-medium" {...props} />
  ),
  code: ({ node, inline, ...props }) =>
    inline ? (
      <code className="px-1 py-0.5 mx-0.5 bg-bg border border-border rounded-sm font-mono text-xs text-cherry dark:text-lime" {...props} />
    ) : (
      <pre className="p-2.5 my-2 bg-bg border border-border rounded-sm overflow-x-auto font-mono text-xs text-text-primary">
        <code {...props} />
      </pre>
    ),
};

export function ChatMessage({ message, isStreaming = false, onFlagToHR }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);
  const [flagged, setFlagged] = React.useState(false);

  const rawContent = message.content || "";
  const cleanedContent = cleanCitations(rawContent);
  const isUrdu = isUrduScript(cleanedContent);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFlag = () => {
    setFlagged(true);
    if (onFlagToHR) onFlagToHR(message);
  };

  // Detect unverified employee attachment context vs verified company docs
  const hasUnverifiedContext =
    rawContent.toLowerCase().includes("based on what you shared") ||
    rawContent.toLowerCase().includes("based on the attached document") ||
    rawContent.toLowerCase().includes("aapke share kiye gaye") ||
    rawContent.includes("آپ کی شیئر کردہ");

  // Detect localized fallback messages
  const isFallbackMessage =
    rawContent.toLowerCase().includes("isn't covered in company documents") ||
    rawContent.toLowerCase().includes("flagged to hr") ||
    rawContent.toLowerCase().includes("documents mein is baare mein koi information") ||
    rawContent.includes("دستاویزات میں اس بارے میں معلومات موجود نہیں");

  return (
    <div
      className={`py-4 px-4 sm:px-6 transition-colors ${
        isUser
          ? "bg-bg/40 border-b border-border/40"
          : "bg-surface border-b border-border"
      }`}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-sm bg-tone-2 border border-border flex items-center justify-center text-text-secondary">
              <User size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-sm bg-surface border border-border flex items-center justify-center shadow-xs">
              <CrocodileLogo size={22} />
            </div>
          )}
        </div>

        {/* Message Content Body */}
        <div className={`flex-1 space-y-2 overflow-hidden ${isUrdu ? "text-right" : "text-left"}`}>
          {/* Header info */}
          <div className="flex items-center justify-between" dir="ltr">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
                {isUser ? "You" : "HR Assistant"}
              </span>

              {!isUser && hasUnverifiedContext && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-sm">
                  <AlertTriangle size={10} />
                  Includes Employee Attachment Context
                </span>
              )}

              {!isUser && !hasUnverifiedContext && !isFallbackMessage && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border border-border bg-bg text-cherry dark:text-lime rounded-sm">
                  <CheckCircle2 size={10} />
                  Verified Company Policy
                </span>
              )}
            </div>

            {/* Message Actions */}
            {!isUser && !isStreaming && (
              <button
                type="button"
                onClick={copyToClipboard}
                title="Copy response"
                className="text-text-secondary hover:text-text-primary p-1 rounded-sm hover:bg-bg transition-colors"
              >
                {copied ? <Check size={14} className="text-cherry dark:text-lime" /> : <Copy size={14} />}
              </button>
            )}
          </div>

          {/* Ephemeral Attachment Preview (if User message has attachment) */}
          {isUser && message.has_attachment && (
            <div className="p-2.5 border border-border bg-bg rounded-sm text-xs space-y-1 my-2" dir="ltr">
              <div className="flex items-center gap-1.5 font-semibold text-cherry dark:text-lime">
                <Paperclip size={13} />
                <span>Attachment Attached (In-Memory)</span>
              </div>
              {message.attachment_text && (
                <p className="text-text-secondary line-clamp-2 italic font-mono text-[11px]">
                  "{message.attachment_text.slice(0, 150)}..."
                </p>
              )}
              <div className="text-[10px] text-text-secondary">
                ⚡ Used only to answer this question — not saved to company records
              </div>
            </div>
          )}

          {/* Main Markdown Formatted Text */}
          <div className="text-text-primary break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
              {cleanedContent}
            </ReactMarkdown>
          </div>

          {/* Streaming Cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-cherry dark:bg-lime animate-pulse ml-0.5 align-middle" />
          )}

          {/* Fallback Question Action Button (Flag to HR) */}
          {!isUser && isFallbackMessage && !isStreaming && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between" dir="ltr">
              <span className="text-xs text-text-secondary">
                Policy document missing? Escalate directly:
              </span>
              <button
                type="button"
                onClick={handleFlag}
                disabled={flagged}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-sm border border-border bg-btn-bg text-btn-text hover:bg-btn-hover disabled:opacity-50 transition-all shadow-sm"
              >
                <Flag size={12} />
                {flagged ? "Flagged to HR Team" : "Flag to HR Department"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
