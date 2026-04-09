import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "gain" | "loss" | "neutral";
}

export function MetricCard({ label, value, delta, deltaType = "neutral" }: MetricCardProps) {
  return (
    <div className="bg-bg-surface rounded-xl p-6 border border-border">
      <p className="text-sm text-text-secondary">{label}</p>
      <p className="text-2xl font-mono mt-1" style={{ fontFeatureSettings: '"tnum"' }}>
        {value}
      </p>
      {delta && (
        <p
          className={cn("text-sm mt-1 flex items-center gap-1", {
            "text-gain": deltaType === "gain",
            "text-loss": deltaType === "loss",
            "text-text-secondary": deltaType === "neutral",
          })}
        >
          {deltaType === "gain" && "▲"}
          {deltaType === "loss" && "▼"}
          {deltaType === "neutral" && "—"}
          <span className="font-mono" style={{ fontFeatureSettings: '"tnum"' }}>
            {delta}
          </span>
        </p>
      )}
    </div>
  );
}
