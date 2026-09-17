"use client";

import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatINR, formatDate } from "@/lib/utils";
import { masterData, useDemoStore } from "@/store/demo-store";

export default function ContractsPage() {
  const customers = useDemoStore((s) => s.customers);
  return (
    <div>
      <PageHeader
        eyebrow="Commercial"
        title="Contracts & Tariffs"
        description="Zone rates feeding booking and billing."
      />
      <Card>
        <CardHeader title="Active contracts" subtitle="Approved commercials" />
        <div className="overflow-x-auto">
          <table className="app-table w-full text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Customer</th>
                <th className="px-4 py-2.5 sm:px-5">Mode / zone</th>
                <th className="px-4 py-2.5 sm:px-5">Rate</th>
                <th className="px-4 py-2.5 sm:px-5">Validity</th>
                <th className="px-4 py-2.5 sm:px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {masterData.contracts.map((c) => {
                const customer = customers.find((x) => x.id === c.customerId);
                return (
                  <tr key={c.id} className="border-b border-[var(--border)]/70">
                    <td className="px-4 py-3 font-medium sm:px-5">
                      {customer?.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 sm:px-5">
                      {c.mode} · {c.zone}
                    </td>
                    <td className="px-4 py-3 font-data sm:px-5">
                      ₹{c.ratePerKg}/kg · min {formatINR(c.minFreight)}
                    </td>
                    <td className="px-4 py-3 font-data text-xs text-slate-500 sm:px-5">
                      {formatDate(c.effectiveFrom)} → {formatDate(c.effectiveTo)}
                    </td>
                    <td className="px-4 py-3 sm:px-5">
                      <StatusBadge tone="green">{c.status}</StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
