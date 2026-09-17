import { Suspense } from "react";
import PodPage from "./pod-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="rounded-2xl border border-dashed border-[var(--border)] bg-card/60 px-4 py-10 text-center text-sm text-slate-500">
          Loading POD…
        </p>
      }
    >
      <PodPage />
    </Suspense>
  );
}
