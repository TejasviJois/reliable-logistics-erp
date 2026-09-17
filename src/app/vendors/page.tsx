"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { canMutate } from "@/data/can-mutate";
import { useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import { toast } from "sonner";
import type { Vendor } from "@/types";

const emptyForm = {
  name: "",
  gstin: "",
  type: "market" as Vendor["type"],
  phone: "",
};

export default function VendorsPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "vendors");
  const vendors = useDemoStore((s) => s.vendors);
  const createVendor = useDemoStore((s) => s.createVendor);
  const deactivateVendor = useDemoStore((s) => s.deactivateVendor);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Vendors"
        description="Transport and procurement vendor master."
        actions={
          canEdit ? (
            <Button
              size="sm"
              data-tour="vendors-new"
              onClick={() => setOpen(true)}
            >
              + Vendor
            </Button>
          ) : undefined
        }
      />
      <Card>
        <CardHeader title="Vendor directory" subtitle="KYC & performance" />
        <div className="overflow-x-auto">
          <table className="app-table w-full text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Vendor</th>
                <th className="px-4 py-2.5 sm:px-5">GSTIN / phone</th>
                <th className="px-4 py-2.5 sm:px-5">Rating</th>
                <th className="px-4 py-2.5 sm:px-5">Type</th>
                {canEdit ? (
                  <th className="px-4 py-2.5 text-right sm:px-5">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => {
                const inactive = v.rating === 0;
                return (
                  <tr key={v.id} className="border-b border-[var(--border)]/70">
                    <td className="px-4 py-3 font-medium sm:px-5">{v.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 sm:px-5">
                      <span className="font-data">{v.gstin}</span>
                      <span className="text-slate-300"> · </span>
                      {v.phone}
                    </td>
                    <td className="px-4 py-3 font-data font-semibold sm:px-5">
                      {inactive ? "—" : v.rating}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <StatusBadge tone={inactive ? "slate" : "teal"}>
                        {inactive ? "inactive" : v.type}
                      </StatusBadge>
                    </td>
                    {canEdit ? (
                      <td className="px-4 py-3 text-right sm:px-5">
                        {!inactive ? (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              deactivateVendor(v.id);
                              toast.message(`${v.name} deactivated`);
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
        onOpenChange={setOpen}
        title="New vendor"
        description="Add a transport or procurement vendor to the master."
        onSave={() => {
          if (!form.name.trim() || !form.gstin.trim() || !form.phone.trim()) {
            return;
          }
          createVendor({
            name: form.name.trim(),
            gstin: form.gstin.trim(),
            type: form.type,
            phone: form.phone.trim(),
          });
          toast.success("Vendor created");
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
          <Label>GSTIN</Label>
          <Input
            value={form.gstin}
            onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                type: e.target.value as Vendor["type"],
              }))
            }
          >
            <option value="market">market</option>
            <option value="owned">owned</option>
            <option value="contracted">contracted</option>
          </Select>
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
      </EntityFormSheet>
    </div>
  );
}
