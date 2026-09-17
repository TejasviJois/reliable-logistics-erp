"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { formatINR } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export default function BillingPage() {
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);
  const invoices = useDemoStore((s) => s.invoices);
  const generateInvoice = useDemoStore((s) => s.generateInvoice);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const eligible = dockets.filter((d) => d.status === "billing_eligible");
  const selected =
    dockets.find((d) => d.id === selectedId) ??
    eligible[0] ??
    dockets.find((d) => d.number === "DK-10231");

  const preview = useMemo(() => {
    if (!selected) return null;
    const subtotal =
      selected.freight +
      selected.fuelSurcharge +
      selected.handling +
      selected.otherCharges;
    const gst = Math.round(subtotal * (selected.gstRate / 100));
    const stateOf = (city: string) => {
      if (["Bengaluru", "Mysuru"].includes(city)) return "KA";
      if (["Chennai", "Coimbatore"].includes(city)) return "TN";
      if (["Hyderabad"].includes(city)) return "TS";
      if (["Mumbai", "Pune"].includes(city)) return "MH";
      if (["Delhi"].includes(city)) return "DL";
      return city;
    };
    const interState =
      stateOf(selected.originCity) !== stateOf(selected.destinationCity);
    const half = Math.round(gst / 2);
    return {
      subtotal,
      gst,
      cgst: interState ? 0 : half,
      sgst: interState ? 0 : gst - half,
      igst: interState ? gst : 0,
      hsn: "996511",
      placeOfSupply: selected.destinationCity,
      interState,
      total: subtotal + gst,
      lineItems: [
        { label: "Freight", amount: selected.freight },
        { label: "Fuel surcharge", amount: selected.fuelSurcharge },
        { label: "Handling", amount: selected.handling },
      ],
    };
  }, [selected]);

  const onGenerate = () => {
    if (!selected) return;
    const id = generateInvoice(selected.id);
    if (!id) {
      setMsg("Billing locked — approve POD first for TBB dockets.");
      return;
    }
    setMsg(`Invoice generated for ${selected.number}.`);
  };

  const todayBilling = invoices
    .filter((i) => i.invoiceDate === "2026-09-18")
    .reduce((a, i) => a + i.total, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Accounts receivable"
        title="Billing & Invoices"
        description="POD approved → billing unlocked → rating → GST → invoice."
      />
      <RoleWorkQueue />

      <div className="mb-3.5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPIStat label="Today's billing" value={formatINR(todayBilling)} />
        <KPIStat label="Pending billing" value={eligible.length} tone="warning" />
        <KPIStat label="Invoices issued" value={invoices.length} />
        <KPIStat
          label="Outstanding invoices"
          value={invoices.filter((i) => i.status !== "paid").length}
        />
      </div>

      <div className="grid gap-3.5 xl:grid-cols-[1fr_340px]">
        <div className="space-y-3.5">
          <Card>
            <CardHeader
              title="Billing queue"
              subtitle="Eligible after POD approval"
            />
            {eligible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">
                No dockets currently billing-eligible.{" "}
                <a href="/pod" className="font-medium text-primary underline-offset-2 hover:underline">
                  Approve a POD
                </a>{" "}
                to unlock TBB billing.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {eligible.map((d) => {
                  const c = customers.find((x) => x.id === d.customerId);
                  return (
                    <li key={d.id}>
                      <button
                        className={`flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50/80 ${
                          selected?.id === d.id ? "bg-accent-soft/40" : ""
                        }`}
                        onClick={() => setSelectedId(d.id)}
                      >
                        <div>
                          <p className="font-data text-sm font-semibold">
                            {d.number}
                          </p>
                          <p className="text-xs text-slate-500">{c?.name}</p>
                        </div>
                        <StatusBadge tone="blue">Billing eligible</StatusBadge>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {selected ? (
            <Card>
              <CardHeader
                title="Create tax invoice"
                subtitle={`Linked to ${selected.number}`}
              />
              <div className="px-4 py-4 sm:px-5">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Customer</Label>
                  <Input
                    readOnly
                    value={
                      customers.find((c) => c.id === selected.customerId)?.name ??
                      ""
                    }
                  />
                </div>
                <div>
                  <Label>Docket</Label>
                  <Select
                    value={selected.id}
                    onChange={(e) => setSelectedId(e.target.value)}
                  >
                    {[...eligible, selected]
                      .filter(
                        (d, i, arr) => arr.findIndex((x) => x.id === d.id) === i
                      )
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.number} · {STATUS_LABEL[d.status]}
                        </option>
                      ))}
                  </Select>
                </div>
                <div>
                  <Label>Freight</Label>
                  <Input readOnly value={selected.freight} />
                </div>
                <div>
                  <Label>Fuel surcharge</Label>
                  <Input readOnly value={selected.fuelSurcharge} />
                </div>
                <div>
                  <Label>Handling</Label>
                  <Input readOnly value={selected.handling} />
                </div>
                <div>
                  <Label>GST rate</Label>
                  <Input readOnly value={`${selected.gstRate}%`} />
                </div>
              </div>
              {selected.status !== "billing_eligible" &&
              selected.paymentMode === "TBB" ? (
                <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Gate: TBB billing requires POD approval. Current status:{" "}
                  {STATUS_LABEL[selected.status]}
                </p>
              ) : null}
              <Button className="mt-4" onClick={onGenerate}>
                Generate and save invoice
              </Button>
              {msg ? <p className="mt-2 text-xs font-medium text-primary">{msg}</p> : null}
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Invoice register" subtitle="Issued" />
            <div className="overflow-x-auto">
              <table className="app-table w-full text-left text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-2">Invoice</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => {
                    const c = customers.find((x) => x.id === i.customerId);
                    return (
                      <tr key={i.id} className="border-b border-border/70">
                        <td className="px-4 py-2.5 font-data font-medium">
                          {i.number}
                        </td>
                        <td className="px-4 py-2.5 sm:px-5">{c?.name}</td>
                        <td className="px-4 py-2.5 font-data">
                          {formatINR(i.total)}
                        </td>
                        <td className="px-4 py-2.5 sm:px-5">
                          <StatusBadge
                            tone={
                              i.status === "paid"
                                ? "green"
                                : i.status === "issued"
                                  ? "blue"
                                  : "amber"
                            }
                          >
                            {i.status.replace("_", " ")}
                          </StatusBadge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader title="Invoice preview" subtitle="Live calculation" />
          <div className="px-4 py-4 sm:px-5">
          {preview && selected ? (
            <dl className="space-y-2.5 text-sm">
              <div className="rounded-lg border border-[var(--border)] bg-slate-50/80 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Tax invoice preview
                </p>
                <p className="mt-1 font-data text-xs text-slate-500">
                  HSN {preview.hsn} · PoS {preview.placeOfSupply}
                </p>
              </div>
              {preview.lineItems.map((line) => (
                <div key={line.label} className="flex justify-between">
                  <dt className="text-slate-500">{line.label}</dt>
                  <dd className="font-data">{formatINR(line.amount)}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="text-slate-500">Taxable value</dt>
                <dd className="font-data">{formatINR(preview.subtotal)}</dd>
              </div>
              {preview.interState ? (
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    IGST ({selected.gstRate}%)
                  </dt>
                  <dd className="font-data">{formatINR(preview.igst)}</dd>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">
                      CGST ({selected.gstRate / 2}%)
                    </dt>
                    <dd className="font-data">{formatINR(preview.cgst)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">
                      SGST ({selected.gstRate / 2}%)
                    </dt>
                    <dd className="font-data">{formatINR(preview.sgst)}</dd>
                  </div>
                </>
              )}
              <div className="flex justify-between border-t border-border pt-2">
                <dt className="font-medium">Invoice total</dt>
                <dd className="font-data text-lg font-semibold text-primary">
                  {formatINR(preview.total)}
                </dd>
              </div>
              <p className="rounded-xl bg-accent-soft/60 px-3 py-2 text-xs text-slate-600">
                Saved invoice becomes available immediately for receipt
                allocation.
              </p>
              <div className="pt-2">
                <StatusBadge tone={STATUS_TONE[selected.status]}>
                  {STATUS_LABEL[selected.status]}
                </StatusBadge>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-slate-500">Select a docket</p>
          )}
          </div>
        </Card>
      </div>
    </div>
  );
}
