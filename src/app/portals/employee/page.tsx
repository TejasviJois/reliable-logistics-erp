"use client";

import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { leaveRequests, payrollRuns } from "@/data/role-work";
import { useSessionStore } from "@/store/session-store";

export default function EmployeePortalPage() {
  const account = useSessionStore((s) => s.account);
  const myLeaves = leaveRequests.filter(
    (l) =>
      !account ||
      account.role === "hr" ||
      l.employee.toLowerCase().includes(account.name.split(" ")[0].toLowerCase())
  );

  return (
    <div>
      <PageHeader
        eyebrow="Portals"
        title="Employee self-service"
        description="Leave balance, payslip status and profile — for staff and HR demos."
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KPIStat label="Signed in as" value={account?.name ?? "—"} />
        <KPIStat label="Department" value={account?.department ?? "—"} />
        <KPIStat
          label="Open leave requests"
          value={leaveRequests.filter((l) => l.status === "pending").length}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="My leave" subtitle="Requests" />
          <div className="overflow-x-auto">
            <table className="app-table w-full text-left text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">Employee</th>
                  <th className="px-4 py-2.5 sm:px-5">Period</th>
                  <th className="px-4 py-2.5 sm:px-5">Status</th>
                </tr>
              </thead>
              <tbody>
                {(myLeaves.length ? myLeaves : leaveRequests).map((l) => (
                  <tr key={l.id} className="border-b border-[var(--border)]/70">
                    <td className="px-4 py-3 font-semibold sm:px-5">
                      {l.employee}
                      <p className="text-xs font-normal text-slate-500">{l.type}</p>
                    </td>
                    <td className="px-4 py-3 font-data text-xs text-slate-500 sm:px-5">
                      {l.from} → {l.to}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <StatusBadge
                        tone={
                          l.status === "approved"
                            ? "green"
                            : l.status === "pending"
                              ? "amber"
                              : "red"
                        }
                      >
                        {l.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title="Payslip status" subtitle="Latest runs" />
          <div className="overflow-x-auto">
            <table className="app-table w-full text-left text-sm">
              <thead className="border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-2.5 sm:px-5">Period</th>
                  <th className="px-4 py-2.5 sm:px-5">Hub</th>
                  <th className="px-4 py-2.5 sm:px-5">Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollRuns.slice(0, 3).map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border)]/70">
                    <td className="px-4 py-3 font-semibold sm:px-5">{p.period}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 sm:px-5">
                      {p.hub}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
