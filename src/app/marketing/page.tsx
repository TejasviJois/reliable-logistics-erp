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

export default function MarketingPage() {
  const account = useSessionStore((s) => s.account);
  const canEdit = canMutate(account?.role, "marketing");
  const campaigns = useDeptStore((s) => s.campaigns);
  const leads = useDeptStore((s) => s.leads);
  const createCampaign = useDeptStore((s) => s.createCampaign);
  const deleteCampaign = useDeptStore((s) => s.deleteCampaign);
  const launchCampaign = useDeptStore((s) => s.launchCampaign);
  const completeCampaign = useDeptStore((s) => s.completeCampaign);
  const createLead = useDeptStore((s) => s.createLead);
  const handoffLead = useDeptStore((s) => s.handoffLead);

  const [campOpen, setCampOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [campForm, setCampForm] = useState({
    name: "",
    channel: "LinkedIn",
    budget: 100000,
    roiNote: "",
  });
  const [leadForm, setLeadForm] = useState({
    company: "",
    contact: "",
    city: "Bengaluru",
    value: 100000,
    mode: "PTL",
  });

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Marketing"
        description="Campaigns → lead generation → qualification → sales handoff → ROI."
        actions={
          canEdit ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setLeadOpen(true)}>
                + Lead
              </Button>
              <Button size="sm" onClick={() => setCampOpen(true)}>
                + Campaign
              </Button>
            </>
          ) : undefined
        }
      />
      <RoleWorkQueue />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <KPIStat label="Campaigns" value={campaigns.length} />
        <KPIStat
          label="Live"
          value={campaigns.filter((c) => c.status === "live").length}
        />
        <KPIStat
          label="Leads generated"
          value={campaigns.reduce((a, c) => a + c.leads, 0)}
        />
        <KPIStat
          label="Budget in flight"
          value={formatINR(
            campaigns
              .filter((c) => c.status !== "completed")
              .reduce((a, c) => a + c.budget, 0)
          )}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Campaigns" subtitle="Pipeline" />
          <ul className="divide-y divide-border">
            {campaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5"
              >
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.channel} · Budget {formatINR(c.budget)} · Spent{" "}
                    {formatINR(c.spent)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{c.roiNote}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge
                    tone={
                      c.status === "live"
                        ? "green"
                        : c.status === "planned"
                          ? "amber"
                          : "slate"
                    }
                  >
                    {c.status}
                  </StatusBadge>
                  {canEdit ? (
                    <div className="flex flex-wrap justify-end gap-1">
                      {c.status === "planned" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            launchCampaign(c.id);
                            toast.success("Campaign live");
                          }}
                        >
                          Launch
                        </Button>
                      ) : null}
                      {c.status === "live" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            completeCampaign(c.id);
                            toast.success("Campaign completed");
                          }}
                        >
                          Complete
                        </Button>
                      ) : null}
                      {c.status === "planned" ? (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            deleteCampaign(c.id);
                            toast.message("Campaign deleted");
                          }}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Lead handoff" subtitle="To Sales" />
          <ul className="divide-y divide-border">
            {leads.slice(0, 6).map((l) => (
              <li
                key={l.id}
                className="flex items-start justify-between gap-2 px-4 py-3 sm:px-5"
              >
                <div>
                  <p className="text-sm font-medium">{l.company}</p>
                  <p className="text-xs text-slate-500">
                    {l.city} · {l.stage} · {formatINR(l.value)}
                  </p>
                </div>
                {canEdit ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      handoffLead(l.id);
                      toast.success("Handed to Sales");
                    }}
                  >
                    Handoff
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <EntityFormSheet
        open={campOpen}
        onOpenChange={setCampOpen}
        title="New campaign"
        description="Create a marketing campaign for hub demand generation."
        onSave={() => {
          if (!campForm.name.trim()) return;
          createCampaign(campForm);
          toast.success("Campaign created");
          setCampOpen(false);
          setCampForm({ name: "", channel: "LinkedIn", budget: 100000, roiNote: "" });
        }}
      >
        <div>
          <Label>Name</Label>
          <Input
            value={campForm.name}
            onChange={(e) => setCampForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <Label>Channel</Label>
          <Input
            value={campForm.channel}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, channel: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Budget (₹)</Label>
          <Input
            type="number"
            value={campForm.budget}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, budget: Number(e.target.value) }))
            }
          />
        </div>
        <div>
          <Label>ROI note</Label>
          <Input
            value={campForm.roiNote}
            onChange={(e) =>
              setCampForm((f) => ({ ...f, roiNote: e.target.value }))
            }
          />
        </div>
      </EntityFormSheet>

      <EntityFormSheet
        open={leadOpen}
        onOpenChange={setLeadOpen}
        title="New lead"
        description="Capture a campaign-sourced lead for Sales handoff."
        onSave={() => {
          if (!leadForm.company.trim()) return;
          createLead({ ...leadForm, owner: "Marketing", nextAction: "Qualify" });
          toast.success("Lead created");
          setLeadOpen(false);
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
    </div>
  );
}
