"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Timeline } from "@/components/workflow";
import { NetworkMap } from "@/components/network-map";
import { formatDateTime } from "@/lib/utils";
import { masterData, useDemoStore } from "@/store/demo-store";

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function etaToIso(value: string) {
  if (!value.trim()) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toISOString();
}

export default function TrackingPage() {
  const search = useSearchParams();
  const trips = useDemoStore((s) => s.trips);
  const dockets = useDemoStore((s) => s.dockets);
  const vehicles = useDemoStore((s) => s.vehicles);
  const customers = useDemoStore((s) => s.customers);
  const publishTripProgress = useDemoStore((s) => s.publishTripProgress);
  const reportTripDelay = useDemoStore((s) => s.reportTripDelay);
  const markTripArrived = useDemoStore((s) => s.markTripArrived);
  const markTripDelivered = useDemoStore((s) => s.markTripDelivered);

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

  const [form, setForm] = useState({
    location: "",
    lat: "",
    lng: "",
    eta: "",
    message: "",
  });

  useEffect(() => {
    if (!trip) return;
    setForm({
      location: trip.currentLocation,
      lat: String(trip.lat ?? ""),
      lng: String(trip.lng ?? ""),
      eta: toDatetimeLocal(trip.eta),
      message: "",
    });
  }, [trip?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = trips.filter((t) =>
    ["dispatched", "in_transit", "arrived"].includes(t.status)
  );
  const delayed = active.filter(
    (t) => t.delayed || (t.progressPct < 25 && t.status === "in_transit")
  ).length;

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

  const trackingLink = trip
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/public/tracking/${trip.publicToken ?? `trk-${trip.id}`}`
    : "";

  const publish = () => {
    if (!trip) return;
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (!form.location.trim()) {
      toast.message("Enter a location");
      return;
    }
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.message("Lat / lng must be numbers");
      return;
    }
    if (!form.message.trim()) {
      toast.message("Add a customer message");
      return;
    }
    publishTripProgress(trip.id, {
      location: form.location.trim(),
      lat,
      lng,
      eta: etaToIso(form.eta),
      message: form.message.trim(),
    });
    toast.success("Progress published to customer");
    setForm((f) => ({ ...f, message: "" }));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Visibility"
        title="Live Tracking"
        description="Network map of active journeys, ETA and checkpoint history."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPIStat label="Active journeys" value={active.length} />
        <KPIStat
          label="Delayed / slow"
          value={delayed}
          tone={delayed ? "warning" : "default"}
        />
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

      <div className="grid gap-4 xl:grid-cols-[280px_1fr_320px]">
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
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        {t.delayed ? (
                          <StatusBadge tone="amber">Delayed</StatusBadge>
                        ) : null}
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

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-data text-xs text-slate-400">{trip?.code}</p>
                {trip?.delayed ? (
                  <StatusBadge tone="amber">Delayed</StatusBadge>
                ) : null}
              </div>
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

          {trip ? (
            <Card>
              <CardHeader
                title="Publish truck progress"
                subtitle="Push location and ETA to the customer link"
              />
              <div className="space-y-3 px-4 pb-4 sm:px-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="trk-location">Location</Label>
                    <Input
                      id="trk-location"
                      value={form.location}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, location: e.target.value }))
                      }
                      placeholder="Current landmark / highway"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trk-lat">Latitude</Label>
                    <Input
                      id="trk-lat"
                      value={form.lat}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, lat: e.target.value }))
                      }
                      placeholder="12.9716"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trk-lng">Longitude</Label>
                    <Input
                      id="trk-lng"
                      value={form.lng}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, lng: e.target.value }))
                      }
                      placeholder="77.5946"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="trk-eta">ETA</Label>
                    <Input
                      id="trk-eta"
                      type="datetime-local"
                      value={form.eta}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, eta: e.target.value }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="trk-message">Customer message</Label>
                    <Textarea
                      id="trk-message"
                      value={form.message}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, message: e.target.value }))
                      }
                      placeholder="Crossed Hosur — on schedule for Chennai"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={publish}>
                    Publish progress
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const reason = window.prompt(
                        "Delay reason",
                        "Traffic congestion"
                      );
                      if (!reason?.trim()) return;
                      reportTripDelay(trip.id, reason.trim());
                      toast.success("Delay reported to customer");
                    }}
                  >
                    Report delay
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      markTripArrived(trip.id);
                      toast.success("Marked arrived");
                    }}
                  >
                    Mark arrived
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      markTripDelivered(trip.id);
                      toast.success("Marked delivered");
                    }}
                  >
                    Mark delivered
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const link = `${window.location.origin}/public/tracking/${trip.publicToken ?? `trk-${trip.id}`}`;
                      try {
                        await navigator.clipboard.writeText(link);
                        toast.success("Tracking link copied");
                      } catch {
                        toast.message(link);
                      }
                    }}
                  >
                    Copy tracking link
                  </Button>
                </div>
                <p className="break-all font-data text-[11px] text-slate-400">
                  {trackingLink}
                </p>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
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

          <Card>
            <CardHeader
              title="Customer updates"
              subtitle="Published SMS / WhatsApp / portal notes"
            />
            <div className="px-4 py-3">
              {(trip?.customerUpdates?.length ?? 0) === 0 ? (
                <p className="text-sm text-slate-500">
                  No customer updates yet. Publish progress to notify them.
                </p>
              ) : (
                <Timeline
                  items={(trip?.customerUpdates ?? []).map((u) => ({
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
      </div>
    </div>
  );
}
