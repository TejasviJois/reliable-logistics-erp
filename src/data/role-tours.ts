import type { DemoRole } from "@/data/demo-users";

export type TourStep = {
  /** Navigate here before highlighting (optional if already on page) */
  route: string;
  /** CSS selector — prefer [data-tour="…"] */
  target: string;
  title: string;
  body: string;
};

export type RoleTour = {
  role: DemoRole;
  title: string;
  steps: TourStep[];
  nextRole: {
    role: DemoRole;
    label: string;
    artifact: string;
    howTogether: string;
  } | null;
};

export const ROLE_TOURS: RoleTour[] = [
  {
    role: "admin",
    title: "Admin / Super User",
    steps: [
      {
        route: "/",
        target: '[data-tour="overview-kpis"]',
        title: "Control tower",
        body: "You see the whole network here — bookings, movement, cash, exceptions. You don’t move freight yourself; you watch and unlock others.",
      },
      {
        route: "/admin",
        target: '[data-tour="admin-roles-tab"]',
        title: "Role access",
        body: "Turn modules on/off for each role template. This is how Booking can book and Warehouse can scan.",
      },
      {
        route: "/admin",
        target: '[data-tour="admin-users-tab"]',
        title: "User access",
        body: "Enable, disable, or override a single person’s modules — joiners and leavers.",
      },
      {
        route: "/admin",
        target: '[data-tour="admin-network-tab"]',
        title: "Network Master",
        body: "Regions, branches, booking offices, hubs. The map of where work happens.",
      },
      {
        route: "/audit",
        target: '[data-tour="audit-table"]',
        title: "Audit trail",
        body: "Every key action lands here. Use this to prove who did what in a demo.",
      },
    ],
    nextRole: {
      role: "sales",
      label: "Sales Executive",
      artifact: "Platform ready for customers",
      howTogether:
        "Admin sets access and network. Sales then creates customers and contracts so Booking can raise dockets. Switch user to Sales to continue the commercial path — or Marketing if you want leads first.",
    },
  },
  {
    role: "management",
    title: "Management / MIS",
    steps: [
      {
        route: "/",
        target: '[data-tour="overview-kpis"]',
        title: "Hub decisions",
        body: "Same tower as Admin, focused on today: what’s stuck, what’s earning, what to escalate.",
      },
      {
        route: "/",
        target: '[data-tour="overview-attention"]',
        title: "Attention queues",
        body: "POD, collections, warehouse, hire cost — jump into the owning team’s work.",
      },
      {
        route: "/reports",
        target: '[data-tour="reports-kpis"]',
        title: "MIS",
        body: "Allocation and completion style metrics for leadership conversations.",
      },
    ],
    nextRole: {
      role: "traffic",
      label: "Traffic Manager",
      artifact: "Dispatch priorities",
      howTogether:
        "Management spots bottlenecks; Traffic clears the load board. Switch user to Traffic (or Sales for commercial pressure).",
    },
  },
  {
    role: "marketing",
    title: "Marketing",
    steps: [
      {
        route: "/marketing",
        target: '[data-tour="marketing-new-campaign"]',
        title: "+ Campaign",
        body: "Create a campaign — channel, budget, name. This is how demand starts.",
      },
      {
        route: "/marketing",
        target: '[data-tour="marketing-new-lead"]',
        title: "+ Lead",
        body: "Capture a company / contact against your pipeline.",
      },
      {
        route: "/marketing",
        target: '[data-tour="marketing-launch"]',
        title: "Launch",
        body: "Move a planned campaign live so it generates leads.",
      },
      {
        route: "/marketing",
        target: '[data-tour="marketing-handoff"]',
        title: "Handoff to Sales",
        body: "Qualified lead leaves Marketing. Sales owns CRM and customer approval next.",
      },
    ],
    nextRole: {
      role: "sales",
      label: "Sales Executive",
      artifact: "Qualified lead",
      howTogether:
        "Marketing fills the top of the funnel. Sales advances the lead, wins the deal, and unlocks an approved customer for Booking. Switch user → Sales.",
    },
  },
  {
    role: "sales",
    title: "Sales Executive",
    steps: [
      {
        route: "/crm",
        target: '[data-tour="crm-new-lead"]',
        title: "CRM lead",
        body: "Work pipeline — create or advance leads and quotations.",
      },
      {
        route: "/customers",
        target: '[data-tour="customers-new"]',
        title: "+ Customer",
        body: "Create a customer profile (starts pending).",
      },
      {
        route: "/customers",
        target: '[data-tour="customers-approve"]',
        title: "Approve customer",
        body: "Active status unlocks Booking. Pending accounts cannot ship.",
      },
      {
        route: "/contracts",
        target: '[data-tour="contracts-new"]',
        title: "Contract / tariff",
        body: "Rates and zones Booking will use for freight.",
      },
    ],
    nextRole: {
      role: "booking",
      label: "Booking Clerk",
      artifact: "Approved customer + contract",
      howTogether:
        "Sales unlocks who can be booked and at what rate. Booking creates the docket and print labels. Switch user → Booking.",
    },
  },
  {
    role: "booking",
    title: "Booking Clerk",
    steps: [
      {
        route: "/bookings",
        target: '[data-tour="bookings-create"]',
        title: "+ Create docket",
        body: "Raise a consignment for an active customer — this is the LR in the system.",
      },
      {
        route: "/bookings",
        target: '[data-tour="bookings-print-label"]',
        title: "View / print barcode",
        body: "Print package labels. Warehouse will scan these codes (or the docket number).",
      },
      {
        route: "/bookings",
        target: '[data-tour="bookings-register"]',
        title: "Docket register",
        body: "Every booking lives here — status, route, chargeable weight.",
      },
    ],
    nextRole: {
      role: "warehouse",
      label: "Warehouse / Hub Operator",
      artifact: "Docket + printed scan labels",
      howTogether:
        "Booking creates the paper trail and stickers. Warehouse scans packages inward before any truck can leave. Switch user → Warehouse.",
    },
  },
  {
    role: "warehouse",
    title: "Warehouse / Hub",
    steps: [
      {
        route: "/warehouse",
        target: '[data-tour="wh-tab-scan"]',
        title: "Scan tab",
        body: "Inward / outward scans with condition codes. This is the physical gate.",
      },
      {
        route: "/warehouse",
        target: '[data-tour="wh-scan-input"]',
        title: "Barcode field",
        body: "Enter BX-… from the label or the docket number. Duplicates are blocked.",
      },
      {
        route: "/warehouse",
        target: '[data-tour="wh-scan-btn"]',
        title: "Scan",
        body: "Stages the package. Finish all boxes — Traffic’s dispatch gate needs this.",
      },
      {
        route: "/warehouse",
        target: '[data-tour="wh-tab-manifests"]',
        title: "Manifests",
        body: "Consolidate dockets onto a vehicle/hub move with an audited manifest.",
      },
    ],
    nextRole: {
      role: "traffic",
      label: "Traffic Manager",
      artifact: "Fully scanned / manifested load",
      howTogether:
        "Warehouse proves cargo is staged. Traffic picks the truck and dispatches. Switch user → Traffic.",
    },
  },
  {
    role: "traffic",
    title: "Traffic Manager",
    steps: [
      {
        route: "/traffic",
        target: '[data-tour="traffic-load"]',
        title: "Load board",
        body: "Pending dockets waiting for a vehicle.",
      },
      {
        route: "/traffic",
        target: '[data-tour="traffic-vehicle"]',
        title: "Vehicle fit",
        body: "Recommended truck with score — capacity, docs, owned vs hire.",
      },
      {
        route: "/traffic",
        target: '[data-tour="traffic-dispatch"]',
        title: "Dispatch",
        body: "Confirm after scan + e-way gates. Trip goes In Transit.",
      },
      {
        route: "/vendor-costs",
        target: '[data-tour="thc-create-tab"]',
        title: "THC (if hired)",
        body: "Open Create THC for market/contracted hire — Truck Hire Challan for advance settlement.",
      },
    ],
    nextRole: {
      role: "delivery",
      label: "Delivery / Field",
      artifact: "Dispatched trip",
      howTogether:
        "Traffic puts the truck on the road (and Tracking shows it). Delivery does OFD and marks delivered. Switch user → Delivery.",
    },
  },
  {
    role: "delivery",
    title: "Delivery / Field",
    steps: [
      {
        route: "/delivery",
        target: '[data-tour="delivery-board"]',
        title: "Delivery board",
        body: "Shipments ready for last mile.",
      },
      {
        route: "/delivery",
        target: '[data-tour="delivery-ofd"]',
        title: "Out for delivery",
        body: "Mark OFD when the run starts.",
      },
      {
        route: "/delivery",
        target: '[data-tour="delivery-delivered"]',
        title: "Mark delivered",
        body: "Consignee received goods. POD Cell takes the evidence next.",
      },
    ],
    nextRole: {
      role: "pod",
      label: "POD Cell",
      artifact: "Delivered consignment",
      howTogether:
        "Field closes physical delivery. POD approves proof so Billing can invoice TBB. Switch user → POD.",
    },
  },
  {
    role: "pod",
    title: "POD Cell",
    steps: [
      {
        route: "/pod",
        target: '[data-tour="pod-queue"]',
        title: "POD queue",
        body: "Needs attention vs approved. Pick a delivered docket.",
      },
      {
        route: "/pod",
        target: '[data-tour="pod-ingest"]',
        title: "Ingest",
        body: "Upload / WhatsApp / driver app channel — then map to the docket.",
      },
      {
        route: "/pod",
        target: '[data-tour="pod-approve"]',
        title: "Approve POD",
        body: "Unlocks billing_eligible for TBB. Reject sends it back.",
      },
    ],
    nextRole: {
      role: "billing",
      label: "Billing / Accounts",
      artifact: "Approved POD",
      howTogether:
        "No approved POD, no tax invoice for TBB. Billing generates CGST/SGST or IGST next. Switch user → Billing.",
    },
  },
  {
    role: "billing",
    title: "Billing / Accounts",
    steps: [
      {
        route: "/billing",
        target: '[data-tour="billing-eligible"]',
        title: "Eligible queue",
        body: "Only dockets unlocked by POD appear here.",
      },
      {
        route: "/billing",
        target: '[data-tour="billing-generate"]',
        title: "Generate invoice",
        body: "Freight lines + GST. Creates INV-######.",
      },
      {
        route: "/billing",
        target: '[data-tour="billing-print"]',
        title: "View / Print",
        body: "Tax invoice for the customer.",
      },
    ],
    nextRole: {
      role: "collections",
      label: "Accounts / Collections",
      artifact: "Issued invoice",
      howTogether:
        "Billing creates the receivable. Collections records receipts and aging. Switch user → Collections.",
    },
  },
  {
    role: "collections",
    title: "Collections",
    steps: [
      {
        route: "/receivables",
        target: '[data-tour="ar-dashboard"]',
        title: "Outstanding",
        body: "What customers still owe.",
      },
      {
        route: "/receivables",
        target: '[data-tour="ar-receipt"]',
        title: "Record receipt",
        body: "Allocate payment against an invoice.",
      },
      {
        route: "/receivables",
        target: '[data-tour="ar-aging"]',
        title: "Aging",
        body: "0–30 through 120+ buckets — cash risk view.",
      },
    ],
    nextRole: null,
  },
  {
    role: "support",
    title: "Customer Support",
    steps: [
      {
        route: "/support",
        target: '[data-tour="support-new"]',
        title: "+ Ticket",
        body: "Open an SLA ticket linked to customer / docket.",
      },
      {
        route: "/support",
        target: '[data-tour="support-queue"]',
        title: "Queue",
        body: "Assign, resolve, close — parallel to ops, not a dispatch step.",
      },
    ],
    nextRole: {
      role: "warehouse",
      label: "Warehouse (if damage/shortage)",
      artifact: "Investigation ticket",
      howTogether:
        "Support captures the voice of the customer. Physical fixes go to Warehouse/POD; money questions to Billing/Collections.",
    },
  },
  {
    role: "fleet",
    title: "Fleet Manager",
    steps: [
      {
        route: "/fleet",
        target: '[data-tour="fleet-new"]',
        title: "+ Vehicle",
        body: "Add capacity to the network.",
      },
      {
        route: "/fleet",
        target: '[data-tour="fleet-docs"]',
        title: "Docs / maintenance",
        body: "Insurance, fitness, maintenance — Traffic won’t trust unsafe trucks.",
      },
      {
        route: "/traffic",
        target: '[data-tour="traffic-vehicle"]',
        title: "Used by Traffic",
        body: "Your vehicles show up on the dispatch fit list. You don’t dispatch — Traffic does.",
      },
    ],
    nextRole: {
      role: "traffic",
      label: "Traffic Manager",
      artifact: "Available documented vehicles",
      howTogether:
        "Fleet keeps metal ready. Traffic assigns it to loads. Not Delivery — dispatch is Traffic. Switch user → Traffic.",
    },
  },
  {
    role: "procurement",
    title: "Procurement",
    steps: [
      {
        route: "/procurement",
        target: '[data-tour="proc-new-po"]',
        title: "+ PO",
        body: "Buy packaging, spares, hub supplies.",
      },
      {
        route: "/procurement",
        target: '[data-tour="proc-advance"]',
        title: "Order → Receive → Close",
        body: "Advance the PO lifecycle.",
      },
      {
        route: "/vendors",
        target: '[data-tour="vendors-new"]',
        title: "Vendors",
        body: "Supplier / hire vendor master shared with Traffic THC.",
      },
    ],
    nextRole: {
      role: "fleet",
      label: "Fleet / Warehouse",
      artifact: "Received goods",
      howTogether:
        "Procurement does NOT hand to Delivery. Received POs feed Fleet (spares) or Warehouse (packaging). Hire cost settles with Traffic via THC/BTH.",
    },
  },
  {
    role: "hr",
    title: "HR Executive",
    steps: [
      {
        route: "/hr",
        target: '[data-tour="hr-new-employee"]',
        title: "+ Employee",
        body: "People master for the hub.",
      },
      {
        route: "/hr",
        target: '[data-tour="hr-leave"]',
        title: "Leave",
        body: "Approve or reject leave requests.",
      },
      {
        route: "/hr",
        target: '[data-tour="hr-payroll"]',
        title: "Payroll",
        body: "Process a payroll run.",
      },
    ],
    nextRole: {
      role: "it",
      label: "IT Helpdesk",
      artifact: "Joiner / leaver",
      howTogether:
        "HR owns the person. IT turns that into ERP login access (or revocation). Not on the shipment spine.",
    },
  },
  {
    role: "it",
    title: "IT Helpdesk",
    steps: [
      {
        route: "/admin",
        target: '[data-tour="admin-users-tab"]',
        title: "User access",
        body: "Enable accounts and module overrides for joiners.",
      },
      {
        route: "/audit",
        target: '[data-tour="audit-table"]',
        title: "Audit",
        body: "Prove access changes.",
      },
    ],
    nextRole: {
      role: "booking",
      label: "Ops roles (example Booking)",
      artifact: "Working login",
      howTogether:
        "After IT enables a clerk, that person can run their Booking tour. Access is the bridge from HR → productive work.",
    },
  },
  {
    role: "legal",
    title: "Legal & Compliance",
    steps: [
      {
        route: "/compliance",
        target: '[data-tour="compliance-new"]',
        title: "+ Document",
        body: "Licenses and renewals.",
      },
      {
        route: "/contracts",
        target: '[data-tour="contracts-new"]',
        title: "Contracts",
        body: "Tariffs Sales and Booking rely on.",
      },
    ],
    nextRole: {
      role: "sales",
      label: "Sales Executive",
      artifact: "Cleared contract / license",
      howTogether:
        "Legal keeps commercial paper clean. Sales can then promise rates; Booking rates from approved tariffs.",
    },
  },
];

export function tourFor(role: DemoRole) {
  return ROLE_TOURS.find((t) => t.role === role);
}
