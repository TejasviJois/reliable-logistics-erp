"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { MODE_LABEL } from "@/lib/status";
import { formatINR, formatNumber } from "@/lib/utils";
import { masterData, useDemoStore } from "@/store/demo-store";

function scoreVehicle(
  capacityKg: number,
  loadKg: number,
  utilizationPct: number,
  vendorType: string | undefined,
  docsOk: boolean
) {
  const reasons: string[] = [];
  let score = 50;
  const headroom = capacityKg - loadKg;
  if (headroom >= 0) {
    score += 25;
    reasons.push(`Fits load (+${formatNumber(headroom)} kg headroom)`);
  } else {
    score -= 40;
    reasons.push("Under capacity for this load");
  }
  const projected = Math.round((loadKg / capacityKg) * 100);
  if (projected >= 55 && projected <= 90) {
    score += 15;
    reasons.push(`Healthy util ~${projected}%`);
  } else if (projected < 55) {
    score += 5;
    reasons.push(`Light util ~${projected}%`);
  } else {
    score -= 10;
    reasons.push(`Tight util ~${projected}%`);
  }
  if (vendorType === "owned") {
    score += 10;
    reasons.push("Owned fleet — lower hire risk");
  } else if (vendorType === "contracted") {
    score += 6;
    reasons.push("Contracted vendor — THC will raise");
  } else {
    score += 2;
    reasons.push("Market hire — THC required");
  }
  if (docsOk) {
    score += 8;
    reasons.push("Docs clear (RC / insurance / fitness)");
  } else {
    score -= 15;
    reasons.push("Document risk on vehicle");
  }
  if (utilizationPct < 30) {
    score += 4;
    reasons.push("Currently idle");
  }
  return { score: Math.max(0, Math.min(100, score)), reasons, projected };
}

