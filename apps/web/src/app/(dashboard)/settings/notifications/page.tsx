"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-brand-primary" : "bg-bg-overlay border border-border"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState(true);
  const [syncErrors, setSyncErrors] = useState(true);
  const [aiInsights, setAiInsights] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [digestDay, setDigestDay] = useState("Monday");

  const handleSave = () => {
    toast({ type: "success", title: "Notification preferences saved" });
  };

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Notifications</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Budget threshold alerts</p>
            <p className="text-xs text-text-secondary">
              Get notified when spending approaches limits
            </p>
          </div>
          <Toggle checked={budgetAlerts} onChange={setBudgetAlerts} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Goal milestone alerts</p>
            <p className="text-xs text-text-secondary">
              Celebrate when you hit 25%, 50%, 75%, 100%
            </p>
          </div>
          <Toggle checked={goalAlerts} onChange={setGoalAlerts} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Transaction sync errors</p>
            <p className="text-xs text-text-secondary">
              Alert when bank sync fails
            </p>
          </div>
          <Toggle checked={syncErrors} onChange={setSyncErrors} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">AI insights</p>
            <p className="text-xs text-text-secondary">
              Receive proactive financial insights from @ORACLE
            </p>
          </div>
          <Toggle checked={aiInsights} onChange={setAiInsights} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-primary">Weekly digest email</p>
            <p className="text-xs text-text-secondary">
              Summary of your financial activity
            </p>
          </div>
          <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
        </div>

        {weeklyDigest && (
          <div className="ml-4">
            <label className="block text-sm text-text-secondary mb-1">
              Digest day
            </label>
            <select
              value={digestDay}
              onChange={(e) => setDigestDay(e.target.value)}
              className="h-10 px-3 rounded-lg text-sm bg-bg-base border border-border text-text-primary"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>
        )}
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
