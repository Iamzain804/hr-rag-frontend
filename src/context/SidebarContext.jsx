import React, { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext({
  isCollapsed: false,
  toggleSidebar: () => {},
  setIsCollapsed: () => {},
  isChatSidebarCollapsed: false,
  toggleChatSidebar: () => {},
  setIsChatSidebarCollapsed: () => {},
});

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("hr_sidebar_collapsed");
    return saved === "true";
  });

  const [isChatSidebarCollapsed, setIsChatSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("hr_chat_sidebar_collapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("hr_sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem("hr_chat_sidebar_collapsed", String(isChatSidebarCollapsed));
  }, [isChatSidebarCollapsed]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const toggleChatSidebar = () => setIsChatSidebarCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setIsCollapsed,
        isChatSidebarCollapsed,
        toggleChatSidebar,
        setIsChatSidebarCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
