"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { useDemoStore } from "@/store/demo-store";
import { formatDateTime } from "@/lib/utils";

export default function WarehousePage() {
  const dockets = useDemoStore((s) => s.dockets);
  const customers = useDemoStore((s) => s.customers);
  const scanBox = useDemoStore((s) => s.scanBox);
  const scanMessage = useDemoStore((s) => s.scanMessage);
  const audit = useDemoStore((s) => s.audit);
  const [barcode, setBarcode] = useState("BX-10231-09");
  const [activeId, setActiveId] = useState("dk-10231");

  const active = dockets.find((d) => d.id === activeId) ?? dockets[0];
  const customer = customers.find((c) => c.id === active?.customerId);

  const scanned = active?.boxes.filter((b) => b.scanned).length ?? 0;
  const total = active?.packages ?? 0;
  const ready = scanned === total && total > 0;

  const warehouseDockets = useMemo(
    () =>
      dockets.filter((d) =>
        ["booked", "warehouse"].includes(d.status)
      ),
    [dockets]
  );

  const recent = audit
    .filter((a) => a.module === "Warehouse")
    .slice(0, 8);

  const onScan = () => {
    const result = scanBox(barcode.trim());
    if (result.docketId) setActiveId(result.docketId);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Physical operations"
        title="Warehouse & Hub"
        description="Scan every package. Duplicate and unknown barcodes are blocked with audit."
      />
      <RoleWorkQueue />

      <div className="mb-3.5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KPIStat label="Units staging" value={warehouseDockets.length} />
        <KPIStat
          label="Scan progress"
          value={`${scanned}/${total}`}
          hint={active?.number}
        />
        <KPIStat
          label="Manifest ready"
          value={ready ? "Yes" : "No"}
          tone={ready ? "success" : "warning"}
        />
        <KPIStat
          label="Open exceptions"
          value={dockets.filter((d) => d.status === "exception").length}
        />
      </div>

      <div className="grid gap-3.5 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader title="Scan package" subtitle="Primary action" />
          <div className="px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Label>Barcode / QR</Label>
              <Input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onScan()}
                className="font-data text-base"
                placeholder="BX-10231-09"
              />
            </div>
            <Button className="mt-5 sm:mt-6" onClick={onScan}>
              Scan
            </Button>
          </div>
          {scanMessage ? (
            <p
              className={`mt-3 rounded-xl px-3 py-2 text-sm ${
                scanMessage.startsWith("✓")
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-amber-50 text-amber-900"
              }`}
            >
              {scanMessage}
            </p>
          ) : null}

          {active ? (
            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-data text-sm font-semibold">{active.number}</p>
                  <p className="text-sm text-slate-600">{customer?.name}</p>
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
                  <span>{Math.round((scanned / Math.max(total, 1)) * 100)}%</span>
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
              <ul className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-5">
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

        <div className="space-y-3.5">
          <Card>
            <CardHeader title="Staging queue" subtitle="Awaiting scan / manifest" />
            <ul className="divide-y divide-border">
              {warehouseDockets.map((d) => {
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
                        <p className="font-data text-sm font-medium">{d.number}</p>
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
              })}
            </ul>
          </Card>
          <Card>
            <CardHeader title="Recent scan activity" subtitle="Live handling ledger" />
            <ul className="divide-y divide-border">
              {recent.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-slate-500">
                  No scans yet in this session
                </li>
              ) : (
                recent.map((a) => (
                  <li key={a.id} className="px-4 py-2.5 text-sm sm:px-5">
                    <p className="font-medium">{a.action}</p>
                    <p className="font-data text-xs text-slate-500">
                      {a.entityId} · {formatDateTime(a.at)}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
