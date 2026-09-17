"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ROLE_TOURS, tourFor } from "@/data/role-tours";
import { useSessionStore } from "@/store/session-store";
import { useTutorialStore } from "@/store/tutorial-store";
import { toast } from "sonner";

export default function TutorialsClient() {
  const router = useRouter();
  const account = useSessionStore((s) => s.account);
  const setModeOn = useTutorialStore((s) => s.setModeOn);
  const startTour = useTutorialStore((s) => s.startTour);

  const groups = useMemo(() => {
    const order = [
      "admin",
      "management",
      "marketing",
      "sales",
      "booking",
      "warehouse",
      "traffic",
      "delivery",
      "pod",
      "billing",
      "collections",
      "support",
      "fleet",
      "procurement",
      "hr",
      "it",
      "legal",
    ] as const;
    return order
      .map((role) => tourFor(role))
      .filter(Boolean) as typeof ROLE_TOURS;
  }, []);

  const launch = (role: (typeof ROLE_TOURS)[number]["role"]) => {
    const tour = tourFor(role);
    if (!tour) return;
    setModeOn(true);
    startTour(role);
    router.push(tour.steps[0]?.route ?? "/");
    toast.message(`Tour: ${tour.title}`, {
      description: "Follow the popup — Next, then Finish for the next role.",
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Learning"
        title="Guided role tours"
        description="Turn on Tutorial in the topbar, or start a tour here. Popups spotlight real buttons — Next → Finish → who comes next."
        actions={
          account ? (
            <Button size="sm" onClick={() => launch(account.role)}>
              Start my tour ({account.roleLabel})
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardHeader
          title="All roles"
          subtitle="Each tour runs on the live screens for that job"
        />
        <ul className="divide-y divide-border">
          {groups.map((t) => (
            <li
              key={t.role}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
            >
              <div>
                <p className="text-sm font-semibold">{t.title}</p>
                <p className="text-xs text-slate-500">
                  {t.steps.length} steps
                  {t.nextRole
                    ? ` · then → ${t.nextRole.label}`
                    : " · end of money spine"}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => launch(t.role)}
              >
                Start tour
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
