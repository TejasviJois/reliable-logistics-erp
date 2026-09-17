"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { EmptyState, PageHeader, SectionLabel } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Timeline, WorkflowStepper } from "@/components/workflow";
import { MODE_LABEL, STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { formatDate, formatDateTime, formatINR } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export default function DocketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);
  const allAudit = useDemoStore((s) => s.audit);
  const invoices = useDemoStore((s) => s.invoices);

  const docket = useMemo(() => dockets.find((d) => d.id === id), [dockets, id]);
  const customer = useMemo(
    () => customers.find((c) => c.id === docket?.customerId),
    [customers, docket?.customerId]
  );
  const audit = useMemo(() => {
    if (!docket) return [];
    const suffix = docket.number.slice(3);
    return allAudit.filter(
      (a) => a.entityId === docket.number || a.entityId.includes(suffix)
    );
  }, [allAudit, docket]);
  const invoice = useMemo(
    () => invoices.find((i) => i.docketId === id),
    [invoices, id]
  );

  if (!docket) {
    return (
      <EmptyState
        title="Docket not found"
        description="This booking is not in the demo register."
      />
    );
  }

  const scanned = docket.boxes.filter((b) => b.scanned).length;

  return (
    <div>
      <PageHeader
        eyebrow="Docket"
        title={docket.number}
        description={`${customer?.name} · ${docket.originCity} → ${docket.destinationCity}`}
        actions={
          <>
            <StatusBadge tone={STATUS_TONE[docket.status]}>
              {STATUS_LABEL[docket.status]}
            </StatusBadge>
            <Button asChild variant="secondary" size="sm">
              <Link href="/warehouse">Warehouse</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/tracking">Track</Link>
            </Button>
          </>
        }
      />

      <div className="mb-5">
        <WorkflowStepper status={docket.status} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5 sm:p-6">
          <SectionLabel>Shipment facts</SectionLabel>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4 text-sm md:grid-cols-3">
            <div>
              <dt className="text-[11px] text-muted-foreground">Consignor</dt>
              <dd className="mt-0.5 font-medium">{docket.consignor}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Consignee</dt>
              <dd className="mt-0.5 font-medium">{docket.consignee}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Mode</dt>
              <dd className="mt-0.5 font-medium">
                {MODE_LABEL[docket.transportMode]}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Packages</dt>
              <dd className="mt-0.5 font-data font-medium">
                {scanned}/{docket.packages} scanned
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Weight</dt>
              <dd className="mt-0.5 font-data font-medium">
                {docket.actualWeightKg} kg
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Freight</dt>
              <dd className="mt-0.5 font-data font-medium">
                {formatINR(docket.freight)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">EDD</dt>
              <dd className="mt-0.5 font-data font-medium">
                {formatDate(docket.edd)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">E-way Bill</dt>
              <dd className="mt-0.5 font-data font-medium">
                {docket.ewayBill ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] text-muted-foreground">Invoice</dt>
              <dd className="mt-0.5 font-data font-medium">
                {invoice?.number ?? "Not generated"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardHeader title="Activity" subtitle="Audit trail" />
          <div className="px-4 py-3 sm:px-5">
            <Timeline
              items={
                audit.length
                  ? audit.slice(0, 6).map((a) => ({
                      title: a.action,
                      meta: `${a.user}${a.next ? ` · ${a.next}` : ""}`,
                      at: formatDateTime(a.at),
                      tone: "done" as const,
                    }))
                  : [
                      {
                        title: "Docket created",
                        at: formatDateTime(docket.createdAt),
                        tone: "done" as const,
                      },
                    ]
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
