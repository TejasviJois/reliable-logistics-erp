import { ModuleShell } from "@/components/module-shell";

export default function CustomerPortalPage() {
  return (
    <ModuleShell
      eyebrow="Portals"
      title="Customer Portal"
      description="Self-service booking, tracking, POD, invoices and tickets."
      bullets={[
        "Track dockets and download POD",
        "View invoices and outstanding",
        "Raise and track support tickets",
      ]}
    />
  );
}
