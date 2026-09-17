"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Timeline } from "@/components/workflow";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { formatDateTime } from "@/lib/utils";
import { canMutate } from "@/data/can-mutate";
import { useDemoStore } from "@/store/demo-store";
import { useSessionStore } from "@/store/session-store";
import type { Ticket } from "@/types";
import { toast } from "sonner";

const SEVERITIES: Ticket["severity"][] = ["P1", "P2", "P3"];
const CATEGORIES = ["DELAY", "SHORTAGE", "DAMAGE", "BILLING", "OTHER"];

export default function SupportPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "support");
  const tickets = useDemoStore((s) => s.tickets);
  const customers = useDemoStore((s) => s.customers);
  const dockets = useDemoStore((s) => s.dockets);
  const createTicket = useDemoStore((s) => s.createTicket);
  const assignTicket = useDemoStore((s) => s.assignTicket);
  const resolveTicket = useDemoStore((s) => s.resolveTicket);
  const closeTicket = useDemoStore((s) => s.closeTicket);

  const defaultOwner = account?.name || "Support Desk";

  const [tktOpen, setTktOpen] = useState(false);
  const [tktForm, setTktForm] = useState({
    subject: "",
    customerId: customers[0]?.id ?? "",
    severity: "P2" as Ticket["severity"],
    category: "DELAY",
    owner: defaultOwner,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Customer service"
        title="Support & SLA"
        description="Prioritize, assign and resolve customer issues with accountable ownership."
        actions={
          canEdit ? (
            <Button
              size="sm"
              data-tour="support-new"
              onClick={() => {
                setTktForm((f) => ({
                  ...f,
                  customerId: f.customerId || customers[0]?.id || "",
                  owner: account?.name || "Support Desk",
                }));
                setTktOpen(true);
              }}
            >
              + Ticket
            </Button>
          ) : undefined
        }
      />
      <RoleWorkQueue />
      <div className="mb-3.5 grid gap-3 sm:grid-cols-4">
        <KPIStat
          label="Open tickets"
          value={tickets.filter(
            (t) => t.status === "open" || t.status === "in_progress"
          ).length}
        />
        <KPIStat
          label="P1 critical"
          value={tickets.filter((t) => t.severity === "P1").length}
          tone="danger"
        />
        <KPIStat label="Total tickets" value={tickets.length} />
        <KPIStat
          label="Resolved"
          value={tickets.filter(
            (t) => t.status === "resolved" || t.status === "closed"
          ).length}
        />
      </div>
      <div className="grid gap-3.5 xl:grid-cols-2" data-tour="support-queue">
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
                {canEdit ? (
                  <div className="flex flex-wrap gap-1.5">
                    {t.status === "open" || t.status === "in_progress" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const owner = account?.name || "Support Desk";
                          assignTicket(t.id, owner);
                          toast.success(`Assigned to ${owner}`);
                        }}
                      >
                        Assign
                      </Button>
                    ) : null}
                    {t.status === "open" || t.status === "in_progress" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          resolveTicket(t.id);
                          toast.success("Ticket resolved");
                        }}
                      >
                        Resolve
                      </Button>
                    ) : null}
                    {t.status === "resolved" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          closeTicket(t.id);
                          toast.message("Ticket closed");
                        }}
                      >
                        Close
                      </Button>
                    ) : null}
                  </div>
                ) : null}
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

      <EntityFormSheet
        open={tktOpen}
        onOpenChange={setTktOpen}
        title="New ticket"
        description="Open a support ticket against a customer."
        onSave={() => {
          if (!tktForm.subject.trim() || !tktForm.customerId) return;
          createTicket({
            ...tktForm,
            owner: tktForm.owner || account?.name || "Support Desk",
          });
          toast.success("Ticket created");
          setTktOpen(false);
          setTktForm({
            subject: "",
            customerId: customers[0]?.id ?? "",
            severity: "P2",
            category: "DELAY",
            owner: account?.name || "Support Desk",
          });
        }}
      >
        <div>
          <Label>Subject</Label>
          <Input
            value={tktForm.subject}
            onChange={(e) =>
              setTktForm((f) => ({ ...f, subject: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Customer</Label>
          <Select
            value={tktForm.customerId}
            onChange={(e) =>
              setTktForm((f) => ({ ...f, customerId: e.target.value }))
            }
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Severity</Label>
          <Select
            value={tktForm.severity}
            onChange={(e) =>
              setTktForm((f) => ({
                ...f,
                severity: e.target.value as Ticket["severity"],
              }))
            }
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Select
            value={tktForm.category}
            onChange={(e) =>
              setTktForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Owner</Label>
          <Input
            value={tktForm.owner}
            onChange={(e) =>
              setTktForm((f) => ({ ...f, owner: e.target.value }))
            }
          />
        </div>
      </EntityFormSheet>
    </div>
  );
}
