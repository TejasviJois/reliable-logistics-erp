import { PageHeader } from "@/components/ui/page";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

export function ModuleShell({
  eyebrow,
  title,
  description,
  bullets,
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div>
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={<StatusBadge tone="slate">Architecture preview</StatusBadge>}
      />
      <Card className="p-6 sm:p-7">
        <p className="text-sm leading-relaxed text-slate-600">
          This module is represented in the information architecture for the full
          ERP. The interactive demo concentrates polish on the core logistics →
          POD → billing journey.
        </p>
        <ul className="mt-5 space-y-2.5">
          {bullets.map((b) => (
            <li
              key={b}
              className="flex gap-2.5 text-sm leading-relaxed text-slate-600"
            >
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              {b}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
