"use client";

import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { masterData } from "@/store/demo-store";

export default function VendorsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Resources"
        title="Vendors"
        description="Transport and procurement vendor master."
      />
      <Card>
        <CardHeader title="Vendor directory" subtitle="KYC & performance" />
        <div className="overflow-x-auto">
          <table className="app-table w-full text-left text-sm">
            <thead className="border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-2.5 sm:px-5">Vendor</th>
                <th className="px-4 py-2.5 sm:px-5">GSTIN / phone</th>
                <th className="px-4 py-2.5 sm:px-5">Rating</th>
                <th className="px-4 py-2.5 sm:px-5">Type</th>
              </tr>
            </thead>
            <tbody>
              {masterData.vendors.map((v) => (
                <tr key={v.id} className="border-b border-[var(--border)]/70">
                  <td className="px-4 py-3 font-medium sm:px-5">{v.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 sm:px-5">
                    <span className="font-data">{v.gstin}</span>
                    <span className="text-slate-300"> · </span>
                    {v.phone}
                  </td>
                  <td className="px-4 py-3 font-data font-semibold sm:px-5">
                    {v.rating}
                  </td>
                  <td className="px-4 py-3 sm:px-5">
                    <StatusBadge tone="teal">{v.type}</StatusBadge>
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
