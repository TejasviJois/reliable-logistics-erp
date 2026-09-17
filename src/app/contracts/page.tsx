"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { formatINR, formatDate } from "@/lib/utils";
import { canMutate } from "@/data/can-mutate";
import { useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import { toast } from "sonner";
import type { Contract } from "@/types";

const MODES: Contract["mode"][] = ["PTL", "FTL", "AIR", "RAIL", "SURFACE"];

const emptyForm = {
  customerId: "",
  mode: "PTL" as Contract["mode"],
  zone: "South",
  ratePerKg: 12,
  minFreight: 500,
};

export default function ContractsPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "contracts");
  const customers = useDemoStore((s) => s.customers);
  const contracts = useDemoStore((s) => s.contracts);
  const createContract = useDemoStore((s) => s.createContract);
  const deactivateContract = useDemoStore((s) => s.deactivateContract);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const activeCustomers = customers.filter((c) => c.status === "active");

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Contracts & Tariffs"
        description="Zone rates feeding booking and billing."
        actions={
          canEdit ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              + Contract
            </Button>
          ) : undefined
        }
      />
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
    </div>
  );
}
