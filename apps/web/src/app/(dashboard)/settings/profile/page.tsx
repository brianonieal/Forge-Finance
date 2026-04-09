"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name ?? "");
  const [email] = useState(user?.email ?? "");

  const handleSave = () => {
    toast({ type: "success", title: "Profile updated" });
  };

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-bg-overlay flex items-center justify-center text-2xl text-text-secondary">
          {fullName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <button className="text-sm text-brand-primary hover:underline">
          Change avatar
        </button>
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-sm text-text-secondary mb-1">
          Full name
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={cn(
            "w-full h-10 px-3 rounded-lg text-sm",
            "bg-bg-base border border-border text-text-primary",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
          )}
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-sm text-text-secondary mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full h-10 px-3 rounded-lg text-sm bg-bg-base border border-border text-text-secondary cursor-not-allowed"
        />
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary text-white hover:opacity-90 transition-opacity"
      >
        Save Changes
      </button>
    </div>
  );
}
