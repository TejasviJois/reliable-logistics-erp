"use client";

import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatINR, formatDateTime } from "@/lib/utils";
import { masterData, useDemoStore } from "@/store/demo-store";

export default function VendorCostsPage() {
  const thcs = useDemoStore((s) => s.thcs);
  const trips = useDemoStore((s) => s.trips);
  const createThc = useDemoStore((s) => s.createThc);

  const tripOptions = trips.filter((t) => t.status !== "planned");

  return (
    <div>
      <PageHeader
        eyebrow="Transport cost"
        title="Vendor Costs — THC & BTH"
        description="Truck hire challans link manifests to vendor advances and balance settlement."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KPIStat label="THC records" value={thcs.length} />
        <KPIStat
          label="Pending approval"
          value={thcs.filter((t) => t.status === "pending").length}
          tone="warning"
        />
        <KPIStat
          label="Approved value"
          value={formatINR(
            thcs
              .filter((t) => t.status === "approved")
              .reduce((a, t) => a + t.contractAmount, 0)
          )}
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tripOptions.slice(0, 3).map((t) => (
          <Button
            key={t.id}
            variant="secondary"
            size="sm"
            onClick={() => createThc(t.id)}
          >
            Create THC for {t.code}
          </Button>
        ))}
      </div>
      <Card>
        <CardHeader title="THC register" subtitle="Traffic + Accounts approvals" />
        <div className="overflow-x-auto">
          <table className="app-table w-full text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">THC</th>
                <th className="px-4 py-2.5 sm:px-5">Vendor / trip</th>
                <th className="px-4 py-2.5 sm:px-5">Contract</th>
                <th className="px-4 py-2.5 sm:px-5">Created</th>
                <th className="px-4 py-2.5 sm:px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {thcs.map((t) => {
                const vendor = masterData.vendors.find((v) => v.id === t.vendorId);
                const trip = trips.find((x) => x.id === t.tripId);
                return (
                  <tr key={t.id} className="border-b border-[var(--border)]/70">
                    <td className="px-4 py-3 font-data font-semibold sm:px-5">
                      {t.number}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <p className="font-medium">{vendor?.name}</p>
                      <p className="text-xs text-slate-500">
                        {trip?.code} · Advance {formatINR(t.advance)}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-data font-medium sm:px-5">
                      {formatINR(t.contractAmount)}
                    </td>
                    <td className="px-4 py-3 font-data text-xs text-slate-500 sm:px-5">
                      {formatDateTime(t.createdAt)}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <StatusBadge
                        tone={
                          t.status === "approved"
                            ? "green"
                            : t.status === "pending"
                              ? "amber"
                              : "slate"
                        }
                      >
                        {t.status}
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
  );
}
