"use client";

import { use } from "react";
import Image from "next/image";
import { EmptyState } from "@/components/ui/page";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Timeline } from "@/components/workflow";
import { formatDateTime } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export default function PublicTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const trips = useDemoStore((s) => s.trips);
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);

  const trip =
    trips.find((t) => t.publicToken === token) ??
    trips.find((t) => `trk-${t.id}` === token);

  if (!trip) {
    return (
      <div className="min-h-screen bg-background px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-lg">
          <EmptyState
            title="Tracking link not found"
            description="This public token does not match an active journey. Ask your carrier for an updated link."
          />
        </div>
      </div>
    );
  }

  const docket = dockets.find((d) => d.id === trip.docketIds[0]);
  const customer = customers.find((c) => c.id === docket?.customerId);
  const updates = trip.customerUpdates ?? [];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_42%)]">
      <header className="border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Image
            src="/reliable-logo.png"
            alt="Reliable Logistics Solutions"
            width={200}
            height={60}
            className="h-10 w-auto object-contain"
            priority
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Shipment tracking
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6 sm:py-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-data text-xs text-slate-400">{trip.code}</p>
            {trip.delayed ? (
              <StatusBadge tone="amber">Delayed</StatusBadge>
            ) : null}
            <StatusBadge
              tone={
                trip.status === "completed"
                  ? "green"
                  : trip.status === "in_transit"
                    ? "blue"
                    : trip.status === "arrived"
                      ? "teal"
                      : "slate"
              }
            >
              {trip.status.replace("_", " ")}
            </StatusBadge>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {trip.origin} → {trip.destination}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {customer?.name ?? "Customer"}
            {docket?.number ? ` · ${docket.number}` : null}
          </p>
        </div>

        <Card>
          <CardHeader title="Live progress" subtitle={trip.currentLocation} />
          <div className="space-y-4 px-4 pb-5 sm:px-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span className="font-data font-semibold text-foreground">
                  {trip.progressPct}%
                </span>
              </div>
              <Progress value={trip.progressPct} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">Route</p>
                <p className="text-sm font-medium">
                  {trip.origin} → {trip.destination}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ETA</p>
                <p className="font-data text-sm font-medium">
                  {formatDateTime(trip.eta)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Last known position</p>
                <p className="font-data text-sm font-medium">
                  {trip.lat.toFixed(4)}, {trip.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader title="Checkpoints" subtitle="Journey milestones" />
            <div className="px-4 py-3">
              <Timeline
                items={trip.checkpoints.map((c) => ({
                  title: c.label,
                  at: c.at ? formatDateTime(c.at) : "Pending",
                  tone: c.done ? "done" : "todo",
                }))}
              />
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Latest updates"
              subtitle="Messages from Reliable"
            />
            <div className="px-4 py-3">
              {updates.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No customer updates have been published yet.
                </p>
              ) : (
                <Timeline
                  items={updates.map((u) => ({
                    title: u.message,
                    meta: u.channel,
                    at: formatDateTime(u.at),
                    tone: "done" as const,
                  }))}
                />
              )}
            </div>
          </Card>
        </div>

        <p className="pb-6 text-center text-xs text-slate-400">
          Powered by Reliable Logistics Solutions · Public tracking demo
        </p>
      </main>
    </div>
  );
}
