"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoRole } from "@/data/demo-users";

type TutorialState = {
  /** Master switch — tours can run when true */
  modeOn: boolean;
  active: boolean;
  role: DemoRole | null;
  stepIndex: number;
  /** After Finish — show next-role handoff sheet */
  showHandoff: boolean;

  setModeOn: (on: boolean) => void;
  startTour: (role: DemoRole) => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  finish: () => void;
  closeHandoff: () => void;
};

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      modeOn: false,
      active: false,
      role: null,
      stepIndex: 0,
      showHandoff: false,

      setModeOn: (on) =>
        set({
          modeOn: on,
          ...(on
            ? {}
            : { active: false, role: null, stepIndex: 0, showHandoff: false }),
        }),

      startTour: (role) =>
        set({
          modeOn: true,
          active: true,
          role,
          stepIndex: 0,
          showHandoff: false,
        }),

      next: () => set({ stepIndex: get().stepIndex + 1 }),

      prev: () => set({ stepIndex: Math.max(0, get().stepIndex - 1) }),

      skip: () =>
        set({
          active: false,
          role: null,
          stepIndex: 0,
          showHandoff: false,
        }),

      finish: () =>
        set({
          active: false,
          stepIndex: 0,
          showHandoff: true,
        }),

      closeHandoff: () =>
        set({ showHandoff: false, role: null }),
    }),
    {
      name: "reliable-tutorial-mode",
      partialize: (s) => ({ modeOn: s.modeOn }),
    }
  )
);
