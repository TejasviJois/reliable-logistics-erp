"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tourFor } from "@/data/role-tours";
import { ROLE_OPTIONS } from "@/data/access-catalog";
import { useSessionStore } from "@/store/session-store";
import { useTutorialStore } from "@/store/tutorial-store";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

function roleLabel(role: string) {
  return ROLE_OPTIONS.find((r) => r.role === role)?.label ?? role;
}

export function TutorialGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const account = useSessionStore((s) => s.account);
  const modeOn = useTutorialStore((s) => s.modeOn);
  const active = useTutorialStore((s) => s.active);
  const role = useTutorialStore((s) => s.role);
  const stepIndex = useTutorialStore((s) => s.stepIndex);
  const showHandoff = useTutorialStore((s) => s.showHandoff);
  const next = useTutorialStore((s) => s.next);
  const prev = useTutorialStore((s) => s.prev);
  const skip = useTutorialStore((s) => s.skip);
  const finish = useTutorialStore((s) => s.finish);
  const closeHandoff = useTutorialStore((s) => s.closeHandoff);
  const startTour = useTutorialStore((s) => s.startTour);
  const signOut = useSessionStore((s) => s.signOut);

  const tour = role ? tourFor(role) : undefined;
  const step = tour?.steps[stepIndex];
  const isLast = tour ? stepIndex >= tour.steps.length - 1 : false;

  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);

  // Navigate to step route
  useEffect(() => {
    if (!active || !step) return;
    if (pathname !== step.route && !pathname.startsWith(step.route + "/")) {
      router.push(step.route);
    }
  }, [active, step, pathname, router]);

  // Measure target
  useLayoutEffect(() => {
    if (!active || !step) {
      setRect(null);
      return;
    }

    let tries = 0;
    let timer: number | undefined;

    const measure = () => {
      if (step.target.includes("wh-scan-input") || step.target.includes("wh-scan-btn")) {
        document.querySelector<HTMLElement>('[data-tour="wh-tab-scan"]')?.click();
      }
      if (step.target.includes("thc-create")) {
        document
          .querySelector<HTMLElement>('[data-tour="thc-create-tab"]')
          ?.click();
      }
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) {
        setMissing(true);
        setRect(null);
        if (tries < 20) {
          tries += 1;
          timer = window.setTimeout(measure, 120);
        }
        return;
      }
      setMissing(false);
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const isTab =
        el.getAttribute("role") === "tab" ||
        !!el.getAttribute("data-tour")?.includes("-tab") ||
        el.getAttribute("data-tour") === "ar-receipt" ||
        el.getAttribute("data-tour") === "ar-aging" ||
        el.getAttribute("data-tour") === "thc-create-tab";
      if (isTab) el.click();
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top,
        left: r.left,
        width: r.width,
        height: r.height,
      });
    };

    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      if (timer) window.clearTimeout(timer);
    };
  }, [active, step, pathname, stepIndex]);

  const onNext = () => {
    if (!tour) return;
    if (isLast) finish();
    else next();
  };

  const handoff = tour?.nextRole;

  const pad = 8;
  const tipTop = rect
    ? Math.min(
        window.innerHeight - 220,
        rect.top + rect.height + pad + 12
      )
    : 80;
  const tipLeft = rect
    ? Math.min(window.innerWidth - 360, Math.max(16, rect.left))
    : 16;

  return (
    <>
      {modeOn && !active && !showHandoff && account ? (
        <div className="fixed bottom-5 right-5 z-[60] flex max-w-xs flex-col gap-2 rounded-2xl border border-primary/25 bg-white p-3 shadow-lg">
          <p className="text-xs font-semibold text-foreground">
            Tutorial mode on
          </p>
          <p className="text-[11px] text-slate-500">
            Walk {account.roleLabel} controls with Next → Finish, then see who
            comes after.
          </p>
          <Button
            size="sm"
            onClick={() => startTour(account.role)}
            data-tour="tutorial-start"
          >
            Start {account.roleLabel} tour
          </Button>
        </div>
      ) : null}

      {active && step && tour ? (
        <div className="pointer-events-none fixed inset-0 z-[70]">
          {rect ? (
            <div
              className="absolute rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-transparent transition-all duration-200"
              style={{
                top: rect.top - pad,
                left: rect.left - pad,
                width: rect.width + pad * 2,
                height: rect.height + pad * 2,
                boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.62)",
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900/60" />
          )}

          <div
            className={cn(
              "pointer-events-auto absolute w-[min(100%-2rem,22rem)] rounded-2xl border border-border bg-white p-4 shadow-xl"
            )}
            style={{ top: tipTop, left: tipLeft }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {tour.title} · {stepIndex + 1} / {tour.steps.length}
            </p>
            <h3 className="mt-1 text-base font-semibold tracking-tight">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {step.body}
            </p>
            {missing ? (
              <p className="mt-2 text-xs text-amber-700">
                Looking for this control on the page… If you can’t mutate as
                this role, Switch user to match the tour.
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={skip}
              >
                Skip
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={stepIndex === 0}
                onClick={prev}
              >
                Back
              </Button>
              <Button type="button" size="sm" className="ml-auto" onClick={onNext}>
                {isLast ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog
        open={showHandoff}
        onOpenChange={(open) => {
          if (!open) closeHandoff();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {handoff ? "Next role in the flow" : "Tour complete"}
            </DialogTitle>
            <DialogDescription>
              {handoff
                ? "How this role works hand-in-hand with the next person."
                : "This path ends here (Collections closes the money loop)."}
            </DialogDescription>
          </DialogHeader>

          {handoff ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-border bg-slate-50 px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  You finished
                </p>
                <p className="font-semibold">{tour?.title}</p>
              </div>
              <div className="flex items-center justify-center text-xs font-semibold text-primary">
                passes · {handoff.artifact}
              </div>
              <div className="rounded-xl border border-primary/25 bg-accent-soft/50 px-3 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                  Next
                </p>
                <p className="font-semibold">{handoff.label}</p>
                <p className="mt-2 text-slate-600">{handoff.howTogether}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  onClick={() => {
                    closeHandoff();
                    signOut();
                    router.push("/login");
                  }}
                >
                  Switch user (login)
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    closeHandoff();
                    startTour(handoff.role);
                  }}
                >
                  Preview next tour
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                Preview shows the next tour UI; for real nav permissions, Switch
                user to a {roleLabel(handoff.role)} account first.
              </p>
            </div>
          ) : (
            <Button onClick={closeHandoff}>Done</Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
