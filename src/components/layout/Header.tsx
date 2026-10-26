import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import {
  Search,
  Sparkles,
  ChevronDown,
  Bell,
  Menu,
  LogOut,
  ArrowUpRight,
  X,
  ShieldCheck,
  Megaphone,
  Check,
  Command,
  Crown,
} from "lucide-react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";
import { Announcement } from "../../types";

interface HeaderNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  path: string;
  kind: "announcement" | "update" | "chat" | "task";
}

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenCopilot: () => void;
  onToggleSidebar: () => void;
  onNavigate: (path: string) => void;
}

const roleLabels: Record<string, string> = {
  super_admin: "Admin",
  technical_support: "Technical Support",
  sales_manager: "Sales Manager",
  sales_agent: "Sales Agent",
};

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenCopilot,
  onToggleSidebar,
  onNavigate,
}) => {
  const { currentUser, logout, isAdmin } = useAuth();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const [liveToast, setLiveToast] = useState<{ message: string; type: string } | null>(null);

  const isUserAdmin = Boolean(
    isAdmin ||
    currentUser?.role === "super_admin" ||
    currentUser?.email?.toLowerCase().trim() === "vahlaydigital@gmail.com"
  );
  const notificationStorageKey = `vahlay_read_notifications_${currentUser?.id || currentUser?.email || "user"}`;

  useEffect(() => {
    let isMounted = true;
    try {
      const storedIds = JSON.parse(localStorage.getItem(notificationStorageKey) || "[]");
      if (Array.isArray(storedIds)) {
        setReadNotificationIds(new Set(storedIds.filter((id): id is string => typeof id === "string")));
      }
    } catch (err) {
      console.warn("Failed to load read notification state:", err);
    }

    const toAnnouncementNotification = (announcement: Announcement): HeaderNotification => ({
      id: `announcement:${announcement.id}`,
      title: announcement.title || "Team announcement",
      message: announcement.content,
      timestamp: announcement.date,
      path: "/announcements",
      kind: "announcement",
    });

    const mergeAnnouncements = (announcements: Announcement[]) => {
      const announcementNotifications = announcements.map(toAnnouncementNotification);
      setNotifications((previous) => {
        const otherNotifications = previous.filter((notification) => notification.kind !== "announcement");
        return [...announcementNotifications, ...otherNotifications]
          .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
          .slice(0, 40);
      });
    };

    const fetchNotifications = async () => {
      try {
        const announcements = await api.getAnnouncements();
        if (!isMounted) return;
        mergeAnnouncements(announcements);
      } catch (err) {
        console.warn("Failed to load announcements for header:", err);
      }
    };
    void fetchNotifications();

    // ── Live real-time announcements subscription ──
    const unsubAnn = api.subscribeAnnouncements((anns) => {
      if (!isMounted || anns.length === 0) return;
      void api.getAnnouncements()
        .then((announcements) => {
          if (isMounted) mergeAnnouncements(announcements);
        })
        .catch((err) => {
          console.warn("Failed to refresh header announcements:", err);
        });
    });

    const canAccessTasks = isUserAdmin || ["technical_support", "sales_manager"].includes(currentUser?.role || "");
    const unsubscribeTasks = canAccessTasks
      ? api.subscribeTasks((tasks) => {
          if (!isMounted) return;
          const taskNotifications: HeaderNotification[] = tasks.map((task) => ({
            id: `task:${task.id}:${task.updatedAt}`,
            title: `Task update: ${task.title}`,
            message: `${task.department} department · ${task.assignedToName || "Department queue"} · ${task.status.replace("_", " ")}`,
            timestamp: task.updatedAt || task.createdAt,
            path: isUserAdmin ? "/admin?tab=tasks" : "/support/tasks",
            kind: "task",
          }));
          setNotifications((previous) => [
            ...taskNotifications,
            ...previous.filter((notification) => notification.kind !== "task"),
          ].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 40));
        })
      : () => {};

    let unsubscribeChat = () => {};
    try {
      const chatQuery = query(
        collection(db, "agent_teams_messages"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      unsubscribeChat = onSnapshot(
        chatQuery,
        (snapshot) => {
          const chatNotifications: HeaderNotification[] = snapshot.docs
            .filter((messageDoc) => messageDoc.data().senderId !== currentUser?.id)
            .map((messageDoc) => {
              const data = messageDoc.data();
              const timestamp = data.createdAt?.toDate?.().toISOString() || new Date().toISOString();
              const convId = typeof data.convId === "string" ? data.convId : "";
              const preview = typeof data.content === "string" ? data.content.trim() : "";
              return {
                id: `chat:${messageDoc.id}`,
                title: `Message from ${data.senderName || "Team member"}`,
                message: preview || (data.leadTag?.name ? `Shared lead: ${data.leadTag.name}` : "New team chat message"),
                timestamp,
                path: convId ? `/agent-chat?convId=${encodeURIComponent(convId)}` : "/agent-chat",
                kind: "chat" as const,
              };
            });
          setNotifications((previous) => {
            const nonChat = previous.filter((notification) => notification.kind !== "chat");
            return [...chatNotifications, ...nonChat]
              .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
              .slice(0, 40);
          });
        },
        (error) => {
          console.warn("Realtime team chat notification subscription error:", error);
        }
      );
    } catch (err) {
      console.warn("Failed to start team chat notification subscription:", err);
    }

    // ── Real-time Support & CRM sync toast listener ──
    const handleRealtimeUpdate = (e: Event) => {
      const custom = e as CustomEvent<{
        type?: string;
        payload?: Announcement & { id?: string };
        timestamp?: string;
        message?: string;
        sourceRole?: string;
      }>;
      const detail = custom.detail;
      if (detail?.type === "ANNOUNCEMENT_ADDED" && detail.payload?.id) {
        const announcement = detail.payload as Announcement;
        setNotifications((previous) => {
          const next = [
            toAnnouncementNotification(announcement),
            ...previous.filter((notification) => notification.id !== `announcement:${announcement.id}`),
          ];
          return next.slice(0, 40);
        });
      } else if (detail?.message && detail.type) {
        const isSupportOrManager = ["technical_support", "sales_manager", "super_admin"].includes(currentUser?.role || "") || isUserAdmin;
        const pathByType: Record<string, string> = {
          LEAD_CREATED: isSupportOrManager ? "/support" : "/leads",
          LEAD_UPDATED: isSupportOrManager ? "/support" : "/leads",
          LEADS_DISTRIBUTED: isSupportOrManager ? "/support" : "/leads",
          PROPOSAL_UPDATED: isSupportOrManager ? "/support/proposals" : "/proposals",
          PROPOSAL_DISPATCHED: isSupportOrManager ? "/support/quotations" : "/proposals",
          ESCALATION_UPDATED: isSupportOrManager ? "/support/escalations" : "/announcements",
        };
        const notification: HeaderNotification = {
          id: `update:${detail.type}:${detail.payload?.id || detail.timestamp || Date.now()}`,
          title: detail.type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()),
          message: detail.message,
          timestamp: detail.timestamp || new Date().toISOString(),
          path: pathByType[detail.type] || "/announcements",
          kind: "update",
        };
        setNotifications((previous) => [
          notification,
          ...previous.filter((item) => item.id !== notification.id),
        ].slice(0, 40));
        setLiveToast({
          message: detail.message,
          type: detail.type || "INFO"
        });
        setTimeout(() => {
          if (isMounted) setLiveToast(null);
        }, 4500);
      }
    };

    window.addEventListener('vahlay:realtime_update', handleRealtimeUpdate);

    return () => {
      isMounted = false;
      unsubAnn();
      unsubscribeChat();
      unsubscribeTasks();
      window.removeEventListener('vahlay:realtime_update', handleRealtimeUpdate);
    };
  }, [currentUser?.id, currentUser?.email, currentUser?.role, isUserAdmin, notificationStorageKey]);

  const accountRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Default display name to Piyush Gond matching the reference design
  const displayName =
    currentUser?.name &&
      currentUser.name !== "vahlaydigital" &&
      !currentUser.name.includes("@")
      ? currentUser.name
      : "Piyush Gond";

  const role = isUserAdmin ? "super_admin" : (currentUser?.role || "sales_agent");
  const roleLabel = isUserAdmin ? "Admin" : (roleLabels[role] || "Sales Agent");

  const initials =
    displayName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "PG";

  useEffect(() => {
    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;

      if (!accountRef.current?.contains(target)) {
        setShowAccountMenu(false);
      }

      if (!notificationRef.current?.contains(target)) {
        setShowNotifications(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAccountMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const navigate = (path: string) => {
    setShowAccountMenu(false);
    setShowNotifications(false);
    onNavigate(path);
  };

  const markNotificationRead = (notificationId: string) => {
    setReadNotificationIds((previous) => {
      const next = new Set(previous);
      next.add(notificationId);
      try {
        localStorage.setItem(notificationStorageKey, JSON.stringify([...next]));
      } catch (err) {
        console.warn("Failed to save read notification state:", err);
      }
      return next;
    });
  };

  const markAllNotificationsRead = () => {
    setReadNotificationIds((previous) => {
      const next = new Set(previous);
      notifications.forEach((notification) => next.add(notification.id));
      try {
        localStorage.setItem(notificationStorageKey, JSON.stringify([...next]));
      } catch (err) {
        console.warn("Failed to save read notification state:", err);
      }
      return next;
    });
  };

  const unreadNotifications = notifications.filter((notification) => !readNotificationIds.has(notification.id)).length;

  const formatNotificationTime = (timestamp: string) => {
    const time = new Date(timestamp).getTime();
    if (!Number.isFinite(time)) return timestamp;
    const minutesAgo = Math.max(0, Math.floor((Date.now() - time) / 60000));
    if (minutesAgo < 1) return "Just now";
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    if (minutesAgo < 1440) return `${Math.floor(minutesAgo / 60)}h ago`;
    return new Date(timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-[72px] w-full border-b border-cyan-500/20 bg-[#08121E]/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
      <div className="flex h-full w-full items-center justify-between gap-4">
        {/* LEFT — Mobile Toggle (visible on mobile only) */}
        <div className="flex shrink-0 items-center lg:hidden">
          {/* Mobile Sidebar Toggle Button */}
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-[#0D1C2E] text-slate-300 transition-all hover:bg-cyan-950/60 hover:text-cyan-300 cursor-pointer"
          >
            <Menu size={18} strokeWidth={2} />
          </button>
        </div>

        {/* CENTER — Global Search Bar with Ctrl K pill */}
        <div className="hidden min-w-0 max-w-[480px] flex-1 px-4 md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="group flex h-[40px] w-full items-center gap-3 rounded-full border border-cyan-500/25 bg-[#0D1C2E] px-4 text-left transition-all duration-200 hover:border-cyan-400/60 hover:bg-[#10243B] hover:shadow-[0_0_16px_rgba(0,212,221,0.18)] focus-visible:outline-none cursor-pointer"
          >
            <Search
              size={16}
              className="shrink-0 text-cyan-400/70 transition-colors group-hover:text-cyan-300"
            />

            <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-slate-300 group-hover:text-white transition-colors">
              Search leads, services, pricing, clients...
            </span>

            <span className="shrink-0 rounded-md border border-cyan-500/30 bg-[#08121E] px-2 py-0.5 text-[10px] font-bold text-cyan-300 shadow-2xs">
              Ctrl K
            </span>
          </button>
        </div>

        {/* RIGHT — Actions: Copilot Pill, Bell (with red 3), User Avatar */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3.5">
          {/* Mobile Search Icon Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Open search"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:bg-[#0D1C2E] hover:text-cyan-300 md:hidden cursor-pointer"
          >
            <Search size={18} />
          </button>

          {/* Notification Bell with live unread count */}
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications((val) => !val);
                setShowAccountMenu(false);
              }}
              aria-label="Notifications"
              className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
                showNotifications
                  ? "bg-[#0D1C2E] text-cyan-300 border border-cyan-500/30"
                  : "text-slate-300 hover:bg-[#0D1C2E] hover:text-cyan-300"
              }`}
            >
              <Bell size={18} strokeWidth={2} />

              {/* Notification count badge (only when unreadNotifications > 0) */}
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#E11D48] px-1 text-[9.5px] font-bold text-white shadow-xs">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Notification Dropdown Dialog */}
            {showNotifications && (
              <div
                role="dialog"
                className="absolute right-0 top-[calc(100%+12px)] z-50 w-[330px] rounded-2xl border border-cyan-500/30 bg-[#0A1828] p-3 shadow-2xl backdrop-blur-xl text-white"
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5 px-2">
                  <div className="flex items-center gap-2">
                    <Megaphone size={16} className="text-cyan-400" />
                    <span className="text-xs font-bold text-white">
                      Notifications & Updates
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close notifications"
                    className="rounded p-1 text-slate-400 hover:bg-cyan-950/40 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between px-2 pt-2">
                  <span className="text-[10px] text-slate-400">{unreadNotifications} unread</span>
                  {unreadNotifications > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[10px] font-semibold text-cyan-300 hover:text-white cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[min(60vh,400px)] space-y-1 overflow-y-auto py-2">
                  {notifications.length === 0 ? (
                    <p className="px-3 py-8 text-center text-xs text-slate-400">You’re all caught up.</p>
                  ) : (
                    notifications.map((notification) => {
                      const isUnread = !readNotificationIds.has(notification.id);
                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => {
                            markNotificationRead(notification.id);
                            navigate(notification.path);
                          }}
                          className={`w-full rounded-xl border p-3 text-left transition cursor-pointer ${
                            isUnread
                              ? "border-cyan-500/25 bg-[#0F2238] hover:bg-[#142b43]"
                              : "border-transparent bg-[#0c1b2b] hover:bg-[#142334]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`text-xs font-bold ${notification.kind === "announcement" ? "text-cyan-300" : notification.kind === "chat" ? "text-emerald-300" : "text-white"}`}>
                              {notification.title}
                            </span>
                            {isUnread && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />}
                          </div>
                          <p className="mt-1 line-clamp-2 text-[11px] text-slate-300">{notification.message}</p>
                          <span className="mt-1.5 block text-[10px] text-slate-500">{formatNotificationTime(notification.timestamp)}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/announcements")}
                  className="w-full rounded-lg py-2 text-center text-xs font-bold text-cyan-300 hover:bg-cyan-950/60 transition cursor-pointer"
                >
                  View All Announcements →
                </button>
              </div>
            )}
          </div>

          {/* AI Sales Copilot Dark Pill Button */}
          <button
            type="button"
            onClick={onOpenCopilot}
            className="group relative flex h-[38px] items-center gap-2 rounded-full border border-cyan-400/50 bg-gradient-to-r from-cyan-950/80 via-[#0a233a] to-blue-950/80 px-3.5 sm:px-4 text-white  transition-all duration-200 hover:border-cyan-300 hover:shadow-[0_0_24px_rgba(0,212,221,0.45)] active:scale-[0.98] cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />

            <span className="hidden text-[12px] font-bold tracking-tight text-white/95 sm:inline">
              LIVE SALES CALL 
            </span>

            <ArrowUpRight
              size={13}
              className="text-cyan-300 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>

          {/* User Profile Pill / Menu */}
          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setShowAccountMenu((val) => !val);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 rounded-full p-1 pl-1 pr-2 hover:bg-[#0D1C2E] border border-cyan-500/30 transition cursor-pointer"
            >
              {/* Initials circle: "PG" in cyan circle with online dot */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00D4DD] to-[#008F9A] text-[12px] font-extrabold text-white shadow-[0_0_12px_rgba(0,212,221,0.4)]">
                {initials}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#08121E]" />
              </div>

              {/* Name & Role */}
              <div className="hidden text-left sm:block">
                <p className="text-[12.5px] font-bold leading-none text-white">
                  {displayName}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <p className="text-[10.5px] font-medium leading-none text-cyan-300/80">
                    {roleLabel}
                  </p>
                  <ChevronDown size={11} className="text-cyan-300/80" />
                </div>
              </div>
            </button>

            {/* Account Dropdown Menu */}
            {showAccountMenu && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+12px)] z-50 w-[240px] rounded-2xl border border-cyan-500/30 bg-[#0A1828] p-2 shadow-2xl backdrop-blur-xl text-white"
              >
                <div className="border-b border-cyan-500/20 p-2.5">
                  <p className="text-xs font-bold text-white">{displayName}</p>
                  <p className="text-[11px] text-slate-400">{currentUser?.email || "piyush.gond@vahlaydigital.com"}</p>
                  <span className={`mt-2 inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[9.5px] font-bold ${
                    isUserAdmin
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                      : 'bg-cyan-950/80 border-cyan-500/30 text-cyan-300'
                  }`}>
                    {isUserAdmin ? <Crown size={10} className="text-amber-400" /> : <Check size={10} />}
                    {roleLabel}
                  </span>
                </div>

                <div className="py-1">
                  {isUserAdmin && (
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowAccountMenu(false);
                        navigate("/admin");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-[#0F2238] hover:text-white transition cursor-pointer"
                    >
                      <ShieldCheck size={14} className="text-cyan-400" />
                      Admin Portal
                    </button>
                  )}
                </div>

                <div className="border-t border-cyan-500/20 pt-1">
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <LogOut size={14} />
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Real-Time Support Update Banner */}
      {liveToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#081828]/95 border border-cyan-400/60 text-white shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in slide-in-from-top-3 fade-in duration-200 max-w-sm sm:max-w-md">
          <div className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-cyan-400" />
              <span>Real-time Support Update</span>
            </div>
            <p className="text-slate-200 text-[11px] font-normal truncate mt-0.5 leading-snug">
              {liveToast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLiveToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </header>
  );
};
