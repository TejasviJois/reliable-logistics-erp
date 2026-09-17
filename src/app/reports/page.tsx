import { ModuleShell } from "@/components/module-shell";

export default function ReportsPage() {
  return (
    <ModuleShell
      eyebrow="Governance"
      title="Reports & MIS"
      description="Operational, financial, branch, customer and profitability analytics."
      bullets={[
        "Executive dashboard KPIs",
        "Lane / branch / vendor scorecards",
        "Export-ready MIS packs",
      ]}
    />
  );
}
