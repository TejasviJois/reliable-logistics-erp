"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { masterData, useDemoStore } from "@/store/demo-store";
import { formatDateTime } from "@/lib/utils";
import type { HubScanEvent, WarehouseException } from "@/types";
import { toast } from "sonner";

const MOVEMENTS: HubScanEvent["movement"][] = ["SCAN_INWARD", "SCAN_OUTWARD"];
const CONDITIONS: HubScanEvent["condition"][] = [
  "GOOD",
  "DAMAGED",
  "OPEN",
  "WET",
  "SHORT",
];
const EXCEPTION_TYPES: WarehouseException["type"][] = [
  "DAMAGE",
  "SHORTAGE",
  "EXCESS",
  "MISROUTED",
];
const EXCEPTION_SEVERITIES: WarehouseException["severity"][] = [
  "HIGH",
  "MEDIUM",
  "LOW",
];

const SAFEGUARDS = [
  {
    title: "Duplicate barcode block",
    detail: "Already-scanned package codes are rejected and audited.",
  },
  {
    title: "Unknown code reject",
    detail: "Barcodes and docket numbers not on the register cannot stage.",
  },
  {
    title: "Condition escalation",
    detail: "Non-GOOD hub conditions write a warehouse audit trail entry.",
  },
  {
    title: "Manifest integrity",
    detail: "Only selected dockets are locked onto an audited manifest.",
  },
  {
    title: "Exception quarantine",
    detail: "Raised exceptions mark the docket and stay open until closed.",
  },
];

const HUBS = masterData.branches.map((b) => b.name);

