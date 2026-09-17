"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { EntityFormSheet } from "@/components/entity-form-sheet";
import { canMutate } from "@/data/can-mutate";
import { useDeptStore } from "@/store/dept-store";
import { useSessionStore } from "@/store/session-store";
import type { ComplianceDoc } from "@/data/role-work";
import { toast } from "sonner";

const DOC_TYPES: ComplianceDoc["type"][] = [
  "license",
  "insurance",
  "gst",
  "contract",
  "permit",
];

export default function CompliancePage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "compliance");
  const docs = useDeptStore((s) => s.complianceDocs);
  const createComplianceDoc = useDeptStore((s) => s.createComplianceDoc);
  const deleteComplianceDoc = useDeptStore((s) => s.deleteComplianceDoc);
  const startRenewal = useDeptStore((s) => s.startRenewal);
  const completeRenewal = useDeptStore((s) => s.completeRenewal);

  const [docOpen, setDocOpen] = useState(false);
  const [docForm, setDocForm] = useState({
    title: "",
    entity: "",
    type: "license" as ComplianceDoc["type"],
    expiry: new Date().toISOString().slice(0, 10),
    owner: "Legal",
  });

  return (
    <div>
      <PageHeader
        eyebrow="Governance"
        title="Compliance & Documents"
        description="Licenses, permits, insurance and contract vault with expiry control."
        actions={
          canEdit ? (
            <Button
              size="sm"
              data-tour="compliance-new"
              onClick={() => setDocOpen(true)}
            >
              + Document
            </Button>
          ) : undefined
        }
      />
      <RoleWorkQueue />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <KPIStat label="Documents" value={docs.length} />
        <KPIStat
          label="Expiring soon"
          value={docs.filter((d) => d.status === "expiring").length}
          tone="warning"
        />
        <KPIStat
          label="Expired"
          value={docs.filter((d) => d.status === "expired").length}
          tone="danger"
        />
        <KPIStat
          label="Renewals in progress"
          value={docs.filter((d) => d.status === "pending_renewal").length}
        />
      </div>

      <Card>
        <CardHeader title="Compliance register" subtitle="Legal vault" />
        <div className="overflow-x-auto">
          <table className="app-table w-full text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Document</th>
                <th className="px-4 py-2.5 sm:px-5">Entity / owner</th>
                <th className="px-4 py-2.5 sm:px-5">Expiry</th>
                <th className="px-4 py-2.5 sm:px-5">Status</th>
                <th className="px-4 py-2.5 text-right sm:px-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id} className="border-b border-[var(--border)]/70">
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-semibold">{d.title}</p>
                    <p className="text-xs text-slate-500">{d.type}</p>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <p>{d.entity}</p>
                    <p className="text-xs text-slate-500">Owner {d.owner}</p>
                  </td>
                  <td className="px-4 py-3 font-data text-slate-600 sm:px-5">
                    {d.expiry}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <StatusBadge
                      tone={
                        d.status === "valid"
                          ? "green"
                          : d.status === "expiring" ||
                              d.status === "pending_renewal"
                            ? "amber"
                            : "red"
                      }
                    >
                      {d.status.replace("_", " ")}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right sm:px-5">
                    {canEdit ? (
                      <div className="flex flex-wrap justify-end gap-1">
                        {d.status === "expiring" || d.status === "expired" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              startRenewal(d.id);
                              toast.success("Renewal started");
                            }}
                          >
                            Start renewal
                          </Button>
                        ) : null}
                        {d.status === "pending_renewal" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              completeRenewal(d.id);
                              toast.success("Renewal completed");
                            }}
                          >
                            Complete renewal
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            deleteComplianceDoc(d.id);
                            toast.message("Document deleted");
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EntityFormSheet
        open={docOpen}
        onOpenChange={setDocOpen}
        title="New document"
        description="Register a license, permit, insurance or contract."
        onSave={() => {
          if (!docForm.title.trim() || !docForm.entity.trim()) return;
          createComplianceDoc(docForm);
          toast.success("Document created");
          setDocOpen(false);
          setDocForm({
            title: "",
            entity: "",
            type: "license",
            expiry: new Date().toISOString().slice(0, 10),
            owner: "Legal",
          });
        }}
      >
        <div>
          <Label>Title</Label>
          <Input
            value={docForm.title}
            onChange={(e) =>
              setDocForm((f) => ({ ...f, title: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Entity</Label>
          <Input
            value={docForm.entity}
            onChange={(e) =>
              setDocForm((f) => ({ ...f, entity: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select
            value={docForm.type}
            onChange={(e) =>
              setDocForm((f) => ({
                ...f,
                type: e.target.value as ComplianceDoc["type"],
              }))
            }
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Expiry</Label>
          <Input
            type="date"
            value={docForm.expiry}
            onChange={(e) =>
              setDocForm((f) => ({ ...f, expiry: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Owner</Label>
          <Input
            value={docForm.owner}
            onChange={(e) =>
              setDocForm((f) => ({ ...f, owner: e.target.value }))
            }
          />
        </div>
      </EntityFormSheet>
    </div>
  );
}
