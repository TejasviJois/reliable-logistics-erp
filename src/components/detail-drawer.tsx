"use client";

import Link from "next/link";
import { useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { WorkflowStepper } from "@/components/workflow";
import { MODE_LABEL, STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { formatDate, formatINR } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export function DetailDrawer() {
  const open = useDemoStore((s) => s.drawerOpen);
  const selectedId = useDemoStore((s) => s.selectedDocketId);
  const close = useDemoStore((s) => s.closeDrawer);
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);
  const invoices = useDemoStore((s) => s.invoices);
  const pods = useDemoStore((s) => s.pods);

  const docket = useMemo(
    () => dockets.find((d) => d.id === selectedId),
    [dockets, selectedId]
  );
  const customer = useMemo(
    () => customers.find((c) => c.id === docket?.customerId),
    [customers, docket?.customerId]
  );
  const invoice = useMemo(
    () => invoices.find((i) => i.id === docket?.billingInvoiceId),
    [invoices, docket?.billingInvoiceId]
  );
  const pod = useMemo(
    () => pods.find((p) => p.id === docket?.podId),
    [pods, docket?.podId]
  );

  if (!open || !docket) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        className="absolute inset-0 bg-slate-900/30"
        aria-label="Close drawer"
        onClick={close}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <p className="font-data text-xs text-slate-400">{docket.number}</p>
            <h2 className="text-lg font-semibold">{customer?.name}</h2>
            <p className="text-sm text-slate-500">
              {docket.originCity} → {docket.destinationCity}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={close}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <StatusBadge tone={STATUS_TONE[docket.status]}>
            {STATUS_LABEL[docket.status]}
          </StatusBadge>
          <WorkflowStepper status={docket.status} />
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Packages</dt>
              <dd className="font-data font-medium">{docket.packages}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Weight</dt>
              <dd className="font-data font-medium">{docket.actualWeightKg} kg</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Mode</dt>
              <dd className="font-medium">{MODE_LABEL[docket.transportMode]}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">EDD</dt>
              <dd className="font-data font-medium">{formatDate(docket.edd)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Freight</dt>
              <dd className="font-data font-medium">{formatINR(docket.freight)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Payment</dt>
              <dd className="font-medium">{docket.paymentMode}</dd>
            </div>
          </dl>
          {pod ? (
            <div className="rounded-md border border-border bg-slate-50 p-3 text-sm">
              <p className="text-xs text-slate-400">POD</p>
              <p className="font-medium capitalize">{pod.status}</p>
            </div>
          ) : null}
          {invoice ? (
            <div className="rounded-md border border-border bg-slate-50 p-3 text-sm">
              <p className="text-xs text-slate-400">Invoice</p>
              <p className="font-data font-medium">
                {invoice.number} · {formatINR(invoice.total)}
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border px-5 py-4">
          <Button asChild variant="secondary" size="sm">
            <Link href={`/tracking?docket=${docket.id}`} onClick={close}>
              Track
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/pod?docket=${docket.id}`} onClick={close}>
              View POD
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/bookings/${docket.id}`} onClick={close}>
              Open docket
            </Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
