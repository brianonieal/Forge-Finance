"use client";

import { useState } from "react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function PreferencesPage() {
  const [currency, setCurrency] = useState("USD");
  const [numberFormat, setNumberFormat] = useState("1,234.56");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [defaultPeriod, setDefaultPeriod] = useState("1M");

  const handleSave = () => {
    toast({ type: "success", title: "Preferences saved" });
  };

  return (
    <div className="max-w-lg space-y-6">
      <h2 className="text-xl font-semibold text-text-primary">Preferences</h2>

      {/* Currency */}
      <div>
        <label className="block text-sm text-text-secondary mb-1">
          Default currency
        </label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full h-10 px-3 rounded-lg text-sm bg-bg-base border border-border text-text-primary"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {/* Number Format */}
      <fieldset>
        <legend className="block text-sm text-text-secondary mb-2">
          Number format
        </legend>
        {["1,234.56", "1.234,56"].map((fmt) => (
          <label key={fmt} className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              name="numberFormat"
              value={fmt}
              checked={numberFormat === fmt}
              onChange={() => setNumberFormat(fmt)}
              className="accent-brand-primary"
            />
            <span className="text-sm text-text-primary font-mono">{fmt}</span>
          </label>
        ))}
      </fieldset>

      {/* Date Format */}
      <fieldset>
        <legend className="block text-sm text-text-secondary mb-2">
          Date format
        </legend>
        {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((fmt) => (
          <label key={fmt} className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              name="dateFormat"
              value={fmt}
              checked={dateFormat === fmt}
              onChange={() => setDateFormat(fmt)}
              className="accent-brand-primary"
            />
            <span className="text-sm text-text-primary">{fmt}</span>
          </label>
        ))}
      </fieldset>

      {/* Default Period */}
      <div>
        <label className="block text-sm text-text-secondary mb-1">
          Default dashboard period
        </label>
        <select
          value={defaultPeriod}
          onChange={(e) => setDefaultPeriod(e.target.value)}
          className="w-full h-10 px-3 rounded-lg text-sm bg-bg-base border border-border text-text-primary"
        >
          {["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
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
