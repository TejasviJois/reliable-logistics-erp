"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { formatINR, formatDateTime } from "@/lib/utils";
import { canMutate } from "@/data/can-mutate";
import type { SalesLead } from "@/data/role-work";
import { useDeptStore } from "@/store/dept-store";
import { useSessionStore } from "@/store/session-store";
import { toast } from "sonner";

const STAGE_TONE: Record<
  SalesLead["stage"],
  "slate" | "blue" | "amber" | "green" | "red"
> = {
  new: "slate",
  qualified: "blue",
  quotation: "amber",
  negotiation: "amber",
  won: "green",
  lost: "red",
};

export default function CrmPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "crm");
  const leads = useDeptStore((s) => s.leads);
  const quotations = useDeptStore((s) => s.quotations);
  const createLead = useDeptStore((s) => s.createLead);
  const deleteLead = useDeptStore((s) => s.deleteLead);
  const advanceLead = useDeptStore((s) => s.advanceLead);
  const createQuotation = useDeptStore((s) => s.createQuotation);
  const deleteQuotation = useDeptStore((s) => s.deleteQuotation);

  const [leadOpen, setLeadOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    company: "",
    contact: "",
    city: "Bengaluru",
    value: 100000,
    mode: "PTL",
  });
  const [quoteForm, setQuoteForm] = useState({
    customer: "",
    lane: "BLR → CHN",
    amount: 100000,
    validTill: "2026-10-31",
  });

  const pipeline = leads
    .filter((l) => !["won", "lost"].includes(l.stage))
    .reduce((a, l) => a + l.value, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="CRM & Sales"
        description="Leads, opportunities and quotations — convert interest into contracted customers."
        actions={
          canEdit ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setLeadOpen(true)}>
                + Lead
              </Button>
              <Button size="sm" onClick={() => setQuoteOpen(true)}>
                + Quotation
              </Button>
            </>
          ) : undefined
        }
      />
      <RoleWorkQueue />
      <div className="mb-3.5 grid gap-3 sm:grid-cols-4">
        <KPIStat
          label="Open opportunities"
          value={leads.filter((l) => !["won", "lost"].includes(l.stage)).length}
        />
        <KPIStat label="Pipeline value" value={formatINR(pipeline)} />
        <KPIStat
          label="Quotations out"
          value={quotations.filter((q) => q.status === "sent").length}
        />
        <KPIStat
          label="Approved quotes"
          value={quotations.filter((q) => q.status === "approved").length}
          tone="success"
        />
      </div>

      <div className="grid gap-3.5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Opportunity pipeline" subtitle="Sales workboard" />
          <ul className="divide-y divide-border">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{lead.company}</p>
                  <p className="text-xs text-slate-500">
                    {lead.contact} · {lead.city} · {lead.mode}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{lead.nextAction}</p>
                  <p className="mt-0.5 font-data text-[11px] text-muted-foreground">
                    Updated {formatDateTime(lead.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge tone={STAGE_TONE[lead.stage]}>
                    {lead.stage}
                  </StatusBadge>
                  <p className="font-data text-sm font-semibold">
                    {formatINR(lead.value)}
                  </p>
                  {canEdit ? (
                    <div className="flex flex-wrap justify-end gap-1">
                      {!["won", "lost"].includes(lead.stage) ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            advanceLead(lead.id);
                            toast.success("Stage advanced");
                          }}
                        >
                          Advance stage
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          deleteLead(lead.id);
                          toast.message("Lead deleted");
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Quotations" subtitle="Commercial offers" />
          <ul className="divide-y divide-border">
            {quotations.map((q) => (
              <li key={q.id} className="px-4 py-2.5 sm:px-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-data text-xs text-muted-foreground">
                      {q.number}
                    </p>
                    <p className="text-sm font-semibold">{q.customer}</p>
                    <p className="text-xs text-slate-500">{q.lane}</p>
                  </div>
                  <StatusBadge
                    tone={
                      q.status === "approved"
                        ? "green"
                        : q.status === "sent"
                          ? "blue"
                          : q.status === "expired"
                            ? "red"
                            : "slate"
                    }
                  >
                    {q.status}
                  </StatusBadge>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{formatINR(q.amount)}</span>
                  <span>Valid till {q.validTill}</span>
                </div>
                {canEdit ? (
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        deleteQuotation(q.id);
                        toast.message("Quotation deleted");
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <EntityFormSheet
        open={leadOpen}
        onOpenChange={setLeadOpen}
        title="New lead"
        description="Capture a sales opportunity for the CRM pipeline."
        onSave={() => {
          if (!leadForm.company.trim()) return;
          createLead({
            ...leadForm,
            owner: "Sales",
            nextAction: "Discovery call",
          });
          toast.success("Lead created");
          setLeadOpen(false);
          setLeadForm({
            company: "",
            contact: "",
            city: "Bengaluru",
            value: 100000,
            mode: "PTL",
          });
        }}
      >
        <div>
          <Label>Company</Label>
          <Input
            value={leadForm.company}
            onChange={(e) =>
              setLeadForm((f) => ({ ...f, company: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Contact</Label>
          <Input
            value={leadForm.contact}
            onChange={(e) =>
              setLeadForm((f) => ({ ...f, contact: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>City</Label>
          <Select
            value={leadForm.city}
            onChange={(e) => setLeadForm((f) => ({ ...f, city: e.target.value }))}
          >
            {["Bengaluru", "Chennai", "Hyderabad", "Mumbai"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Mode</Label>
          <Select
            value={leadForm.mode}
            onChange={(e) => setLeadForm((f) => ({ ...f, mode: e.target.value }))}
          >
            {["PTL", "FTL", "Express", "Warehousing"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Est. value (₹)</Label>
          <Input
            type="number"
            value={leadForm.value}
            onChange={(e) =>
              setLeadForm((f) => ({ ...f, value: Number(e.target.value) }))
            }
          />
        </div>
      </EntityFormSheet>

      <EntityFormSheet
        open={quoteOpen}
        onOpenChange={setQuoteOpen}
        title="New quotation"
        description="Create a commercial offer for a prospect or customer."
        onSave={() => {
          if (!quoteForm.customer.trim()) return;
          createQuotation(quoteForm);
          toast.success("Quotation created");
          setQuoteOpen(false);
          setQuoteForm({
            customer: "",
            lane: "BLR → CHN",
            amount: 100000,
            validTill: "2026-10-31",
          });
        }}
      >
        <div>
          <Label>Customer</Label>
          <Input
            value={quoteForm.customer}
            onChange={(e) =>
              setQuoteForm((f) => ({ ...f, customer: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Lane</Label>
          <Input
            value={quoteForm.lane}
            onChange={(e) =>
              setQuoteForm((f) => ({ ...f, lane: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            value={quoteForm.amount}
            onChange={(e) =>
              setQuoteForm((f) => ({ ...f, amount: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label>Valid till</Label>
          <Input
            type="date"
            value={quoteForm.validTill}
            onChange={(e) =>
              setQuoteForm((f) => ({ ...f, validTill: e.target.value }))
            }
          />
        </div>
      </EntityFormSheet>
    </div>
  );
}
