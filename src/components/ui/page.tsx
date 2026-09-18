import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-slate-50/60 px-6 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
      {children}
    </p>
  );
}

export function FieldGrid({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 md:grid-cols-2",
        cols === 3 && "grid-cols-1 md:grid-cols-3",
        cols === 4 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {children}
    </div>
  );
}
