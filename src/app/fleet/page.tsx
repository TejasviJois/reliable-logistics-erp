"use client";

import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { masterData, useDemoStore } from "@/store/demo-store";

export default function FleetPage() {
  const vehicles = useDemoStore((s) => s.vehicles);
  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Fleet"
        description="Vehicles, documents, utilization and expiry alerts."
      />
      <RoleWorkQueue />
      <div className="mb-3.5 grid gap-3 sm:grid-cols-4">
        <KPIStat label="Vehicles" value={vehicles.length} />
        <KPIStat
          label="Available"
          value={vehicles.filter((v) => v.status === "available").length}
        />
        <KPIStat
          label="In transit"
          value={vehicles.filter((v) => v.status === "in_transit").length}
        />
        <KPIStat
          label="Doc attention"
          value={
            vehicles.filter(
              (v) => v.docs.insurance === "Expiring" || v.docs.fitness === "Due"
            ).length
          }
          tone="warning"
        />
      </div>
      <Card>
        <CardHeader title="Vehicle master" subtitle="Network fleet" />
        <ul className="divide-y divide-border">
          {vehicles.map((v) => {
            const driver = masterData.drivers.find((d) => d.id === v.driverId);
            const vendor = masterData.vendors.find((x) => x.id === v.vendorId);
            return (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
              >
                <div>
                  <p className="font-data text-sm font-semibold">
                    {v.registration}
                  </p>
                  <p className="text-xs text-slate-500">
                    {v.type} · {driver?.name} · {vendor?.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Insurance {formatDate(v.insuranceExpiry)} · RC {v.docs.rc} ·
                    Fitness {v.docs.fitness}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge
                    tone={
                      v.status === "available"
                        ? "green"
                        : v.status === "in_transit"
                          ? "blue"
                          : "amber"
                    }
                  >
                    {v.status.replace("_", " ")}
                  </StatusBadge>
                  <p className="mt-1 font-data text-xs text-slate-500">
                    Util {v.currentUtilizationPct}%
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
