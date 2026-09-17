"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { formatINR } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  spent: number;
  leads: number;
  qualified: number;
  status: "planned" | "live" | "completed";
  roiNote: string;
}

const SEED: Campaign[] = [
  {
    id: "camp-1",
    name: "South Hub PTL Push Q3",
    channel: "LinkedIn + Trade shows",
    budget: 450000,
    spent: 312000,
    leads: 86,
    qualified: 24,
    status: "live",
    roiNote: "Handoff to Sales — 4 open opportunities",
  },
  {
    id: "camp-2",
    name: "Pharma Cold-chain Awareness",
    channel: "Email + Webinar",
    budget: 180000,
    spent: 180000,
    leads: 41,
    qualified: 12,
    status: "completed",
    roiNote: "2 converted customers · Orbit Pharma pipeline",
  },
  {
    id: "camp-3",
    name: "Diwali Surface Capacity",
    channel: "WhatsApp + SMS",
    budget: 120000,
    spent: 0,
    leads: 0,
    qualified: 0,
    status: "planned",
    roiNote: "Launch week of 29 Sep",
  },
];

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState(SEED);

  const launch = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id && c.status === "planned"
          ? { ...c, status: "live" as const }
          : c
      )
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Marketing"
        description="Campaigns → lead generation → qualification → sales handoff → ROI (per user-flow PDF)."
      />
      <RoleWorkQueue />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <KPIStat label="Campaigns" value={campaigns.length} />
        <KPIStat
          label="Live"
          value={campaigns.filter((c) => c.status === "live").length}
        />
        <KPIStat
          label="Leads captured"
          value={campaigns.reduce((a, c) => a + c.leads, 0)}
        />
        <KPIStat
          label="Qualified → Sales"
          value={campaigns.reduce((a, c) => a + c.qualified, 0)}
          tone="success"
        />
      </div>
      <Card>
        <CardHeader title="Campaign board" subtitle="Marketing plan → ROI" />
        <div className="overflow-x-auto">
          <table className="app-table w-full text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Campaign</th>
                <th className="px-4 py-2.5 sm:px-5">Budget / spent</th>
                <th className="px-4 py-2.5 sm:px-5">Pipeline</th>
                <th className="px-4 py-2.5 sm:px-5">Status</th>
                <th className="px-4 py-2.5 text-right sm:px-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)]/70">
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-semibold">{c.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{c.channel}</p>
                  </td>
                  <td className="px-4 py-3 font-data text-slate-600 sm:px-5">
                    {formatINR(c.budget)}
                    <span className="text-slate-400"> · </span>
                    {formatINR(c.spent)}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <p className="font-data text-sm">
                      {c.leads} leads · {c.qualified} qualified
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{c.roiNote}</p>
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <StatusBadge
                      tone={
                        c.status === "live"
                          ? "green"
                          : c.status === "completed"
                            ? "blue"
                            : "slate"
                      }
                    >
                      {c.status}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right sm:px-5">
                    {c.status === "planned" ? (
                      <Button size="sm" onClick={() => launch(c.id)}>
                        Launch campaign
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
