"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { formatINR } from "@/lib/utils";
import { canMutate } from "@/data/can-mutate";
import { useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  city: "Bengaluru",
  contactPerson: "",
  email: "",
  phone: "",
  gstin: "",
};

export default function CustomersPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "customers");
  const customers = useDemoStore((s) => s.customers);
  const approveCustomer = useDemoStore((s) => s.approveCustomer);
  const createCustomer = useDemoStore((s) => s.createCustomer);
  const deactivateCustomer = useDemoStore((s) => s.deactivateCustomer);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Customers"
        description="Customer master with contracts, shipments and receivables linked. Pending profiles cannot book until Admin approves."
        actions={
          canEdit ? (
            <Button size="sm" onClick={() => setOpen(true)}>
              + Customer
            </Button>
          ) : undefined
        }
      />
      <RoleWorkQueue />
      <div className="mb-3.5 grid gap-3 sm:grid-cols-4">
        <KPIStat label="Profiles" value={customers.length} />
        <KPIStat
          label="Active"
          value={customers.filter((c) => c.status === "active").length}
        />
        <KPIStat
          label="Pending approval"
          value={customers.filter((c) => c.status === "pending").length}
          tone="warning"
        />
        <KPIStat
          label="Outstanding book"
          value={formatINR(customers.reduce((a, c) => a + c.outstanding, 0))}
        />
      </div>
      <Card>
        <CardHeader title="Customer master" subtitle="Profiles" />
        <ul className="divide-y divide-border">
          {customers.map((c) => (
            <li key={c.id}>
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
                <Link
                  href={`/customers/${c.id}`}
                  className="min-w-0 flex-1 transition-colors hover:opacity-90"
                >
                  <p className="font-data text-xs text-muted-foreground">
                    {c.code}
                  </p>
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.city} · {c.gstin} · {c.contactPerson}
                  </p>
                </Link>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge
                    tone={
                      c.status === "active"
                        ? "green"
                        : c.status === "pending"
                          ? "amber"
                          : "slate"
                    }
                  >
                    {c.status}
                  </StatusBadge>
                  <p className="font-data text-xs text-slate-500">
                    {formatINR(c.outstanding)} due
                  </p>
                  {canEdit && c.status === "pending" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        approveCustomer(c.id);
                        toast.success(`${c.name} approved for booking`);
                      }}
                    >
                      Approve
                    </Button>
                  ) : null}
                  {canEdit && c.status === "active" ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        deactivateCustomer(c.id);
                        toast.message(`${c.name} deactivated`);
                      }}
                    >
                      Deactivate
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <EntityFormSheet
        open={open}
        onOpenChange={setOpen}
        title="New customer"
        description="Creates a pending profile. Booking stays blocked until Admin approval."
        onSave={() => {
          if (
            !form.name.trim() ||
            !form.contactPerson.trim() ||
            !form.email.trim() ||
            !form.phone.trim()
          ) {
            return;
          }
          createCustomer({
            name: form.name.trim(),
            city: form.city,
            contactPerson: form.contactPerson.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            gstin: form.gstin.trim() || undefined,
          });
          toast.success("Customer created — pending approval");
          setOpen(false);
          setForm(emptyForm);
        }}
      >
        <div>
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <Label>City</Label>
          <Select
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          >
            {["Bengaluru", "Chennai", "Hyderabad", "Mumbai", "Delhi", "Pune"].map(
              (city) => (
                <option key={city}>{city}</option>
              )
            )}
          </Select>
        </div>
        <div>
          <Label>Contact person</Label>
          <Input
            value={form.contactPerson}
            onChange={(e) =>
              setForm((f) => ({ ...f, contactPerson: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div>
          <Label>GSTIN (optional)</Label>
          <Input
            value={form.gstin}
            onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
            placeholder="29AABCR0000A1Z5"
          />
        </div>
      </EntityFormSheet>
    </div>
  );
}
