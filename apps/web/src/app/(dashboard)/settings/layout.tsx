"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Shield, Sliders, Bell, Plug, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNav = [
  { label: "Profile", href: "/settings/profile", icon: User },
  { label: "Security", href: "/settings/security", icon: Shield },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
  { label: "Preferences", href: "/settings/preferences", icon: Sliders },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Connected Apps", href: "/settings/connected-apps", icon: Plug },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Settings sidebar */}
      <nav className="hidden md:block w-[200px] border-r border-border p-4 space-y-1">
        {settingsNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-bg-overlay text-text-primary font-medium"
                  : "text-text-secondary hover:bg-bg-overlay hover:text-text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile settings nav */}
      <div className="md:hidden w-full">
        <div className="flex overflow-x-auto border-b border-border px-4 gap-1">
          {settingsNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap border-b-2 transition-colors",
                  isActive
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-text-secondary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="p-4">{children}</div>
      </div>

      {/* Desktop content */}
      <div className="hidden md:block flex-1 p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
