"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { EmptyState, PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { MODE_LABEL, STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { formatINR } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import { toast } from "sonner";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customers = useDemoStore((s) => s.customers);
  const allDockets = useDemoStore((s) => s.dockets);
  const allInvoices = useDemoStore((s) => s.invoices);
  const allTickets = useDemoStore((s) => s.tickets);
  const allContracts = useDemoStore((s) => s.contracts);

  const customer = useMemo(
    () => customers.find((c) => c.id === id),
    [customers, id]
  );
  const approveCustomer = useDemoStore((s) => s.approveCustomer);
  const dockets = useMemo(
    () => allDockets.filter((d) => d.customerId === id),
    [allDockets, id]
  );
  const invoices = useMemo(
    () => allInvoices.filter((i) => i.customerId === id),
    [allInvoices, id]
  );
  const tickets = useMemo(
    () => allTickets.filter((t) => t.customerId === id),
    [allTickets, id]
  );
  const contracts = useMemo(
    () => allContracts.filter((c) => c.customerId === id),
    [allContracts, id]
  );

  if (!customer) {
    return (
      <EmptyState
        title="Customer not found"
        description="This profile is not in the demo master."
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={customer.code}
        title={customer.name}
        description={`${customer.address} · GSTIN ${customer.gstin}`}
        actions={
          <>
            <StatusBadge
              tone={
                customer.status === "active"
                  ? "green"
                  : customer.status === "pending"
                    ? "amber"
                    : "slate"
              }
            >
              {customer.status}
            </StatusBadge>
            {customer.status === "pending" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  approveCustomer(customer.id);
                  toast.success(`${customer.name} approved for booking`);
                }}
              >
                Approve for booking
              </Button>
            ) : customer.status === "active" ? (
              <Button asChild size="sm">
                <Link href="/bookings/new">Create shipment</Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <KPIStat label="Shipments" value={dockets.length} />
        <KPIStat label="Contracts" value={contracts.length} />
        <KPIStat label="Outstanding" value={formatINR(customer.outstanding)} />
        <KPIStat
          label="Open tickets"
          value={tickets.filter((t) => t.status !== "closed").length}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader title="Relationship" subtitle="Contacts & commercial" />
          <div className="space-y-3 px-4 py-4 text-sm sm:px-5">
            <p>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Contact
              </span>
              <br />
              {customer.contactPerson} · {customer.email} · {customer.phone}
            </p>
            <p>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Modes
              </span>
              <br />
              {customer.contractedModes.map((m) => MODE_LABEL[m] ?? m).join(", ") ||
                "None"}
            </p>
            <div className="space-y-2">
              {contracts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-[var(--border)] bg-slate-50/80 px-3 py-2.5"
                >
                  <p className="font-medium">
                    {MODE_LABEL[c.mode]} · {c.zone}
                  </p>
                  <p className="font-data text-xs text-slate-500">
                    ₹{c.ratePerKg}/kg · min {formatINR(c.minFreight)} · {c.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Shipments" subtitle="Linked dockets" />
          {dockets.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500 sm:px-5">
              No shipments linked yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="app-table w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-2.5 sm:px-5">Docket</th>
                    <th className="px-4 py-2.5 sm:px-5">Route</th>
                    <th className="px-4 py-2.5 sm:px-5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dockets.map((d) => (
                    <tr key={d.id} className="border-b border-[var(--border)]/70">
                      <td className="px-4 py-3 sm:px-5">
                        <Link
                          href={`/bookings/${d.id}`}
                          className="font-data font-medium text-accent hover:underline"
                        >
                          {d.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 sm:px-5">
                        {d.originCity} → {d.destinationCity}
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <StatusBadge tone={STATUS_TONE[d.status]}>
                          {STATUS_LABEL[d.status]}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Invoices & outstanding" subtitle="Finance" />
          {invoices.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500 sm:px-5">
              No invoices yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="app-table w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-2.5 sm:px-5">Invoice</th>
                    <th className="px-4 py-2.5 sm:px-5">Amount</th>
                    <th className="px-4 py-2.5 sm:px-5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id} className="border-b border-[var(--border)]/70">
                      <td className="px-4 py-3 font-data font-medium sm:px-5">
                        {i.number}
                      </td>
                      <td className="px-4 py-3 font-data text-slate-600 sm:px-5">
                        {formatINR(i.total)}
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <StatusBadge
                          tone={i.status === "paid" ? "green" : "amber"}
                        >
                          {i.status.replace("_", " ")}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Support tickets" subtitle="Communication" />
          {tickets.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500 sm:px-5">
              No tickets.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="app-table w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-2.5 sm:px-5">Ticket</th>
                    <th className="px-4 py-2.5 sm:px-5">Subject</th>
                    <th className="px-4 py-2.5 sm:px-5">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--border)]/70">
                      <td className="px-4 py-3 font-data text-xs text-slate-400 sm:px-5">
                        {t.number}
                      </td>
                      <td className="px-4 py-3 font-medium sm:px-5">
                        {t.subject}
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <StatusBadge tone={t.severity === "P1" ? "red" : "amber"}>
                          {t.severity} · {t.status}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
