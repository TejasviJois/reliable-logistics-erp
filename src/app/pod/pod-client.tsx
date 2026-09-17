"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/status";
import { formatDate, formatDateTime, formatINR } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export default function PodPage() {
  const search = useSearchParams();
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);
  const pods = useDemoStore((s) => s.pods);
  const ingestPod = useDemoStore((s) => s.ingestPod);
  const approvePod = useDemoStore((s) => s.approvePod);
  const rejectPod = useDemoStore((s) => s.rejectPod);
  const requestPodReview = useDemoStore((s) => s.requestPodReview);

  const initialDocket =
    search.get("docket") ??
    dockets.find((d) => d.status === "pod_pending")?.id ??
    "dk-10190";

  const [selectedDocketId, setSelectedDocketId] = useState(initialDocket);
  const [filter, setFilter] = useState<"all" | "attention" | "approved">("all");
  const [extracting, setExtracting] = useState(false);

  const docket = dockets.find((d) => d.id === selectedDocketId);
  const customer = customers.find((c) => c.id === docket?.customerId);
  const pod = pods.find((p) => p.docketId === selectedDocketId);

  const queue = useMemo(() => {
    return dockets.filter((d) => {
      const p = pods.find((x) => x.docketId === d.id);
      if (filter === "approved") return p?.status === "approved";
      if (filter === "attention")
        return (
          d.status === "pod_pending" ||
          p?.status === "extracted" ||
          p?.status === "pending"
        );
      return (
        ["pod_pending", "billing_eligible", "delivered", "invoiced", "paid"].includes(
          d.status
        ) || !!p
      );
    });
  }, [dockets, pods, filter]);

  return (
    <div>
      <PageHeader
        eyebrow="Proof of delivery"
        title="POD verification"
        description="Review delivery evidence and approve before billing unlocks."
      />
      <RoleWorkQueue />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPIStat label="Documents processed" value={pods.length} />
        <KPIStat
          label="Needs attention"
          value={pods.filter((p) => p.status === "extracted").length}
          tone="warning"
        />
        <KPIStat
          label="Approved"
          value={pods.filter((p) => p.status === "approved").length}
          tone="success"
        />
        <KPIStat
          label="Rejected"
          value={pods.filter((p) => p.status === "rejected").length}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[260px_1fr]">
        <Card>
          <CardHeader title="POD register" subtitle="Queue" />
          <div className="flex gap-1 border-b border-[var(--border)] px-3 py-2">
            {(
              [
                ["all", "All"],
                ["attention", "Attention"],
                ["approved", "Approved"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  filter === id
                    ? "bg-primary text-primary-foreground"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <ul className="max-h-[520px] divide-y divide-[var(--border)] overflow-y-auto">
            {queue.map((d) => {
              const p = pods.find((x) => x.docketId === d.id);
              return (
                <li key={d.id}>
                  <button
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                      selectedDocketId === d.id
                        ? "border-l-2 border-l-primary bg-accent-soft/60"
                        : "border-l-2 border-l-transparent"
                    }`}
                    onClick={() => setSelectedDocketId(d.id)}
                  >
                    <p className="font-data text-sm font-semibold">{d.number}</p>
                    <p className="text-xs text-slate-500">
                      {d.originCity} → {d.destinationCity}
                    </p>
                    <div className="mt-1">
                      <StatusBadge
                        tone={
                          p?.status === "approved"
                            ? "green"
                            : p?.status === "extracted"
                              ? "amber"
                              : STATUS_TONE[d.status]
                        }
                      >
                        {p?.status ?? STATUS_LABEL[d.status]}
                      </StatusBadge>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-4">
          {docket && !pod && docket.status === "pod_pending" ? (
            <Card className="p-5">
              <h3 className="text-base font-semibold">Upload POD</h3>
              <p className="mt-1 text-sm text-slate-500">
                Upload delivery evidence for {docket.number}. Capture receiver,
                signature, seal and delivery time for verification.
              </p>
              <div className="mt-4 rounded-lg border border-dashed border-border bg-slate-50 p-8 text-center">
                <p className="text-sm font-medium">POD document preview</p>
                <p className="mt-1 text-xs text-slate-500">
                  Demo: simulate WhatsApp / upload intake
                </p>
                {extracting ? (
                  <p className="mt-3 text-xs font-medium text-primary">
                    Extracting fields…
                  </p>
                ) : null}
              </div>
              <Button
                className="mt-4"
                disabled={extracting}
                onClick={() => {
                  setExtracting(true);
                  window.setTimeout(() => {
                    ingestPod(docket.id);
                    setExtracting(false);
                  }, 900);
                }}
              >
                {extracting ? "Mapping to docket…" : "Ingest and map to docket"}
              </Button>
            </Card>
          ) : null}

          {docket && pod ? (
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <p className="font-data text-xs text-slate-400">{docket.number}</p>
                  <h3 className="font-semibold">Side-by-side review</h3>
                </div>
                <StatusBadge
                  tone={
                    pod.status === "approved"
                      ? "green"
                      : pod.status === "rejected"
                        ? "red"
                        : "amber"
                  }
                >
                  {pod.status}
                </StatusBadge>
              </div>
              <div className="grid gap-0 lg:grid-cols-3">
                <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
                  <p className="mb-2 text-[11px] font-semibold uppercase text-slate-400">
                    POD document
                  </p>
                  <div className="flex h-64 flex-col justify-between rounded-xl border border-[var(--border)] bg-[linear-gradient(145deg,#fff5f5_0%,#f8fafc_48%,#eef1f8_100%)] p-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                        Proof of delivery
                      </p>
                      <p className="mt-3 font-data text-sm">{docket.number}</p>
                      <p className="text-sm">{customer?.name}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Receiver: {pod.receiverName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Delivered:{" "}
                        {pod.deliveryAt ? formatDateTime(pod.deliveryAt) : "—"}
                      </p>
                    </div>
                    <div className="border-t border-slate-300 pt-3">
                      <p className="text-[10px] text-slate-400">Signature</p>
                      <p className="font-serif text-lg italic text-slate-700">
                        {pod.receiverName}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
                  <p className="mb-2 text-[11px] font-semibold uppercase text-slate-400">
                    Captured details
                  </p>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-400">Recipient</dt>
                      <dd className="font-medium">{pod.receiverName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Delivery date</dt>
                      <dd className="font-data">
                        {pod.deliveryAt ? formatDateTime(pod.deliveryAt) : "—"}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <StatusBadge tone={pod.signatureDetected ? "green" : "red"}>
                        Signature {pod.signatureDetected ? "yes" : "no"}
                      </StatusBadge>
                      <StatusBadge tone={pod.sealDetected ? "green" : "amber"}>
                        Seal {pod.sealDetected ? "yes" : "unclear"}
                      </StatusBadge>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">GPS verified</dt>
                      <dd>{pod.gpsVerified ? "Yes" : "No"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Match confidence</dt>
                      <dd className="font-data font-semibold text-accent">
                        {Math.round((pod.ocrConfidence ?? 0) * 100)}%
                      </dd>
                      <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-accent"
                          style={{
                            width: `${(pod.ocrConfidence ?? 0) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    {pod.remarks ? (
                      <p className="rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                        {pod.remarks}
                      </p>
                    ) : null}
                  </dl>
                </div>

                <div className="p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase text-slate-400">
                    Shipment facts
                  </p>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-xs text-slate-400">Customer</dt>
                      <dd className="font-medium">{customer?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Route</dt>
                      <dd>
                        {docket.originCity} → {docket.destinationCity}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Weight</dt>
                      <dd className="font-data">{docket.actualWeightKg} kg</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">EDD</dt>
                      <dd className="font-data">{formatDate(docket.edd)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Freight</dt>
                      <dd className="font-data">{formatINR(docket.freight)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Current status</dt>
                      <dd>
                        <StatusBadge tone={STATUS_TONE[docket.status]}>
                          {STATUS_LABEL[docket.status]}
                        </StatusBadge>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              {pod.status === "extracted" || pod.status === "pending" ? (
                <div className="flex flex-wrap gap-2 border-t border-[var(--border)] bg-slate-50/80 px-4 py-3.5">
                  <Button onClick={() => approvePod(pod.id)}>Approve POD</Button>
                  <Button
                    variant="secondary"
                    onClick={() => requestPodReview(pod.id)}
                  >
                    Request review
                  </Button>
                  <Button variant="danger" onClick={() => rejectPod(pod.id)}>
                    Reject
                  </Button>
                  <p className="w-full text-xs leading-relaxed text-slate-500">
                    Confirm delivery evidence before approving. Billing unlocks
                    only after POD approval for TBB dockets.
                  </p>
                </div>
              ) : pod.status === "approved" ? (
                <div className="border-t border-[var(--border)] bg-emerald-50/90 px-4 py-3.5 text-sm text-emerald-800">
                  Approved after human verification. Billing unlocked for TBB
                  dockets.
                </div>
              ) : null}
            </Card>
          ) : null}

          {docket && !pod && docket.status !== "pod_pending" ? (
            <Card className="p-8 text-center text-sm text-slate-500">
              No POD yet for {docket.number}. Complete delivery first, or select a
              docket awaiting POD.
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
