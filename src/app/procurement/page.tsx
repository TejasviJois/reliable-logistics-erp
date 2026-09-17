"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { formatINR } from "@/lib/utils";
import { purchaseOrders, type PurchaseOrder } from "@/data/role-work";
import { masterData } from "@/store/demo-store";

export default function ProcurementPage() {
  const [pos, setPos] = useState(purchaseOrders);
  const vendors = masterData.vendors;

  const markReceived = (id: string) => {
    setPos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "received" as PurchaseOrder["status"] } : p
      )
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Procurement"
        description="Purchase orders for packaging, fleet spares and hub supplies."
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
                {pos.map((po) => (
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
                      {po.status === "ordered" || po.status === "partial" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markReceived(po.id)}
                        >
                          Mark received
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
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
    </div>
  );
}
