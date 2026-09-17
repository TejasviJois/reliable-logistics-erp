"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { formatINR, formatDateTime } from "@/lib/utils";
import { quotations, salesLeads, type SalesLead } from "@/data/role-work";

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
  const [leads, setLeads] = useState(salesLeads);

  const pipeline = leads
    .filter((l) => !["won", "lost"].includes(l.stage))
    .reduce((a, l) => a + l.value, 0);

  const advance = (id: string) => {
    const order: SalesLead["stage"][] = [
      "new",
      "qualified",
      "quotation",
      "negotiation",
      "won",
    ];
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const i = order.indexOf(l.stage);
        if (i < 0 || i >= order.length - 1) return l;
        return { ...l, stage: order[i + 1], updatedAt: new Date().toISOString() };
      })
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="CRM & Sales"
        description="Leads, opportunities and quotations — convert interest into contracted customers."
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
                  {!["won", "lost"].includes(lead.stage) ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => advance(lead.id)}
                    >
                      Advance stage
                    </Button>
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
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>{formatINR(q.amount)}</span>
                  <span>Valid till {q.validTill}</span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
