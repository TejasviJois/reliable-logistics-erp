"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { cn, formatINR, formatDate } from "@/lib/utils";
import { canMutate } from "@/data/can-mutate";
import { useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import { toast } from "sonner";
import type { Contract, TariffZone, TransportMode } from "@/types";

type Tab = "contracts" | "zoning";

const MODES: TransportMode[] = ["PTL", "FTL", "AIR", "RAIL", "SURFACE"];

const emptyForm = {
  customerId: "",
  mode: "PTL" as Contract["mode"],
  zone: "South",
  ratePerKg: 12,
  minFreight: 500,
};

const emptyZoneForm = {
  customerId: "",
  mode: "PTL" as TransportMode,
  name: "",
  basis: "CITY" as TariffZone["basis"],
  members: "",
  ratePerKg: 18,
  minFreight: 1200,
  cftFactor: 7,
};

export default function ContractsPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "contracts");
  const customers = useDemoStore((s) => s.customers);
  const contracts = useDemoStore((s) => s.contracts);
  const tariffZones = useDemoStore((s) => s.tariffZones);
  const createContract = useDemoStore((s) => s.createContract);
  const deactivateContract = useDemoStore((s) => s.deactivateContract);
  const createTariffZone = useDemoStore((s) => s.createTariffZone);

  const [tab, setTab] = useState<Tab>("contracts");
  const [open, setOpen] = useState(false);
  const [zoneOpen, setZoneOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [zoneForm, setZoneForm] = useState(emptyZoneForm);

  const activeCustomers = customers.filter((c) => c.status === "active");

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Contracts & Tariffs"
        description="Zone rates feeding booking and billing."
        actions={
          canEdit ? (
            tab === "contracts" ? (
              <Button
                size="sm"
                data-tour="contracts-new"
                onClick={() => setOpen(true)}
              >
                + Contract
              </Button>
            ) : (
              <Button size="sm" onClick={() => setZoneOpen(true)}>
                + Tariff zone
              </Button>
            )
          ) : undefined
        }
      />

      <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        {(
          [
            ["contracts", "Contracts"],
            ["zoning", "Zoning & tariffs"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              tab === id
                ? "bg-white text-foreground shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "contracts" ? (
        <Card>
          <CardHeader title="Active contracts" subtitle="Approved commercials" />
          <div className="overflow-x-auto">
            <table className="app-table w-full text-left text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">Customer</th>
                  <th className="px-4 py-2.5 sm:px-5">Mode / zone</th>
                  <th className="px-4 py-2.5 sm:px-5">Rate</th>
                  <th className="px-4 py-2.5 sm:px-5">Validity</th>
                  <th className="px-4 py-2.5 sm:px-5">Status</th>
                  {canEdit ? (
                    <th className="px-4 py-2.5 text-right sm:px-5">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {contracts.map((c) => {
                  const customer = customers.find((x) => x.id === c.customerId);
                  const onHold = c.status === "on_hold";
                  return (
                    <tr key={c.id} className="border-b border-[var(--border)]/70">
                      <td className="px-4 py-3 font-medium sm:px-5">
                        {customer?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 sm:px-5">
                        {c.mode} · {c.zone}
                      </td>
                      <td className="px-4 py-3 font-data sm:px-5">
                        ₹{c.ratePerKg}/kg · min {formatINR(c.minFreight)}
                      </td>
                      <td className="px-4 py-3 font-data text-xs text-slate-500 sm:px-5">
                        {formatDate(c.effectiveFrom)} → {formatDate(c.effectiveTo)}
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <StatusBadge
                          tone={
                            c.status === "approved"
                              ? "green"
                              : onHold
                                ? "amber"
                                : "slate"
                          }
                        >
                          {c.status.replace("_", " ")}
                        </StatusBadge>
                      </td>
                      {canEdit ? (
                        <td className="px-4 py-3 text-right sm:px-5">
                          {!onHold ? (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                deactivateContract(c.id);
                                toast.message("Contract put on hold");
                              }}
                            >
                              Deactivate
                            </Button>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Tariff zones"
            subtitle="City / state membership feeding freight"
          />
          <div className="overflow-x-auto">
            <table className="app-table w-full text-left text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">Customer</th>
                  <th className="px-4 py-2.5 sm:px-5">Zone</th>
                  <th className="px-4 py-2.5 sm:px-5">Mode</th>
                  <th className="px-4 py-2.5 sm:px-5">Basis / members</th>
                  <th className="px-4 py-2.5 sm:px-5">Rate</th>
                  <th className="px-4 py-2.5 sm:px-5">CFT</th>
                </tr>
              </thead>
              <tbody>
                {tariffZones.map((z) => {
                  const customer = customers.find((x) => x.id === z.customerId);
                  return (
                    <tr
                      key={z.id}
                      className="border-b border-[var(--border)]/70"
                    >
                      <td className="px-4 py-3 font-medium sm:px-5">
                        {customer?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 sm:px-5">{z.name}</td>
                      <td className="px-4 py-3 sm:px-5">
                        <StatusBadge tone="slate">{z.mode}</StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-slate-600 sm:px-5">
                        <span className="font-medium text-foreground">
                          {z.basis}
                        </span>
                        {" · "}
                        {z.members}
                      </td>
                      <td className="px-4 py-3 font-data sm:px-5">
                        ₹{z.ratePerKg}/kg · min {formatINR(z.minFreight)}
                      </td>
                      <td className="px-4 py-3 font-data text-xs sm:px-5">
                        {z.cftFactor}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <EntityFormSheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next && !form.customerId && activeCustomers[0]) {
            setForm((f) => ({ ...f, customerId: activeCustomers[0].id }));
          }
        }}
        title="New contract"
        description="Zone tariff that feeds booking freight and billing."
        onSave={() => {
          if (!form.customerId || !form.zone.trim()) return;
          createContract({
            customerId: form.customerId,
            mode: form.mode,
            zone: form.zone.trim(),
            ratePerKg: form.ratePerKg,
            minFreight: form.minFreight,
          });
          toast.success("Contract created");
          setOpen(false);
          setForm({
            ...emptyForm,
            customerId: activeCustomers[0]?.id ?? "",
          });
        }}
      >
        <div>
          <Label>Customer</Label>
          <Select
            value={form.customerId}
            onChange={(e) =>
              setForm((f) => ({ ...f, customerId: e.target.value }))
            }
          >
            <option value="" disabled>
              Select customer
            </option>
            {activeCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Mode</Label>
          <Select
            value={form.mode}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                mode: e.target.value as Contract["mode"],
              }))
            }
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Zone</Label>
          <Input
            value={form.zone}
            onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
          />
        </div>
        <div>
          <Label>Rate per kg (₹)</Label>
          <Input
            type="number"
            value={form.ratePerKg}
            onChange={(e) =>
              setForm((f) => ({ ...f, ratePerKg: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label>Min freight (₹)</Label>
          <Input
            type="number"
            value={form.minFreight}
            onChange={(e) =>
              setForm((f) => ({ ...f, minFreight: Number(e.target.value) }))
            }
          />
        </div>
      </EntityFormSheet>

      <EntityFormSheet
        open={zoneOpen}
        onOpenChange={(next) => {
          setZoneOpen(next);
          if (next && !zoneForm.customerId && activeCustomers[0]) {
            setZoneForm((f) => ({
              ...f,
              customerId: activeCustomers[0].id,
            }));
          }
        }}
        title="New tariff zone"
        description="Customer zone with city or state membership and CFT factor."
        onSave={() => {
          if (
            !zoneForm.customerId ||
            !zoneForm.name.trim() ||
            !zoneForm.members.trim()
          ) {
            toast.message("Fill customer, name and members");
            return;
          }
          createTariffZone({
            customerId: zoneForm.customerId,
            mode: zoneForm.mode,
            name: zoneForm.name.trim(),
            basis: zoneForm.basis,
            members: zoneForm.members.trim(),
            ratePerKg: zoneForm.ratePerKg,
            minFreight: zoneForm.minFreight,
            cftFactor: zoneForm.cftFactor,
          });
          toast.success("Tariff zone created");
          setZoneOpen(false);
          setZoneForm({
            ...emptyZoneForm,
            customerId: activeCustomers[0]?.id ?? "",
          });
        }}
      >
        <div>
          <Label>Customer</Label>
          <Select
            value={zoneForm.customerId}
            onChange={(e) =>
              setZoneForm((f) => ({ ...f, customerId: e.target.value }))
            }
          >
            <option value="" disabled>
              Select customer
            </option>
            {activeCustomers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Mode</Label>
          <Select
            value={zoneForm.mode}
            onChange={(e) =>
              setZoneForm((f) => ({
                ...f,
                mode: e.target.value as TransportMode,
              }))
            }
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Name</Label>
          <Input
            value={zoneForm.name}
            placeholder="South Metro"
            onChange={(e) =>
              setZoneForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Basis</Label>
          <Select
            value={zoneForm.basis}
            onChange={(e) =>
              setZoneForm((f) => ({
                ...f,
                basis: e.target.value as TariffZone["basis"],
              }))
            }
          >
            <option value="CITY">CITY</option>
            <option value="STATE">STATE</option>
          </Select>
        </div>
        <div>
          <Label>Members</Label>
          <Textarea
            value={zoneForm.members}
            placeholder="Bengaluru, Chennai, Hyderabad"
            onChange={(e) =>
              setZoneForm((f) => ({ ...f, members: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Rate per kg (₹)</Label>
          <Input
            type="number"
            value={zoneForm.ratePerKg}
            onChange={(e) =>
              setZoneForm((f) => ({
                ...f,
                ratePerKg: Number(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <Label>Min freight (₹)</Label>
          <Input
            type="number"
            value={zoneForm.minFreight}
            onChange={(e) =>
              setZoneForm((f) => ({
                ...f,
                minFreight: Number(e.target.value),
              }))
            }
          />
        </div>
        <div>
          <Label>CFT factor</Label>
          <Input
            type="number"
            value={zoneForm.cftFactor}
            onChange={(e) =>
              setZoneForm((f) => ({
                ...f,
                cftFactor: Number(e.target.value),
              }))
            }
          />
        </div>
      </EntityFormSheet>
    </div>
  );
}
