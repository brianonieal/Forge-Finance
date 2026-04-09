"use client";

import { useState, useEffect } from "react";
import { Shield, Check, Loader2, Copy } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type TwoFAStep = "idle" | "setup" | "verify" | "enabled";

export default function SecurityPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  // 2FA state
  const [twoFAStep, setTwoFAStep] = useState<TwoFAStep>("idle");
  const [secret, setSecret] = useState("");
  const [otpauthUri, setOtpauthUri] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.settings.get2FAStatus()
      .then((res) => {
        if (res.enabled) setTwoFAStep("enabled");
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await api.settings.setup2FA();
      setSecret(res.secret);
      setOtpauthUri(res.otpauth_uri);
      setTwoFAStep("setup");
    } catch {
      toast({ type: "error", title: "Failed to start 2FA setup" });
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyCode.length !== 6) return;
    setLoading(true);
    try {
      await api.settings.verify2FA(verifyCode);
      setTwoFAStep("enabled");
      toast({ type: "success", title: "2FA enabled", description: "Your account is now protected with two-factor authentication." });
    } catch {
      toast({ type: "error", title: "Invalid code", description: "Please check your authenticator app and try again." });
    }
    setLoading(false);
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await api.settings.disable2FA();
      setTwoFAStep("idle");
      setSecret("");
      setOtpauthUri("");
      setVerifyCode("");
      toast({ type: "success", title: "2FA disabled" });
    } catch {
      toast({ type: "error", title: "Failed to disable 2FA" });
    }
    setLoading(false);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast({ type: "success", title: "Secret copied to clipboard" });
  };

  return (
    <div className="max-w-lg space-y-8">
      <h2 className="text-xl font-semibold text-text-primary">Security</h2>

      {/* 2FA Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-primary">
          Two-factor authentication
        </h3>
        <p className="text-xs text-text-secondary">
          Add an extra layer of security to your account with a TOTP authenticator app.
        </p>

        {checking ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking 2FA status...
          </div>
        ) : twoFAStep === "idle" ? (
          <button
            onClick={handleSetup}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium border border-brand-primary text-brand-primary",
              "hover:bg-brand-primary hover:text-white transition-colors",
              "disabled:opacity-50 flex items-center gap-2"
            )}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Enable 2FA
          </button>
        ) : twoFAStep === "setup" ? (
          <div className="space-y-4 bg-bg-base border border-border rounded-lg p-4">
            <p className="text-sm text-text-primary font-medium">Step 1: Add to your authenticator app</p>
            <p className="text-xs text-text-secondary">
              Scan the QR code below or manually enter the secret key in your authenticator app (Google Authenticator, Authy, etc.).
            </p>

            {/* QR Code placeholder using otpauth URI */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpauthUri)}`}
                  alt="2FA QR Code"
                  className="w-44 h-44"
                />
              </div>
            </div>

            {/* Manual secret */}
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-bg-surface border border-border rounded px-3 py-2 text-xs font-mono text-text-primary break-all">
                {secret}
              </code>
              <button onClick={copySecret} className="p-2 hover:bg-bg-overlay rounded transition-colors" title="Copy secret">
                <Copy className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            <button
              onClick={() => setTwoFAStep("verify")}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary text-white hover:opacity-90 transition-opacity"
            >
              I&apos;ve added it — Next
            </button>
          </div>
        ) : twoFAStep === "verify" ? (
          <div className="space-y-4 bg-bg-base border border-border rounded-lg p-4">
            <p className="text-sm text-text-primary font-medium">Step 2: Verify your code</p>
            <p className="text-xs text-text-secondary">
              Enter the 6-digit code from your authenticator app to confirm setup.
            </p>
            <form onSubmit={handleVerify} className="space-y-3">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className={cn(
                  "w-full h-12 px-4 rounded-lg text-center text-2xl font-mono tracking-[0.5em]",
                  "bg-bg-surface border border-border text-text-primary",
                  "focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                )}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={verifyCode.length !== 6 || loading}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary text-white",
                    "hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  )}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Verify & Enable
                </button>
                <button
                  type="button"
                  onClick={() => { setTwoFAStep("idle"); setVerifyCode(""); }}
                  className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-gain/10 border border-gain/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-gain" />
              <span className="text-sm text-text-primary font-medium">2FA is enabled</span>
            </div>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="text-sm text-loss hover:underline disabled:opacity-50"
            >
              {loading ? "Disabling..." : "Disable"}
            </button>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-text-primary">
          Active sessions
        </h3>
        <div className="bg-bg-surface border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">Current session</p>
              <p className="text-xs text-text-secondary">Active now</p>
            </div>
            <span className="text-xs text-gain">Active</span>
          </div>
        </div>
      </div>

      {/* Delete Account */}
      <div className="space-y-2 pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-loss">Delete account</h3>
        <p className="text-xs text-text-secondary">
          Permanently delete your account and all associated data.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-loss text-loss hover:bg-loss/10 transition-colors"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-text-secondary">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className={cn(
                "w-full h-10 px-3 rounded-lg text-sm",
                "bg-bg-base border border-loss text-text-primary",
                "focus:outline-none focus:ring-2 focus:ring-loss/50"
              )}
            />
            <div className="flex gap-2">
              <button
                disabled={deleteText !== "DELETE"}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-loss text-white disabled:opacity-50"
              >
                Confirm Deletion
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteText("");
                }}
                className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
