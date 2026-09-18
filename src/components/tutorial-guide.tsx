"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { tourChapters, tourFor, type TourStep } from "@/data/role-tours";
import { ROLE_OPTIONS } from "@/data/access-catalog";
import { useSessionStore } from "@/store/session-store";
import { useTutorialStore } from "@/store/tutorial-store";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

function roleLabel(role: string) {
  return ROLE_OPTIONS.find((r) => r.role === role)?.label ?? role;
}

/** Exact match, or child path — "/" only matches home. */
function routeReady(pathname: string, route: string) {
  if (!route || route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
}

function tipPosition(
  rect: Rect | null,
  placement: TourStep["placement"] = "bottom"
) {
  const tipW = 352;
  const tipH = 220;
  if (!rect) return { top: 88, left: 16 };
  const pad = 12;
  let top = rect.top + rect.height + pad;
  let left = Math.min(
    window.innerWidth - tipW - 16,
    Math.max(16, rect.left)
  );
  if (placement === "top") {
    top = Math.max(16, rect.top - tipH - pad);
  } else if (placement === "left") {
    top = Math.max(16, rect.top);
    left = Math.max(16, rect.left - tipW - pad);
  } else if (placement === "right") {
    top = Math.max(16, rect.top);
    left = Math.min(
      window.innerWidth - tipW - 16,
      rect.left + rect.width + pad
    );
  }
  if (top + tipH > window.innerHeight - 16) {
    top = Math.max(16, rect.top - tipH - pad);
  }
  return { top, left };
}

/** Accept full CSS selectors or bare tour ids. */
function toSelector(target: string) {
  const t = target.trim();
  if (!t) return null;
  if (
    t.startsWith("[") ||
    t.startsWith(".") ||
    t.startsWith("#") ||
    t.startsWith("data-tour")
  ) {
    return t.startsWith("data-tour") ? `[${t}]` : t;
  }
  return `[data-tour="${t}"]`;
}

function queryAll(selector: string): HTMLElement[] {
  try {
    return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
  } catch {
    return [];
  }
}

function scoreEl(el: HTMLElement): number {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return -1;
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return 0;
  // Prefer on-screen elements
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const onScreen =
    r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw ? 10 : 1;
  return onScreen + Math.min(r.width * r.height, 50000) / 50000;
}

function findBest(selector: string | null): HTMLElement | null {
  if (!selector) return null;
  const ranked = queryAll(selector)
    .map((el) => ({ el, score: scoreEl(el) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.el ?? null;
}

function measure(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    width: Math.max(r.width, 28),
    height: Math.max(r.height, 28),
  };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** Tour pacing — deliberate, not jumpy */
const PACE = {
  routePoll: 140,
  pageCommit: 450,
  prepareGap: 280,
  afterClick: 350,
  findPoll: 120,
  afterTab: 320,
  afterScroll: 520,
  settle: 380,
  spotlightMs: 520,
} as const;

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
  const goToStep = useTutorialStore((s) => s.goToStep);
  const signOut = useSessionStore((s) => s.signOut);

  const tour = role ? tourFor(role) : undefined;
  const step = tour?.steps[stepIndex];
  const isLast = tour ? stepIndex >= tour.steps.length - 1 : false;
  const chapters = useMemo(
    () => (tour ? tourChapters(tour) : []),
    [tour]
  );

  const [rect, setRect] = useState<Rect | null>(null);
  const [status, setStatus] = useState("");
  const [settling, setSettling] = useState(false);
  const [tipKey, setTipKey] = useState(0);
  const genRef = useRef(0);

  // Keep URL on the step route (separate from spotlight so it never cancels finding)
  useEffect(() => {
    if (!active || !step) return;
    if (!routeReady(pathname, step.route)) {
      router.push(step.route);
    }
  }, [active, step?.route, pathname, router, step]);

  // Spotlight: only restarts when the step itself changes — NOT on every pathname tick
  useEffect(() => {
    const current = role ? tourFor(role)?.steps[stepIndex] : undefined;
    if (!active || !current) {
      setRect(null);
      setStatus("");
      setSettling(false);
      return;
    }

    const gen = ++genRef.current;
    const alive = () => genRef.current === gen;

    // Keep prior spotlight while we move — avoids full-screen flash / “skip” feel
    setSettling(true);
    setStatus("Opening this screen…");
    setTipKey((k) => k + 1);

    const run = async () => {
      // 1) Wait for the URL
      for (let i = 0; i < 60 && alive(); i++) {
        const here = window.location.pathname;
        if (routeReady(here, current.route)) break;
        router.push(current.route);
        setStatus("Opening this screen…");
        await sleep(PACE.routePoll);
      }
      if (!alive()) return;

      if (!routeReady(window.location.pathname, current.route)) {
        setSettling(false);
        setStatus(
          `Could not open ${current.route}. Tap Next to skip, or switch to a user with access.`
        );
        return;
      }

      // 2) Let the page settle after navigation
      setStatus("Loading this screen…");
      await sleep(PACE.pageCommit);
      if (!alive()) return;

      // 3) Prepare (tabs) — paced so the UI can open
      if (current.prepare?.length) {
        setStatus("Opening the right panel…");
        for (const raw of current.prepare) {
          findBest(toSelector(raw))?.click();
          await sleep(PACE.prepareGap);
          if (!alive()) return;
        }
      }

      const action = current.action ?? "none";

      // 4) Open sheet/dialog when needed
      if (action === "click" || action === "clickThenWait") {
        setStatus("Opening this control…");
        const clickSel = toSelector(current.clickTarget ?? current.target);
        for (let i = 0; i < 40 && alive(); i++) {
          const clickEl = findBest(clickSel);
          if (clickEl) {
            clickEl.click();
            break;
          }
          await sleep(PACE.findPoll);
        }
        await sleep(PACE.afterClick);
        if (action === "clickThenWait" && current.waitFor) {
          const waitSel = toSelector(current.waitFor);
          for (let i = 0; i < 40 && alive(); i++) {
            if (findBest(waitSel)) break;
            await sleep(PACE.findPoll);
          }
          await sleep(PACE.afterClick);
        }
      }
      if (!alive()) return;

      // 5) Find spotlight target
      const spotlightSel = toSelector(
        action === "clickThenWait" && current.waitFor
          ? current.waitFor
          : current.target
      );

      setStatus("Finding this control…");
      let el: HTMLElement | null = null;
      for (let i = 0; i < 80 && alive(); i++) {
        el = findBest(spotlightSel);
        if (el && scoreEl(el) > 0) break;
        if (i > 0 && i % 8 === 0 && current.prepare?.length) {
          for (const raw of current.prepare) {
            findBest(toSelector(raw))?.click();
          }
        }
        await sleep(PACE.findPoll);
      }
      if (!alive()) return;

      if (el) {
        const tourId = el.getAttribute("data-tour") ?? "";
        if (
          el.getAttribute("role") === "tab" ||
          tourId.includes("-tab") ||
          [
            "ar-receipt",
            "ar-aging",
            "ar-outstanding",
            "ar-history",
            "ar-dashboard-tab",
          ].includes(tourId)
        ) {
          el.click();
          await sleep(PACE.afterTab);
          el = findBest(spotlightSel) ?? el;
        }
      }

      if (!el || scoreEl(el) <= 0) {
        el =
          findBest("main") ||
          (document.querySelector("main") as HTMLElement | null);
        setStatus(
          "This step’s control isn’t on screen yet. Showing the page — tap Next."
        );
      } else {
        setStatus("");
      }

      if (!el) {
        setSettling(false);
        setStatus("Page has no highlightable area. Tap Next to continue.");
        return;
      }

      try {
        el.scrollIntoView({
          block: "center",
          inline: "nearest",
          behavior: "smooth",
        });
      } catch {
        el.scrollIntoView();
      }
      await sleep(PACE.afterScroll);
      if (!alive()) return;

      // Morph spotlight to the new target (CSS transition handles the motion)
      setRect(measure(el));
      await sleep(PACE.settle);
      if (!alive()) return;
      setSettling(false);
    };

    void run();

    const onRefresh = () => {
      if (!alive()) return;
      const sel = toSelector(
        current.action === "clickThenWait" && current.waitFor
          ? current.waitFor
          : current.target
      );
      const el = findBest(sel) || findBest("main");
      if (!el || scoreEl(el) < 0) return;
      setRect(measure(el));
    };
    window.addEventListener("resize", onRefresh);
    window.addEventListener("scroll", onRefresh, true);
    return () => {
      if (genRef.current === gen) genRef.current += 1;
      window.removeEventListener("resize", onRefresh);
      window.removeEventListener("scroll", onRefresh, true);
    };
  }, [active, role, stepIndex, router]);

  const onNext = () => {
    if (!tour || settling) return;
    if (isLast) finish();
    else next();
  };

  const onPrev = () => {
    if (settling || stepIndex === 0) return;
    prev();
  };

  const handoff = tour?.nextRole;
  const pad = 10;
  const tip = tipPosition(rect, step?.placement);
  const currentChapter = step?.chapter;
  const spotlightTransition = `top ${PACE.spotlightMs}ms var(--ease-out), left ${PACE.spotlightMs}ms var(--ease-out), width ${PACE.spotlightMs}ms var(--ease-out), height ${PACE.spotlightMs}ms var(--ease-out), box-shadow ${PACE.spotlightMs}ms var(--ease-out)`;
  const tipTransition = `top ${PACE.spotlightMs}ms var(--ease-out), left ${PACE.spotlightMs}ms var(--ease-out)`;

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
              className="absolute rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-transparent"
              style={{
                top: rect.top - pad,
                left: rect.left - pad,
                width: rect.width + pad * 2,
                height: rect.height + pad * 2,
                boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.52)",
                transition: spotlightTransition,
              }}
            />
          ) : (
            <div
              className="absolute inset-0 bg-slate-900/40"
              style={{
                transition: `opacity ${PACE.spotlightMs}ms var(--ease-out)`,
              }}
            />
          )}

          <div
            key={tipKey}
            className="pointer-events-auto absolute w-[min(100%-2rem,22rem)] rounded-2xl border border-border bg-white p-4 shadow-xl"
            style={{
              top: tip.top,
              left: tip.left,
              transition: tipTransition,
              animation: `tour-tip-in ${PACE.settle}ms var(--ease-out) both`,
            }}
          >
            {chapters.length > 1 ? (
              <div className="mb-2 flex flex-wrap gap-1">
                {chapters.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    disabled={settling}
                    onClick={() => {
                      if (settling) return;
                      const idx = tour.steps.findIndex((s) => s.chapter === ch);
                      if (idx >= 0) goToStep(idx);
                    }}
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      currentChapter === ch
                        ? "bg-primary text-primary-foreground"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      settling && "opacity-60"
                    )}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {tour.title}
              {currentChapter ? ` · ${currentChapter}` : ""} · {stepIndex + 1} /{" "}
              {tour.steps.length}
            </p>
            <h3 className="mt-1 text-base font-semibold tracking-tight">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {step.body}
            </p>
            {status || settling ? (
              <p className="mt-2 text-xs leading-relaxed text-amber-700">
                {status || "Settling on this control…"}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={skip}>
                Skip
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={stepIndex === 0 || settling}
                onClick={onPrev}
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                className="ml-auto"
                disabled={settling}
                onClick={onNext}
              >
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
                For real permissions, switch to a {roleLabel(handoff.role)}{" "}
                account. Preview only walks the next tour copy.
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
