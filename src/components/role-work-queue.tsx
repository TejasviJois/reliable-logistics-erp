"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { roleQueueFor, type RoleQueueItem } from "@/data/role-work";
import { useSessionStore } from "@/store/session-store";
import { useDemoStore } from "@/store/demo-store";
import { cn } from "@/lib/utils";

export function RoleWorkQueue({ className }: { className?: string }) {
  const account = useSessionStore((s) => s.account);
  const dockets = useDemoStore((s) => s.dockets);
  const pods = useDemoStore((s) => s.pods);
  const tickets = useDemoStore((s) => s.tickets);
  const vehicles = useDemoStore((s) => s.vehicles);

  if (!account || account.role === "admin") return null;

  const items = roleQueueFor(account.role, {
    docketsPendingScan: dockets.filter((d) =>
      ["booked", "warehouse"].includes(d.status)
    ).length,
    readyToDispatch: dockets.filter(
      (d) =>
        ["booked", "warehouse"].includes(d.status) &&
        d.boxes.length > 0 &&
        d.boxes.every((b) => b.scanned)
    ).length,
    ofdCount: dockets.filter((d) => d.status === "out_for_delivery").length,
    podPending: pods.filter(
      (p) => p.status === "pending" || p.status === "extracted"
    ).length,
    billable: dockets.filter((d) => d.status === "billing_eligible").length,
    openTickets: tickets.filter(
      (t) => t.status === "open" || t.status === "in_progress"
    ).length,
    fleetExpiring: vehicles.filter(
      (v) => v.docs.insurance === "Expiring" || v.docs.fitness === "Due"
    ).length,
  });

  if (!items.length) return null;

  return (
    <div
      className={cn(
        "mb-5 rounded-xl border border-accent/20 bg-accent-soft/60 px-4 py-3",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-accent">
          Your work today · {account.roleLabel}
        </p>
        <p className="text-[11px] text-slate-500">{account.branchLabel}</p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <QueueChip key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function QueueChip({ item }: { item: RoleQueueItem }) {
  return (
    <Link
      href={item.href}
      className="group flex items-start justify-between gap-2 rounded-lg border border-white/80 bg-white px-3 py-2.5 transition-colors hover:border-accent/40"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.title}
        </p>
        <p className="truncate text-xs text-slate-500">{item.meta}</p>
      </div>
      <ArrowRight
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-accent",
          item.tone === "urgent" && "text-accent"
        )}
      />
    </Link>
  );
}
