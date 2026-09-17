"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { formatDate } from "@/lib/utils";
import { canMutate } from "@/data/can-mutate";
import { masterData, useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import { toast } from "sonner";

const VEHICLE_TYPES = [
  "Tata Ace",
  "14 ft Container",
  "17 ft Open",
  "32 ft SXL",
];

export default function FleetPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "fleet");
  const vehicles = useDemoStore((s) => s.vehicles);
  const vendors = useDemoStore((s) => s.vendors);
  const createVehicle = useDemoStore((s) => s.createVehicle);
  const deleteVehicle = useDemoStore((s) => s.deleteVehicle);
  const setVehicleMaintenance = useDemoStore((s) => s.setVehicleMaintenance);
  const renewVehicleDocs = useDemoStore((s) => s.renewVehicleDocs);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    registration: "",
    type: VEHICLE_TYPES[0],
    capacityKg: 5000,
    vendorId: vendors[0]?.id ?? "",
    driverId: masterData.drivers[0]?.id ?? "",
  });

  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Fleet"
        description="Vehicles, documents, utilization and expiry alerts."
        actions={
          canEdit ? (
            <Button
              size="sm"
              onClick={() => {
                setForm((f) => ({
                  ...f,
                  vendorId: f.vendorId || vendors[0]?.id || "",
                  driverId: f.driverId || masterData.drivers[0]?.id || "",
                }));
                setOpen(true);
              }}
            >
              + Vehicle
            </Button>
          ) : undefined
        }
      />
      <RoleWorkQueue />
      <div className="mb-3.5 grid gap-3 sm:grid-cols-4">
        <KPIStat label="Vehicles" value={vehicles.length} />
        <KPIStat
          label="Available"
          value={vehicles.filter((v) => v.status === "available").length}
        />
        <KPIStat
          label="In transit"
          value={vehicles.filter((v) => v.status === "in_transit").length}
        />
        <KPIStat
          label="Doc attention"
          value={
            vehicles.filter(
              (v) => v.docs.insurance === "Expiring" || v.docs.fitness === "Due"
            ).length
          }
          tone="warning"
        />
      </div>
      <Card>
        <CardHeader title="Vehicle master" subtitle="Network fleet" />
        <ul className="divide-y divide-border">
          {vehicles.map((v) => {
            const driver = masterData.drivers.find((d) => d.id === v.driverId);
            const vendor = vendors.find((x) => x.id === v.vendorId);
            return (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
              >
                <div>
                  <p className="font-data text-sm font-semibold">
                    {v.registration}
                  </p>
                  <p className="text-xs text-slate-500">
                    {v.type} · {driver?.name} · {vendor?.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Insurance {formatDate(v.insuranceExpiry)} · RC {v.docs.rc} ·
                    Fitness {v.docs.fitness}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge
                    tone={
                      v.status === "available"
                        ? "green"
                        : v.status === "in_transit"
                          ? "blue"
                          : "amber"
                    }
                  >
                    {v.status.replace("_", " ")}
                  </StatusBadge>
                  <p className="font-data text-xs text-slate-500">
                    Util {v.currentUtilizationPct}%
                  </p>
                  {canEdit ? (
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setVehicleMaintenance(v.id);
                          toast.success("Marked for maintenance");
                        }}
                      >
                        Maintenance
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          renewVehicleDocs(v.id);
                          toast.success("Documents renewed");
                        }}
                      >
                        Renew docs
                      </Button>
                      {v.status !== "in_transit" ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            deleteVehicle(v.id);
                            toast.message("Vehicle deleted");
                          }}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <EntityFormSheet
        open={open}
        onOpenChange={setOpen}
        title="New vehicle"
        description="Add a vehicle to the network fleet master."
        onSave={() => {
          if (!form.registration.trim() || !form.vendorId || !form.driverId) return;
          createVehicle(form);
          toast.success("Vehicle added");
          setOpen(false);
          setForm({
            registration: "",
            type: VEHICLE_TYPES[0],
            capacityKg: 5000,
            vendorId: vendors[0]?.id ?? "",
            driverId: masterData.drivers[0]?.id ?? "",
          });
        }}
      >
        <div>
          <Label>Registration</Label>
          <Input
            value={form.registration}
            onChange={(e) =>
              setForm((f) => ({ ...f, registration: e.target.value }))
            }
            placeholder="KA01AB1234"
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            {VEHICLE_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Capacity (kg)</Label>
          <Input
            type="number"
            value={form.capacityKg}
            onChange={(e) =>
              setForm((f) => ({ ...f, capacityKg: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label>Vendor</Label>
          <Select
            value={form.vendorId}
            onChange={(e) =>
              setForm((f) => ({ ...f, vendorId: e.target.value }))
            }
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Driver</Label>
          <Select
            value={form.driverId}
            onChange={(e) =>
              setForm((f) => ({ ...f, driverId: e.target.value }))
            }
          >
            {masterData.drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        </div>
      </EntityFormSheet>
    </div>
  );
}
