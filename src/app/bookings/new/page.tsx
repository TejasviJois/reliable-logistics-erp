"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { FieldGrid } from "@/components/ui/page";
import { Input, Label, Select } from "@/components/ui/input";
import { cn, formatINR } from "@/lib/utils";
import { useDemoStore, masterData } from "@/store/demo-store";
import type { PaymentMode, TransportMode } from "@/types";

const steps = ["Shipment", "Cargo", "Commercial", "Compliance"] as const;

export default function CreateDocketPage() {
  const router = useRouter();
  const customers = useDemoStore((s) => s.customers);
  const createDocket = useDemoStore((s) => s.createDocket);
  const [step, setStep] = useState(0);
  const [gateMsg, setGateMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerId: "cus-meridian",
    consignor: "Meridian Electronics — Bengaluru Plant",
    consignee: "Meridian Electronics — Chennai DC",
    originCity: "Bengaluru",
    originPin: "560100",
    destinationCity: "Chennai",
    destinationPin: "600032",
    paymentMode: "TBB" as PaymentMode,
    transportMode: "PTL" as TransportMode,
    packages: 9,
    actualWeightKg: 800,
    lengthCm: 60,
    widthCm: 40,
    heightCm: 40,
    invoiceNumber: "ME-INV-88421",
    ewayBill: "1710 2345 678901",
    riskType: "Carrier's Risk",
    edd: "2026-09-20",
  });

  const contract = masterData.contracts.find(
    (c) =>
      c.customerId === form.customerId && c.mode === form.transportMode
  );
  const freight = useMemo(() => {
    const volumetric =
      (form.lengthCm * form.widthCm * form.heightCm * form.packages) / 4500;
    const chargeable = Math.max(form.actualWeightKg, Math.round(volumetric));
    const rate = contract?.ratePerKg ?? 20;
    return Math.max(contract?.minFreight ?? 1200, Math.round(chargeable * rate));
  }, [form, contract]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onCreate = () => {
    const result = createDocket({ ...form, freight });
    if (!result.ok) {
      setGateMsg(result.message);
      return;
    }
    router.push(`/bookings/${result.id}?label=1`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Order entry"
        title="Create consignment docket"
        description="Guided booking with live commercial summary."
      />
      <div className="grid gap-3.5 xl:grid-cols-[1fr_320px]">
        <Card className="p-5">
          <div className="mb-5 flex flex-wrap gap-1.5" data-tour="bookings-wizard-steps">
            {steps.map((s, i) => (
              <button
                key={s}
                type="button"
                data-tour={`bookings-wizard-step-${i}`}
                onClick={() => setStep(i)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] transition-colors",
                  i === step &&
                    "bg-primary text-primary-foreground shadow-[0_1px_0_rgba(0,0,0,0.06)]",
                  i < step &&
                    "bg-accent-soft text-primary ring-1 ring-inset ring-primary/20",
                  i > step &&
                    "bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200/80"
                )}
              >
                {i + 1}. {s}
              </button>
            ))}
          </div>

          {step === 0 && (
            <FieldGrid cols={2}>
              <div>
                <Label>Customer</Label>
                <Select
                  value={form.customerId}
                  onChange={(e) => set("customerId", e.target.value)}
                >
                  {customers
                    .filter((c) => c.status === "active")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </Select>
              </div>
              <div>
                <Label>Booking source</Label>
                <Input value="Regular Customer" readOnly />
              </div>
              <div>
                <Label>Consignor</Label>
                <Input
                  value={form.consignor}
                  onChange={(e) => set("consignor", e.target.value)}
                />
              </div>
              <div>
                <Label>Consignee</Label>
                <Input
                  value={form.consignee}
                  onChange={(e) => set("consignee", e.target.value)}
                />
              </div>
              <div>
                <Label>Origin city</Label>
                <Input
                  value={form.originCity}
                  onChange={(e) => set("originCity", e.target.value)}
                />
              </div>
              <div>
                <Label>Origin PIN</Label>
                <Input
                  value={form.originPin}
                  onChange={(e) => set("originPin", e.target.value)}
                />
              </div>
              <div>
                <Label>Destination city</Label>
                <Input
                  value={form.destinationCity}
                  onChange={(e) => set("destinationCity", e.target.value)}
                />
              </div>
              <div>
                <Label>Destination PIN</Label>
                <Input
                  value={form.destinationPin}
                  onChange={(e) => set("destinationPin", e.target.value)}
                />
              </div>
            </FieldGrid>
          )}

          {step === 1 && (
            <FieldGrid cols={3}>
              <div>
                <Label>Packages</Label>
                <Input
                  type="number"
                  value={form.packages}
                  onChange={(e) => set("packages", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Actual weight (kg)</Label>
                <Input
                  type="number"
                  value={form.actualWeightKg}
                  onChange={(e) => set("actualWeightKg", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Risk type</Label>
                <Select
                  value={form.riskType}
                  onChange={(e) => set("riskType", e.target.value)}
                >
                  <option>Carrier&apos;s Risk</option>
                  <option>Owner&apos;s Risk</option>
                </Select>
              </div>
              <div>
                <Label>Length cm</Label>
                <Input
                  type="number"
                  value={form.lengthCm}
                  onChange={(e) => set("lengthCm", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Width cm</Label>
                <Input
                  type="number"
                  value={form.widthCm}
                  onChange={(e) => set("widthCm", Number(e.target.value))}
                />
              </div>
              <div>
                <Label>Height cm</Label>
                <Input
                  type="number"
                  value={form.heightCm}
                  onChange={(e) => set("heightCm", Number(e.target.value))}
                />
              </div>
            </FieldGrid>
          )}

          {step === 2 && (
            <FieldGrid cols={2}>
              <div>
                <Label>Payment mode</Label>
                <Select
                  value={form.paymentMode}
                  onChange={(e) =>
                    set("paymentMode", e.target.value as PaymentMode)
                  }
                >
                  <option value="TBB">TBB — To Be Billed</option>
                  <option value="TO_PAY">To Pay</option>
                  <option value="PAID">Paid</option>
                </Select>
              </div>
              <div>
                <Label>Transport mode</Label>
                <Select
                  value={form.transportMode}
                  onChange={(e) =>
                    set("transportMode", e.target.value as TransportMode)
                  }
                >
                  <option value="PTL">Surface PTL</option>
                  <option value="FTL">Surface FTL</option>
                  <option value="RAIL">Rail</option>
                  <option value="AIR">Air</option>
                </Select>
              </div>
              <div className="md:col-span-2 rounded-2xl border border-[var(--border)] bg-slate-50/80 p-3 text-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Contract rate
                </p>
                <p className="mt-1 text-slate-600">
                  Contract zone <strong>{contract?.zone ?? "Market"}</strong> ·
                  rate ₹{contract?.ratePerKg ?? 20}/kg · estimated freight{" "}
                  <strong>{formatINR(freight)}</strong>
                </p>
              </div>
            </FieldGrid>
          )}

          {step === 3 && (
            <FieldGrid cols={2}>
              <div>
                <Label>Customer invoice number</Label>
                <Input
                  value={form.invoiceNumber}
                  onChange={(e) => set("invoiceNumber", e.target.value)}
                />
              </div>
              <div>
                <Label>E-way Bill</Label>
                <Input
                  value={form.ewayBill}
                  onChange={(e) => set("ewayBill", e.target.value)}
                />
              </div>
              <div>
                <Label>EDD</Label>
                <Input
                  type="date"
                  value={form.edd}
                  onChange={(e) => set("edd", e.target.value)}
                />
              </div>
            </FieldGrid>
          )}

          <div className="mt-6 flex justify-between">
            <Button
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
            <div className="flex gap-2">
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
              ) : (
                <>
                  <Button variant="secondary">Save draft</Button>
                  <Button onClick={onCreate}>Create docket</Button>
                  {gateMsg ? (
                    <p className="mt-2 text-xs font-medium text-amber-800">
                      {gateMsg}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="h-fit">
          <CardHeader
            title={`${form.originCity} → ${form.destinationCity}`}
            subtitle="Shipment summary"
          />
          <dl className="space-y-2.5 px-4 py-4 text-sm sm:px-5">
            <div className="flex justify-between">
              <dt className="text-slate-500">Packages</dt>
              <dd className="font-data font-medium">{form.packages}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Weight</dt>
              <dd className="font-data font-medium">{form.actualWeightKg} kg</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Mode</dt>
              <dd className="font-medium">
                {form.transportMode === "PTL" ? "Surface PTL" : form.transportMode}
              </dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <dt className="text-slate-500">Estimated freight</dt>
              <dd className="font-data text-base font-semibold text-primary">
                {formatINR(freight)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
