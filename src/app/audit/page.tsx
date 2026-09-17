"use client";

import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader } from "@/components/ui/card";
import { ActivityFeed } from "@/components/workflow";
import { formatDateTime } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";

export default function AuditPage() {
  const audit = useDemoStore((s) => s.audit);
  return (
    <div>
      <PageHeader
        eyebrow="Governance"
        title="Audit log"
        description="Immutable activity history across modules."
      />
      <Card>
        <CardHeader title="Recent events" subtitle="User · entity · old → new" />
        <div className="px-1 pb-2 sm:px-2">
          <ActivityFeed
            events={audit.map((a) => ({
              ...a,
              at: formatDateTime(a.at),
            }))}
          />
        </div>
      </Card>
    </div>
  );
}
