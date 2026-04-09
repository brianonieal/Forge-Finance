"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const periods = ["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"] as const;

export function PeriodSelector() {
  const { period, setPeriod } = useUIStore();

  return (
    <div className="flex items-center gap-1 bg-bg-surface rounded-lg p-1">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150",
            period === p
              ? "bg-brand-primary text-white"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-overlay"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
