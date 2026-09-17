"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getAccountById,
  type DemoAccount,
  type DemoScope,
} from "@/data/demo-users";

interface SessionState {
  account: DemoAccount | null;
  signIn: (account: DemoAccount) => void;
  signOut: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      account: null,
      signIn: (account) => set({ account }),
      signOut: () => set({ account: null }),
    }),
    {
      name: "reliable-demo-session",
      partialize: (s) => ({ account: s.account }),
    }
  )
);

export function refreshSessionAccount() {
  const current = useSessionStore.getState().account;
  if (!current) return;
  const fresh = getAccountById(current.id);
  if (fresh) useSessionStore.getState().signIn(fresh);
  else useSessionStore.getState().signOut();
}

export function scopeToBranchId(scope: DemoScope): string {
  if (scope === "admin") return "all";
  return scope;
}
