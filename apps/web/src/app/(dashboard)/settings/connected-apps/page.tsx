"use client";

import { Plug } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConnectedAppsPage() {
  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          Connected Apps
        </h2>
        <button
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            "bg-brand-primary text-white hover:opacity-90 transition-opacity"
          )}
        >
          + Connect New Account
        </button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Plug className="h-12 w-12 text-text-secondary mb-4" />
        <p className="text-text-primary font-medium">No accounts connected</p>
        <p className="text-sm text-text-secondary mt-1">
          Connect your bank to start tracking your finances.
        </p>
        <p className="text-xs text-text-secondary mt-4">
          Bank connections available in v0.4.0
        </p>
      </div>
    </div>
  );
}
