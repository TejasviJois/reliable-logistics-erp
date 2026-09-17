"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      theme="light"
      position="bottom-right"
      closeButton
      toastOptions={{
        className: "font-[var(--font-jakarta)]",
        style: {
          border: "1px solid rgba(15,23,42,0.08)",
          boxShadow: "0 8px 24px -12px rgba(15,23,42,0.2)",
        },
      }}
    />
  );
}
