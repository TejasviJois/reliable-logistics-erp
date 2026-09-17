"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { ScanLabelDialog } from "@/components/scan-label-dialog";
import { MODE_LABEL, STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { formatNumber } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import type { Docket } from "@/types";

export default function BookingsPage() {
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);
  const openDrawer = useDemoStore((s) => s.openDocketDrawer);
  const account = useSessionStore((s) => s.account);
  const canCreateDocket =
    account?.role === "booking" || account?.role === "management";
  const [labelDocket, setLabelDocket] = useState<Docket | null>(null);

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Bookings"
        description="Docket register across the network. Print scan labels for warehouse."
        actions={
          canCreateDocket ? (
            <Button asChild>
              <Link href="/bookings/new" data-tour="bookings-create">
                + Create docket
              </Link>
            </Button>
          ) : undefined
        }
      />
      <RoleWorkQueue />
      <Card data-tour="bookings-register">
        <CardHeader title="Docket register" subtitle="All bookings" />
        <div className="overflow-x-auto">
          <table className="app-table w-full text-left text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Docket</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Route</th>
                <th className="px-4 py-2.5">Mode</th>
                <th className="px-4 py-2.5">Pkgs</th>
                <th className="px-4 py-2.5">Chargeable</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Scan label</th>
                <th className="px-4 py-2.5 sm:px-5" />
              </tr>
            </thead>
            <tbody>
              {dockets.map((d, index) => {
                const c = customers.find((x) => x.id === d.customerId);
                return (
                  <tr key={d.id} className="border-b border-border/70">
                    <td className="px-4 py-2.5 font-data font-medium sm:px-5">
                      {d.number}
                    </td>
                    <td className="px-4 py-2.5">{c?.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {d.originCity} → {d.destinationCity}
                    </td>
                    <td className="px-4 py-2.5">{MODE_LABEL[d.transportMode]}</td>
                    <td className="px-4 py-2.5 font-data">{d.packages}</td>
                    <td className="px-4 py-2.5 font-data">
                      {formatNumber(d.chargeableWeightKg)} kg
                    </td>
                    <td className="px-4 py-2.5">
                      <button type="button" onClick={() => openDrawer(d.id)}>
                        <StatusBadge tone={STATUS_TONE[d.status]}>
                          {STATUS_LABEL[d.status]}
                        </StatusBadge>
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        data-tour={
                          index === 0 ? "bookings-print-label" : undefined
                        }
                        onClick={() => setLabelDocket(d)}
                      >
                        View / print barcode
                      </Button>
                    </td>
                    <td className="px-4 py-2.5 text-right sm:px-5">
                      <Link
                        href={`/bookings/${d.id}`}
                        className="text-xs font-semibold text-primary"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ScanLabelDialog
        docket={labelDocket}
        open={!!labelDocket}
        onOpenChange={(open) => {
          if (!open) setLabelDocket(null);
        }}
      />
    </div>
  );
}
