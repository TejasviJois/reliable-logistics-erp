"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import {
  ACCESS_MODULES,
  DEFAULT_ROLE_ACCESS,
  ROLE_OPTIONS,
  canAccessHref,
  moduleLabel,
} from "@/data/access-catalog";
import {
  DEMO_ACCOUNTS,
  type DemoAccount,
  type DemoRole,
} from "@/data/demo-users";
import { cn, formatINR } from "@/lib/utils";
import { useAccessStore } from "@/store/access-store";
import { useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import { toast } from "sonner";
import type { NetworkLocation } from "@/types";

type Tab = "roles" | "users" | "network" | "executive";

const LOCATION_TYPES: NetworkLocation["type"][] = [
  "REGION",
  "BRANCH",
  "BOOKING_OFFICE",
  "TRANSSHIPMENT_HUB",
];

const emptyNetworkForm = {
  code: "",
  name: "",
  type: "BRANCH" as NetworkLocation["type"],
  region: "South",
  state: "KA",
  city: "",
  pin: "",
};

export default function AdminPage() {
  const account = useSessionStore((s) => s.account);
  const canManage =
    account?.role === "admin" || account?.role === "it" || account?.role === "management";

  const roleAccess = useAccessStore((s) => s.roleAccess);
  const userOverrides = useAccessStore((s) => s.userOverrides);
  const toggleRoleModule = useAccessStore((s) => s.toggleRoleModule);
  const grantRoleFullAccess = useAccessStore((s) => s.grantRoleFullAccess);
  const setUserEnabled = useAccessStore((s) => s.setUserEnabled);
  const setUserInheritRole = useAccessStore((s) => s.setUserInheritRole);
  const toggleUserModule = useAccessStore((s) => s.toggleUserModule);
  const grantUserFullAccess = useAccessStore((s) => s.grantUserFullAccess);
  const resetAll = useAccessStore((s) => s.resetAll);

  const dockets = useDemoStore((s) => s.dockets);
  const trips = useDemoStore((s) => s.trips);
  const invoices = useDemoStore((s) => s.invoices);
  const warehouseExceptions = useDemoStore((s) => s.warehouseExceptions);
  const networkLocations = useDemoStore((s) => s.networkLocations);
  const createNetworkLocation = useDemoStore((s) => s.createNetworkLocation);

  const [tab, setTab] = useState<Tab>("roles");
  const [role, setRole] = useState<DemoRole>("sales");
  const [userId, setUserId] = useState(DEMO_ACCOUNTS[1]?.id ?? DEMO_ACCOUNTS[0].id);
  const [userFilter, setUserFilter] = useState<"all" | DemoRole | "disabled">("all");
  const [networkOpen, setNetworkOpen] = useState(false);
  const [networkForm, setNetworkForm] = useState(emptyNetworkForm);

  const selectedUser = DEMO_ACCOUNTS.find((u) => u.id === userId) ?? DEMO_ACCOUNTS[0];
  const roleModules = roleAccess[role] ?? DEFAULT_ROLE_ACCESS[role];
  const userOv = userOverrides[selectedUser.id];
  const userEnabled = userOv?.enabled !== false;
  const userInherits = !userOv?.navHrefs;
  const effectiveUserModules =
    userOv?.navHrefs ?? roleAccess[selectedUser.role] ?? selectedUser.navHrefs;

  const filteredUsers = useMemo(() => {
    return DEMO_ACCOUNTS.filter((u) => {
      if (userFilter === "disabled")
        return userOverrides[u.id]?.enabled === false;
      if (userFilter === "all") return true;
      return u.role === userFilter;
    });
  }, [userFilter, userOverrides]);

  const disabledCount = DEMO_ACCOUNTS.filter(
    (u) => userOverrides[u.id]?.enabled === false
  ).length;
  const overrideCount = DEMO_ACCOUNTS.filter(
    (u) => !!userOverrides[u.id]?.navHrefs
  ).length;

  const todayKey = new Date().toLocaleDateString("en-CA");
  const docketsToday = dockets.filter((d) =>
    d.createdAt.startsWith(todayKey)
  ).length;
  const tripsInTransit = trips.filter((t) => t.status === "in_transit").length;
  const invoicesOutstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + (i.total - i.amountReceived), 0);
  const openExceptions = warehouseExceptions.filter(
    (e) => e.status === "open"
  ).length;

  if (!canManage) {
    return (
      <div>
        <PageHeader
          eyebrow="Governance"
          title="Administration"
          description="Access control is restricted to Admin, IT and Branch Manager."
        />
        <Card className="p-6 text-sm text-slate-600">
          Signed in as {account?.roleLabel}. Switch to{" "}
          <strong>Demo Administrator</strong> or an IT account to manage roles
          and users.
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Governance"
        title="Access control"
        description="Grant modules by role template, then override per user. Changes apply immediately to navigation."
        actions={
          <Button variant="secondary" size="sm" onClick={resetAll}>
            Reset defaults
          </Button>
        }
      />
      <RoleWorkQueue />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <KPIStat label="Demo users" value={DEMO_ACCOUNTS.length} />
        <KPIStat label="Roles" value={ROLE_OPTIONS.length} />
        <KPIStat label="User overrides" value={overrideCount} />
        <KPIStat
          label="Disabled users"
          value={disabledCount}
          tone={disabledCount ? "warning" : "default"}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {(
          [
            ["roles", "Role access"],
            ["users", "User access"],
            ["network", "Network Master"],
            ["executive", "Executive"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-tour={
              id === "roles"
                ? "admin-roles-tab"
                : id === "users"
                  ? "admin-users-tab"
                  : id === "network"
                    ? "admin-network-tab"
                    : undefined
            }
            onClick={() => setTab(id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              tab === id
                ? "bg-white text-foreground shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "roles" ? (
        <div className="grid gap-4 xl:grid-cols-[240px_1fr]">
          <Card>
            <CardHeader title="Roles" subtitle="Templates" />
            <ul className="max-h-[640px] overflow-y-auto divide-y divide-border">
              {ROLE_OPTIONS.map((r) => {
                const mods = roleAccess[r.role] ?? DEFAULT_ROLE_ACCESS[r.role];
                const count = mods.includes("*")
                  ? "All"
                  : String(mods.length);
                return (
                  <li key={r.role}>
                    <button
                      type="button"
                      onClick={() => setRole(r.role)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm hover:bg-slate-50",
                        role === r.role && "bg-accent-soft/50"
                      )}
                    >
                      <span className="font-medium">{r.label}</span>
                      <StatusBadge tone={mods.includes("*") ? "green" : "slate"}>
                        {count}
                      </StatusBadge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title={`${ROLE_OPTIONS.find((r) => r.role === role)?.label} modules`}
              subtitle={
                DEMO_ACCOUNTS.find((a) => a.role === role)?.primaryFlow ??
                "Role template — applies to all users with this role unless overridden"
              }
              action={
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      useAccessStore.setState((s) => ({
                        roleAccess: {
                          ...s.roleAccess,
                          [role]: [...DEFAULT_ROLE_ACCESS[role]],
                        },
                      }))
                    }
                  >
                    Reset role
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => grantRoleFullAccess(role)}
                    disabled={role === "admin"}
                  >
                    Full access
                  </Button>
                </div>
              }
            />
            <ModuleChecklist
              selected={roleModules}
              locked={role === "admin"}
              onToggle={(href) => toggleRoleModule(role, href)}
            />
          </Card>
        </div>
      ) : tab === "users" ? (
        <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
          <Card>
            <CardHeader
              title="Users"
              subtitle="Per-account control"
              action={
                <select
                  className="h-8 rounded-md border border-border bg-white px-2 text-xs"
                  value={userFilter}
                  onChange={(e) =>
                    setUserFilter(e.target.value as typeof userFilter)
                  }
                >
                  <option value="all">All users</option>
                  <option value="disabled">Disabled only</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              }
            />
            <ul className="max-h-[640px] overflow-y-auto divide-y divide-border">
              {filteredUsers.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  active={u.id === selectedUser.id}
                  enabled={userOverrides[u.id]?.enabled !== false}
                  hasOverride={!!userOverrides[u.id]?.navHrefs}
                  onSelect={() => setUserId(u.id)}
                />
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title={selectedUser.name}
              subtitle={`${selectedUser.email} · ${selectedUser.roleLabel} · ${selectedUser.branchLabel}`}
              action={
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={userEnabled ? "secondary" : "default"}
                    onClick={() =>
                      setUserEnabled(selectedUser.id, !userEnabled)
                    }
                    disabled={selectedUser.role === "admin"}
                  >
                    {userEnabled ? "Disable login" : "Enable login"}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setUserInheritRole(selectedUser.id)}
                    disabled={userInherits}
                  >
                    Inherit role
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => grantUserFullAccess(selectedUser.id)}
                    disabled={selectedUser.role === "admin"}
                  >
                    Full access
                  </Button>
                </div>
              }
            />
            <div className="border-b border-border px-4 py-3 text-xs text-slate-500 sm:px-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                PDF primary flow
              </p>
              <p className="mb-3 text-sm text-foreground">
                {selectedUser.primaryFlow}
              </p>
              {userEnabled ? (
                userInherits ? (
                  <>
                    Using <strong>role template</strong> (
                    {effectiveUserModules.includes("*")
                      ? "all modules"
                      : `${effectiveUserModules.length} modules`}
                    ). Toggle any module to create a user override.
                  </>
                ) : (
                  <>
                    <strong>Custom override</strong> active —{" "}
                    {effectiveUserModules.includes("*")
                      ? "all modules"
                      : effectiveUserModules.map(moduleLabel).join(", ")}
                  </>
                )
              ) : (
                <span className="text-danger">
                  Login disabled — this account will not appear as active on the
                  sign-in screen.
                </span>
              )}
            </div>
            <ModuleChecklist
              selected={effectiveUserModules}
              locked={selectedUser.role === "admin" || !userEnabled}
              onToggle={(href) =>
                toggleUserModule(selectedUser.id, href, selectedUser.role)
              }
            />
          </Card>
        </div>
      ) : tab === "network" ? (
        <div>
          <Card>
            <CardHeader
              title="Network locations"
              subtitle="Regions, branches, booking offices and hubs"
              action={
                <Button size="sm" onClick={() => setNetworkOpen(true)}>
                  + Location
                </Button>
              }
            />
            <div className="overflow-x-auto">
              <table className="app-table w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-2.5 sm:px-5">Code</th>
                    <th className="px-4 py-2.5 sm:px-5">Name</th>
                    <th className="px-4 py-2.5 sm:px-5">Type</th>
                    <th className="px-4 py-2.5 sm:px-5">Region</th>
                    <th className="px-4 py-2.5 sm:px-5">City / state</th>
                    <th className="px-4 py-2.5 sm:px-5">PIN</th>
                  </tr>
                </thead>
                <tbody>
                  {networkLocations.map((loc) => (
                    <tr
                      key={loc.id}
                      className="border-b border-[var(--border)]/70"
                    >
                      <td className="px-4 py-3 font-data text-xs sm:px-5">
                        {loc.code}
                      </td>
                      <td className="px-4 py-3 font-medium sm:px-5">
                        {loc.name}
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <StatusBadge tone="slate">
                          {loc.type.replaceAll("_", " ")}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-600 sm:px-5">
                        {loc.region}
                      </td>
                      <td className="px-4 py-3 text-slate-600 sm:px-5">
                        {loc.city}, {loc.state}
                      </td>
                      <td className="px-4 py-3 font-data text-xs sm:px-5">
                        {loc.pin}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <EntityFormSheet
            open={networkOpen}
            onOpenChange={setNetworkOpen}
            title="New network location"
            description="Add a region, branch, booking office or transshipment hub."
            onSave={() => {
              if (
                !networkForm.code.trim() ||
                !networkForm.name.trim() ||
                !networkForm.city.trim() ||
                !networkForm.pin.trim()
              ) {
                toast.message("Fill code, name, city and PIN");
                return;
              }
              createNetworkLocation({
                code: networkForm.code.trim().toUpperCase(),
                name: networkForm.name.trim(),
                type: networkForm.type,
                region: networkForm.region.trim(),
                state: networkForm.state.trim().toUpperCase(),
                city: networkForm.city.trim(),
                pin: networkForm.pin.trim(),
              });
              toast.success("Network location created");
              setNetworkOpen(false);
              setNetworkForm(emptyNetworkForm);
            }}
          >
            <div>
              <Label>Code</Label>
              <Input
                value={networkForm.code}
                placeholder="BR-BLR"
                onChange={(e) =>
                  setNetworkForm((f) => ({ ...f, code: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={networkForm.name}
                placeholder="Bengaluru Hub"
                onChange={(e) =>
                  setNetworkForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={networkForm.type}
                onChange={(e) =>
                  setNetworkForm((f) => ({
                    ...f,
                    type: e.target.value as NetworkLocation["type"],
                  }))
                }
              >
                {LOCATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Region</Label>
              <Input
                value={networkForm.region}
                onChange={(e) =>
                  setNetworkForm((f) => ({ ...f, region: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                value={networkForm.state}
                placeholder="KA"
                onChange={(e) =>
                  setNetworkForm((f) => ({ ...f, state: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                value={networkForm.city}
                onChange={(e) =>
                  setNetworkForm((f) => ({ ...f, city: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>PIN</Label>
              <Input
                value={networkForm.pin}
                placeholder="560001"
                onChange={(e) =>
                  setNetworkForm((f) => ({ ...f, pin: e.target.value }))
                }
              />
            </div>
          </EntityFormSheet>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KPIStat label="Dockets today" value={docketsToday} />
          <KPIStat label="Trips in transit" value={tripsInTransit} />
          <KPIStat
            label="Invoices outstanding"
            value={formatINR(invoicesOutstanding)}
            tone={invoicesOutstanding > 0 ? "warning" : "default"}
          />
          <KPIStat
            label="Warehouse exceptions"
            value={openExceptions}
            tone={openExceptions ? "warning" : "default"}
          />
        </div>
      )}
    </div>
  );
}

function UserRow({
  user,
  active,
  enabled,
  hasOverride,
  onSelect,
}: {
  user: DemoAccount;
  active: boolean;
  enabled: boolean;
  hasOverride: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50/80 sm:px-5",
          active && "bg-accent-soft/50"
        )}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white"
          style={{ backgroundColor: user.color }}
        >
          {user.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-slate-500">
            {user.roleLabel} · {user.branchLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge tone={enabled ? "green" : "red"}>
            {enabled ? "active" : "off"}
          </StatusBadge>
          {hasOverride ? (
            <span className="text-[10px] font-medium text-accent">override</span>
          ) : null}
        </div>
      </button>
    </li>
  );
}

function ModuleChecklist({
  selected,
  onToggle,
  locked,
}: {
  selected: string[];
  onToggle: (href: string) => void;
  locked?: boolean;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, typeof ACCESS_MODULES>();
    ACCESS_MODULES.forEach((m) => {
      const list = map.get(m.group) ?? [];
      list.push(m);
      map.set(m.group, list);
    });
    return [...map.entries()];
  }, []);

  return (
    <div className="space-y-4 px-4 py-4 sm:px-5">
      {groups.map(([group, modules]) => (
        <div key={group}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {group}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {modules.map((m) => {
              const on = canAccessHref(selected, m.href);
              return (
                <label
                  key={m.href}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                    on
                      ? "border-primary/25 bg-accent-soft/40"
                      : "border-[var(--border)] bg-white hover:bg-slate-50/80",
                    locked && "cursor-not-allowed opacity-60"
                  )}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--brand-red)]"
                    checked={on}
                    disabled={locked}
                    onChange={() => onToggle(m.href)}
                  />
                  <span className="font-medium text-foreground">{m.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
