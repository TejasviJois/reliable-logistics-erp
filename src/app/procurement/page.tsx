"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { formatINR } from "@/lib/utils";
import { canMutate } from "@/data/can-mutate";
import { useDeptStore } from "@/store/dept-store";
import { useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import { toast } from "sonner";

const HUBS = ["Bengaluru Hub", "Chennai Hub", "Hyderabad Hub", "Mumbai Hub"];
const CATEGORIES = [
  "Cartons & stretch film",
  "Tyre set — HCV",
  "Handheld barcode scanners",
  "Stationery / labels",
  "Hub supplies",
];

export default function ProcurementPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "procurement");
  const pos = useDeptStore((s) => s.purchaseOrders);
  const createPO = useDeptStore((s) => s.createPO);
  const deletePO = useDeptStore((s) => s.deletePO);
  const advancePO = useDeptStore((s) => s.advancePO);
  const vendors = useDemoStore((s) => s.vendors);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    vendor: vendors[0]?.name ?? "",
    category: CATEGORIES[0],
    amount: 50000,
    eta: "2026-10-01",
    hub: HUBS[0],
  });

  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Procurement"
        description="Purchase orders for packaging, fleet spares and hub supplies."
        actions={
          canEdit ? (
            <Button
              size="sm"
              data-tour="proc-new-po"
              onClick={() => {
                setForm((f) => ({
                  ...f,
                  vendor: f.vendor || vendors[0]?.name || "",
                }));
                setOpen(true);
              }}
            >
              + PO
            </Button>
          ) : undefined
        }
      />
      <RoleWorkQueue />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <KPIStat
          label="Open POs"
          value={pos.filter((p) => !["closed", "received"].includes(p.status)).length}
        />
        <KPIStat
          label="Awaiting delivery"
          value={pos.filter((p) => p.status === "ordered" || p.status === "partial").length}
          tone="warning"
        />
        <KPIStat label="Vendors" value={vendors.length} />
        <KPIStat
          label="Open PO value"
          value={formatINR(
            pos
              .filter((p) => !["closed", "received"].includes(p.status))
              .reduce((a, p) => a + p.amount, 0)
          )}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Purchase orders" subtitle="Buy desk" />
          <div className="overflow-x-auto">
            <table className="app-table w-full text-left text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">PO</th>
                  <th className="px-4 py-2.5 sm:px-5">Vendor / hub</th>
                  <th className="px-4 py-2.5 sm:px-5">Amount</th>
                  <th className="px-4 py-2.5 sm:px-5">Status</th>
                  <th className="px-4 py-2.5 text-right sm:px-5">Action</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po) => {
                  const isFirstAdvance =
                    po.status !== "closed" &&
                    pos.find((p) => p.status !== "closed")?.id === po.id;
                  return (
                  <tr key={po.id} className="border-b border-[var(--border)]/70">
                    <td className="px-4 py-3 sm:px-5">
                      <p className="font-data text-xs text-slate-400">{po.number}</p>
                      <p className="font-medium">{po.category}</p>
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <p className="font-medium">{po.vendor}</p>
                      <p className="text-xs text-slate-500">
                        {po.hub} · ETA {po.eta}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-data font-semibold sm:px-5">
                      {formatINR(po.amount)}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <StatusBadge
                        tone={
                          po.status === "received" || po.status === "closed"
                            ? "green"
                            : po.status === "partial"
                              ? "amber"
                              : po.status === "ordered"
                                ? "blue"
                                : "slate"
                        }
                      >
                        {po.status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right sm:px-5">
                      {canEdit ? (
                        <div className="flex flex-wrap justify-end gap-1">
                          {po.status !== "closed" ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              data-tour={
                                isFirstAdvance ? "proc-advance" : undefined
                              }
                              onClick={() => {
                                advancePO(po.id);
                                toast.success("PO advanced");
                              }}
                            >
                              Advance
                            </Button>
                          ) : null}
                          {po.status === "draft" ? (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                deletePO(po.id);
                                toast.message("Draft PO deleted");
                              }}
                            >
                              Delete
                            </Button>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Preferred vendors" subtitle="Supply base" />
          <div className="overflow-x-auto">
            <table className="app-table w-full text-left text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">Vendor</th>
                  <th className="px-4 py-2.5 text-right sm:px-5">Rating</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id} className="border-b border-[var(--border)]/70">
                    <td className="px-4 py-3 sm:px-5">
                      <p className="font-medium">{v.name}</p>
                      <p className="text-xs text-slate-500">
                        {v.type} · {v.phone}
                      </p>
                      <p className="mt-0.5 font-data text-[11px] text-slate-400">
                        {v.gstin}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-data font-semibold sm:px-5">
                      {v.rating.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <EntityFormSheet
        open={open}
        onOpenChange={setOpen}
        title="New purchase order"
        description="Raise a PO for packaging, spares or hub supplies."
        onSave={() => {
          if (!form.vendor.trim() || !form.category.trim()) return;
          createPO(form);
          toast.success("Purchase order created");
          setOpen(false);
          setForm({
            vendor: vendors[0]?.name ?? "",
            category: CATEGORIES[0],
            amount: 50000,
            eta: "2026-10-01",
            hub: HUBS[0],
          });
        }}
      >
        <div>
          <Label>Vendor</Label>
          <Select
            value={form.vendor}
            onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Select
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label>ETA</Label>
          <Input
            type="date"
            value={form.eta}
            onChange={(e) => setForm((f) => ({ ...f, eta: e.target.value }))}
          />
        </div>
        <div>
          <Label>Hub</Label>
          <Select
            value={form.hub}
            onChange={(e) => setForm((f) => ({ ...f, hub: e.target.value }))}
          >
            {HUBS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </Select>
        </div>
      </EntityFormSheet>
    </div>
  );
}
