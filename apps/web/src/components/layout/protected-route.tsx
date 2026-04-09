"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { SkeletonScreen } from "@/components/ui/skeleton";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, initialized, router]);

  if (!initialized || loading) {
    return <SkeletonScreen variant="full-page" />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
