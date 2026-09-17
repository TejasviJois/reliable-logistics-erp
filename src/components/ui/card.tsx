import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--border)] bg-card shadow-[var(--shadow-sm)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5",
        className
      )}
    >
      <div>
        {subtitle ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            {subtitle}
          </p>
        ) : null}
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
      </div>
      {action}
    </div>
  );
}

export function KPIStat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "danger" | "success" | "warning";
}) {
  const valueColor =
    tone === "danger"
      ? "text-danger"
      : tone === "success"
        ? "text-success"
        : tone === "warning"
          ? "text-warning"
          : "text-foreground";
  return (
    <Card className="px-4 py-3.5 transition-[transform,box-shadow] duration-[180ms] [transition-timing-function:var(--ease-out)] hover-lift">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-1 font-data text-2xl font-semibold tracking-tight",
          valueColor
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}
