import React from "react";
import {
  Bot,
  User,
  FileText,
  Paperclip,
  AlertTriangle,
  CheckCircle2,
  Flag,
  Copy,
  Check,
} from "lucide-react";
import { CrocodileLogo } from "../CrocodileLogo";

/**
 * Format markdown-like text with bold, bullet points, headers, and code snippets.
 * Automatically removes internal document source citations from the text body.
 */
function FormattedText({ text }) {
  if (!text) return null;

  // Clean any [Source: ...] or 【Source: ...】 tags from display
  const cleanedText = text
    .replace(/[\[【]\s*source\s*:\s*[^\]】]+[\]】]/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Split text into paragraphs / lines
  const lines = cleanedText.split("\n");

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Check if line is a bullet point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-cherry dark:text-lime font-bold mt-0.5">•</span>
              <div>{renderInlineFormatting(content)}</div>
            </div>
          );
        }

        // Check if numbered list (e.g. "1. ")
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-cherry dark:text-lime font-bold font-mono text-xs mt-0.5">
                {numberedMatch[1]}.
              </span>
              <div>{renderInlineFormatting(numberedMatch[2])}</div>
            </div>
          );
        }

        // Standard paragraph
        return <p key={idx}>{renderInlineFormatting(trimmed)}</p>;
      })}
    </div>
  );
}

/**
 * Renders bold (**text**) and inline code (`code`).
 */
function renderInlineFormatting(line) {
  return parseBasicMarkdown(line);
}

function parseBasicMarkdown(text) {
  // Simple bold parser for **bold**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Handle inline `code`
    const codeParts = part.split(/(`[^`]+`)/g);
    return codeParts.map((cPart, ci) => {
      if (cPart.startsWith("`") && cPart.endsWith("`")) {
        return (
          <code
            key={`${i}-${ci}`}
            className="px-1 py-0.5 mx-0.5 bg-bg border border-border rounded-sm font-mono text-xs text-cherry dark:text-lime"
          >
            {cPart.slice(1, -1)}
          </code>
        );
      }
      return cPart;
    });
  });
}

export function ChatMessage({ message, isStreaming = false, onFlagToHR }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);
  const [flagged, setFlagged] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFlag = () => {
    setFlagged(true);
    if (onFlagToHR) onFlagToHR(message);
  };

  // Detect unverified employee attachment context vs verified company docs
  const hasUnverifiedContext =
    message.content.toLowerCase().includes("based on what you shared") ||
    message.content.toLowerCase().includes("based on the attached document") ||
    message.content.toLowerCase().includes("unverified");

  // Detect fallback message
  const isFallbackMessage =
    message.content.toLowerCase().includes("isn't covered in company documents") ||
    message.content.toLowerCase().includes("flagged to hr");

  return (
    <div
      className={`py-4 px-4 sm:px-6 transition-colors ${
        isUser
          ? "bg-bg/40 border-b border-border/40"
          : "bg-surface border-b border-border"
      }`}
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
        <div className="flex-1 space-y-2 overflow-hidden">
          {/* Header info */}
          <div className="flex items-center justify-between">
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
            <div className="p-2.5 border border-border bg-bg rounded-sm text-xs space-y-1 my-2">
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

          {/* Main Formatted Text */}
          <div className="text-text-primary">
            <FormattedText text={message.content} />
          </div>

          {/* Streaming Cursor */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-cherry dark:bg-lime animate-pulse ml-0.5 align-middle" />
          )}

          {/* Fallback Question Action Button (Flag to HR) */}
          {!isUser && isFallbackMessage && !isStreaming && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
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
