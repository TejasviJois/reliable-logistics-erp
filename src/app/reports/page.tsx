import { ModuleShell } from "@/components/module-shell";

export default function ReportsPage() {
  return (
    <div data-tour="reports-kpis">
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
    </div>
  );
}
