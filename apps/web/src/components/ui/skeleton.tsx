import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-bg-overlay",
        className
      )}
    />
  );
}

type SkeletonScreenVariant = "metric-card" | "table-row" | "full-page" | "chart";

interface SkeletonScreenProps {
  variant: SkeletonScreenVariant;
  count?: number;
}

export function SkeletonScreen({ variant, count = 1 }: SkeletonScreenProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  switch (variant) {
    case "metric-card":
      return (
        <div className="flex gap-4">
          {items.map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-6 flex-1">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-8 w-[180px] mb-2" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          ))}
        </div>
      );

    case "table-row":
      return (
        <div className="space-y-2">
          {items.map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-bg-surface rounded-lg px-4 py-3"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      );

    case "chart":
      return (
        <div className="bg-bg-surface rounded-xl p-6">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      );

    case "full-page":
      return (
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-bg-surface rounded-xl p-6 flex-1">
                <Skeleton className="h-3 w-20 mb-3" />
                <Skeleton className="h-8 w-[180px] mb-2" />
                <Skeleton className="h-4 w-[120px]" />
              </div>
            ))}
          </div>
          <div className="bg-bg-surface rounded-xl p-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-bg-surface rounded-lg px-4 py-3"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      );
  }
}

export { Skeleton };
