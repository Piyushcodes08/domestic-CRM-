import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { GlobalSearchModal } from "../common/GlobalSearchModal";

interface LayoutProps {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPath,
  onNavigate,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global hotkey for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={
        currentPath === '/agent-chat'
          ? "h-screen h-[100dvh] max-h-screen max-h-[100dvh] overflow-hidden flex font-sans antialiased selection:bg-cyan-500 selection:text-white"
          : "min-h-screen flex font-sans antialiased selection:bg-cyan-500 selection:text-white"
      }
      style={{
        backgroundColor: '#85c2f5',
        backgroundImage:
          'radial-gradient(ellipse at 50% 0%, rgba(253, 253, 253, 0.8) 0%, rgb(183, 213, 238) 60%)',
      }}
    >
      {/* Left Sidebar spanning full height */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Right Shell: Top Sticky Header + Scrollable Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${currentPath === '/agent-chat' ? 'h-full max-h-full overflow-hidden' : ''}`}>
        <Header
          onOpenSearch={() => setSearchOpen(true)}
          onOpenCopilot={() => onNavigate("/sales-copilot")}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onNavigate={onNavigate}
        />

        <main
          className={
            currentPath === '/agent-chat'
              ? 'flex-1 min-h-0 w-full p-0 m-0 overflow-hidden bg-slate-50'
              : 'flex-1 min-w-0 p-4 sm:p-5 lg:p-6 w-full max-w-[1700px] mx-auto overflow-x-hidden'
          }
        >
          {children}
        </main>
      </div>

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
