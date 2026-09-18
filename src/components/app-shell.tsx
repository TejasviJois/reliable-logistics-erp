"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MobileNavSheet, Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { DetailDrawer } from "@/components/detail-drawer";
import { TutorialGuide } from "@/components/tutorial-guide";
import {
  refreshSessionAccount,
  useSessionStore,
} from "@/store/session-store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const account = useSessionStore((s) => s.account);
  const [hydrated, setHydrated] = useState(false);

  const isLogin = pathname === "/login";
  const isPublic = pathname.startsWith("/public/");
  const isBare = isLogin || isPublic;

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      refreshSessionAccount();
      setHydrated(true);
    };
    const unsub = useSessionStore.persist.onFinishHydration(finish);
    if (useSessionStore.persist.hasHydrated()) finish();
    const fallback = window.setTimeout(finish, 100);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!hydrated || isPublic) return;
    if (!account && !isLogin) {
      router.replace("/login");
    } else if (account && isLogin) {
      router.replace(account.homeHref || "/");
    }
  }, [account, hydrated, isLogin, isPublic, router]);

  if (isBare) {
    return <>{children}</>;
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Loading demo session…
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-slate-500">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <MobileNavSheet />
      <div className="app-canvas flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-5 lg:px-7">
          {children}
        </main>
      </div>
      <DetailDrawer />
      <TutorialGuide />
    </div>
  );
}
