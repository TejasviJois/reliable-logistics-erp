"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export default function ReceivablesPage() {
  const customers = useDemoStore((s) => s.customers);
  const invoices = useDemoStore((s) => s.invoices);
  const receipts = useDemoStore((s) => s.receipts);
  const recordReceipt = useDemoStore((s) => s.recordReceipt);

  const openInvoices = invoices.filter((i) => i.status !== "paid");
  const [invoiceId, setInvoiceId] = useState(openInvoices[0]?.id ?? "");
  const [amount, setAmount] = useState(openInvoices[0]?.total ?? 0);
  const [msg, setMsg] = useState<string | null>(null);

  const totalOutstanding = customers.reduce((a, c) => a + c.outstanding, 0);
  const selected = invoices.find((i) => i.id === invoiceId);

  const onRecord = () => {
    if (!invoiceId) return;
    recordReceipt(invoiceId, Number(amount));
    setMsg("Receipt recorded. Outstanding updated.");
  };

  const byCustomer = customers
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
    .filter((r) => r.invoiced > 0 || r.outstanding > 0);

  return (
    <div>
      <PageHeader
        eyebrow="Collections"
        title="Receivables & Outstanding"
        description="Receipt → allocation → settlement → outstanding / aging (Accounts / Collections flow)."
      />
      <RoleWorkQueue />

      <div className="mb-3.5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPIStat label="Total outstanding" value={formatINR(totalOutstanding)} tone="warning" />
        <KPIStat label="Pending invoices" value={openInvoices.length} />
        <KPIStat label="Receipts recorded" value={receipts.length} />
        <KPIStat
          label="Customers outstanding"
          value={customers.filter((c) => c.outstanding > 0).length}
        />
      </div>

      <div className="grid gap-3.5 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader title="Customer outstanding summary" subtitle="Aging view" />
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
                  <tr key={r.customer.id} className="border-b border-border/70">
                    <td className="px-4 py-2.5 font-medium">{r.customer.name}</td>
                    <td className="px-4 py-2.5 font-data">{formatINR(r.invoiced)}</td>
                    <td className="px-4 py-2.5 font-data">{formatINR(r.received)}</td>
                    <td className="px-4 py-2.5 font-data font-semibold text-warning">
                      {formatINR(r.outstanding)}
                    </td>
                    <td className="px-4 py-2.5 font-data">{r.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-3.5">
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
                    if (inv) setAmount(inv.total - inv.amountReceived);
                  }}
                >
                  {openInvoices.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.number} · due {formatINR(i.total - i.amountReceived)}
                    </option>
                  ))}
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
              {selected ? (
                <p className="text-xs text-slate-500">
                  {customers.find((c) => c.id === selected.customerId)?.name} ·{" "}
                  <StatusBadge
                    tone={selected.status === "paid" ? "green" : "blue"}
                  >
                    {selected.status.replace("_", " ")}
                  </StatusBadge>
                </p>
              ) : null}
              <Button className="w-full" onClick={onRecord}>
                Allocate receipt
              </Button>
              {msg ? <p className="text-xs font-medium text-primary">{msg}</p> : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Receipt history" subtitle="Recent" />
            <ul className="divide-y divide-border">
              {receipts.map((r) => (
                <li key={r.id} className="px-4 py-2.5 text-sm sm:px-5">
                  <p className="font-data font-medium">{r.number}</p>
                  <p className="text-xs text-slate-500">
                    {formatINR(r.amount)} · {r.mode}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
