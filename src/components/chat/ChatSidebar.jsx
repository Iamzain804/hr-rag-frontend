import React, { useState } from "react";
import {
  MessageSquarePlus,
  MessageSquare,
  Trash2,
  Clock,
  ChevronRight,
  Search,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";

export function ChatSidebar({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  isLoading,
}) {
  const { isChatSidebarCollapsed, toggleChatSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    } catch {
      return "";
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || "New Conversation").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isChatSidebarCollapsed) {
    return (
      <div className="w-16 border-r border-border/70 bg-surface flex flex-col items-center py-4 justify-between shrink-0 h-full select-none transition-all duration-300 ease-in-out">
        <div className="space-y-3 flex flex-col items-center">
          <button
            type="button"
            onClick={toggleChatSidebar}
            title="Expand Chat History"
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors"
          >
            <PanelLeft size={18} />
          </button>
          <button
            type="button"
            onClick={onNewChat}
            title="Start New Chat"
            className="p-2.5 bg-btn-bg text-btn-text hover:bg-btn-hover rounded-xl transition-all shadow-xs active:scale-95"
          >
            <MessageSquarePlus size={18} />
          </button>
        </div>

        <div className="text-[10px] font-mono text-text-secondary">
          {conversations.length}
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 border-r border-border/70 bg-surface flex flex-col justify-between shrink-0 h-full select-none transition-all duration-300 ease-in-out animate-fadeIn">
      {/* Top Header & New Chat Button */}
      <div className="p-3.5 border-b border-border/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-text-secondary tracking-wider">
            Chat History
          </span>
          <button
            type="button"
            onClick={toggleChatSidebar}
            title="Collapse Chat History"
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg transition-colors"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-btn-bg text-btn-text hover:bg-btn-hover text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
        >
          <MessageSquarePlus size={15} />
          <span>New Chat Session</span>
        </button>

        {/* Search Chat History */}
        {conversations.length > 2 && (
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 bg-bg border border-border/80 rounded-xl text-xs text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:border-cherry dark:focus:border-lime transition-all"
            />
          </div>
        )}
      </div>

      {/* Conversations History List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {isLoading && conversations.length === 0 ? (
          <div className="p-4 text-center space-y-2">
            <div className="w-5 h-5 border-2 border-border border-t-cherry dark:border-t-lime rounded-full animate-spin mx-auto" />
            <div className="text-xs text-text-secondary">Loading history...</div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-secondary space-y-2">
            <MessageSquare size={24} className="mx-auto text-text-secondary/40" />
            <p>{searchQuery ? "No matching chats found." : "No chat history yet."}</p>
            {!searchQuery && (
              <p className="text-[11px] opacity-80">Start a new conversation to inquire about company policies.</p>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = activeConversationId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? "bg-bg border border-cherry/30 dark:border-lime/30 text-text-primary font-semibold shadow-xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent"
                }`}
              >
                <div className="flex items-start gap-2.5 overflow-hidden flex-1 mr-1">
                  <MessageSquare
                    size={15}
                    className={`shrink-0 mt-0.5 ${isActive ? "text-cherry dark:text-lime" : "opacity-60"}`}
                  />
                  <div className="overflow-hidden flex-1">
                    <div className="text-xs truncate font-medium">
                      {conv.title || "Inquiry Session"}
                    </div>
                    <div className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5 opacity-70">
                      <Clock size={10} />
                      <span>{formatDate(conv.updated_at || conv.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Delete button (hover only) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to delete this conversation?")) {
                      onDeleteConversation(conv.id);
                    }
                  }}
                  className="p-1 rounded-lg text-text-secondary hover:text-vibrantRed hover:bg-surface opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete conversation"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border/70 bg-bg/50 text-[11px] text-text-secondary flex items-center justify-between font-mono">
        <span>History: Local Storage</span>
        <span>{conversations.length} sessions</span>
      </div>
    </div>
  );
}
