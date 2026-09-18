"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function EntityFormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  saveLabel = "Save",
  onDelete,
  deleteLabel = "Delete",
  busy,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSave: () => void;
  saveLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  busy?: boolean;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md"
        data-tour="entity-sheet"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4">
          {children}
        </div>
        <SheetFooter className="flex-row gap-2 sm:flex-row">
          {onDelete ? (
            <Button
              type="button"
              variant="danger"
              disabled={busy}
              onClick={onDelete}
            >
              {deleteLabel}
            </Button>
          ) : null}
          <div className="ml-auto flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={onSave}
              data-tour="entity-sheet-save"
            >
              {saveLabel}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
