"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ACCESS_MODULES,
  ALL_MODULE_HREFS,
  DEFAULT_ROLE_ACCESS,
  canAccessHref,
} from "@/data/access-catalog";
import type { DemoAccount, DemoRole } from "@/data/demo-users";

export interface UserAccessOverride {
  enabled: boolean;
  /** null = inherit role template */
  navHrefs: string[] | null;
}

type RoleAccessMap = Record<DemoRole, string[]>;
type UserOverrideMap = Record<string, UserAccessOverride>;

function cloneDefaults(): RoleAccessMap {
  const out = {} as RoleAccessMap;
  (Object.keys(DEFAULT_ROLE_ACCESS) as DemoRole[]).forEach((role) => {
    out[role] = [...DEFAULT_ROLE_ACCESS[role]];
  });
  return out;
}

function ensureUser(
  map: UserOverrideMap,
  userId: string
): UserAccessOverride {
  return map[userId] ?? { enabled: true, navHrefs: null };
}

function expandModules(hrefs: string[]): string[] {
  if (hrefs.includes("*")) return [...ALL_MODULE_HREFS];
  return [...hrefs];
}

interface AccessState {
  roleAccess: RoleAccessMap;
  userOverrides: UserOverrideMap;
  toggleRoleModule: (role: DemoRole, href: string) => void;
  grantRoleFullAccess: (role: DemoRole) => void;
  setUserEnabled: (userId: string, enabled: boolean) => void;
  setUserInheritRole: (userId: string) => void;
  toggleUserModule: (userId: string, href: string, role: DemoRole) => void;
  grantUserFullAccess: (userId: string) => void;
  resetAll: () => void;
}

export const useAccessStore = create<AccessState>()(
  persist(
    (set, get) => ({
      roleAccess: cloneDefaults(),
      userOverrides: {},

      toggleRoleModule: (role, href) => {
        const current = expandModules(
          get().roleAccess[role] ?? DEFAULT_ROLE_ACCESS[role]
        );
        const next = current.includes(href)
          ? current.filter((h) => h !== href)
          : [...current, href];
        const full =
          next.length === ACCESS_MODULES.length ? ["*"] : next;
        set((s) => ({
          roleAccess: { ...s.roleAccess, [role]: full },
        }));
      },

      grantRoleFullAccess: (role) =>
        set((s) => ({
          roleAccess: { ...s.roleAccess, [role]: ["*"] },
        })),

      setUserEnabled: (userId, enabled) =>
        set((s) => ({
          userOverrides: {
            ...s.userOverrides,
            [userId]: { ...ensureUser(s.userOverrides, userId), enabled },
          },
        })),

      setUserInheritRole: (userId) =>
        set((s) => ({
          userOverrides: {
            ...s.userOverrides,
            [userId]: {
              ...ensureUser(s.userOverrides, userId),
              navHrefs: null,
            },
          },
        })),

      toggleUserModule: (userId, href, role) => {
        const ov = ensureUser(get().userOverrides, userId);
        const base = expandModules(
          ov.navHrefs ??
            get().roleAccess[role] ??
            DEFAULT_ROLE_ACCESS[role]
        );
        const next = base.includes(href)
          ? base.filter((h) => h !== href)
          : [...base, href];
        const full =
          next.length === ACCESS_MODULES.length ? ["*"] : next;
        set((s) => ({
          userOverrides: {
            ...s.userOverrides,
            [userId]: { ...ov, navHrefs: full },
          },
        }));
      },

      grantUserFullAccess: (userId) =>
        set((s) => ({
          userOverrides: {
            ...s.userOverrides,
            [userId]: {
              ...ensureUser(s.userOverrides, userId),
              navHrefs: ["*"],
            },
          },
        })),

      resetAll: () =>
        set({
          roleAccess: cloneDefaults(),
          userOverrides: {},
        }),
    }),
    { name: "reliable-demo-access" }
  )
);

export function isUserEnabled(userId: string): boolean {
  const ov = useAccessStore.getState().userOverrides[userId];
  return ov?.enabled !== false;
}

export function getEffectiveNavHrefs(account: DemoAccount): string[] {
  const state = useAccessStore.getState();
  const ov = state.userOverrides[account.id];
  if (ov?.navHrefs) return ov.navHrefs;
  return state.roleAccess[account.role] ?? account.navHrefs;
}

export function userHasModule(account: DemoAccount, href: string): boolean {
  return canAccessHref(getEffectiveNavHrefs(account), href);
}
