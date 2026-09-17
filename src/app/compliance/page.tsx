"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { complianceDocs, type ComplianceDoc } from "@/data/role-work";

export default function CompliancePage() {
  const [docs, setDocs] = useState(complianceDocs);

  const startRenewal = (id: string) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: "pending_renewal" as ComplianceDoc["status"] }
          : d
      )
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Governance"
        title="Compliance & Documents"
        description="Licenses, permits, insurance and contract vault with expiry control."
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
                    {d.status === "expiring" || d.status === "expired" ? (
                      <Button size="sm" onClick={() => startRenewal(d.id)}>
                        Start renewal
                      </Button>
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
    </div>
  );
}
