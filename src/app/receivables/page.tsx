"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatDateTime, formatINR } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import type { Invoice } from "@/types";

const DEMO_AS_OF = "2026-09-18";

const AGING_BUCKETS = [
  { key: "0-30", label: "0–30 days", min: 0, max: 30 },
  { key: "31-60", label: "31–60 days", min: 31, max: 60 },
  { key: "61-90", label: "61–90 days", min: 61, max: 90 },
  { key: "91-120", label: "91–120 days", min: 91, max: 120 },
  { key: "120+", label: "120+ days", min: 121, max: Infinity },
] as const;

type AgingKey = (typeof AGING_BUCKETS)[number]["key"];

const RECEIPT_MODES = ["NEFT", "UPI", "CHEQUE"] as const;

function daysPastDue(dueDate: string, asOf: string) {
  const due = new Date(dueDate);
  const ref = new Date(asOf);
  const ms = ref.getTime() - due.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function agingBucket(days: number): AgingKey {
  if (days <= 30) return "0-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  if (days <= 120) return "91-120";
  return "120+";
}

function balanceDue(inv: Invoice) {
  return Math.max(0, inv.total - inv.amountReceived);
}

export default function ReceivablesPage() {
  const customers = useDemoStore((s) => s.customers);
  const invoices = useDemoStore((s) => s.invoices);
  const receipts = useDemoStore((s) => s.receipts);
  const recordReceipt = useDemoStore((s) => s.recordReceipt);

  const asOf = DEMO_AS_OF || new Date().toISOString().slice(0, 10);

  const openInvoices = invoices.filter((i) => i.status !== "paid");
  const [invoiceId, setInvoiceId] = useState(openInvoices[0]?.id ?? "");
  const [amount, setAmount] = useState(() => {
    const first = openInvoices[0];
    return first ? balanceDue(first) : 0;
  });
  const [mode, setMode] = useState<(typeof RECEIPT_MODES)[number]>("NEFT");
  const [msg, setMsg] = useState<string | null>(null);

  const totalOutstanding = customers.reduce((a, c) => a + c.outstanding, 0);
  const selected = invoices.find((i) => i.id === invoiceId);

  const byCustomer = useMemo(
    () =>
      customers
        .map((c) => {
          const invs = invoices.filter((i) => i.customerId === c.id);
          const invoiced = invs.reduce((a, i) => a + i.total, 0);
          const received = invs.reduce((a, i) => a + i.amountReceived, 0);
          return {
            customer: c,
            invoiced,
            received,
            outstanding: c.outstanding,
            pending: invs.filter((i) => i.status !== "paid").length,
          };
        })
        .filter((r) => r.invoiced > 0 || r.outstanding > 0),
    [customers, invoices]
  );

  const aging = useMemo(() => {
    const groups: Record<AgingKey, { invoices: Invoice[]; total: number }> = {
      "0-30": { invoices: [], total: 0 },
      "31-60": { invoices: [], total: 0 },
      "61-90": { invoices: [], total: 0 },
      "91-120": { invoices: [], total: 0 },
      "120+": { invoices: [], total: 0 },
    };
    for (const inv of openInvoices) {
      const days = Math.max(0, daysPastDue(inv.dueDate, asOf));
      const key = agingBucket(days);
      const bal = balanceDue(inv);
      groups[key].invoices.push(inv);
      groups[key].total += bal;
    }
    return groups;
  }, [openInvoices, asOf]);

  const onRecord = () => {
    if (!invoiceId) return;
    recordReceipt(invoiceId, Number(amount));
    setMsg(`Receipt recorded (${mode}). Outstanding updated.`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Collections"
        title="Receivables & Outstanding"
        description="Receipt → allocation → settlement → outstanding / aging (Accounts / Collections flow)."
      />
      <RoleWorkQueue />

      <div
        className="mb-3.5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        data-tour="ar-dashboard"
      >
        <KPIStat
          label="Total outstanding"
          value={formatINR(totalOutstanding)}
          tone="warning"
        />
        <KPIStat label="Pending invoices" value={openInvoices.length} />
        <KPIStat label="Receipts recorded" value={receipts.length} />
        <KPIStat
          label="Customers outstanding"
          value={customers.filter((c) => c.outstanding > 0).length}
        />
      </div>

      <Tabs defaultValue="dashboard" className="gap-3.5">
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-0"
        >
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="receipt-entry" data-tour="ar-receipt">
            Receipt Entry
          </TabsTrigger>
          <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
          <TabsTrigger value="aging" data-tour="ar-aging">
            Aging
          </TabsTrigger>
          <TabsTrigger value="receipt-history">Receipt History</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-3.5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {AGING_BUCKETS.map((b) => (
              <KPIStat
                key={b.key}
                label={b.label}
                value={formatINR(aging[b.key].total)}
                hint={`${aging[b.key].invoices.length} invoice(s)`}
                tone={
                  b.key === "120+" || b.key === "91-120" ? "warning" : "default"
                }
              />
            ))}
          </div>

          <div className="grid gap-3.5 xl:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader
                title="Collections snapshot"
                subtitle={`As of ${formatDate(asOf)}`}
              />
              <div className="overflow-x-auto">
                <table className="app-table w-full text-left text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="px-4 py-2">Customer</th>
                      <th className="px-4 py-2">Outstanding</th>
                      <th className="px-4 py-2">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byCustomer
                      .filter((r) => r.outstanding > 0)
                      .map((r) => (
                        <tr
                          key={r.customer.id}
                          className="border-b border-border/70"
                        >
                          <td className="px-4 py-2.5 font-medium">
                            {r.customer.name}
                          </td>
                          <td className="px-4 py-2.5 font-data font-semibold text-warning">
                            {formatINR(r.outstanding)}
                          </td>
                          <td className="px-4 py-2.5 font-data">{r.pending}</td>
                        </tr>
                      ))}
                    {byCustomer.filter((r) => r.outstanding > 0).length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No outstanding balances.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <CardHeader title="Recent receipts" subtitle="Latest settlements" />
              <ul className="divide-y divide-border">
                {receipts.slice(0, 5).map((r) => (
                  <li key={r.id} className="px-4 py-2.5 text-sm sm:px-5">
                    <p className="font-data font-medium">{r.number}</p>
                    <p className="text-xs text-slate-500">
                      {formatINR(r.amount)} · {r.mode}
                    </p>
                  </li>
                ))}
                {receipts.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-slate-500">
                    No receipts yet.
                  </li>
                ) : null}
              </ul>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receipt-entry">
          <div className="grid gap-3.5 xl:grid-cols-[1fr_360px]">
            <Card>
              <CardHeader
                title="Open invoices"
                subtitle="Select an invoice to allocate"
              />
              <div className="overflow-x-auto">
                <table className="app-table w-full text-left text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="px-4 py-2">Invoice</th>
                      <th className="px-4 py-2">Customer</th>
                      <th className="px-4 py-2">Due</th>
                      <th className="px-4 py-2">Balance</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {openInvoices.map((i) => {
                      const c = customers.find((x) => x.id === i.customerId);
                      const active = i.id === invoiceId;
                      return (
                        <tr
                          key={i.id}
                          className={`cursor-pointer border-b border-border/70 hover:bg-slate-50/80 ${
                            active ? "bg-slate-50" : ""
                          }`}
                          onClick={() => {
                            setInvoiceId(i.id);
                            setAmount(balanceDue(i));
                          }}
                        >
                          <td className="px-4 py-2.5 font-data font-medium">
                            {i.number}
                          </td>
                          <td className="px-4 py-2.5">{c?.name ?? "—"}</td>
                          <td className="px-4 py-2.5 font-data">
                            {formatDate(i.dueDate)}
                          </td>
                          <td className="px-4 py-2.5 font-data font-semibold text-warning">
                            {formatINR(balanceDue(i))}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge
                              tone={
                                i.status === "partially_paid" ? "amber" : "blue"
                              }
                            >
                              {i.status.replace("_", " ")}
                            </StatusBadge>
                          </td>
                        </tr>
                      );
                    })}
                    {openInvoices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          All invoices are settled.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <CardHeader title="Record receipt" subtitle="Allocate payment" />
              <div className="space-y-3 px-4 py-4 sm:px-5">
                <div>
                  <Label>Invoice</Label>
                  <Select
                    value={invoiceId}
                    onChange={(e) => {
                      setInvoiceId(e.target.value);
                      const inv = invoices.find((i) => i.id === e.target.value);
                      if (inv) setAmount(balanceDue(inv));
                    }}
                  >
                    {openInvoices.length === 0 ? (
                      <option value="">No open invoices</option>
                    ) : (
                      openInvoices.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.number} · due {formatINR(balanceDue(i))}
                        </option>
                      ))
                    )}
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Mode</Label>
                  <Select
                    value={mode}
                    onChange={(e) =>
                      setMode(e.target.value as (typeof RECEIPT_MODES)[number])
                    }
                  >
                    {RECEIPT_MODES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </div>
                {selected ? (
                  <p className="text-xs text-slate-500">
                    {customers.find((c) => c.id === selected.customerId)?.name}{" "}
                    ·{" "}
                    <StatusBadge
                      tone={selected.status === "paid" ? "green" : "blue"}
                    >
                      {selected.status.replace("_", " ")}
                    </StatusBadge>
                  </p>
                ) : null}
                <Button
                  className="w-full"
                  onClick={onRecord}
                  disabled={!invoiceId}
                >
                  Allocate receipt
                </Button>
                {msg ? (
                  <p className="text-xs font-medium text-primary">{msg}</p>
                ) : null}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outstanding">
          <Card>
            <CardHeader
              title="Customer outstanding summary"
              subtitle="Invoiced vs received by account"
            />
            <div className="overflow-x-auto">
              <table className="app-table w-full text-left text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Invoiced</th>
                    <th className="px-4 py-2">Received</th>
                    <th className="px-4 py-2">Outstanding</th>
                    <th className="px-4 py-2">Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {byCustomer.map((r) => (
                    <tr
                      key={r.customer.id}
                      className="border-b border-border/70"
                    >
                      <td className="px-4 py-2.5 font-medium">
                        {r.customer.name}
                      </td>
                      <td className="px-4 py-2.5 font-data">
                        {formatINR(r.invoiced)}
                      </td>
                      <td className="px-4 py-2.5 font-data">
                        {formatINR(r.received)}
                      </td>
                      <td className="px-4 py-2.5 font-data font-semibold text-warning">
                        {formatINR(r.outstanding)}
                      </td>
                      <td className="px-4 py-2.5 font-data">{r.pending}</td>
                    </tr>
                  ))}
                  {byCustomer.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No customer balances to show.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-3.5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {AGING_BUCKETS.map((b) => (
              <KPIStat
                key={b.key}
                label={b.label}
                value={formatINR(aging[b.key].total)}
                hint={`${aging[b.key].invoices.length} open`}
                tone={
                  aging[b.key].total > 0 &&
                  (b.key === "91-120" || b.key === "120+")
                    ? "warning"
                    : "default"
                }
              />
            ))}
          </div>

          {AGING_BUCKETS.map((b) => {
            const group = aging[b.key];
            return (
              <Card key={b.key}>
                <CardHeader
                  title={b.label}
                  subtitle={`${group.invoices.length} invoice(s) · ${formatINR(group.total)}`}
                />
                {group.invoices.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-500 sm:px-5">
                    No open invoices in this bucket.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="app-table w-full text-left text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="px-4 py-2">Invoice</th>
                          <th className="px-4 py-2">Customer</th>
                          <th className="px-4 py-2">Due date</th>
                          <th className="px-4 py-2">Days past due</th>
                          <th className="px-4 py-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.invoices.map((i) => {
                          const c = customers.find(
                            (x) => x.id === i.customerId
                          );
                          const days = Math.max(0, daysPastDue(i.dueDate, asOf));
                          return (
                            <tr
                              key={i.id}
                              className="border-b border-border/70"
                            >
                              <td className="px-4 py-2.5 font-data font-medium">
                                {i.number}
                              </td>
                              <td className="px-4 py-2.5">
                                {c?.name ?? "—"}
                              </td>
                              <td className="px-4 py-2.5 font-data">
                                {formatDate(i.dueDate)}
                              </td>
                              <td className="px-4 py-2.5 font-data">{days}</td>
                              <td className="px-4 py-2.5 font-data font-semibold text-warning">
                                {formatINR(balanceDue(i))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="receipt-history">
          <Card>
            <CardHeader
              title="Receipt history"
              subtitle={`${receipts.length} settlement(s)`}
            />
            {receipts.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No receipts recorded yet. Use Receipt Entry to allocate a
                payment.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="app-table w-full text-left text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="px-4 py-2">Receipt</th>
                      <th className="px-4 py-2">Customer</th>
                      <th className="px-4 py-2">Invoices</th>
                      <th className="px-4 py-2">Mode</th>
                      <th className="px-4 py-2">Received</th>
                      <th className="px-4 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((r) => {
                      const c = customers.find((x) => x.id === r.customerId);
                      const invLabels = r.invoiceIds
                        .map(
                          (id) =>
                            invoices.find((i) => i.id === id)?.number ?? id
                        )
                        .join(", ");
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-border/70"
                        >
                          <td className="px-4 py-2.5 font-data font-medium">
                            {r.number}
                          </td>
                          <td className="px-4 py-2.5">{c?.name ?? "—"}</td>
                          <td className="px-4 py-2.5 font-data text-slate-600">
                            {invLabels || "—"}
                          </td>
                          <td className="px-4 py-2.5">{r.mode}</td>
                          <td className="px-4 py-2.5 font-data text-slate-600">
                            {formatDateTime(r.receivedAt)}
                          </td>
                          <td className="px-4 py-2.5 font-data font-semibold">
                            {formatINR(r.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
