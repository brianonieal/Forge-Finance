"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Mail, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  mode: "login" | "register" | "reset";
}

const headings = {
  login: "Welcome back",
  register: "Create account",
  reset: "Reset password",
};

const descriptions = {
  login: "Sign in to your Forge Finance account",
  register: "Start managing your finances with AI",
  reset: "We'll send you a link to reset your password",
};

export function AuthCard({ mode }: AuthCardProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { signInWithGoogle, signInWithMagicLink } = useAuthStore();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const { error } = await signInWithMagicLink(email);
    setLoading(false);

    if (error) {
      toast({ type: "error", title: "Error", description: error });
    } else {
      setMagicLinkSent(true);
      toast({
        type: "success",
        title: "Check your email",
        description: "We sent you a magic link to sign in.",
      });
    }
  };

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-md bg-bg-surface rounded-xl p-8 border border-border text-center">
        <Mail className="h-12 w-12 text-brand-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Check your email
        </h2>
        <p className="text-text-secondary text-sm mb-4">
          We sent a magic link to <strong>{email}</strong>
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="text-sm text-brand-primary hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-bg-surface rounded-xl p-8 border border-border">
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <LayoutDashboard className="h-6 w-6 text-brand-primary" />
        <span className="text-lg font-semibold text-brand-primary">
          Forge Finance
        </span>
      </div>

      <h1 className="text-xl font-semibold text-text-primary text-center mb-1">
        {headings[mode]}
      </h1>
      <p className="text-sm text-text-secondary text-center mb-6">
        {descriptions[mode]}
      </p>

      {/* Google OAuth */}
      {mode !== "reset" && (
        <>
          <button
            onClick={signInWithGoogle}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-10 rounded-lg",
              "border border-border text-text-primary text-sm font-medium",
              "hover:bg-bg-overlay transition-colors"
            )}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-secondary">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </>
      )}

      {/* Magic Link / Reset Form */}
      <form onSubmit={handleMagicLink} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          className={cn(
            "w-full h-10 px-3 rounded-lg text-sm",
            "bg-bg-base border border-border text-text-primary",
            "placeholder:text-text-secondary/60",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
          )}
        />
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-10 rounded-lg text-sm font-medium",
            "bg-brand-primary text-white",
            "hover:opacity-90 transition-opacity",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-2"
          )}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "reset" ? "Send Reset Link" : "Send Magic Link"}
        </button>
      </form>

      {/* Mode-specific footer links */}
      {mode !== "reset" && (
        <p className="text-xs text-text-secondary text-center mt-4">
          By continuing, you agree to our Terms of Service.
        </p>
      )}

      <div className="mt-4 text-center text-sm">
        {mode === "login" && (
          <>
            <Link
              href="/register"
              className="text-brand-primary hover:underline"
            >
              Create an account
            </Link>
            <span className="text-text-secondary mx-2">·</span>
            <Link
              href="/reset-password"
              className="text-text-secondary hover:text-text-primary"
            >
              Forgot password?
            </Link>
          </>
        )}
        {mode === "register" && (
          <Link href="/login" className="text-brand-primary hover:underline">
            Already have an account? Sign in
          </Link>
        )}
        {mode === "reset" && (
          <Link href="/login" className="text-brand-primary hover:underline">
            Back to sign in
          </Link>
        )}
      </div>
    </div>
  );
}
