"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page";
import { RoleWorkQueue } from "@/components/role-work-queue";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, KPIStat } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import { toast } from "sonner";

export default function CustomersPage() {
  const customers = useDemoStore((s) => s.customers);
  const approveCustomer = useDemoStore((s) => s.approveCustomer);

  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Customers"
        description="Customer master with contracts, shipments and receivables linked. Pending profiles cannot book until Admin approves."
      />
      <RoleWorkQueue />
      <div className="mb-3.5 grid gap-3 sm:grid-cols-4">
        <KPIStat label="Profiles" value={customers.length} />
        <KPIStat
          label="Active"
          value={customers.filter((c) => c.status === "active").length}
        />
        <KPIStat
          label="Pending approval"
          value={customers.filter((c) => c.status === "pending").length}
          tone="warning"
        />
        <KPIStat
          label="Outstanding book"
          value={formatINR(customers.reduce((a, c) => a + c.outstanding, 0))}
        />
      </div>
      <Card>
        <CardHeader title="Customer master" subtitle="Profiles" />
        <ul className="divide-y divide-border">
          {customers.map((c) => (
            <li key={c.id}>
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5">
                <Link
                  href={`/customers/${c.id}`}
                  className="min-w-0 flex-1 transition-colors hover:opacity-90"
                >
                  <p className="font-data text-xs text-muted-foreground">
                    {c.code}
                  </p>
                  <p className="font-medium text-foreground">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.city} · {c.gstin} · {c.contactPerson}
                  </p>
                </Link>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge
                    tone={
                      c.status === "active"
                        ? "green"
                        : c.status === "pending"
                          ? "amber"
                          : "slate"
                    }
                  >
                    {c.status}
                  </StatusBadge>
                  <p className="font-data text-xs text-slate-500">
                    {formatINR(c.outstanding)} due
                  </p>
                  {c.status === "pending" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        approveCustomer(c.id);
                        toast.success(`${c.name} approved for booking`);
                      }}
                    >
                      Approve
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
