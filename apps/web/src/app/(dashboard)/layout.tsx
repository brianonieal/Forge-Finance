"use client";

import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { MobileBottomTabBar } from "@/components/layout/mobile-bottom-tab-bar";
import { ProtectedRoute } from "@/components/layout/protected-route";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>
      <div className="flex h-screen overflow-hidden">
        <NavigationSidebar />
        <main id="main-content" role="main" className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
        <MobileBottomTabBar />
      </div>
    </ProtectedRoute>
  );
}
