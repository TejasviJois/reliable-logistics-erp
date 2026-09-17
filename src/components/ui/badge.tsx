import { cn } from "@/lib/utils";

const tones = {
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  blue: "bg-blue-50 text-blue-800 border-blue-200",
  green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  red: "bg-red-50 text-red-800 border-red-200",
  violet: "bg-violet-50 text-violet-800 border-violet-200",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
  teal: "bg-brand-secondary-soft text-brand-secondary border-brand-secondary/20",
  brand: "bg-accent-soft text-accent border-accent/20",
};

export function StatusBadge({
  children,
  tone = "slate",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
