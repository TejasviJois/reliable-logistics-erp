"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Search, UsersRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { masterData, useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import { STATUS_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NETWORK_ALL = "all";

export function Topbar() {
  const router = useRouter();
  const branchId = useDemoStore((s) => s.branchId);
  const setBranchId = useDemoStore((s) => s.setBranchId);
  const account = useSessionStore((s) => s.account);
  const signOut = useSessionStore((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const isAdmin =
    account?.role === "admin" || account?.branchId === "admin";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const switchAccount = () => {
    signOut();
    router.push("/login");
  };

  const onAdminBranchChange = (value: string) => {
    setBranchId(value);
    const label =
      value === NETWORK_ALL
        ? "Network · All hubs"
        : masterData.branches.find((b) => b.id === value)?.name ?? value;
    toast.message("View scope updated", { description: label });
  };

  return (
    <>
      <header className="app-topbar sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] px-5 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-3">
          {isAdmin ? (
            <Select
              value={branchId === NETWORK_ALL || !branchId ? NETWORK_ALL : branchId}
              onValueChange={onAdminBranchChange}
            >
              <SelectTrigger
                size="sm"
                className="hidden h-8 w-[11.5rem] border-[var(--border)] bg-white/90 shadow-[var(--shadow-xs)] sm:flex"
              >
                <SelectValue placeholder="Select hub" />
              </SelectTrigger>
              <SelectContent align="start" position="popper">
                <SelectItem value={NETWORK_ALL}>Network · All hubs</SelectItem>
                {masterData.branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="hidden h-8 items-center rounded-lg bg-slate-50 px-2.5 text-xs font-medium text-slate-600 ring-1 ring-[var(--border)] sm:flex">
              {account?.branchLabel ??
                masterData.branches.find((b) => b.id === branchId)?.name ??
                "Hub"}
            </div>
          )}
          <button
            onClick={() => setOpen(true)}
            className="pressable hidden items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs text-slate-500 shadow-[var(--shadow-xs)] md:flex"
          >
            <Search className="h-3.5 w-3.5" />
            Search dockets, customers, invoices…
            <kbd className="ml-2 rounded border border-[var(--border)] bg-slate-50 px-1.5 py-0.5 font-data text-[10px]">
              ⌘K
            </kbd>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={switchAccount}>
            <UsersRound className="h-3.5 w-3.5" />
            Switch user
          </Button>
          <Separator orientation="vertical" className="mx-0.5 hidden h-7 sm:block" />
          <div className="hidden items-center gap-2 rounded-md border border-border bg-white/70 px-2 py-1 sm:flex">
            <Avatar size="sm">
              <AvatarFallback
                className="text-[11px] font-semibold text-white"
                style={{ backgroundColor: account?.color ?? "#e31e24" }}
              >
                {account?.initials ?? "—"}
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-xs font-medium">{account?.name}</p>
              <p className="text-[10px] text-slate-400">
                {account?.roleLabel}
                {account?.branchId !== "admin"
                  ? ` · ${account?.branchLabel}`
                  : " · All India"}
              </p>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={switchAccount}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Sign out</TooltipContent>
          </Tooltip>
        </div>
      </header>
      {open ? (
        <CommandPalette
          query={q}
          setQuery={setQ}
          onClose={() => {
            setOpen(false);
            setQ("");
          }}
          onNavigate={(href) => {
            setOpen(false);
            setQ("");
            router.push(href);
          }}
        />
      ) : null}
    </>
  );
}

function CommandPalette({
  query,
  setQuery,
  onClose,
  onNavigate,
}: {
  query: string;
  setQuery: (v: string) => void;
  onClose: () => void;
  onNavigate: (href: string) => void;
}) {
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);
  const invoices = useDemoStore((s) => s.invoices);
  const vehicles = useDemoStore((s) => s.vehicles);
  const pods = useDemoStore((s) => s.pods);
  const tickets = useDemoStore((s) => s.tickets);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        { type: "Nav", title: "Operations Overview", meta: "Control", href: "/" },
        { type: "Nav", title: "Create Docket", meta: "Bookings", href: "/bookings/new" },
      ];
    }
    const rows: { type: string; title: string; meta: string; href: string }[] = [];
    dockets
      .filter(
        (d) =>
          d.number.toLowerCase().includes(q) ||
          d.originCity.toLowerCase().includes(q) ||
          d.destinationCity.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .forEach((d) => {
        const c = customers.find((x) => x.id === d.customerId);
        rows.push({
          type: "Docket",
          title: d.number,
          meta: `${c?.name ?? ""} · ${d.originCity} → ${d.destinationCity} · ${STATUS_LABEL[d.status]}`,
          href: `/bookings/${d.id}`,
        });
      });
    customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.gstin.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .forEach((c) =>
        rows.push({
          type: "Customer",
          title: c.name,
          meta: `${c.code} · ${c.status}`,
          href: `/customers/${c.id}`,
        })
      );
    invoices
      .filter((i) => i.number.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((i) =>
        rows.push({
          type: "Invoice",
          title: i.number,
          meta: `${i.status} · ₹${i.total}`,
          href: "/billing",
        })
      );
    vehicles
      .filter((v) => v.registration.toLowerCase().includes(q))
      .slice(0, 3)
      .forEach((v) =>
        rows.push({
          type: "Vehicle",
          title: v.registration,
          meta: `${v.type} · ${v.status}`,
          href: "/fleet",
        })
      );
    pods
      .filter((p) => {
        const d = dockets.find((x) => x.id === p.docketId);
        return d?.number.toLowerCase().includes(q) || p.id.includes(q);
      })
      .slice(0, 3)
      .forEach((p) => {
        const d = dockets.find((x) => x.id === p.docketId);
        rows.push({
          type: "POD",
          title: d?.number ?? p.id,
          meta: p.status,
          href: `/pod?docket=${p.docketId}`,
        });
      });
    tickets
      .filter(
        (t) =>
          t.number.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q)
      )
      .slice(0, 3)
      .forEach((t) =>
        rows.push({
          type: "Ticket",
          title: t.number,
          meta: t.subject,
          href: "/support",
        })
      );
    return rows;
  }, [query, dockets, customers, invoices, vehicles, pods, tickets]);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/40 pt-[12vh]">
      <button className="absolute inset-0" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search DK-10231, Meridian, INV-2026…"
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-slate-500">
              No matches
            </li>
          ) : (
            results.map((r, i) => (
              <li key={`${r.type}-${r.title}-${i}`}>
                <button
                  onClick={() => onNavigate(r.href)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left hover:bg-slate-50"
                  )}
                >
                  <span className="mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                    {r.type}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{r.title}</span>
                    <span className="block text-xs text-slate-500">{r.meta}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
