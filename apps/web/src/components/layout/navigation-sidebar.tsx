"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  Target,
  PiggyBank,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Bell,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  gate?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Landmark },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Investments", href: "/investments", icon: TrendingUp },
  { label: "Net Worth", href: "/net-worth", icon: CreditCard },
  { label: "Alerts", href: "/alerts", icon: Bell },
];

export function NavigationSidebar() {
  const pathname = usePathname();
  const { sidebarExpanded, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-bg-surface border-r border-border transition-all duration-200 h-screen",
        sidebarExpanded ? "w-60" : "w-[60px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-brand-primary font-semibold"
        >
          <LayoutDashboard className="h-5 w-5 shrink-0" />
          {sidebarExpanded && <span className="text-lg">Forge</span>}
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isGated = !!item.gate;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={isGated ? "#" : item.href}
              title={
                isGated
                  ? `Coming in ${item.gate}`
                  : sidebarExpanded
                    ? undefined
                    : item.label
              }
              className={cn(
                "flex items-center h-10 mx-1 px-3 rounded-lg transition-colors duration-150 gap-3",
                isActive &&
                  "bg-bg-overlay border-l-[3px] border-brand-primary",
                !isActive && !isGated && "hover:bg-bg-overlay",
                isGated && "opacity-40 cursor-not-allowed"
              )}
              onClick={isGated ? (e) => e.preventDefault() : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-brand-primary" : "text-text-secondary"
                )}
              />
              {sidebarExpanded && (
                <span
                  className={cn(
                    "text-sm truncate",
                    isActive ? "text-text-primary font-medium" : "text-text-secondary"
                  )}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border py-2">
        <Link
          href="/settings"
          title={sidebarExpanded ? undefined : "Settings"}
          className={cn(
            "flex items-center h-10 mx-1 px-3 rounded-lg transition-colors duration-150 gap-3 hover:bg-bg-overlay",
            pathname === "/settings" &&
              "bg-bg-overlay border-l-[3px] border-brand-primary"
          )}
        >
          <Settings className="h-5 w-5 shrink-0 text-text-secondary" />
          {sidebarExpanded && (
            <span className="text-sm text-text-secondary">Settings</span>
          )}
        </Link>

        <button
          onClick={toggleSidebar}
          className="flex items-center h-10 mx-1 px-3 rounded-lg transition-colors duration-150 gap-3 hover:bg-bg-overlay w-full"
        >
          {sidebarExpanded ? (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0 text-text-secondary" />
              <span className="text-sm text-text-secondary">Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-5 w-5 shrink-0 text-text-secondary" />
          )}
        </button>
      </div>
    </aside>
  );
}
