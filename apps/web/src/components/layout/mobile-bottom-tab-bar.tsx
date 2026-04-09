"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  MessageSquare,
  PiggyBank,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", href: "/accounts", icon: Landmark },
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Budgets", href: "/budgets", icon: PiggyBank },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function MobileBottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-bg-surface border-t border-border z-50">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 px-2 min-w-[56px]",
                isActive ? "text-brand-primary" : "text-text-secondary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] leading-tight">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
