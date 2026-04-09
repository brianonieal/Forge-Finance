"use client";

import { create } from "zustand";

type Period = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

interface UIState {
  sidebarExpanded: boolean;
  period: Period;
  toggleSidebar: () => void;
  setPeriod: (period: Period) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarExpanded: true,
  period: "1M",
  toggleSidebar: () =>
    set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setPeriod: (period) => set({ period }),
}));