export default function WarehousePage() {
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);
  const scanMessage = useDemoStore((s) => s.scanMessage);
  const audit = useDemoStore((s) => s.audit);
  const hubScans = useDemoStore((s) => s.hubScans);
  const manifests = useDemoStore((s) => s.manifests);
  const warehouseExceptions = useDemoStore((s) => s.warehouseExceptions);
  const recordHubScan = useDemoStore((s) => s.recordHubScan);
  const createManifest = useDemoStore((s) => s.createManifest);
  const raiseWarehouseException = useDemoStore((s) => s.raiseWarehouseException);
  const closeWarehouseException = useDemoStore((s) => s.closeWarehouseException);

  const [barcode, setBarcode] = useState("BX-10231-09");
  const [movement, setMovement] =
    useState<HubScanEvent["movement"]>("SCAN_INWARD");
  const [hub, setHub] = useState(HUBS[0] ?? "Bengaluru Hub");
  const [packages, setPackages] = useState(1);
  const [weightKg, setWeightKg] = useState("");
  const [condition, setCondition] =
    useState<HubScanEvent["condition"]>("GOOD");
  const [remarks, setRemarks] = useState("");
  const [activeId, setActiveId] = useState("dk-10231");

  const [mfCode, setMfCode] = useState("");
  const [mfVehicle, setMfVehicle] = useState("");
  const [mfDriver, setMfDriver] = useState("");
  const [mfOrigin, setMfOrigin] = useState(HUBS[0] ?? "Bengaluru Hub");
  const [mfDest, setMfDest] = useState(HUBS[1] ?? "Chennai Hub");
  const [mfDocketIds, setMfDocketIds] = useState<string[]>([]);

  const [exDocketId, setExDocketId] = useState("");
  const [exScanCode, setExScanCode] = useState("");
  const [exType, setExType] =
    useState<WarehouseException["type"]>("DAMAGE");
  const [exSeverity, setExSeverity] =
    useState<WarehouseException["severity"]>("HIGH");
  const [exHub, setExHub] = useState(HUBS[0] ?? "Bengaluru Hub");
  const [exRemarks, setExRemarks] = useState("");

  const active = dockets.find((d) => d.id === activeId) ?? dockets[0];
  const customer = customers.find((c) => c.id === active?.customerId);

  const scanned = active?.boxes.filter((b) => b.scanned).length ?? 0;
  const total = active?.packages ?? 0;
  const ready = scanned === total && total > 0;

  const warehouseDockets = useMemo(
    () => dockets.filter((d) => ["booked", "warehouse"].includes(d.status)),
    [dockets]
  );

  const inwardScanCount = useMemo(
    () => hubScans.filter((s) => s.movement === "SCAN_INWARD").length,
    [hubScans]
  );

  const activeManifests = useMemo(
    () =>
      manifests.filter(
        (m) => m.status === "draft" || m.status === "generated"
      ).length,
    [manifests]
  );

  const openExceptions = useMemo(
    () =>
      warehouseExceptions.filter(
        (e) => e.status === "open" || e.status === "investigating"
      ),
    [warehouseExceptions]
  );

  const ledger = useMemo(() => {
    const fromScans = hubScans.map((s) => {
      const docket = dockets.find((d) => d.id === s.docketId);
      return {
        id: s.id,
        title: `${s.movement.replace("_", " ")} · ${s.barcode}`,
        detail: `${docket?.number ?? s.docketId} · ${s.hub} · ${s.condition}${
          s.remarks ? ` · ${s.remarks}` : ""
        }`,
        at: s.at,
        kind: "scan" as const,
      };
    });
    const fromAudit = audit
      .filter((a) => a.module === "Warehouse")
      .map((a) => ({
        id: a.id,
        title: a.action,
        detail: `${a.entityType} ${a.entityId}${
          a.next ? ` · ${a.next}` : ""
        }`,
        at: a.at,
        kind: "audit" as const,
      }));
    return [...fromScans, ...fromAudit]
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 16);
  }, [hubScans, audit, dockets]);

  const onScan = () => {
    const result = recordHubScan({
      barcode: barcode.trim(),
      movement,
      hub,
      packages,
      weightKg: weightKg ? Number(weightKg) : undefined,
      condition,
      remarks: remarks.trim() || undefined,
    });
    if (result.docketId) setActiveId(result.docketId);
    if (result.ok) {
      toast.success(result.message);
      const next = useDemoStore
        .getState()
        .dockets.find((d) => d.id === (result.docketId ?? activeId));
      const pending = next?.boxes.find((b) => !b.scanned);
      if (pending) setBarcode(pending.barcode);
    } else {
      toast.error(result.message);
    }
  };

  const onCreateManifest = () => {
    if (!mfVehicle.trim() || !mfDriver.trim()) {
      toast.error("Vehicle registration and driver are required");
      return;
    }
    if (mfDocketIds.length === 0) {
      toast.error("Select at least one docket for the manifest");
      return;
    }
    const id = createManifest({
      code: mfCode.trim() || undefined,
      vehicleReg: mfVehicle.trim(),
      driverName: mfDriver.trim(),
      originHub: mfOrigin,
      destinationHub: mfDest,
      docketIds: mfDocketIds,
    });
    toast.success(`Manifest created · ${id}`);
    setMfCode("");
    setMfVehicle("");
    setMfDriver("");
    setMfDocketIds([]);
  };

  const onRaiseException = () => {
    const docketId = exDocketId || warehouseDockets[0]?.id || dockets[0]?.id;
    if (!docketId) {
      toast.error("No docket available");
      return;
    }
    if (!exScanCode.trim()) {
      toast.error("Scan code is required");
      return;
    }
    if (!exRemarks.trim()) {
      toast.error("Remarks are required");
      return;
    }
    const id = raiseWarehouseException({
      docketId,
      scanCode: exScanCode.trim(),
      type: exType,
      severity: exSeverity,
      hub: exHub,
      remarks: exRemarks.trim(),
    });
    toast.success(`Exception raised · ${id}`);
    setExScanCode("");
    setExRemarks("");
  };

  const toggleMfDocket = (id: string) => {
    setMfDocketIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Physical operations"
        title="Warehouse & Hub"
        description="Inward / outward hub scanning, audited manifests, and exception quarantine — barcode-first on the floor."
      />
      <RoleWorkQueue />

      <Tabs defaultValue="control" className="gap-3.5">
        <TabsList className="h-auto w-full flex-wrap justify-start sm:w-fit">
          <TabsTrigger value="control" data-tour="wh-tab-control">
            Control
          </TabsTrigger>
          <TabsTrigger value="scan" data-tour="wh-tab-scan">
            Scan
          </TabsTrigger>
          <TabsTrigger value="manifests" data-tour="wh-tab-manifests">
            Manifests
          </TabsTrigger>
          <TabsTrigger value="exceptions" data-tour="wh-tab-exceptions">
            Exceptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="control" className="space-y-3.5">
          <div
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            data-tour="wh-control-kpis"
          >
            <KPIStat label="Units staging" value={warehouseDockets.length} />
            <KPIStat label="Inward scans" value={inwardScanCount} />
            <KPIStat label="Active manifests" value={activeManifests} />
            <KPIStat
              label="Open exceptions"
              value={openExceptions.length}
              tone={openExceptions.length ? "warning" : "default"}
            />
          </div>

          <div className="grid gap-3.5 xl:grid-cols-[1.4fr_1fr]">
            <Card data-tour="wh-ledger">
              <CardHeader
                title="Live handling ledger"
                subtitle="Hub scans and warehouse audit"
              />
              <ul className="divide-y divide-border">
                {ledger.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-slate-500">
                    No hub activity yet — run a scan to populate the ledger
                  </li>
                ) : (
                  ledger.map((row) => (
                    <li key={row.id} className="px-4 py-2.5 text-sm sm:px-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{row.title}</p>
                          <p className="font-data text-xs text-slate-500">
                            {row.detail}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge
                            tone={row.kind === "scan" ? "blue" : "slate"}
                          >
                            {row.kind}
                          </StatusBadge>
                          <span className="font-data text-[11px] text-slate-500">
                            {formatDateTime(row.at)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </Card>

            <Card data-tour="wh-safeguards">
              <CardHeader
                title="Safeguards"
                subtitle="Floor controls enforced in demo"
              />
              <ul className="divide-y divide-border">
                {SAFEGUARDS.map((s) => (
                  <li key={s.title} className="px-4 py-3 sm:px-5">
                    <p className="text-sm font-medium">{s.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{s.detail}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scan" className="space-y-3.5">
          <div className="grid gap-3.5 xl:grid-cols-[1.25fr_1fr]">
            <Card>
              <CardHeader
                title="Hub scan"
                subtitle="Barcode / QR · inward or outward"
              />
              <div className="space-y-3 px-4 py-4 sm:px-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Barcode / QR</Label>
                    <Input
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onScan()}
                      className="font-data text-base"
                      placeholder="BX-10231-09 or DK-10231"
                      data-tour="wh-scan-input"
                    />
                  </div>
                  <div>
                    <Label>Movement</Label>
                    <Select
                      value={movement}
                      onChange={(e) =>
                        setMovement(e.target.value as HubScanEvent["movement"])
                      }
                      data-tour="wh-scan-movement"
                    >
                      {MOVEMENTS.map((m) => (
                        <option key={m} value={m}>
                          {m.replace("_", " ")}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Hub</Label>
                    <Select
                      value={hub}
                      onChange={(e) => setHub(e.target.value)}
                      data-tour="wh-scan-hub"
                    >
                      {HUBS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Packages</Label>
                    <Input
                      type="number"
                      min={1}
                      value={packages}
                      onChange={(e) =>
                        setPackages(Math.max(1, Number(e.target.value) || 1))
                      }
                      data-tour="wh-scan-packages"
                    />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      min={0}
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label>Condition</Label>
                    <Select
                      value={condition}
                      onChange={(e) =>
                        setCondition(
                          e.target.value as HubScanEvent["condition"]
                        )
                      }
                      data-tour="wh-scan-condition"
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Remarks</Label>
                    <Input
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Optional floor notes"
                      data-tour="wh-scan-remarks"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={onScan} data-tour="wh-scan-btn">
                    Scan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      toast.message(
                        "Camera scan ready for handheld / browser — use barcode field in demo"
                      )
                    }
                  >
                    Scan with camera
                  </Button>
                </div>

                {scanMessage ? (
                  <p
                    className={`rounded-xl px-3 py-2 text-sm ${
                      scanMessage.startsWith("✓") ||
                      scanMessage.toLowerCase().includes("recorded")
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-900"
                    }`}
                  >
                    {scanMessage}
                  </p>
                ) : null}

                {active ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-slate-50/80 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-data text-sm font-semibold">
                          {active.number}
                        </p>
                        <p className="text-sm text-slate-600">
                          {customer?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {active.originCity} → {active.destinationCity}
                        </p>
                      </div>
                      <StatusBadge tone={ready ? "green" : "blue"}>
                        {ready ? "Manifest ready" : "Scanning"}
                      </StatusBadge>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>
                          {scanned} scanned · {total - scanned} pending
                        </span>
                        <span>
                          {Math.round((scanned / Math.max(total, 1)) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white">
                        <div
                          className="h-1.5 rounded-full bg-primary transition-all"
                          style={{
                            width: `${(scanned / Math.max(total, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <ul
                      className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-5"
                      data-tour="wh-scan-progress"
                    >
                      {active.boxes.map((b) => (
                        <li
                          key={b.id}
                          className={`rounded border px-2 py-1 font-data text-[10px] ${
                            b.scanned
                              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                              : "border-border bg-white text-slate-500"
                          }`}
                        >
                          {b.barcode.slice(-5)}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card data-tour="wh-staging-queue">
              <CardHeader
                title="Staging queue"
                subtitle="Awaiting scan / manifest"
              />
              <ul className="divide-y divide-border">
                {warehouseDockets.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-slate-500">
                    No units in warehouse staging
                  </li>
                ) : (
                  warehouseDockets.map((d) => {
                    const done = d.boxes.filter((b) => b.scanned).length;
                    return (
                      <li key={d.id}>
                        <button
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-slate-50/80 sm:px-5"
                          onClick={() => {
                            setActiveId(d.id);
                            const next = d.boxes.find((b) => !b.scanned);
                            if (next) setBarcode(next.barcode);
                          }}
                        >
                          <div>
                            <p className="font-data text-sm font-medium">
                              {d.number}
                            </p>
                            <p className="text-xs text-slate-500">
                              {d.originCity} → {d.destinationCity}
                            </p>
                          </div>
                          <span className="font-data text-xs text-slate-500">
                            {done}/{d.packages}
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manifests" className="space-y-3.5">
          <div className="grid gap-3.5 xl:grid-cols-[1fr_1.2fr]">
            <Card data-tour="wh-manifest-form">
              <CardHeader
                title="Create manifest"
                subtitle="Audited load sheet for hub exit"
              />
              <div className="space-y-3 px-4 py-4 sm:px-5">
                <div>
                  <Label>Manifest code</Label>
                  <Input
                    value={mfCode}
                    onChange={(e) => setMfCode(e.target.value)}
                    placeholder="Auto if blank"
                    className="font-data"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Vehicle registration</Label>
                    <Input
                      value={mfVehicle}
                      onChange={(e) => setMfVehicle(e.target.value)}
                      placeholder="KA01AB1234"
                      className="font-data"
                    />
                  </div>
                  <div>
                    <Label>Driver name</Label>
                    <Input
                      value={mfDriver}
                      onChange={(e) => setMfDriver(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Origin hub</Label>
                    <Select
                      value={mfOrigin}
                      onChange={(e) => setMfOrigin(e.target.value)}
                    >
                      {HUBS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Destination hub</Label>
                    <Select
                      value={mfDest}
                      onChange={(e) => setMfDest(e.target.value)}
                    >
                      {HUBS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Dockets on manifest</Label>
                  <ul className="mt-1 max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                    {warehouseDockets.length === 0 ? (
                      <li className="px-1 py-2 text-xs text-slate-500">
                        No staging dockets available
                      </li>
                    ) : (
                      warehouseDockets.map((d) => (
                        <li key={d.id}>
                          <label className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1.5 text-sm hover:bg-slate-50">
                            <input
                              type="checkbox"
                              checked={mfDocketIds.includes(d.id)}
                              onChange={() => toggleMfDocket(d.id)}
                              className="accent-[var(--primary)]"
                            />
                            <span className="font-data font-medium">
                              {d.number}
                            </span>
                            <span className="text-xs text-slate-500">
                              {d.originCity} → {d.destinationCity}
                            </span>
                          </label>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <Button onClick={onCreateManifest} data-tour="wh-manifest-create">
                  Create manifest
                </Button>
              </div>
            </Card>

            <Card data-tour="wh-manifest-register">
              <CardHeader
                title="Manifest register"
                subtitle="From demo store"
              />
              <div className="overflow-x-auto">
                <table className="app-table w-full text-left text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="px-4 py-2.5 sm:px-5">Code</th>
                      <th className="px-4 py-2.5">Route</th>
                      <th className="px-4 py-2.5">Vehicle</th>
                      <th className="px-4 py-2.5">Dockets</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manifests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-slate-500"
                        >
                          No manifests yet
                        </td>
                      </tr>
                    ) : (
                      manifests.map((m) => (
                        <tr key={m.id} className="border-b border-border/70">
                          <td className="px-4 py-2.5 font-data font-medium sm:px-5">
                            {m.code}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-600">
                            {m.originHub ?? "—"} → {m.destinationHub ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 font-data text-xs">
                            {m.vehicleReg ?? "—"}
                            {m.driverName ? (
                              <span className="block text-slate-500">
                                {m.driverName}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-2.5 font-data">
                            {m.docketIds.length}
                          </td>
                          <td className="px-4 py-2.5">
                            <StatusBadge
                              tone={
                                m.status === "dispatched"
                                  ? "green"
                                  : m.status === "generated"
                                    ? "blue"
                                    : "slate"
                              }
                            >
                              {m.status}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-2.5 font-data text-xs text-slate-500">
                            {formatDateTime(m.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-3.5">
          <div className="grid gap-3.5 xl:grid-cols-[1fr_1.2fr]">
            <Card data-tour="wh-exception-form">
              <CardHeader
                title="Raise exception"
                subtitle="Damage, shortage, excess, misroute"
              />
              <div className="space-y-3 px-4 py-4 sm:px-5">
                <div>
                  <Label>Docket</Label>
                  <Select
                    value={exDocketId || warehouseDockets[0]?.id || dockets[0]?.id || ""}
                    onChange={(e) => setExDocketId(e.target.value)}
                  >
                    {(warehouseDockets.length
                      ? warehouseDockets
                      : dockets.slice(0, 12)
                    ).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.number} · {d.originCity} → {d.destinationCity}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Scan code</Label>
                  <Input
                    value={exScanCode}
                    onChange={(e) => setExScanCode(e.target.value)}
                    placeholder="BX-10190-03"
                    className="font-data"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={exType}
                      onChange={(e) =>
                        setExType(
                          e.target.value as WarehouseException["type"]
                        )
                      }
                    >
                      {EXCEPTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <Select
                      value={exSeverity}
                      onChange={(e) =>
                        setExSeverity(
                          e.target.value as WarehouseException["severity"]
                        )
                      }
                    >
                      {EXCEPTION_SEVERITIES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Hub</Label>
                  <Select
                    value={exHub}
                    onChange={(e) => setExHub(e.target.value)}
                  >
                    {HUBS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Remarks</Label>
                  <Input
                    value={exRemarks}
                    onChange={(e) => setExRemarks(e.target.value)}
                    placeholder="Describe the floor finding"
                  />
                </div>
                <Button onClick={onRaiseException} data-tour="wh-exception-raise">
                  Raise exception
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Exception queue"
                subtitle="Open and closed handling holds"
              />
              <ul className="divide-y divide-border">
                {warehouseExceptions.length === 0 ? (
                  <li className="px-4 py-8 text-center text-sm text-slate-500">
                    No warehouse exceptions
                  </li>
                ) : (
                  warehouseExceptions.map((ex) => {
                    const docket = dockets.find((d) => d.id === ex.docketId);
                    const open =
                      ex.status === "open" || ex.status === "investigating";
                    return (
                      <li
                        key={ex.id}
                        className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-data text-sm font-semibold">
                              {docket?.number ?? ex.docketId}
                            </p>
                            <StatusBadge
                              tone={
                                ex.severity === "HIGH"
                                  ? "red"
                                  : ex.severity === "MEDIUM"
                                    ? "amber"
                                    : "slate"
                              }
                            >
                              {ex.severity}
                            </StatusBadge>
                            <StatusBadge
                              tone={open ? "amber" : "green"}
                            >
                              {ex.status}
                            </StatusBadge>
                          </div>
                          <p className="mt-1 text-sm">
                            {ex.type} · {ex.scanCode} · {ex.hub}
                          </p>
                          <p className="text-xs text-slate-500">{ex.remarks}</p>
                          <p className="mt-1 font-data text-[11px] text-slate-400">
                            {formatDateTime(ex.createdAt)}
                          </p>
                        </div>
                        {open ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              closeWarehouseException(ex.id);
                              toast.success("Exception closed");
                            }}
                          >
                            Close
                          </Button>
                        ) : null}
                      </li>
                    );
                  })
                )}
              </ul>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
