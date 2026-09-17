import { Suspense } from "react";
import TutorialsClient from "./tutorials-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-10 text-center text-sm text-slate-500">
          Loading tutorials…
        </p>
      }
    >
      <TutorialsClient />
    </Suspense>
  );
}
