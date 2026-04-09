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
      <div className="flex h-screen overflow-hidden">
        <NavigationSidebar />
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
        <MobileBottomTabBar />
      </div>
    </ProtectedRoute>
  );
}
