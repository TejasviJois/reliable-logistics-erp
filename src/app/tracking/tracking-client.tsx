"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Timeline } from "@/components/workflow";
import { NetworkMap } from "@/components/network-map";
import { formatDateTime } from "@/lib/utils";
import { masterData, useDemoStore } from "@/store/demo-store";

export default function TrackingPage() {
  const search = useSearchParams();
  const trips = useDemoStore((s) => s.trips);
  const dockets = useDemoStore((s) => s.dockets);
  const vehicles = useDemoStore((s) => s.vehicles);
  const customers = useDemoStore((s) => s.customers);

  const initial = useMemo(() => {
    const docketId = search.get("docket");
    if (docketId) {
      const t = trips.find((x) => x.docketIds.includes(docketId));
      if (t) return t.id;
    }
    const hero = trips.find(
      (t) => t.docketIds.includes("dk-10231") && t.status !== "planned"
    );
    return (
      hero?.id ??
      trips.find((t) => t.status === "in_transit")?.id ??
      trips[0]?.id
    );
  }, [search, trips]);

  const [selectedId, setSelectedId] = useState(initial);
  const trip = trips.find((t) => t.id === selectedId) ?? trips[0];
  const vehicle = vehicles.find((v) => v.id === trip?.vehicleId);
  const driver = masterData.drivers.find((d) => d.id === trip?.driverId);
  const docket = dockets.find((d) => d.id === trip?.docketIds[0]);
  const customer = customers.find((c) => c.id === docket?.customerId);

  const active = trips.filter((t) =>
    ["dispatched", "in_transit", "arrived"].includes(t.status)
  );
  const delayed = active.filter((t) => t.progressPct < 25 && t.status === "in_transit").length;

  // Soft live progress for in-transit trips (demo pulse)
  useEffect(() => {
    const tick = window.setInterval(() => {
      useDemoStore.setState((s) => ({
        trips: s.trips.map((t) => {
          if (t.status !== "in_transit" || t.progressPct >= 92) return t;
          const next = Math.min(92, t.progressPct + 1);
          return {
            ...t,
            progressPct: next,
            currentLocation:
              next > 50
                ? `En route · ${t.origin} → ${t.destination}`
                : t.currentLocation,
          };
        }),
      }));
    }, 4000);
    return () => window.clearInterval(tick);
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Visibility"
        title="Live Tracking"
        description="Network map of active journeys, ETA and checkpoint history."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPIStat label="Active journeys" value={active.length} />
        <KPIStat label="Delayed / slow" value={delayed} tone={delayed ? "warning" : "default"} />
        <KPIStat
          label="Avg progress"
          value={`${Math.round(
            active.reduce((a, t) => a + t.progressPct, 0) /
              Math.max(active.length, 1)
          )}%`}
        />
        <KPIStat
          label="Mapped journeys"
          value={active.filter((t) => t.lat && t.lng).length}
          tone="success"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[280px_1fr_300px]">
        <Card>
          <CardHeader title="Journey queue" subtitle="Dispatched trucks" />
          <ul className="divide-y divide-[var(--border)]">
            {trips
              .filter(
                (t) => t.status !== "planned" || t.docketIds.includes("dk-10231")
              )
              .map((t) => (
                <li key={t.id}>
                  <button
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                      selectedId === t.id
                        ? "border-l-2 border-l-primary bg-accent-soft/60"
                        : "border-l-2 border-l-transparent"
                    }`}
                    onClick={() => setSelectedId(t.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-data text-xs font-semibold">{t.code}</p>
                      <StatusBadge
                        tone={
                          t.status === "in_transit"
                            ? "blue"
                            : t.status === "completed"
                              ? "green"
                              : "slate"
                        }
                      >
                        {t.status.replace("_", " ")}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm">
                      {t.origin} → {t.destination}
                    </p>
                    <p className="font-data text-xs text-slate-500">
                      {t.progressPct}% complete
                    </p>
                  </button>
                </li>
              ))}
          </ul>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
            <p className="font-data text-xs text-slate-400">{trip?.code}</p>
            <h3 className="text-lg font-semibold tracking-tight">
              {trip?.origin} → {trip?.destination}
            </h3>
          </div>
          <NetworkMap
            trips={active.length ? active : trips.slice(0, 3)}
            selectedId={trip?.id}
            onSelect={setSelectedId}
          />
          {trip ? (
            <div className="grid grid-cols-2 gap-3 border-t border-border p-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">Vehicle</p>
                <p className="font-data font-medium">{vehicle?.registration}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Driver</p>
                <p className="font-medium">{driver?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Shipment</p>
                <p className="font-medium">
                  {docket?.packages} pkgs · {docket?.actualWeightKg} kg
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Customer</p>
                <p className="font-medium">{customer?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Latest location</p>
                <p className="font-medium">{trip.currentLocation}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ETA</p>
                <p className="font-data font-medium">
                  {formatDateTime(trip.eta)}
                </p>
              </div>
            </div>
          ) : null}
        </Card>

        <Card>
          <CardHeader title="Journey timeline" subtitle="Checkpoints" />
          <div className="px-4 py-3">
            <Timeline
              items={
                trip?.checkpoints.map((c) => ({
                  title: c.label,
                  at: c.at ? formatDateTime(c.at) : "Pending",
                  tone: c.done ? "done" : "todo",
                })) ?? []
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