export default function TrafficPage() {
  const dockets = useDemoStore((s) => s.dockets);
  const vehicles = useDemoStore((s) => s.vehicles);
  const customers = useDemoStore((s) => s.customers);
  const dispatchTrip = useDemoStore((s) => s.dispatchTrip);
  const [selectedDocket, setSelectedDocket] = useState("dk-10231");
  const [selectedVehicle, setSelectedVehicle] = useState("veh-1");
  const [dispatchedMsg, setDispatchedMsg] = useState<string | null>(null);

  const pendingLoad = dockets.filter((d) =>
    ["booked", "warehouse"].includes(d.status)
  );
  const pendingPkgs = pendingLoad.reduce((a, d) => a + d.packages, 0);
  const pendingTons =
    pendingLoad.reduce((a, d) => a + d.actualWeightKg, 0) / 1000;

  const docket = dockets.find((d) => d.id === selectedDocket);

  const ranked = useMemo(() => {
    const loadKg = docket?.actualWeightKg ?? 0;
    return vehicles
      .filter((v) => v.status === "available" || v.id === "veh-1")
      .map((v) => {
        const vendor = masterData.vendors.find((x) => x.id === v.vendorId);
        const docsOk =
          v.docs.insurance !== "Expiring" && v.docs.fitness !== "Due";
        const ranked = scoreVehicle(
          v.capacityKg,
          loadKg,
          v.currentUtilizationPct,
          vendor?.type,
          docsOk
        );
        return { vehicle: v, vendor, ...ranked };
      })
      .sort((a, b) => b.score - a.score);
  }, [vehicles, docket]);

  const onDispatch = () => {
    if (!docket) return;
    const result = dispatchTrip(docket.id, selectedVehicle);
    if (!result.ok) {
      setDispatchedMsg(result.message);
      return;
    }
    const v = vehicles.find((x) => x.id === selectedVehicle);
    setDispatchedMsg(
      `Dispatched ${docket.number} on ${v?.registration}. Status → In Transit.`
    );
  };

  const gateHints = docket
    ? [
        {
          ok: docket.boxes.every((b) => b.scanned),
          label: `Scan complete (${docket.boxes.filter((b) => b.scanned).length}/${docket.packages})`,
        },
        {
          ok: Boolean(docket.ewayBill?.trim()),
          label: docket.ewayBill
            ? `E-way ${docket.ewayBill}`
            : "E-way bill missing",
        },
      ]
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="Dispatch control"
        title="Traffic & Dispatch"
        description="Allocate vehicles with capacity fit, docs and THC gates visible before confirm."
      />
      <RoleWorkQueue />

      <div className="mb-3.5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPIStat label="Pending dockets" value={pendingLoad.length} />
        <KPIStat label="Pending packages" value={pendingPkgs} />
        <KPIStat label="Pending tonnage" value={`${pendingTons.toFixed(2)}T`} />
        <KPIStat label="Available vehicles" value={ranked.length} />
      </div>

      <div className="grid gap-3.5 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Traffic load board" subtitle="Pending load" />
          <div className="overflow-x-auto">
            <table className="app-table w-full text-left text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-2">Docket</th>
                  <th className="px-4 py-2">Destination</th>
                  <th className="px-4 py-2">Mode</th>
                  <th className="px-4 py-2">Pkgs</th>
                  <th className="px-4 py-2">Weight</th>
                  <th className="px-4 py-2">E-way</th>
                  <th className="px-4 py-2">Scan</th>
                </tr>
              </thead>
              <tbody>
                {pendingLoad.map((d) => {
                  const scanned = d.boxes.filter((b) => b.scanned).length;
                  return (
                    <tr
                      key={d.id}
                      className={`cursor-pointer border-b border-border/70 hover:bg-slate-50/80 ${
                        selectedDocket === d.id ? "bg-accent-soft/40" : ""
                      }`}
                      onClick={() => setSelectedDocket(d.id)}
                    >
                      <td className="px-4 py-2.5 font-data font-medium">
                        {d.number}
                      </td>
                      <td className="px-4 py-2.5">{d.destinationCity}</td>
                      <td className="px-4 py-2.5">
                        {MODE_LABEL[d.transportMode]}
                      </td>
                      <td className="px-4 py-2.5 font-data">{d.packages}</td>
                      <td className="px-4 py-2.5 font-data">
                        {formatNumber(d.actualWeightKg)} kg
                      </td>
                      <td className="px-4 py-2.5 font-data text-xs">
                        {d.ewayBill ? (
                          <span className="text-emerald-700">Ready</span>
                        ) : (
                          <span className="text-amber-700">Missing</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-data text-xs">
                        {scanned}/{d.packages}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-3.5">
          <Card>
            <CardHeader
              title="Vehicle matching"
              subtitle="Ranked recommendation"
            />
            <ul className="divide-y divide-border">
              {ranked.map(({ vehicle: v, vendor, score, reasons }, idx) => {
                const driver = masterData.drivers.find(
                  (d) => d.id === v.driverId
                );
                return (
                  <li key={v.id}>
                    <button
                      className={`flex w-full flex-col gap-1.5 px-4 py-3 text-left hover:bg-slate-50/80 ${
                        selectedVehicle === v.id ? "bg-accent-soft/50" : ""
                      }`}
                      onClick={() => setSelectedVehicle(v.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-data text-sm font-semibold">
                          {v.registration}
                          {idx === 0 ? (
                            <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Recommended
                            </span>
                          ) : null}
                        </span>
                        <span className="font-data text-xs font-semibold text-slate-600">
                          Fit {score}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {v.type} · {formatNumber(v.capacityKg)} kg · Driver{" "}
                        {driver?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {vendor?.name} · Est. hire{" "}
                        {formatINR(Math.round((docket?.freight ?? 10000) * 0.5))}
                      </p>
                      <p className="text-[11px] leading-snug text-slate-500">
                        {reasons.slice(0, 2).join(" · ")}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border p-4">
              {gateHints.length ? (
                <ul className="mb-3 space-y-1">
                  {gateHints.map((g) => (
                    <li
                      key={g.label}
                      className={`text-xs ${g.ok ? "text-emerald-700" : "text-amber-700"}`}
                    >
                      {g.ok ? "✓" : "○"} {g.label}
                    </li>
                  ))}
                </ul>
              ) : null}
              <Button className="w-full" onClick={onDispatch}>
                Confirm dispatch
              </Button>
              {dispatchedMsg ? (
                <p
                  className={`mt-2 text-xs font-medium ${
                    dispatchedMsg.startsWith("Gate") ||
                    dispatchedMsg.startsWith("Cannot")
                      ? "text-amber-800"
                      : "text-primary"
                  }`}
                >
                  {dispatchedMsg}
                </p>
              ) : null}
            </div>
          </Card>

          {docket ? (
            <Card>
              <CardHeader title={docket.number} subtitle="Selected load" />
              <div className="space-y-1 px-4 py-3.5 text-sm sm:px-5">
                <p className="font-medium">
                  {customers.find((c) => c.id === docket.customerId)?.name}
                </p>
                <p className="text-slate-500">
                  {docket.originCity} → {docket.destinationCity} ·{" "}
                  {docket.packages} pkgs · {docket.actualWeightKg} kg
                </p>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
