import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  MapPin,
  Building2,
  AlertCircle,
  RefreshCw,
  PanelLeft,
  PanelLeftClose,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSidebar } from "../../context/SidebarContext";
import { api } from "../../api/client";
import { streamChatResponse } from "../../api/chatStream";
import { ChatSidebar } from "./ChatSidebar";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { CrocodileLogo } from "../CrocodileLogo";

export function ChatView() {
  const { user, logout } = useAuth();
  const { isChatSidebarCollapsed, toggleChatSidebar } = useSidebar();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingSources, setStreamingSources] = useState([]);
  const [chatError, setChatError] = useState("");

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const tokenQueueRef = useRef([]);
  const isTypingRef = useRef(false);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, isThinking]);

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const loadConversations = async () => {
    setIsHistoryLoading(true);
    setChatError("");
    try {
      const data = await api.getConversations();
      const list = data?.conversations || [];
      setConversations(list);
      if (list.length > 0 && !activeConversationId) {
        loadConversationMessages(list[0].id);
      }
    } catch (err) {
      setChatError("Failed to load chat history. Is rag-chat-service active?");
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const loadConversationMessages = async (convId) => {
    if (!convId) return;
    setActiveConversationId(convId);
    setChatError("");
    try {
      const res = await api.getConversation(convId);
      setMessages(res?.messages || []);
    } catch (err) {
      setChatError("Unable to retrieve conversation messages.");
    }
  };

  const handleNewChat = () => {
    if (isStreaming && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveConversationId(null);
    setMessages([]);
    setStreamingContent("");
    setIsThinking(false);
    setIsStreaming(false);
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await api.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      setChatError("Failed to delete conversation.");
    }
  };

  /**
   * Human-like typing queue processor.
   */
  const startTypingLoop = () => {
    if (isTypingRef.current) return;
    isTypingRef.current = true;

    const processNext = () => {
      if (tokenQueueRef.current.length > 0) {
        const nextChunk = tokenQueueRef.current.shift();
        setStreamingContent((prev) => prev + nextChunk);
        const randomDelay = Math.floor(Math.random() * 18) + 12;
        setTimeout(processNext, randomDelay);
      } else {
        isTypingRef.current = false;
      }
    };

    processNext();
  };

  const handleSendMessage = async ({ message, attachmentFile, attachmentText }) => {
    setChatError("");
    const userMsg = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: message,
      has_attachment: Boolean(attachmentFile || attachmentText),
      attachment_text: attachmentText || (attachmentFile ? `File: ${attachmentFile.name}` : null),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    setIsStreaming(true);
    setStreamingContent("");
    setStreamingSources([]);
    tokenQueueRef.current = [];

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let fullAccumulatedResponse = "";
    let serverAssignedConvId = activeConversationId;
    let receivedSources = [];
    let messageAppended = false;

    await streamChatResponse({
      message,
      conversationId: activeConversationId,
      attachmentFile,
      attachmentText,
      signal: controller.signal,
      onMeta: (meta) => {
        setIsThinking(false);
        if (meta.conversation_id) {
          serverAssignedConvId = meta.conversation_id;
          setActiveConversationId(meta.conversation_id);
        }
        if (meta.sources) {
          receivedSources = meta.sources;
          setStreamingSources(meta.sources);
        }
      },
      onToken: (token) => {
        setIsThinking(false);
        fullAccumulatedResponse += token;
        tokenQueueRef.current.push(token);
        startTypingLoop();
      },
      onDone: () => {
        setIsThinking(false);
        setTimeout(() => {
          setIsStreaming(false);
          isTypingRef.current = false;
          tokenQueueRef.current = [];

          if (fullAccumulatedResponse && !messageAppended) {
            messageAppended = true;
            const assistantMsg = {
              id: `asst-${Date.now()}`,
              role: "assistant",
              content: fullAccumulatedResponse,
              sources: receivedSources,
              created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
            setStreamingContent("");
          }
          loadConversations();
        }, 100);
      },
      onError: (err) => {
        setIsThinking(false);
        setIsStreaming(false);
        isTypingRef.current = false;
        tokenQueueRef.current = [];
        setChatError(err.message || "Failed to stream chat response from backend.");
      },
    });
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsThinking(false);
    setIsStreaming(false);
    isTypingRef.current = false;
    tokenQueueRef.current = [];
    if (streamingContent) {
      const assistantMsg = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: streamingContent + " [Response interrupted]",
        sources: streamingSources,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamingContent("");
    }
  };

  const activeConvObj = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="flex h-[calc(100vh-65px)] bg-bg overflow-hidden w-full transition-all duration-300">
      {/* Left Sidebar: Persistent Chat History */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={loadConversationMessages}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        isLoading={isHistoryLoading}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden bg-bg">
        {/* Header Ribbon */}
        <header className="px-4 sm:px-6 py-3.5 border-b border-border/70 bg-surface/90 backdrop-blur-md flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* History Toggle Button */}
            <button
              type="button"
              onClick={toggleChatSidebar}
              className="p-2 border border-border/80 bg-bg hover:bg-surface-hover rounded-xl text-text-secondary hover:text-text-primary transition-colors mr-1"
              title={isChatSidebarCollapsed ? "Open Chat History" : "Close Chat History"}
            >
              {isChatSidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </button>

            <div className="w-9 h-9 rounded-xl bg-surface border border-border/80 flex items-center justify-center font-bold shrink-0 shadow-2xs">
              <CrocodileLogo size={24} />
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-text-primary truncate">
                  {activeConvObj?.title || "HR Assistant"}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online & Ready</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-text-secondary mt-0.5">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin size={11} className="text-cherry dark:text-lime" />
                  {user?.branch?.name || "Global Branch"}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Building2 size={11} className="text-cherry dark:text-lime" />
                  {user?.department?.name || "All Departments"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border/80 bg-bg hover:bg-surface text-xs font-semibold rounded-xl text-text-primary transition-colors shadow-2xs"
            >
              <span>+ New Chat</span>
            </button>
          </div>
        </header>

        {/* Error Notification Banner */}
        {chatError && (
          <div className="p-3 mx-4 sm:mx-6 mt-3 border border-vibrantRed/50 bg-vibrantRed/10 text-vibrantRed rounded-xl text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{chatError}</span>
            </div>
            <div className="flex items-center gap-2">
              {chatError.toLowerCase().includes("token") || chatError.toLowerCase().includes("unauthorized") ? (
                <button
                  type="button"
                  onClick={logout}
                  className="px-3 py-1 bg-vibrantRed text-white font-bold text-[11px] rounded-lg hover:opacity-90 transition-opacity"
                >
                  Sign In Again
                </button>
              ) : (
                <button
                  type="button"
                  onClick={loadConversations}
                  className="p-1 hover:bg-vibrantRed/20 rounded-lg"
                  title="Retry connection"
                >
                  <RefreshCw size={13} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !isStreaming && !isThinking ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto space-y-6 animate-fadeIn">
              {/* Mascot Welcome Emblem */}
              <div className="relative flex flex-col items-center">
                <div className="p-5 rounded-3xl bg-surface border border-border/80 shadow-md transition-transform hover:scale-105">
                  <CrocodileLogo size={60} />
                </div>
                <div className="mt-4 space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-primary">
                    How can I help you today?
                  </h3>
                  <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                    Ask any question about company policies, leave days, health & dental coverage, or guidelines in English, Roman Urdu, or Urdu.
                  </p>
                </div>
              </div>

              {/* Sample Quick-Prompt Suggestion Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
                {[
                  {
                    title: "Medical & Dental Coverage",
                    desc: "What is the annual allowance for dental restorative procedures?",
                  },
                  {
                    title: "Equipment & Commute Stipend",
                    desc: "What home office or transit passes am I eligible for?",
                  },
                  {
                    title: "Annual Leave & Sick Policy",
                    desc: "How many days of paid vacation and sick leave do permanent staff get?",
                  },
                  {
                    title: "Mental Health Sessions",
                    desc: "How many confidential therapy sessions are covered under EAP?",
                  },
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage({ message: sample.desc })}
                    className="p-4 text-left border border-border/80 bg-surface hover:border-cherry/60 dark:hover:border-lime/60 rounded-2xl transition-all hover:bg-surface-hover shadow-xs group flex flex-col justify-between hover:-translate-y-0.5"
                  >
                    <div className="text-xs font-bold text-text-primary group-hover:text-cherry dark:group-hover:text-lime transition-colors">
                      {sample.title}
                    </div>
                    <div className="text-[11px] text-text-secondary mt-1 leading-snug">
                      "{sample.desc}"
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage key={msg.id || index} message={msg} />
              ))}

              {/* Thinking Indicator before first token */}
              {isThinking && (
                <div className="flex justify-start w-full max-w-4xl mx-auto px-4 sm:px-6 py-2 animate-fadeIn">
                  <div className="w-full bg-surface border border-border/80 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                    <div className="w-7 h-7 rounded-lg bg-surface border border-border/80 flex items-center justify-center">
                      <CrocodileLogo size={18} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-cherry dark:bg-lime animate-pulse" />
                      <span>Thinking & consulting company policies...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Streaming Message */}
              {isStreaming && streamingContent && (
                <ChatMessage
                  message={{
                    role: "assistant",
                    content: streamingContent,
                    sources: streamingSources,
                    created_at: new Date().toISOString(),
                  }}
                  isStreaming={true}
                />
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Bottom Input Box Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={handleStopGeneration}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
