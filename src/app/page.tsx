"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_TONE, MODE_LABEL } from "@/lib/status";
import { formatINR, formatNumber } from "@/lib/utils";
import { masterData, useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";

const PIPELINE = [
  { key: "booked", label: "Booked", statuses: ["booked", "draft"] },
  { key: "warehouse", label: "Warehouse", statuses: ["warehouse"] },
  { key: "transit", label: "In transit", statuses: ["dispatched", "in_transit", "at_hub"] },
  { key: "ofd", label: "OFD", statuses: ["out_for_delivery"] },
  { key: "pod", label: "POD", statuses: ["pod_pending", "delivered"] },
  { key: "billing", label: "Billing", statuses: ["billing_eligible"] },
  { key: "invoiced", label: "Invoiced", statuses: ["invoiced", "paid"] },
] as const;

export default function OperationsOverviewPage() {
  const branchId = useDemoStore((s) => s.branchId);
  const allDockets = useDemoStore((s) => s.dockets);
  const invoices = useDemoStore((s) => s.invoices);
  const customers = useDemoStore((s) => s.customers);
  const vehicles = useDemoStore((s) => s.vehicles);
  const pods = useDemoStore((s) => s.pods);
  const tickets = useDemoStore((s) => s.tickets);
  const trips = useDemoStore((s) => s.trips);
  const receipts = useDemoStore((s) => s.receipts);
  const thcs = useDemoStore((s) => s.thcs);
  const openDrawer = useDemoStore((s) => s.openDocketDrawer);
  const account = useSessionStore((s) => s.account);
  const canCreateDocket =
    account?.role === "booking" || account?.role === "management";

  const dockets = useMemo(
    () =>
      branchId === "all"
        ? allDockets
        : allDockets.filter((d) => d.originBranchId === branchId),
    [allDockets, branchId]
  );

  const scopedPods = useMemo(() => {
    if (branchId === "all") return pods;
    const ids = new Set(dockets.map((d) => d.id));
    return pods.filter((p) => ids.has(p.docketId));
  }, [pods, dockets, branchId]);

  const hubLabel =
    branchId === "all"
      ? "All hubs"
      : masterData.branches.find((b) => b.id === branchId)?.name ?? "Hub";

  const stats = useMemo(() => {
    const todayShipments = dockets.filter((d) =>
      d.createdAt.startsWith("2026-09-17")
    ).length;
    const tonnageBooked =
      dockets.reduce((a, d) => a + d.actualWeightKg, 0) / 1000;
    const packagesLive = dockets.reduce((a, d) => a + d.packages, 0);
    const inTransit = dockets.filter((d) =>
      ["in_transit", "dispatched", "at_hub"].includes(d.status)
    ).length;
    const ofd = dockets.filter((d) => d.status === "out_for_delivery").length;
    const exceptions = dockets.filter((d) => d.status === "exception").length;
    const deliveredLike = dockets.filter((d) =>
      ["delivered", "pod_pending", "pod_approved", "billing_eligible", "invoiced", "paid"].includes(
        d.status
      )
    ).length;
    const deliverySuccessPct =
      dockets.length > 0
        ? Math.round((deliveredLike / dockets.length) * 100)
        : 0;

    const docketIds = new Set(dockets.map((d) => d.id));
    const scopedInvoices =
      branchId === "all"
        ? invoices
        : invoices.filter((i) => docketIds.has(i.docketId));
    const revenue = scopedInvoices
      .filter((i) => i.status !== "draft")
      .reduce((a, i) => a + i.total, 0);
    const collected = receipts.reduce((a, r) => a + r.amount, 0);
    const outstanding = customers.reduce((a, c) => a + c.outstanding, 0);
    const billable = dockets.filter((d) => d.status === "billing_eligible").length;
    const podPending = scopedPods.filter(
      (p) => p.status === "pending" || p.status === "extracted"
    ).length;
    const openTickets = tickets.filter(
      (t) => t.status === "open" || t.status === "in_progress"
    ).length;
    const p1Tickets = tickets.filter((t) => t.severity === "P1").length;
    const vehiclesTransit = vehicles.filter((v) => v.status === "in_transit").length;
    const vehiclesAvail = vehicles.filter((v) => v.status === "available").length;
    const fleetDocRisk = vehicles.filter(
      (v) => v.docs.insurance === "Expiring" || v.docs.fitness === "Due"
    ).length;
    const vendorCost = thcs.reduce((a, t) => a + t.contractAmount, 0);
    const grossMargin = revenue - vendorCost;
    const activeCustomers = customers.filter((c) => c.status === "active").length;
    const pendingCustomers = customers.filter((c) => c.status === "pending").length;
    const warehouseQueue = dockets.filter((d) =>
      ["booked", "warehouse"].includes(d.status)
    ).length;
    const tripsLive = trips.filter((t) =>
      ["dispatched", "in_transit"].includes(t.status)
    ).length;

    return {
      todayShipments,
      tonnageBooked,
      packagesLive,
      inTransit,
      ofd,
      exceptions,
      deliverySuccessPct,
      revenue,
      collected,
      outstanding,
      billable,
      podPending,
      openTickets,
      p1Tickets,
      vehiclesTransit,
      vehiclesAvail,
      fleetDocRisk,
      vendorCost,
      grossMargin,
      activeCustomers,
      pendingCustomers,
      warehouseQueue,
      tripsLive,
      networkDockets: dockets.length,
    };
  }, [
    dockets,
    invoices,
    customers,
    scopedPods,
    tickets,
    vehicles,
    thcs,
    receipts,
    trips,
    branchId,
  ]);

  const pipeline = PIPELINE.map((stage) => ({
    ...stage,
    count: dockets.filter((d) =>
      (stage.statuses as readonly string[]).includes(d.status)
    ).length,
  }));
  const pipelineMax = Math.max(1, ...pipeline.map((p) => p.count));

  const hubPerformance = masterData.branches.slice(0, 4).map((b) => {
    const hubDockets = dockets.filter((d) => d.originBranchId === b.id);
    const tonnage =
      hubDockets.reduce((a, d) => a + d.actualWeightKg, 0) / 1000;
    const pending = hubDockets.filter((d) =>
      ["booked", "warehouse"].includes(d.status)
    ).length;
    return {
      id: b.id,
      name: b.name,
      city: b.city,
      dockets: hubDockets.length,
      tonnage,
      pending,
    };
  });

  const modeMix = (["PTL", "FTL", "AIR", "RAIL", "SURFACE"] as const)
    .map((mode) => ({
      mode,
      count: dockets.filter((d) => d.transportMode === mode).length,
      tonnage:
        dockets
          .filter((d) => d.transportMode === mode)
          .reduce((a, d) => a + d.actualWeightKg, 0) / 1000,
    }))
    .filter((m) => m.count > 0);

  const topCustomers = [...customers]
    .sort((a, b) => b.outstanding - a.outstanding || a.name.localeCompare(b.name))
    .slice(0, 4);

  const attention = [
    {
      id: "a1",
      title: "POD awaiting approval",
      meta: `${stats.podPending} document(s) — billing unlock blocked for TBB`,
      href: "/pod",
      severity: "high" as const,
    },
    {
      id: "a2",
      title: "Ready to invoice",
      meta: `${stats.billable} docket(s) in billing queue`,
      href: "/billing",
      severity: "medium" as const,
    },
    {
      id: "a3",
      title: "Collections outstanding",
      meta: `${formatINR(stats.outstanding)} across ${customers.filter((c) => c.outstanding > 0).length} customers`,
      href: "/receivables",
      severity: stats.outstanding > 0 ? ("high" as const) : ("low" as const),
    },
    {
      id: "a4",
      title: "Support tickets open",
      meta: `${stats.openTickets} open · ${stats.p1Tickets} P1`,
      href: "/support",
      severity: stats.p1Tickets ? ("high" as const) : ("medium" as const),
    },
    {
      id: "a5",
      title: "Warehouse staging",
      meta: `${stats.warehouseQueue} docket(s) awaiting scan / dispatch`,
      href: "/warehouse",
      severity: "medium" as const,
    },
    {
      id: "a6",
      title: "Fleet document risk",
      meta:
        vehicles
          .filter(
            (v) => v.docs.insurance === "Expiring" || v.docs.fitness === "Due"
          )
          .map((v) => v.registration)
          .join(", ") || "All clear",
      href: "/fleet",
      severity: stats.fleetDocRisk ? ("medium" as const) : ("low" as const),
    },
    {
      id: "a7",
      title: "Customers pending approval",
      meta: `${stats.pendingCustomers} profile(s) blocked for booking until Admin approve`,
      href: "/customers",
      severity: stats.pendingCustomers ? ("high" as const) : ("low" as const),
    },
    {
      id: "a8",
      title: "Vendor hire (THC) exposure",
      meta: `${formatINR(stats.vendorCost)} contracted · margin ${formatINR(stats.grossMargin)}`,
      href: "/vendor-costs",
      severity: "low" as const,
    },
  ];

  const lanes = [
    { lane: "Bengaluru → Chennai", volume: 4, tonnage: 5.1, sla: 94, onTime: 18, delayed: 1 },
    { lane: "Chennai → Hyderabad", volume: 2, tonnage: 0.9, sla: 91, onTime: 9, delayed: 1 },
    { lane: "Hyderabad → Delhi", volume: 1, tonnage: 0.3, sla: 88, onTime: 7, delayed: 1 },
    { lane: "Bengaluru → Pune", volume: 1, tonnage: 4.2, sla: 96, onTime: 11, delayed: 0 },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Control tower"
        title="Business overview"
        description={
          branchId === "all"
            ? "Owner view across bookings, network movement, delivery proof, billing, collections, fleet and support — one screen for the whole business."
            : `Scoped to ${hubLabel} — bookings, movement, POD, billing and ops for this hub. Switch back to Network · All hubs for the full picture.`
        }
        actions={
          canCreateDocket ? (
            <Button asChild>
              <Link href="/bookings/new">+ Create docket</Link>
            </Button>
          ) : undefined
        }
      />
      <RoleWorkQueue />

      <div data-tour="overview-kpis">
        {/* Executive KPIs — BRD: dockets, tonnage, revenue, vehicles, delivery success */}
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Executive snapshot
        </p>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <KPIStat
            label="Network dockets"
            value={stats.networkDockets}
            hint={`${stats.todayShipments} booked today`}
          />
          <KPIStat
            label="Tonnage on books"
            value={`${stats.tonnageBooked.toFixed(1)} T`}
            hint={`${formatNumber(stats.packagesLive)} packages`}
          />
          <KPIStat
            label="Revenue billed"
            value={formatINR(stats.revenue)}
            hint={`${formatINR(stats.collected)} collected`}
          />
          <KPIStat
            label="Vehicles in transit"
            value={stats.vehiclesTransit}
            hint={`${stats.vehiclesAvail} available · ${stats.tripsLive} live trips`}
          />
          <KPIStat
            label="Delivery success"
            value={`${stats.deliverySuccessPct}%`}
            hint={`${stats.ofd} out for delivery`}
            tone={stats.deliverySuccessPct >= 90 ? "success" : "warning"}
          />
        </div>

        {/* Cash & commercial */}
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Commercial & cash
        </p>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <KPIStat
            label="Outstanding AR"
            value={formatINR(stats.outstanding)}
            tone="warning"
            hint="Customer receivables"
          />
          <KPIStat label="Billing unlocked" value={stats.billable} hint="POD approved · TBB" />
          <KPIStat label="POD pending" value={stats.podPending} tone={stats.podPending ? "warning" : "default"} />
          <KPIStat
            label="Active customers"
            value={stats.activeCustomers}
            hint={
              stats.pendingCustomers
                ? `${stats.pendingCustomers} awaiting approval`
                : "All approved"
            }
          />
          <KPIStat
            label="Vendor hire (THC)"
            value={formatINR(stats.vendorCost)}
            hint="Transport cost on books"
          />
          <KPIStat
            label="Gross margin proxy"
            value={formatINR(stats.grossMargin)}
            hint="Billed revenue − THC"
            tone={stats.grossMargin >= 0 ? "success" : "danger"}
          />
        </div>

        {/* Ops health */}
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
          Operations health
        </p>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <KPIStat label="In transit" value={stats.inTransit} />
          <KPIStat label="Out for delivery" value={stats.ofd} />
          <KPIStat label="Warehouse queue" value={stats.warehouseQueue} />
          <KPIStat
            label="Exceptions"
            value={stats.exceptions}
            tone={stats.exceptions ? "danger" : "success"}
          />
          <KPIStat
            label="Open tickets"
            value={stats.openTickets}
            hint={stats.p1Tickets ? `${stats.p1Tickets} P1` : "No P1"}
            tone={stats.p1Tickets ? "danger" : "default"}
          />
          <KPIStat
            label="Fleet doc risk"
            value={stats.fleetDocRisk}
            tone={stats.fleetDocRisk ? "warning" : "success"}
            hint="Insurance / fitness"
          />
        </div>
      </div>

      {/* Pipeline */}
      <Card className="mb-5">
        <CardHeader
          title="Shipment pipeline"
          subtitle="Network status flow"
          action={
            <Link href="/bookings" className="text-xs font-medium text-accent">
              Full register →
            </Link>
          }
        />
        <div className="grid gap-3 px-4 py-4 sm:grid-cols-7">
          {pipeline.map((stage) => (
            <div key={stage.key} className="min-w-0">
              <p className="text-[11px] font-medium text-slate-500">{stage.label}</p>
              <p className="mt-1 font-data text-xl font-semibold">{stage.count}</p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-accent transition-[width] duration-[220ms] [transition-timing-function:var(--ease-out)]"
                  style={{
                    width: `${Math.max(8, (stage.count / pipelineMax) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="Hub performance" subtitle="Origin branches" />
          <ul className="divide-y divide-border">
            {hubPerformance.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{h.name}</p>
                  <p className="text-xs text-slate-500">{h.city}</p>
                </div>
                <div className="text-right font-data text-xs text-slate-500">
                  <p className="text-sm font-semibold text-foreground">
                    {h.dockets} dockets
                  </p>
                  <p>
                    {h.tonnage.toFixed(1)}T · {h.pending} pending
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Mode mix" subtitle="Transport modes" />
          <ul className="divide-y divide-border">
            {modeMix.map((m) => (
              <li
                key={m.mode}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <p className="text-sm font-semibold">
                  {MODE_LABEL[m.mode] ?? m.mode}
                </p>
                <p className="font-data text-xs text-slate-500">
                  {m.count} · {m.tonnage.toFixed(1)}T
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Customer receivables"
            subtitle="Highest outstanding"
            action={
              <Link href="/receivables" className="text-xs font-medium text-accent">
                Collections →
              </Link>
            }
          />
          <ul className="divide-y divide-border">
            {topCustomers.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/customers/${c.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.city} · {c.status}
                    </p>
                  </div>
                  <p
                    className={`font-data text-sm font-semibold ${
                      c.outstanding > 0 ? "text-warning" : "text-success"
                    }`}
                  >
                    {formatINR(c.outstanding)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Card>
          <CardHeader
            subtitle="Live network"
            title="Docket visibility"
            action={
              <Link href="/tracking" className="text-xs font-medium text-accent">
                Live tracking →
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-[11px] uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Docket / Customer</th>
                  <th className="px-4 py-2 font-medium">Route</th>
                  <th className="px-4 py-2 font-medium">Mode</th>
                  <th className="px-4 py-2 font-medium">Weight</th>
                  <th className="px-4 py-2 font-medium">Payment</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dockets.slice(0, 10).map((d) => {
                  const c = customers.find((x) => x.id === d.customerId);
                  return (
                    <tr
                      key={d.id}
                      className="cursor-pointer border-b border-border/70 hover:bg-slate-50"
                      onClick={() => openDrawer(d.id)}
                    >
                      <td className="px-4 py-3">
                        <p className="font-data font-medium">{d.number}</p>
                        <p className="text-xs text-slate-500">{c?.name}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {d.originCity} → {d.destinationCity}
                      </td>
                      <td className="px-4 py-3">
                        {MODE_LABEL[d.transportMode]}
                      </td>
                      <td className="px-4 py-3 font-data">
                        {formatNumber(d.actualWeightKg)} kg
                      </td>
                      <td className="px-4 py-3 font-data text-xs">
                        {d.paymentMode}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge tone={STATUS_TONE[d.status]}>
                          {STATUS_LABEL[d.status]}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card data-tour="overview-attention">
            <CardHeader
              subtitle="Owner priorities"
              title="Attention queue"
            />
            <ul className="max-h-[420px] divide-y divide-border overflow-y-auto">
              {attention.map((a) => (
                <li key={a.id}>
                  <Link
                    href={a.href}
                    className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.meta}</p>
                    </div>
                    <StatusBadge
                      tone={
                        a.severity === "high"
                          ? "red"
                          : a.severity === "medium"
                            ? "amber"
                            : "slate"
                      }
                    >
                      {a.severity}
                    </StatusBadge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader subtitle="Lane SLA" title="Top corridors" />
            <div className="space-y-3 px-4 py-3">
              {lanes.map((l) => (
                <div key={l.lane}>
                  <div className="mb-1 flex justify-between gap-2 text-sm">
                    <span className="font-medium">{l.lane}</span>
                    <span className="shrink-0 font-data text-xs text-slate-500">
                      SLA {l.sla}% · {l.onTime}OT / {l.delayed}D
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-accent"
                      style={{ width: `${l.sla}%` }}
                    />
                  </div>
                  <p className="mt-1 font-data text-[11px] text-slate-400">
                    {l.volume} dockets · {l.tonnage}T
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
