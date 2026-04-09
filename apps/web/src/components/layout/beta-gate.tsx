"use client";

import { useState } from "react";
import { LayoutDashboard, Loader2, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const BETA_STORAGE_KEY = "forge-beta-access";

export function BetaGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(BETA_STORAGE_KEY) === "true";
  });
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (verified) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.settings.verifyBetaAccess(code);
      localStorage.setItem(BETA_STORAGE_KEY, "true");
      setVerified(true);
    } catch {
      setError("Invalid access code. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-bg-surface rounded-xl p-8 border border-border text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <LayoutDashboard className="h-6 w-6 text-brand-primary" />
          <span className="text-lg font-semibold text-brand-primary">Forge Finance</span>
        </div>

        <ShieldCheck className="h-12 w-12 text-brand-accent mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-1">Beta Access</h2>
        <p className="text-sm text-text-secondary mb-6">
          Forge Finance is currently in private beta. Enter your access code to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter access code"
            className={cn(
              "w-full h-10 px-3 rounded-lg text-sm text-center tracking-wider font-mono",
              "bg-bg-base border text-text-primary",
              error ? "border-loss" : "border-border",
              "focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary",
            )}
            autoFocus
          />
          {error && <p className="text-xs text-loss">{error}</p>}
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className={cn(
              "w-full h-10 rounded-lg text-sm font-medium",
              "bg-brand-primary text-white",
              "hover:opacity-90 transition-opacity",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center gap-2",
            )}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify Access
          </button>
        </form>

        <p className="text-xs text-text-secondary/60 mt-4">
          Need a code? Join the waitlist at forgefi.co
        </p>
      </div>
    </div>
  );
}
