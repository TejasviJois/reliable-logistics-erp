"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { formatINR } from "@/lib/utils";
import {
  employees,
  leaveRequests,
  payrollRuns,
  type LeaveRequest,
} from "@/data/role-work";

export default function HrPage() {
  const [leaves, setLeaves] = useState(leaveRequests);

  const decide = (id: string, status: LeaveRequest["status"]) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="HR & Payroll"
        description="Employee master, leave approvals and payroll runs for the hub."
      />
      <RoleWorkQueue />
      <div className="mb-3.5 grid gap-3 sm:grid-cols-4">
        <KPIStat
          label="Headcount"
          value={employees.filter((e) => e.status !== "exited").length}
        />
        <KPIStat
          label="Onboarding"
          value={employees.filter((e) => e.status === "onboarding").length}
          tone="warning"
        />
        <KPIStat
          label="Leave pending"
          value={leaves.filter((l) => l.status === "pending").length}
          tone="warning"
        />
        <KPIStat
          label="Payroll in flight"
          value={payrollRuns.filter((p) => p.status !== "paid").length}
        />
      </div>

      <div className="grid gap-3.5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Employee directory" subtitle="People master" />
          <ul className="divide-y divide-border">
            {employees.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
              >
                <div>
                  <p className="font-data text-xs text-muted-foreground">
                    {e.code}
                  </p>
                  <p className="font-semibold">{e.name}</p>
                  <p className="text-xs text-slate-500">
                    {e.role} · {e.department} · {e.hub}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge
                    tone={
                      e.status === "active"
                        ? "green"
                        : e.status === "onboarding"
                          ? "blue"
                          : e.status === "notice"
                            ? "amber"
                            : "slate"
                    }
                  >
                    {e.status}
                  </StatusBadge>
                  <p className="mt-1 font-data text-xs text-slate-500">
                    CTC {formatINR(e.ctc)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-3.5">
          <Card>
            <CardHeader title="Leave requests" subtitle="Approvals" />
            <ul className="divide-y divide-border">
              {leaves.map((l) => (
                <li key={l.id} className="px-4 py-2.5 sm:px-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{l.employee}</p>
                      <p className="text-xs text-slate-500">
                        {l.type} · {l.from} → {l.to} · {l.days} day(s)
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{l.reason}</p>
                    </div>
                    <StatusBadge
                      tone={
                        l.status === "approved"
                          ? "green"
                          : l.status === "rejected"
                            ? "red"
                            : "amber"
                      }
                    >
                      {l.status}
                    </StatusBadge>
                  </div>
                  {l.status === "pending" ? (
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => decide(l.id, "approved")}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => decide(l.id, "rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Payroll runs" subtitle="Monthly cycles" />
            <ul className="divide-y divide-border">
              {payrollRuns.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
                >
                  <div>
                    <p className="font-semibold">
                      {p.period} · {p.hub}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.headcount} employees · Gross {formatINR(p.gross)}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge
                      tone={
                        p.status === "paid"
                          ? "green"
                          : p.status === "processing"
                            ? "blue"
                            : "slate"
                      }
                    >
                      {p.status}
                    </StatusBadge>
                    <p className="mt-1 font-data text-xs text-slate-500">
                      Net {formatINR(p.net)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
