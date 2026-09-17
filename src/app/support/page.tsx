"use client";

import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Timeline } from "@/components/workflow";
import { formatDateTime } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export default function SupportPage() {
  const tickets = useDemoStore((s) => s.tickets);
  const customers = useDemoStore((s) => s.customers);
  const dockets = useDemoStore((s) => s.dockets);

  return (
    <div>
      <PageHeader
        eyebrow="Customer service"
        title="Support & SLA"
        description="Prioritize, assign and resolve customer issues with accountable ownership."
      />
      <RoleWorkQueue />
      <div className="mb-3.5 grid gap-3 sm:grid-cols-4">
        <KPIStat
          label="Open tickets"
          value={tickets.filter((t) => t.status === "open" || t.status === "in_progress").length}
        />
        <KPIStat
          label="P1 critical"
          value={tickets.filter((t) => t.severity === "P1").length}
          tone="danger"
        />
        <KPIStat label="Total tickets" value={tickets.length} />
        <KPIStat
          label="Resolved"
          value={tickets.filter((t) => t.status === "resolved" || t.status === "closed").length}
        />
      </div>
      <div className="grid gap-3.5 xl:grid-cols-2">
        {tickets.map((t) => {
          const c = customers.find((x) => x.id === t.customerId);
          const d = dockets.find((x) => x.id === t.docketId);
          return (
            <Card key={t.id}>
              <CardHeader
                title={t.subject}
                subtitle={t.number}
                action={
                  <StatusBadge tone={t.severity === "P1" ? "red" : "amber"}>
                    {t.severity} · {t.status}
                  </StatusBadge>
                }
              />
              <div className="space-y-3 px-4 py-3.5 text-sm sm:px-5">
                <p className="text-foreground">
                  {c?.name} · {d?.number ?? "Unlinked"} · Owner {t.owner}
                </p>
                <p className="text-xs text-slate-500">
                  SLA due {formatDateTime(t.slaDue)}
                </p>
                <Timeline
                  items={t.updates.map((u) => ({
                    title: u.action,
                    meta: u.note,
                    at: formatDateTime(u.at),
                    tone: "done" as const,
                  }))}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
