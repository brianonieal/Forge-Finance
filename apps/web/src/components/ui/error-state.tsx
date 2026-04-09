import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  type: "full-page" | "inline";
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ type, title, message, onRetry }: ErrorStateProps) {
  if (type === "inline") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-bg-surface border border-border">
        <AlertCircle className="h-6 w-6 text-loss shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary">{title}</p>
          <p className="text-xs text-text-secondary">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-brand-primary hover:underline shrink-0"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
      <AlertCircle className="h-12 w-12 text-loss" />
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <p className="text-text-secondary max-w-md">{message}</p>
      <div className="flex gap-3 mt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "bg-brand-primary text-white hover:opacity-90 transition-opacity"
            )}
          >
            Retry
          </button>
        )}
        <Link
          href="/dashboard"
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium",
            "border border-border text-text-secondary hover:bg-bg-overlay transition-colors"
          )}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export function NetworkOfflineBanner() {
  return (
    <div className="w-full bg-brand-accent/20 border-b border-brand-accent text-brand-accent text-sm text-center py-2 px-4">
      You are currently offline. Some features may be unavailable.
    </div>
  );
}
