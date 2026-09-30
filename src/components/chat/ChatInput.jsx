import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Square,
  Paperclip,
  FileText,
  Image as ImageIcon,
  X,
  Type,
  HelpCircle,
  Sparkles,
  Search,
  Check,
} from "lucide-react";

export function ChatInput({
  onSendMessage,
  onStopGeneration,
  isStreaming,
  disabled,
}) {
  const [message, setMessage] = useState("");
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentText, setAttachmentText] = useState("");
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedBuffer, setPastedBuffer] = useState("");
  const [deepThinkActive, setDeepThinkActive] = useState(true);
  const [docSearchActive, setDocSearchActive] = useState(true);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if ((!message.trim() && !attachmentFile && !attachmentText.trim()) || isStreaming || disabled) {
      return;
    }

    onSendMessage({
      message: message.trim(),
      attachmentFile,
      attachmentText: attachmentText.trim() || null,
    });

    // Reset fields
    setMessage("");
    setAttachmentFile(null);
    setAttachmentText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentFile(file);
      setAttachmentText("");
    }
  };

  const handleSavePastedText = () => {
    if (pastedBuffer.trim()) {
      setAttachmentText(pastedBuffer.trim());
      setAttachmentFile(null);
      setShowPasteModal(false);
      setPastedBuffer("");
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-surface/90 backdrop-blur-md border-t border-border/70 shrink-0 shadow-lg">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
          className="hidden"
        />

        {/* Attachment Pill Indicator */}
        {(attachmentFile || attachmentText) && (
          <div className="p-2.5 px-3.5 border border-border/80 bg-bg rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-fadeIn">
            <div className="flex items-center gap-2 overflow-hidden">
              {attachmentFile ? (
                attachmentFile.type.startsWith("image/") ? (
                  <ImageIcon size={16} className="text-cherry dark:text-lime shrink-0" />
                ) : (
                  <FileText size={16} className="text-cherry dark:text-lime shrink-0" />
                )
              ) : (
                <Type size={16} className="text-cherry dark:text-lime shrink-0" />
              )}
              <span className="font-semibold text-text-primary truncate max-w-xs">
                {attachmentFile ? attachmentFile.name : `Pasted text (${attachmentText.length} chars)`}
              </span>
              <span className="text-[10px] text-text-secondary hidden md:inline font-mono">
                &bull; Temporary attachment
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <span className="text-[11px] text-text-secondary italic">
                Included with this inquiry only
              </span>
              <button
                type="button"
                onClick={removeAttachment}
                className="p-1 rounded-lg text-text-secondary hover:text-cherry dark:hover:text-vibrantRed hover:bg-surface transition-colors"
                title="Remove attachment"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Floating Input Container Box */}
        <form
          onSubmit={handleSend}
          className="relative border border-border/80 bg-input-bg rounded-2xl focus-within:border-cherry dark:focus-within:border-lime focus-within:ring-2 focus-within:ring-cherry/20 dark:focus-within:ring-lime/20 transition-all p-3 shadow-sm space-y-2.5"
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about leave policies, insurance, allowances, or office timings..."
            disabled={disabled}
            className="w-full bg-transparent border-none outline-none resize-none px-2 py-1 text-sm text-text-primary placeholder:text-text-secondary max-h-48 leading-relaxed font-sans"
          />

          {/* Bottom Toolbar: Mode Pills + Attachments + Send */}
          <div className="flex items-center justify-between pt-1.5 border-t border-border/40 gap-2 flex-wrap">
            {/* Left: Toggles & Attachment buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* DeepThink / Rerank Mode Badge */}
              <button
                type="button"
                onClick={() => setDeepThinkActive((p) => !p)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  deepThinkActive
                    ? "border-cherry/40 dark:border-lime/40 bg-cherry/10 dark:bg-lime/10 text-cherry dark:text-lime shadow-2xs"
                    : "border-border/60 bg-surface text-text-secondary opacity-60 hover:opacity-100"
                }`}
                title="Cross-Encoder Reranking & Precise Document Matching"
              >
                <Sparkles size={12} />
                <span>Deep Reasoning</span>
              </button>

              {/* Document Search Mode Badge */}
              <button
                type="button"
                onClick={() => setDocSearchActive((p) => !p)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  docSearchActive
                    ? "border-cherry/40 dark:border-lime/40 bg-cherry/10 dark:bg-lime/10 text-cherry dark:text-lime shadow-2xs"
                    : "border-border/60 bg-surface text-text-secondary opacity-60 hover:opacity-100"
                }`}
                title="Company Knowledge Base Search"
              >
                <Search size={12} />
                <span>Company Docs</span>
              </button>

              {/* Attachment File Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach PDF, document, or image screenshot"
                disabled={isStreaming || disabled}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-50 ml-1"
              >
                <Paperclip size={17} />
              </button>

              {/* Paste Text Snippet Trigger */}
              <button
                type="button"
                onClick={() => setShowPasteModal(true)}
                title="Paste text snippet"
                disabled={isStreaming || disabled}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors disabled:opacity-50 hidden sm:inline-flex"
              >
                <Type size={17} />
              </button>
            </div>

            {/* Right: Send / Stop Action Button */}
            <div className="shrink-0">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  title="Stop generating response"
                  className="p-2.5 rounded-xl bg-btn-bg text-btn-text hover:bg-btn-hover transition-all shadow-sm flex items-center justify-center active:scale-95"
                >
                  <Square size={14} className="fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={(!message.trim() && !attachmentFile && !attachmentText.trim()) || disabled}
                  title="Send question (Enter)"
                  className="p-2.5 rounded-xl bg-btn-bg text-btn-text hover:bg-btn-hover disabled:opacity-30 disabled:hover:bg-btn-bg transition-all shadow-sm flex items-center justify-center active:scale-95"
                >
                  <Send size={15} />
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Footer Disclaimer */}
        <div className="flex items-center justify-between text-[11px] text-text-secondary px-1 pt-0.5">
          <span>
            Press <kbd className="px-1.5 py-0.5 border border-border/80 bg-bg rounded-md font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 border border-border/80 bg-bg rounded-md font-mono text-[10px]">Shift + Enter</kbd> for new line
          </span>
          <span className="flex items-center gap-1 text-[11px] opacity-80">
            <HelpCircle size={11} /> Grounded in official company handbooks
          </span>
        </div>
      </div>

      {/* Paste Text Snippet Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-border/80 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
                <Type size={18} className="text-cherry dark:text-lime" /> Paste Context Snippet
              </h3>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Paste email text or message snippet to include as context for this question only.
            </p>
            <textarea
              rows={6}
              value={pastedBuffer}
              onChange={(e) => setPastedBuffer(e.target.value)}
              placeholder="Paste email text, memo snippet, or Slack message here..."
              className="w-full p-3 border border-border/80 bg-input-bg text-text-primary text-xs rounded-xl focus:outline-none focus:border-cherry dark:focus:border-lime resize-none font-mono"
            />
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 border border-border/80 bg-bg text-xs font-semibold rounded-xl hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePastedText}
                disabled={!pastedBuffer.trim()}
                className="px-5 py-2 bg-btn-bg text-btn-text text-xs font-semibold rounded-xl hover:bg-btn-hover disabled:opacity-50 transition-colors shadow-sm"
              >
                Attach Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
