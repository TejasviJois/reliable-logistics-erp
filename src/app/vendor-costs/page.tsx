"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR, formatDateTime } from "@/lib/utils";
import { masterData, useDemoStore } from "@/store/demo-store";
import { toast } from "sonner";
import type { BTH, THC } from "@/types";

const ADDITIONAL_TYPES = ["UNLOADING", "HALTING", "DETENTION", "OTHER"] as const;
const POD_STATUSES: BTH["podStatus"][] = ["RECEIVED", "PENDING", "NOT_REQUIRED"];

function thcTone(status: THC["status"]) {
  if (status === "approved" || status === "completed") return "green" as const;
  if (status === "pending" || status === "submitted") return "amber" as const;
  if (status === "rejected" || status === "on_hold") return "red" as const;
  return "slate" as const;
}

function bthTone(status: BTH["status"]) {
  if (status === "completed" || status === "paid") return "green" as const;
  if (status === "pending_accounts" || status === "pending_payment")
    return "amber" as const;
  if (status === "hold" || status === "rejected") return "red" as const;
  return "slate" as const;
}

function isBthPending(status: BTH["status"]) {
  return status === "pending_accounts" || status === "pending_payment";
}

export default function VendorCostsPage() {
  const thcs = useDemoStore((s) => s.thcs);
  const bths = useDemoStore((s) => s.bths);
  const trips = useDemoStore((s) => s.trips);
  const vendors = useDemoStore((s) => s.vendors);
  const createThc = useDemoStore((s) => s.createThc);
  const approveThc = useDemoStore((s) => s.approveThc);
  const rejectThc = useDemoStore((s) => s.rejectThc);
  const createBth = useDemoStore((s) => s.createBth);
  const payBth = useDemoStore((s) => s.payBth);

  const tripOptions = trips.filter((t) => t.status !== "planned");
  const approvedThcs = thcs.filter((t) => t.status === "approved");
  const vendorList = vendors.length ? vendors : masterData.vendors;

  const pendingApproval = thcs.filter(
    (t) => t.status === "pending" || t.status === "submitted"
  ).length;
  const pendingPayment = bths.filter((b) => isBthPending(b.status)).length;
  const paidCompleted = bths.filter(
    (b) => b.status === "paid" || b.status === "completed"
  ).length;
  const onHoldRejected =
    thcs.filter((t) => t.status === "on_hold" || t.status === "rejected").length +
    bths.filter((b) => b.status === "hold" || b.status === "rejected").length;

  const [selectedTripId, setSelectedTripId] = useState(
    () => tripOptions[0]?.id ?? ""
  );
  const [bthForm, setBthForm] = useState({
    thcId: "",
    podStatus: "RECEIVED" as BTH["podStatus"],
    balanceAmount: "",
    additionalType: "",
    additionalAmount: "",
  });
  const [utrByBth, setUtrByBth] = useState<Record<string, string>>({});

  const selectedApprovedThc = useMemo(
    () => approvedThcs.find((t) => t.id === bthForm.thcId),
    [approvedThcs, bthForm.thcId]
  );

  function resolveVendor(vendorId: string) {
    return vendorList.find((v) => v.id === vendorId);
  }

  function handleCreateThc(tripId: string) {
    if (!tripId) {
      toast.error("Select a trip first");
      return;
    }
    createThc(tripId);
    const trip = trips.find((t) => t.id === tripId);
    toast.success(`THC created for ${trip?.code ?? tripId}`);
  }

  function handleCreateBth() {
    if (!bthForm.thcId) {
      toast.error("Select an approved THC");
      return;
    }
    const balance = Number(bthForm.balanceAmount);
    if (!Number.isFinite(balance) || balance <= 0) {
      toast.error("Enter a valid balance amount");
      return;
    }
    const additionalAmount = bthForm.additionalAmount
      ? Number(bthForm.additionalAmount)
      : undefined;
    if (
      bthForm.additionalType &&
      (additionalAmount === undefined ||
        !Number.isFinite(additionalAmount) ||
        additionalAmount <= 0)
    ) {
      toast.error("Enter a valid additional charge amount");
      return;
    }
    createBth({
      thcId: bthForm.thcId,
      balanceAmount: balance,
      podStatus: bthForm.podStatus,
      additionalType: bthForm.additionalType || undefined,
      additionalAmount: bthForm.additionalType ? additionalAmount : undefined,
    });
    toast.success("BTH created — pending accounts");
    setBthForm({
      thcId: "",
      podStatus: "RECEIVED",
      balanceAmount: "",
      additionalType: "",
      additionalAmount: "",
    });
  }

  function handlePayBth(id: string) {
    const utr = (utrByBth[id] ?? "").trim();
    if (!utr) {
      toast.error("Enter UTR to pay & lock");
      return;
    }
    payBth(id, utr);
    toast.success("BTH paid and locked");
    setUtrByBth((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  return (
    <div>
      <PageHeader
        eyebrow="Transport cost"
        title="Vendor Costs — THC & BTH"
        description="Truck hire challans link manifests to vendor advances and balance settlement."
      />

      <Tabs defaultValue="dashboard" className="gap-4">
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-1"
        >
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="create-thc" data-tour="thc-create-tab">
            Create THC
          </TabsTrigger>
          <TabsTrigger value="thc-register">THC Register</TabsTrigger>
          <TabsTrigger value="create-bth">Create BTH</TabsTrigger>
          <TabsTrigger value="bth-register">BTH Register</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPIStat
              label="Pending traffic / approval"
              value={pendingApproval}
              tone="warning"
              hint="THCs awaiting Traffic + Accounts"
            />
            <KPIStat
              label="Pending payment"
              value={pendingPayment}
              tone="warning"
              hint="BTHs in pending_accounts / pending_payment"
            />
            <KPIStat
              label="Paid / completed"
              value={paidCompleted}
              tone="success"
            />
            <KPIStat
              label="On hold / rejected"
              value={onHoldRejected}
              tone="danger"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <KPIStat label="THC records" value={thcs.length} />
            <KPIStat label="BTH records" value={bths.length} />
            <KPIStat
              label="Approved THC value"
              value={formatINR(
                thcs
                  .filter((t) => t.status === "approved")
                  .reduce((a, t) => a + t.contractAmount, 0)
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader
              title="Hire vendors"
              subtitle="Read-only snapshot"
              action={
                <Button asChild variant="secondary" size="sm">
                  <Link href="/vendors">Open vendor master →</Link>
                </Button>
              }
            />
            <div className="border-b border-[var(--border)] px-4 py-3 text-sm text-slate-600 sm:px-5">
              Vendor KYC, bank and GST live on{" "}
              <Link
                href="/vendors"
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                /vendors
              </Link>
              . Use that screen to add or deactivate market / dedicated vendors
              before raising a THC.
            </div>
            <div className="overflow-x-auto">
              <table className="app-table w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-2.5 sm:px-5">Vendor</th>
                    <th className="px-4 py-2.5 sm:px-5">GSTIN / phone</th>
                    <th className="px-4 py-2.5 sm:px-5">Type</th>
                    <th className="px-4 py-2.5 sm:px-5">Rating</th>
                    <th className="px-4 py-2.5 sm:px-5">Open THCs</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorList.map((v) => {
                    const openThcs = thcs.filter(
                      (t) =>
                        t.vendorId === v.id &&
                        t.status !== "rejected" &&
                        t.status !== "completed"
                    ).length;
                    return (
                      <tr
                        key={v.id}
                        className="border-b border-[var(--border)]/70"
                      >
                        <td className="px-4 py-3 font-medium sm:px-5">
                          {v.name}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 sm:px-5">
                          <span className="font-data">{v.gstin}</span>
                          <span className="text-slate-300"> · </span>
                          {v.phone}
                        </td>
                        <td className="px-4 py-3 sm:px-5">
                          <StatusBadge tone="teal">{v.type}</StatusBadge>
                        </td>
                        <td className="px-4 py-3 font-data font-semibold sm:px-5">
                          {v.rating || "—"}
                        </td>
                        <td className="px-4 py-3 font-data sm:px-5">
                          {openThcs}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="create-thc" className="space-y-4" data-tour="thc-create">
          <Card>
            <CardHeader
              title="Create THC for trip"
              subtitle="Quick raise from active trips"
            />
            <div className="space-y-4 px-4 py-4 sm:px-5">
              <div className="flex flex-wrap gap-2">
                {tripOptions.slice(0, 3).map((t) => (
                  <Button
                    key={t.id}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCreateThc(t.id)}
                  >
                    Create THC for {t.code}
                  </Button>
                ))}
                {tripOptions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No eligible trips (non-planned) available.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <Label htmlFor="thc-trip">Or select any eligible trip</Label>
                  <Select
                    id="thc-trip"
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                  >
                    <option value="">Select trip…</option>
                    {tripOptions.map((t) => {
                      const vendor = resolveVendor(t.vendorId);
                      return (
                        <option key={t.id} value={t.id}>
                          {t.code} · {vendor?.name ?? t.vendorId} ·{" "}
                          {formatINR(t.estimatedCost)}
                        </option>
                      );
                    })}
                  </Select>
                </div>
                <Button
                  onClick={() => handleCreateThc(selectedTripId)}
                  disabled={!selectedTripId}
                >
                  Create THC
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                New THCs open as pending Traffic + Accounts approval. Contract
                amount defaults to trip estimated cost with ~30% advance.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="thc-register">
          <Card>
            <CardHeader
              title="THC register"
              subtitle="Traffic + Accounts approvals"
            />
            <div className="overflow-x-auto">
              <table className="app-table w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-2.5 sm:px-5">THC</th>
                    <th className="px-4 py-2.5 sm:px-5">Vendor / trip</th>
                    <th className="px-4 py-2.5 sm:px-5">Contract</th>
                    <th className="px-4 py-2.5 sm:px-5">Advance</th>
                    <th className="px-4 py-2.5 sm:px-5">Created</th>
                    <th className="px-4 py-2.5 sm:px-5">Status</th>
                    <th className="px-4 py-2.5 text-right sm:px-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {thcs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500 sm:px-5"
                      >
                        No THCs yet — create one from an active trip.
                      </td>
                    </tr>
                  ) : (
                    thcs.map((t) => {
                      const vendor = resolveVendor(t.vendorId);
                      const trip = trips.find((x) => x.id === t.tripId);
                      const pending =
                        t.status === "pending" || t.status === "submitted";
                      return (
                        <tr
                          key={t.id}
                          className="border-b border-[var(--border)]/70"
                        >
                          <td className="px-4 py-3 font-data font-semibold sm:px-5">
                            {t.number}
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <p className="font-medium">{vendor?.name}</p>
                            <p className="text-xs text-slate-500">
                              {trip?.code}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-data font-medium sm:px-5">
                            {formatINR(t.contractAmount)}
                          </td>
                          <td className="px-4 py-3 font-data sm:px-5">
                            {formatINR(t.advance)}
                          </td>
                          <td className="px-4 py-3 font-data text-xs text-slate-500 sm:px-5">
                            {formatDateTime(t.createdAt)}
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <StatusBadge tone={thcTone(t.status)}>
                              {t.status}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3 text-right sm:px-5">
                            {pending ? (
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    approveThc(t.id);
                                    toast.success(`${t.number} approved`);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    rejectThc(t.id);
                                    toast.error(`${t.number} rejected`);
                                  }}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="create-bth">
          <Card>
            <CardHeader
              title="Create BTH"
              subtitle="Balance transport hire after POD"
            />
            <div className="grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
              <div className="sm:col-span-2">
                <Label htmlFor="bth-thc">Approved THC</Label>
                <Select
                  id="bth-thc"
                  value={bthForm.thcId}
                  onChange={(e) => {
                    const thc = approvedThcs.find(
                      (t) => t.id === e.target.value
                    );
                    const suggested = thc
                      ? Math.max(0, thc.contractAmount - thc.advance)
                      : 0;
                    setBthForm((f) => ({
                      ...f,
                      thcId: e.target.value,
                      balanceAmount: suggested
                        ? String(suggested)
                        : f.balanceAmount,
                    }));
                  }}
                >
                  <option value="">Select approved THC…</option>
                  {approvedThcs.map((t) => {
                    const vendor = resolveVendor(t.vendorId);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.number} · {vendor?.name} · bal{" "}
                        {formatINR(
                          Math.max(0, t.contractAmount - t.advance)
                        )}
                      </option>
                    );
                  })}
                </Select>
                {selectedApprovedThc ? (
                  <p className="mt-1.5 text-xs text-slate-500">
                    Contract {formatINR(selectedApprovedThc.contractAmount)} ·
                    Advance paid {formatINR(selectedApprovedThc.advance)}
                  </p>
                ) : null}
              </div>

              <div>
                <Label htmlFor="bth-pod">POD hard copy</Label>
                <Select
                  id="bth-pod"
                  value={bthForm.podStatus}
                  onChange={(e) =>
                    setBthForm((f) => ({
                      ...f,
                      podStatus: e.target.value as BTH["podStatus"],
                    }))
                  }
                >
                  {POD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="bth-balance">Balance amount (₹)</Label>
                <Input
                  id="bth-balance"
                  type="number"
                  min={0}
                  value={bthForm.balanceAmount}
                  onChange={(e) =>
                    setBthForm((f) => ({
                      ...f,
                      balanceAmount: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="bth-add-type">
                  Additional charge type (optional)
                </Label>
                <Select
                  id="bth-add-type"
                  value={bthForm.additionalType}
                  onChange={(e) =>
                    setBthForm((f) => ({
                      ...f,
                      additionalType: e.target.value,
                      additionalAmount: e.target.value
                        ? f.additionalAmount
                        : "",
                    }))
                  }
                >
                  <option value="">None</option>
                  {ADDITIONAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="bth-add-amt">Additional amount (₹)</Label>
                <Input
                  id="bth-add-amt"
                  type="number"
                  min={0}
                  disabled={!bthForm.additionalType}
                  value={bthForm.additionalAmount}
                  onChange={(e) =>
                    setBthForm((f) => ({
                      ...f,
                      additionalAmount: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>

              <div className="sm:col-span-2">
                <Button onClick={handleCreateBth}>Create BTH</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="bth-register">
          <Card>
            <CardHeader
              title="BTH register"
              subtitle="Pay & lock with UTR"
            />
            <div className="overflow-x-auto">
              <table className="app-table w-full text-left text-sm">
                <thead className="border-b border-[var(--border)]">
                  <tr>
                    <th className="px-4 py-2.5 sm:px-5">BTH</th>
                    <th className="px-4 py-2.5 sm:px-5">THC / POD</th>
                    <th className="px-4 py-2.5 sm:px-5">Balance</th>
                    <th className="px-4 py-2.5 sm:px-5">Extras</th>
                    <th className="px-4 py-2.5 sm:px-5">Status</th>
                    <th className="px-4 py-2.5 sm:px-5">UTR</th>
                    <th className="px-4 py-2.5 text-right sm:px-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bths.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-sm text-slate-500 sm:px-5"
                      >
                        No BTHs yet — create one from an approved THC.
                      </td>
                    </tr>
                  ) : (
                    bths.map((b) => {
                      const thc = thcs.find((t) => t.id === b.thcId);
                      const pending = isBthPending(b.status);
                      const locked =
                        b.status === "completed" || b.status === "paid";
                      const extras = b.additionalCharges
                        .map((c) => `${c.type} ${formatINR(c.amount)}`)
                        .join(", ");
                      return (
                        <tr
                          key={b.id}
                          className="border-b border-[var(--border)]/70"
                        >
                          <td className="px-4 py-3 font-data font-semibold sm:px-5">
                            {b.number}
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <p className="font-medium">
                              {thc?.number ?? b.thcId}
                            </p>
                            <p className="text-xs text-slate-500">
                              POD {b.podStatus}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-data font-medium sm:px-5">
                            {formatINR(b.balanceAmount)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 sm:px-5">
                            {extras || "—"}
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            <StatusBadge tone={bthTone(b.status)}>
                              {b.status}
                            </StatusBadge>
                          </td>
                          <td className="px-4 py-3 sm:px-5">
                            {locked && b.utr ? (
                              <span className="font-data text-xs font-semibold text-slate-700">
                                🔒 {b.utr}
                              </span>
                            ) : pending ? (
                              <Input
                                className="h-8 max-w-[160px] font-data text-xs"
                                placeholder="UTR…"
                                value={utrByBth[b.id] ?? ""}
                                onChange={(e) =>
                                  setUtrByBth((prev) => ({
                                    ...prev,
                                    [b.id]: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right sm:px-5">
                            {pending ? (
                              <Button
                                size="sm"
                                onClick={() => handlePayBth(b.id)}
                              >
                                Pay &amp; lock
                              </Button>
                            ) : locked ? (
                              <span className="text-xs font-medium text-success">
                                Locked
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
