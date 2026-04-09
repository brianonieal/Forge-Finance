"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SecurityPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  return (
    <div className="max-w-lg space-y-8">
      <h2 className="text-xl font-semibold text-text-primary">Security</h2>

      {/* 2FA Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-text-primary">
          Two-factor authentication
        </h3>
        <p className="text-xs text-text-secondary">
          Add an extra layer of security to your account.
        </p>
        <button
          disabled
          className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-text-secondary cursor-not-allowed"
        >
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Enable 2FA (Coming in v4.0.0)
          </span>
        </button>
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
