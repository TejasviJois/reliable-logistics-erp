import { cn } from "@/lib/utils";
import { WORKFLOW_STEPS, workflowIndex } from "@/lib/status";
import type { DocketStatus } from "@/types";

export function WorkflowStepper({ status }: { status: DocketStatus }) {
  const active = workflowIndex(status);
  return (
    <div className="flex flex-wrap gap-1.5">
      {WORKFLOW_STEPS.map((step, i) => (
        <div
          key={step}
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]",
            i < active && "bg-accent-soft text-primary ring-1 ring-inset ring-primary/20",
            i === active && "bg-primary text-primary-foreground shadow-[0_1px_0_rgba(0,0,0,0.06)]",
            i > active && "bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200/80"
          )}
        >
          {step}
        </div>
      ))}
    </div>
  );
}

export function Timeline({
  items,
}: {
  items: { title: string; meta?: string; at?: string; tone?: "done" | "current" | "todo" }[];
}) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "mt-1 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                item.tone === "done" && "bg-primary",
                item.tone === "current" && "bg-[var(--brand-blue)]",
                (!item.tone || item.tone === "todo") && "bg-slate-300"
              )}
            />
            {i < items.length - 1 ? (
              <span className="mt-1 w-px flex-1 bg-border" />
            ) : null}
          </div>
          <div className="pb-2">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            {item.meta ? (
              <p className="text-xs text-slate-500">{item.meta}</p>
            ) : null}
            {item.at ? (
              <p className="mt-0.5 font-data text-[11px] text-muted-foreground">
                {item.at}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ActivityFeed({
  events,
}: {
  events: {
    id: string;
    at: string;
    user: string;
    action: string;
    entityId: string;
    previous?: string;
    next?: string;
  }[];
}) {
  return (
    <div className="divide-y divide-border">
      {events.map((e) => (
        <div key={e.id} className="px-4 py-2.5 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">{e.action}</p>
              <p className="text-xs text-slate-500">
                {e.user} · {e.entityId}
              </p>
              {e.previous || e.next ? (
                <p className="mt-1 font-data text-[11px] text-slate-500">
                  {e.previous ?? "—"} → {e.next ?? "—"}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 font-data text-[11px] text-muted-foreground">
              {e.at}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
