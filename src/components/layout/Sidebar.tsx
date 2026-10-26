import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import {
  Home,
  PhoneForwarded,
  Briefcase,
  BadgeIndianRupee,
  ClipboardList,
  Send,
  LifeBuoy,
  Trophy,
  Megaphone,
  Kanban,
  ShieldCheck,
  Crown,
  X,
  ChevronRight,
  Sparkles,
  Headphones,
  MessageSquare,
  Users,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  isHighlighted?: boolean;
  count?: number;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const { currentUser, isAdmin, isSupport, isManager } = useAuth();

  const isUserAdmin = Boolean(
    isAdmin ||
      currentUser?.role === "super_admin" ||
      currentUser?.email?.toLowerCase().trim() === "vahlaydigital@gmail.com"
  );

  const isSupportOrManager = isSupport || isManager;

  const handleNav = (path: string) => {
    onNavigate(path);
    onClose();
  };

  // Lock document scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!isOpen || window.innerWidth >= 1024) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const [followUpsCount, setFollowUpsCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const fetchFollowUps = async () => {
      try {
        const res = await api.getLeads();
        if (!isMounted) return;
        const today = new Date().toISOString().slice(0, 10);
        const count = res.leads.filter(
          (l) => l.followUpStatus !== "completed" && l.nextFollowUpDate && l.nextFollowUpDate <= today
        ).length;
        setFollowUpsCount(count);
      } catch (err) {
        console.warn("Sidebar follow-ups fetch skipped:", err);
      }
    };
    void fetchFollowUps();
    return () => {
      isMounted = false;
    };
  }, []);

  // ── Role-Specific Navigation Groups ──

  // 1. Agent Portal: Strictly for Sales Agents
  const agentNavGroups: NavGroup[] = [
    {
      title: "Agent Workspace",
      items: [
        { label: "Overview Dashboard", path: "/", icon: Home },
        { label: "Live Sales Call", path: "/sales-copilot", icon: Sparkles, badge: "Live" },
        { label: "Leads & Pipeline", path: "/leads", icon: Kanban },
        {
          label: "Follow-ups & Callbacks",
          path: "/follow-ups",
          icon: PhoneForwarded,
          count: followUpsCount > 0 ? followUpsCount : undefined,
        },
        { label: "Quotations", path: "/proposals", icon: Send },
        { label: "My Deals", path: "/deals", icon: Trophy },
        { label: "My Clients", path: "/clients", icon: Briefcase },
        { label: "Approved Rate Chart", path: "/pricing", icon: BadgeIndianRupee },
        { label: "Agent Chat", path: "/agent-chat", icon: MessageSquare },
        { label: "Team Announcements", path: "/announcements", icon: Megaphone },
      ],
    },
  ];

  // 2. Support + Manager Portal: Support Team & Sales Manager share this interface
  const supportNavGroups: NavGroup[] = [
    {
      title: "Support & Delivery",
      items: [
        {
          label: "Inbound Leads Queue",
          path: "/support",
          icon: LifeBuoy,
          badge: "Inbound",
        },
        {
          label: "WhatsApp Collateral Share",
          path: "/support/whatsapp-share",
          icon: MessageSquare,
          badge: "Direct",
        },
        {
          label: "Quotation Dispatch",
          path: "/support/quotations",
          icon: Send,
          badge: "Quotes",
        },
        {
          label: "Department Task Board",
          path: "/support/tasks",
          icon: ClipboardList,
        },
        {
          label: "Team Announcements",
          path: "/announcements",
          icon: Megaphone,
        },
      ],
    },
    // Manager tabs only shown when user is sales_manager
    ...(currentUser?.role === "sales_manager" ? [{
      title: "Manager Operations",
      items: [
        {
          label: "Agent Targets",
          path: "/support/targets",
          icon: TrendingUp,
          badge: "Targets",
        },
        {
          label: "Proposal Approvals",
          path: "/support/proposals",
          icon: ShieldCheck,
          badge: "Approvals",
        },
        {
          label: "Follow-up Radar",
          path: "/support/followups",
          icon: PhoneForwarded,
          badge: "Radar",
        },
        {
          label: "Escalations",
          path: "/support/escalations",
          icon: Users,
          badge: "Escalations",
        },
      ],
    }] as NavGroup[] : []),
  ];

  // 3. Admin Portal: Strictly for Admin / Super Admin (Central Command Hub)
  const adminNavGroups: NavGroup[] = [
    {
      title: "Admin workspace",
      items: [
        {
          label: "Overview",
          path: "/admin?tab=overview",
          icon: Crown,
        },
        {
          label: "Department Tasks",
          path: "/admin?tab=tasks",
          icon: ClipboardList,
        },
        {
          label: "Team Directory",
          path: "/admin?tab=agents",
          icon: Users,
        },
        {
          label: "All Agents Leads",
          path: "/admin?tab=all_leads",
          icon: Kanban,
        },
        {
          label: "All Agents Quotation Request",
          path: "/admin?tab=all_quotations",
          icon: Send,
        },
        {
          label: "All Agents Follow-up",
          path: "/admin?tab=all_followups",
          icon: PhoneForwarded,
        },
        {
          label: "All Agents Deals",
          path: "/admin?tab=all_deals",
          icon: Trophy,
        },
        {
          label: "Sales Targets",
          path: "/support/targets",
          icon: TrendingUp,
        },
      ],
    },
    {
      title: "Company & settings",
      items: [
        {
          label: "Services & Pricing",
          path: "/admin?tab=services",
          icon: BadgeIndianRupee,
        },
        {
          label: "Team Announcements",
          path: "/announcements",
          icon: Megaphone,
        },
        {
          label: "Workspace Settings",
          path: "/admin?tab=settings",
          icon: ShieldCheck,
        },
        {
          label: "Activity History",
          path: "/admin?tab=audit",
          icon: ClipboardList,
        },
      ],
    },
  ];

  // Directly assign navigation according to role - no manual switcher
  const currentNavGroups = isUserAdmin
    ? adminNavGroups
    : isSupportOrManager
    ? supportNavGroups
    : agentNavGroups;

  const isActivePath = (path: string) => {
    // If path has query params (e.g. /admin?tab=all_leads), match exact currentPath
    if (path.includes("?")) {
      const [pathBase, pathQuery] = path.split("?");
      const [currentBase, currentQuery] = currentPath.split("?");
      if (pathBase === currentBase && pathQuery === currentQuery) {
        return true;
      }
      if (
        pathBase === "/admin" &&
        pathQuery === "tab=all_leads" &&
        currentBase === "/admin" &&
        currentQuery === "tab=master_data"
      ) {
        return true;
      }
      if (
        pathBase === "/admin" &&
        pathQuery === "tab=overview" &&
        (currentPath === "/admin" || currentPath === "/admin/")
      ) {
        return true;
      }
      if (
        pathBase === "/manager" &&
        pathQuery === "tab=targets" &&
        (currentPath === "/manager" || currentPath === "/manager/")
      ) {
        return true;
      }
      return false;
    }

    const currentBase = currentPath.split("?")[0];
    const pathBase = path.split("?")[0];

    if (pathBase === "/") {
      return currentBase === "/" || currentBase === "/dashboard";
    }

    if (pathBase === "/leads" && currentBase === "/pipeline") {
      return true;
    }

    if (currentBase === pathBase) {
      return true;
    }

    if (currentBase.startsWith(`${pathBase}/`)) {
      return true;
    }

    return false;
  };

  const defaultHomePath = isUserAdmin ? "/admin" : isSupportOrManager ? "/support" : "/";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#050D15]/75 backdrop-blur-[4px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Main navigation"
        className={`
          fixed left-0 top-0 z-50 flex h-[100dvh] w-[260px]
          flex-col border-r border-[#122233] bg-[#08121E] text-slate-300
          shadow-[14px_0_40px_rgba(0,0,0,0.35)]
          transition-transform duration-300 ease-in-out

          lg:sticky lg:top-0 lg:z-30
          lg:h-screen lg:shrink-0 lg:shadow-none

          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#122233] px-5">
          <button
            type="button"
            onClick={() => handleNav(defaultHomePath)}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <img src="/logo (3).png" className="w-auto h-auto sm:w-auto sm:h-auto shrink-0" alt="Vahlay Digital" />
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable navigation */}
        <nav className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4 no-scrollbar">
          {currentNavGroups.map((group, groupIdx) => (
            <section key={group.title || groupIdx}>
              {group.title && (
                <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActivePath(item.path);
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNav(item.path)}
                      aria-current={active ? "page" : undefined}
                      className={`
                        group relative flex min-h-[42px] w-full items-center
                        gap-3 rounded-xl px-3.5 py-2.5
                        text-left transition-all duration-150 cursor-pointer

                        ${
                          active
                            ? "bg-[#009EB0] text-white font-bold shadow-[0_4px_16px_rgba(0,158,176,0.32)]"
                            : "text-[#94A3B8] font-medium hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      {/* Icon */}
                      <Icon
                        className={`
                          h-[18px] w-[18px] shrink-0 transition-colors
                          ${active ? "text-white" : "text-[#7B8D9F] group-hover:text-white"}
                        `}
                      />

                      {/* Label */}
                      <span className="min-w-0 flex-1 truncate text-[12.5px] tracking-[-0.01em]">
                        {item.label}
                      </span>

                      {/* Badge (Text or Count) */}
                      {item.badge && (
                        <span
                          className={`
                            shrink-0 rounded-md border px-1.5 py-0.5
                            text-[8.5px] font-extrabold uppercase tracking-wide
                            ${
                              active
                                ? "border-white/30 bg-white/20 text-white"
                                : "border-slate-700 bg-slate-800 text-slate-300"
                            }
                          `}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Red notification count badge (e.g. Follow-ups, only when count > 0) */}
                      {item.count !== undefined && item.count > 0 && (
                        <span className="shrink-0 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#E11D48] text-[10.5px] font-bold text-white shadow-xs">
                          {item.count}
                        </span>
                      )}

                      {/* Active Chevron Indicator */}
                      {active && (
                        <ChevronRight
                          size={15}
                          className="shrink-0 text-white/90"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
};
