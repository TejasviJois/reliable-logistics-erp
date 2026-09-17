import type { DocketStatus } from "@/types";

export const STATUS_LABEL: Record<DocketStatus, string> = {
  draft: "Draft",
  booked: "Booked",
  warehouse: "Warehouse",
  dispatched: "Dispatched",
  in_transit: "In Transit",
  at_hub: "At Hub",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  pod_pending: "POD Pending",
  pod_approved: "POD Approved",
  billing_eligible: "Billing Eligible",
  invoiced: "Invoiced",
  paid: "Paid",
  exception: "Exception",
};

export const STATUS_TONE: Record<
  DocketStatus,
  "amber" | "blue" | "green" | "red" | "violet" | "slate"
> = {
  draft: "slate",
  booked: "amber",
  warehouse: "violet",
  dispatched: "blue",
  in_transit: "blue",
  at_hub: "violet",
  out_for_delivery: "amber",
  delivered: "green",
  pod_pending: "amber",
  pod_approved: "green",
  billing_eligible: "violet",
  invoiced: "blue",
  paid: "green",
  exception: "red",
};

export const PIPELINE_STAGES: DocketStatus[] = [
  "booked",
  "warehouse",
  "dispatched",
  "in_transit",
  "at_hub",
  "out_for_delivery",
  "delivered",
  "billing_eligible",
  "paid",
];

export const MODE_LABEL: Record<string, string> = {
  PTL: "Surface PTL",
  FTL: "Surface FTL",
  RAIL: "Rail",
  AIR: "Air",
  SURFACE: "Surface",
};

export const WORKFLOW_STEPS = [
  "Created",
  "Warehouse",
  "Manifest",
  "Dispatched",
  "Transit",
  "Hub",
  "Delivery",
  "POD",
  "Billing",
  "Paid",
] as const;

export function workflowIndex(status: DocketStatus): number {
  const map: Partial<Record<DocketStatus, number>> = {
    draft: 0,
    booked: 0,
    warehouse: 1,
    dispatched: 3,
    in_transit: 4,
    at_hub: 5,
    out_for_delivery: 6,
    delivered: 6,
    pod_pending: 7,
    pod_approved: 7,
    billing_eligible: 8,
    invoiced: 8,
    paid: 9,
    exception: 4,
  };
  return map[status] ?? 0;
}
