"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DemoRole } from "@/data/demo-users";
import { tourFor } from "@/data/role-tours";

type TutorialState = {
  modeOn: boolean;
  active: boolean;
  role: DemoRole | null;
  stepIndex: number;
  showHandoff: boolean;

  setModeOn: (on: boolean) => void;
  startTour: (role: DemoRole, chapter?: string) => void;
  goToStep: (index: number) => void;
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

      startTour: (role, chapter) => {
        const tour = tourFor(role);
        let stepIndex = 0;
        if (chapter && tour) {
          const idx = tour.steps.findIndex((s) => s.chapter === chapter);
          if (idx >= 0) stepIndex = idx;
        }
        set({
          modeOn: true,
          active: true,
          role,
          stepIndex,
          showHandoff: false,
        });
      },

      goToStep: (index) => set({ stepIndex: Math.max(0, index) }),

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

      closeHandoff: () => set({ showHandoff: false, role: null }),
    }),
    {
      name: "reliable-tutorial-mode",
      partialize: (s) => ({ modeOn: s.modeOn }),
    }
  )
);
