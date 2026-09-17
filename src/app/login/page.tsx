"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Plane, TrainFront, Truck, Warehouse } from "lucide-react";
import {
  accountsForScope,
  DEMO_SCOPES,
  type DemoAccount,
  type DemoScope,
} from "@/data/demo-users";
import { useSessionStore, scopeToBranchId } from "@/store/session-store";
import { useDemoStore } from "@/store/demo-store";
import { isUserEnabled, useAccessStore } from "@/store/access-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MODES = [
  { label: "Air", icon: Plane },
  { label: "Train", icon: TrainFront },
  { label: "Surface", icon: Truck },
  { label: "Warehouse", icon: Warehouse },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const signIn = useSessionStore((s) => s.signIn);
  const setBranchId = useDemoStore((s) => s.setBranchId);
  const [scope, setScope] = useState<DemoScope>("admin");
  useAccessStore((s) => s.userOverrides);

  const accounts = useMemo(() => accountsForScope(scope), [scope]);
  const activeScope = DEMO_SCOPES.find((s) => s.id === scope);

  const enter = (account: DemoAccount) => {
    if (!isUserEnabled(account.id)) return;
    signIn(account);
    setBranchId(scopeToBranchId(account.branchId));
    toast.success(`Signed in as ${account.name}`, {
      description: `${account.roleLabel} · ${account.branchLabel}`,
    });
    router.replace(account.homeHref);
  };

  return (
    <div className="login-root flex min-h-screen">
      {/* Brand plane */}
      <section className="login-brand relative hidden w-[46%] overflow-hidden text-white lg:flex lg:flex-col">
        <div className="login-brand-grid absolute inset-0" aria-hidden />
        <div className="login-brand-routes absolute inset-0" aria-hidden />

        <div className="relative z-10 flex h-full flex-col justify-between px-12 py-14 xl:px-16">
          <div className="login-fade-up">
            <div className="inline-flex rounded-md bg-black/80 p-3 ring-1 ring-white/10 backdrop-blur-sm">
              <Image
                src="/reliable-logo.png"
                alt="Reliable Logistics Solutions"
                width={300}
                height={90}
                className="h-auto w-[260px] object-contain"
                priority
              />
            </div>
          </div>

          <div className="login-fade-up login-delay-1 max-w-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
              Operations control
            </p>
            <h1 className="mt-4 text-[2.65rem] font-semibold leading-[1.08] tracking-[-0.03em]">
              Move freight.
              <span className="mt-1 block text-white/90">
                Control every hub.
              </span>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/60">
              Demo access across Bengaluru, Chennai and Hyderabad — pick a
              branch, then step into any role.
            </p>
          </div>

          <div className="login-fade-up login-delay-2">
            <div className="grid grid-cols-4 gap-3 border-t border-white/10 pt-8">
              {MODES.map(({ label, icon: Icon }) => (
                <div key={label} className="group">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-white/5 ring-1 ring-white/10 transition-colors group-hover:bg-[var(--brand-red)]/20 group-hover:ring-[var(--brand-red)]/40">
                    <Icon className="h-4 w-4 text-white/80" strokeWidth={1.75} />
                  </div>
                  <p className="text-[11px] font-medium tracking-wide text-white/50">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sign-in plane */}
      <section className="login-panel relative flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-10 lg:px-14 lg:py-12">
        <div className="login-panel-texture absolute inset-0" aria-hidden />

        <div className="relative z-10 mx-auto flex w-full max-w-[34rem] flex-col">
          <div className="mb-8 lg:hidden">
            <div className="inline-flex rounded-md bg-black p-2.5">
              <Image
                src="/reliable-logo.png"
                alt="Reliable"
                width={200}
                height={60}
                className="h-auto w-[168px] object-contain"
                priority
              />
            </div>
          </div>

          <header className="login-fade-up">
            <h2 className="text-[2rem] font-semibold tracking-[-0.03em] text-foreground">
              Sign in
            </h2>
            <p className="mt-2 text-[15px] text-slate-500">
              Choose your branch, then select your account.
            </p>
          </header>

          <div
            className="login-fade-up login-delay-1 mt-8 grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100/90 p-1.5 sm:grid-cols-4"
            role="tablist"
            aria-label="Demo scope"
          >
            {DEMO_SCOPES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={scope === s.id}
                onClick={() => setScope(s.id)}
                className={cn(
                  "rounded-lg px-3 py-3 text-center text-[13px] font-semibold leading-tight pressable",
                  scope === s.id
                    ? "bg-white text-foreground shadow-[var(--shadow-sm)]"
                    : "text-slate-500"
                )}
              >
                {s.label.replace(" Hub", "")}
              </button>
            ))}
          </div>

          <p className="login-fade-up login-delay-1 mt-3.5 text-[13px] text-slate-400">
            {activeScope?.description}
            {scope !== "admin"
              ? ` · ${accounts.length} role accounts`
              : " · full platform access"}
          </p>

          <ul
            key={scope}
            className="login-account-list mt-6 max-h-[min(56vh,580px)] space-y-2.5 overflow-y-auto pr-1"
          >
            {accounts.map((account, i) => {
              const enabled = isUserEnabled(account.id);
              return (
              <li
                key={account.id}
                className="login-account-item"
                style={{ animationDelay: `${80 + i * 35}ms` }}
              >
                <button
                  type="button"
                  disabled={!enabled}
                  onClick={() => enter(account)}
                  className={cn(
                    "login-account-btn group flex w-full items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left",
                    enabled
                      ? "border-[var(--border)] bg-white/95 shadow-[var(--shadow-xs)]"
                      : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-55"
                  )}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[15px] font-semibold text-white transition-transform duration-200 group-hover:scale-105"
                    style={{ backgroundColor: account.color }}
                  >
                    {account.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-foreground">
                      {account.name}
                    </p>
                    <p className="truncate font-data text-xs text-slate-500">
                      {enabled ? account.email : "Access disabled by admin"}
                    </p>
                  </div>
                  <span
                    className="hidden shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white sm:inline-flex"
                    style={{ backgroundColor: enabled ? account.color : "#94a3b8" }}
                  >
                    {enabled ? account.roleLabel : "Disabled"}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[var(--brand-red)]" />
                </button>
              </li>
              );
            })}
          </ul>

          <p className="mt-8 text-center text-xs tracking-wide text-slate-400">
            Demo mode — no password required
          </p>
        </div>
      </section>
    </div>
  );
}
