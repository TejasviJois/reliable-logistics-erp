"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Download, Printer } from "lucide-react";
import type { Docket } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNumber } from "@/lib/utils";

type ScanLabelDialogProps = {
  docket: Docket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ScanLabelDialog({
  docket,
  open,
  onOpenChange,
}: ScanLabelDialogProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pkgIndex, setPkgIndex] = useState(0);

  const boxes = docket?.boxes ?? [];
  const box = boxes[Math.min(pkgIndex, Math.max(boxes.length - 1, 0))];
  const code = box?.barcode ?? docket?.number ?? "";

  useEffect(() => {
    if (open) setPkgIndex(0);
  }, [open, docket?.id]);

  useEffect(() => {
    if (!open || !svgRef.current || !code) return;
    JsBarcode(svgRef.current, code, {
      format: "CODE128",
      width: 2,
      height: 68,
      displayValue: true,
      fontSize: 13,
      margin: 10,
      background: "#ffffff",
      lineColor: "#0f172a",
    });
  }, [open, code, pkgIndex]);

  const downloadBarcode = () => {
    const svg = svgRef.current;
    if (!svg || !docket) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docket.number}-${code}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printLabel = () => {
    if (!docket || !svgRef.current) return;
    const svgHtml = svgRef.current.outerHTML;
    const win = window.open("", "_blank", "noopener,noreferrer,width=480,height=640");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${docket.number} label</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 24px; color: #0f172a; }
  .eyebrow { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; }
  h1 { font-size: 28px; margin: 8px 0 16px; font-family: ui-monospace, monospace; }
  .frame { border: 1px dashed #94a3b8; border-radius: 12px; padding: 16px; text-align: center; }
  .route { margin-top: 14px; font-size: 15px; font-weight: 600; }
  .meta { margin-top: 4px; font-size: 14px; }
  .hint { margin-top: 18px; font-size: 12px; color: #64748b; }
  @media print { body { margin: 12mm; } }
</style></head><body>
  <div class="eyebrow">Reliable Logistics · Warehouse scan</div>
  <h1>${docket.number}</h1>
  <div class="frame">${svgHtml}</div>
  <div class="route">${docket.originCity} → ${docket.destinationCity}</div>
  <div class="meta">${docket.packages} package(s) · ${formatNumber(docket.chargeableWeightKg)} kg${
    boxes.length > 1 ? ` · Label ${pkgIndex + 1} of ${boxes.length}` : ""
  }</div>
  <p class="hint">Attach this label to the consignment. Warehouse scanning identifies the package automatically.</p>
  <script>window.onload=()=>{window.print();}</script>
</body></html>`);
    win.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Reliable Logistics · Warehouse scan
          </p>
          <DialogTitle className="font-data text-2xl tracking-tight">
            {docket?.number ?? "—"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Printable warehouse barcode label for this docket
          </DialogDescription>
        </DialogHeader>

        {docket ? (
          <div className="space-y-4">
            <div className="flex justify-center rounded-xl border border-dashed border-border bg-white px-3 py-4">
              <svg ref={svgRef} />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">
                {docket.originCity} → {docket.destinationCity}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {docket.packages} package(s) ·{" "}
                {formatNumber(docket.chargeableWeightKg)} kg
                {boxes.length > 1
                  ? ` · Label ${pkgIndex + 1} of ${boxes.length}`
                  : null}
              </p>
            </div>

            {boxes.length > 1 ? (
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pkgIndex <= 0}
                  onClick={() => setPkgIndex((i) => Math.max(0, i - 1))}
                >
                  Prev package
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pkgIndex >= boxes.length - 1}
                  onClick={() =>
                    setPkgIndex((i) => Math.min(boxes.length - 1, i + 1))
                  }
                >
                  Next package
                </Button>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" className="flex-1" onClick={downloadBarcode}>
                <Download className="size-4" />
                Download barcode
              </Button>
              <Button type="button" className="flex-1" onClick={printLabel}>
                <Printer className="size-4" />
                Print label
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Attach this label to the consignment. Warehouse scanning identifies
              the package automatically.
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
