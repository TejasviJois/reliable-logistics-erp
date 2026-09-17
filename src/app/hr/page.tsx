"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { formatINR } from "@/lib/utils";
import { canMutate } from "@/data/can-mutate";
import { useDeptStore } from "@/store/dept-store";
import { useSessionStore } from "@/store/session-store";
import { toast } from "sonner";

const HUBS = ["Bengaluru Hub", "Chennai Hub", "Hyderabad Hub", "Mumbai Hub"];
const DEPARTMENTS = [
  "Warehouse",
  "Booking",
  "Delivery",
  "Sales",
  "Billing",
  "Fleet",
  "HR",
];

export default function HrPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "hr");
  const employees = useDeptStore((s) => s.employees);
  const leaveRequests = useDeptStore((s) => s.leaveRequests);
  const payrollRuns = useDeptStore((s) => s.payrollRuns);
  const createEmployee = useDeptStore((s) => s.createEmployee);
  const exitEmployee = useDeptStore((s) => s.exitEmployee);
  const decideLeave = useDeptStore((s) => s.decideLeave);
  const processPayroll = useDeptStore((s) => s.processPayroll);

  const [empOpen, setEmpOpen] = useState(false);
  const [empForm, setEmpForm] = useState({
    name: "",
    role: "",
    department: "Warehouse",
    hub: "Bengaluru Hub",
    ctc: 400000,
    joinDate: new Date().toISOString().slice(0, 10),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="HR & Payroll"
        description="Employee master, leave approvals and payroll runs for the hub."
        actions={
          canEdit ? (
            <Button size="sm" onClick={() => setEmpOpen(true)}>
              + Employee
            </Button>
          ) : undefined
        }
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
          value={leaveRequests.filter((l) => l.status === "pending").length}
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
                <div className="flex flex-col items-end gap-1.5">
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
                  <p className="font-data text-xs text-slate-500">
                    CTC {formatINR(e.ctc)}
                  </p>
                  {canEdit && e.status !== "exited" ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        exitEmployee(e.id);
                        toast.message(`${e.name} marked exited`);
                      }}
                    >
                      Exit employee
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-3.5">
          <Card>
            <CardHeader title="Leave requests" subtitle="Approvals" />
            <ul className="divide-y divide-border">
              {leaveRequests.map((l) => (
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
                  {canEdit && l.status === "pending" ? (
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          decideLeave(l.id, "approved");
                          toast.success(`Leave approved for ${l.employee}`);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          decideLeave(l.id, "rejected");
                          toast.message(`Leave rejected for ${l.employee}`);
                        }}
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
                  <div className="flex flex-col items-end gap-1.5">
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
                    <p className="font-data text-xs text-slate-500">
                      Net {formatINR(p.net)}
                    </p>
                    {canEdit && p.status !== "paid" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          processPayroll(p.id);
                          toast.success(
                            p.status === "draft"
                              ? "Payroll processing"
                              : "Payroll paid"
                          );
                        }}
                      >
                        Process
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <EntityFormSheet
        open={empOpen}
        onOpenChange={setEmpOpen}
        title="New employee"
        description="Add a person to the hub employee master."
        onSave={() => {
          if (!empForm.name.trim() || !empForm.role.trim()) return;
          createEmployee(empForm);
          toast.success("Employee created");
          setEmpOpen(false);
          setEmpForm({
            name: "",
            role: "",
            department: "Warehouse",
            hub: "Bengaluru Hub",
            ctc: 400000,
            joinDate: new Date().toISOString().slice(0, 10),
          });
        }}
      >
        <div>
          <Label>Name</Label>
          <Input
            value={empForm.name}
            onChange={(e) =>
              setEmpForm((f) => ({ ...f, name: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Role</Label>
          <Input
            value={empForm.role}
            onChange={(e) =>
              setEmpForm((f) => ({ ...f, role: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Department</Label>
          <Select
            value={empForm.department}
            onChange={(e) =>
              setEmpForm((f) => ({ ...f, department: e.target.value }))
            }
          >
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Hub</Label>
          <Select
            value={empForm.hub}
            onChange={(e) => setEmpForm((f) => ({ ...f, hub: e.target.value }))}
          >
            {HUBS.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>CTC (₹)</Label>
          <Input
            type="number"
            value={empForm.ctc}
            onChange={(e) =>
              setEmpForm((f) => ({ ...f, ctc: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label>Join date</Label>
          <Input
            type="date"
            value={empForm.joinDate}
            onChange={(e) =>
              setEmpForm((f) => ({ ...f, joinDate: e.target.value }))
            }
          />
        </div>
      </EntityFormSheet>
    </div>
  );
}
