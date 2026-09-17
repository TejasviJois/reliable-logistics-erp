"use client";

import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { useDemoStore } from "@/store/demo-store";

export default function DeliveryPage() {
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);
  const markOutForDelivery = useDemoStore((s) => s.markOutForDelivery);
  const markDelivered = useDemoStore((s) => s.markDelivered);

  const queue = dockets.filter((d) =>
    ["in_transit", "at_hub", "out_for_delivery", "pod_pending"].includes(d.status)
  );
  const firstOfdId = queue.find((d) =>
    ["in_transit", "at_hub"].includes(d.status)
  )?.id;
  const firstDeliveredId = queue.find(
    (d) => d.status === "out_for_delivery"
  )?.id;

  return (
    <div>
      <PageHeader
        eyebrow="Last mile"
        title="Delivery"
        description="Move shipments to out-for-delivery and confirm delivery before POD."
      />
      <RoleWorkQueue />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KPIStat
          label="In transit / hub"
          value={dockets.filter((d) => ["in_transit", "at_hub"].includes(d.status)).length}
        />
        <KPIStat
          label="Out for delivery"
          value={dockets.filter((d) => d.status === "out_for_delivery").length}
        />
        <KPIStat
          label="Awaiting POD"
          value={dockets.filter((d) => d.status === "pod_pending").length}
        />
      </div>
      <Card data-tour="delivery-board">
        <CardHeader title="Delivery runs" subtitle="Field operations" />
        <div className="overflow-x-auto">
          <table className="app-table w-full text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Docket</th>
                <th className="px-4 py-2.5 sm:px-5">Customer</th>
                <th className="px-4 py-2.5 sm:px-5">Route</th>
                <th className="px-4 py-2.5 sm:px-5">Status</th>
                <th className="px-4 py-2.5 text-right sm:px-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((d) => {
                const c = customers.find((x) => x.id === d.customerId);
                return (
                  <tr key={d.id} className="border-b border-[var(--border)]/70">
                    <td className="px-4 py-3 font-data font-medium sm:px-5">
                      {d.number}
                    </td>
                    <td className="px-4 py-3 sm:px-5">{c?.name}</td>
                    <td className="px-4 py-3 text-slate-500 sm:px-5">
                      {d.originCity} → {d.destinationCity}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <StatusBadge tone={STATUS_TONE[d.status]}>
                        {STATUS_LABEL[d.status]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right sm:px-5">
                      {["in_transit", "at_hub"].includes(d.status) ? (
                        <Button
                          size="sm"
                          data-tour={
                            d.id === firstOfdId ? "delivery-ofd" : undefined
                          }
                          onClick={() => markOutForDelivery(d.id)}
                        >
                          Out for delivery
                        </Button>
                      ) : null}
                      {d.status === "out_for_delivery" ? (
                        <Button
                          size="sm"
                          data-tour={
                            d.id === firstDeliveredId
                              ? "delivery-delivered"
                              : undefined
                          }
                          onClick={() => markDelivered(d.id)}
                        >
                          Mark delivered
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {queue.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No shipments in the delivery queue.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
