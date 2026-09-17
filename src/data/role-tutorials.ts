import type { DemoRole } from "@/data/demo-users";

export type TutorialStep = {
  title: string;
  href: string;
  screen: string;
  doThis: string;
  lookFor: string;
};

export type TutorialLink = {
  role: DemoRole;
  artifact: string;
  why: string;
};

export type RoleTutorial = {
  role: DemoRole;
  title: string;
  group: "Control" | "Commercial" | "Operations" | "Finance" | "Resources" | "Governance";
  homeHref: string;
  minutes: number;
  about: string;
  features: string[];
  youWorkOn: string[];
  steps: TutorialStep[];
  receivesFrom: TutorialLink[];
  handsOffTo: TutorialLink[];
  worksWith: TutorialLink[];
};

export const ROLE_TUTORIALS: RoleTutorial[] = [
  {
    role: "admin",
    title: "Admin / Super User",
    group: "Control",
    homeHref: "/",
    minutes: 8,
    about:
      "Tenant-wide owner of the demo. You see every module, every hub, and Access Control. You do not move the shipment yourself — you unlock who can, watch the control tower, and jump into any stuck handoff.",
    features: [
      "Operations Overview (KPIs, attention queues, lanes)",
      "Administration — Role access, User access, Network Master, Executive",
      "Audit trail across all modules",
      "Reports & MIS",
      "Hub scope switch (All hubs / Bengaluru / Chennai / Hyderabad)",
      "Full sidebar — every commercial, ops, finance and resource screen",
    ],
    youWorkOn: [
      "Grant or revoke modules per role template",
      "Enable/disable user logins or custom module overrides",
      "Create network locations (region / branch / booking office / hub)",
      "Review executive KPIs and open exceptions",
      "Spot-check Audit after a full ops run",
    ],
    steps: [
      {
        title: "Open the control tower",
        href: "/",
        screen: "Operations Overview",
        doThis: "Walk the KPI strip and attention queue. Open DK-10231 from recent bookings.",
        lookFor: "Hero docket drawer + workflow stepper",
      },
      {
        title: "Manage who can do what",
        href: "/admin",
        screen: "Administration · Roles",
        doThis: "Pick a role (e.g. Booking). Toggle a module on/off and note the sidebar changes after Switch user.",
        lookFor: "Role access matrix applies to all users of that role",
      },
      {
        title: "Network Master",
        href: "/admin",
        screen: "Administration · Network",
        doThis: "Open Network Master tab. Review Bengaluru / Chennai hubs. Optionally create a booking office.",
        lookFor: "REGION / BRANCH / BOOKING_OFFICE / TRANSSHIPMENT_HUB types",
      },
      {
        title: "Prove the audit spine",
        href: "/audit",
        screen: "Audit",
        doThis: "Filter recent Booking / Warehouse / POD actions from the hero run.",
        lookFor: "Immutable activity with user + module + before/after",
      },
    ],
    receivesFrom: [],
    handsOffTo: [
      {
        role: "management",
        artifact: "Live MIS + access policy",
        why: "Branch managers run day-to-day with the grants you set",
      },
      {
        role: "it",
        artifact: "User / role access patterns",
        why: "IT Helpdesk mirrors access work for joiners and leavers",
      },
      {
        role: "sales",
        artifact: "Approved platform ready for customers",
        why: "Commercial work starts once the org and modules are live",
      },
    ],
    worksWith: [
      {
        role: "legal",
        artifact: "Compliance visibility",
        why: "Governance pair — licenses and contracts",
      },
    ],
  },
  {
    role: "management",
    title: "Management / MIS (Branch Manager)",
    group: "Control",
    homeHref: "/",
    minutes: 5,
    about:
      "Hub-level owner. Same visibility as Admin for the demo, focused on decisions: what is stuck, what is earning, what needs escalation — not data entry.",
    features: [
      "Operations Overview",
      "Reports & MIS",
      "Administration (when granted)",
      "Cross-module drill-down via search and drawers",
    ],
    youWorkOn: [
      "Review today’s bookings, tonnage, outstanding, POD attention",
      "Escalate exceptions to Warehouse / Support",
      "Confirm commercial health (billing + receivables)",
    ],
    steps: [
      {
        title: "Control tower",
        href: "/",
        screen: "Operations Overview",
        doThis: "Read attention cards: POD, collections, warehouse staging, THC exposure.",
        lookFor: "Queues that jump into the owning module",
      },
      {
        title: "MIS snapshot",
        href: "/reports",
        screen: "Reports & MIS",
        doThis: "Open operational KPIs and spend signals.",
        lookFor: "Allocation / completion style metrics",
      },
    ],
    receivesFrom: [
      {
        role: "admin",
        artifact: "Access + network setup",
        why: "You operate inside the tenant Admin configured",
      },
    ],
    handsOffTo: [
      {
        role: "sales",
        artifact: "Priority lanes / customers to chase",
        why: "Commercial execution sits with Sales",
      },
      {
        role: "traffic",
        artifact: "Dispatch priorities",
        why: "Ops bottlenecks often clear in Traffic",
      },
    ],
    worksWith: [
      {
        role: "collections",
        artifact: "Outstanding aging",
        why: "Cash and ops reviewed together",
      },
    ],
  },
  {
    role: "marketing",
    title: "Marketing",
    group: "Commercial",
    homeHref: "/marketing",
    minutes: 6,
    about:
      "Creates demand. Campaigns produce leads; qualified leads are handed to Sales — Marketing does not book dockets.",
    features: [
      "Campaign create / launch / complete / delete",
      "Lead capture on Marketing",
      "Handoff to Sales (CRM)",
      "Marketing work queue",
    ],
    youWorkOn: [
      "Create and launch a campaign",
      "Add a lead against the campaign",
      "Handoff qualified lead to Sales",
    ],
    steps: [
      {
        title: "Create a campaign",
        href: "/marketing",
        screen: "Marketing",
        doThis: "Click + Campaign, save, then Launch.",
        lookFor: "Status moves Planned → Active; audit toast",
      },
      {
        title: "Capture a lead",
        href: "/marketing",
        screen: "Marketing · Leads",
        doThis: "Add a lead for a South corridor prospect.",
        lookFor: "Lead appears in the list",
      },
      {
        title: "Handoff to Sales",
        href: "/marketing",
        screen: "Marketing",
        doThis: "Use Handoff to Sales on the lead.",
        lookFor: "Lead becomes visible to CRM / Sales tutorial next",
      },
    ],
    receivesFrom: [],
    handsOffTo: [
      {
        role: "sales",
        artifact: "Qualified lead",
        why: "Sales owns pipeline, quotation and customer onboarding",
      },
    ],
    worksWith: [
      {
        role: "sales",
        artifact: "ROI feedback",
        why: "Won deals close the marketing loop",
      },
    ],
  },
  {
    role: "sales",
    title: "Sales Executive",
    group: "Commercial",
    homeHref: "/customers",
    minutes: 8,
    about:
      "Turns leads into approved customers and contracts. Booking cannot ship for a pending customer — Sales + approval unlock the commercial gate.",
    features: [
      "CRM leads & quotations (advance stage, won/lost)",
      "Customer create (pending) and approve",
      "Contracts & tariffs / zoning",
      "Booking peek for account shipments",
    ],
    youWorkOn: [
      "Advance CRM lead and create quotation",
      "Create pending customer → Approve",
      "Attach / edit tariff contract or zone",
    ],
    steps: [
      {
        title: "Work the pipeline",
        href: "/crm",
        screen: "CRM & Sales",
        doThis: "Open a lead, advance stage, add a quotation, mark won.",
        lookFor: "Stage badges + quotation row",
      },
      {
        title: "Onboard a customer",
        href: "/customers",
        screen: "Customers",
        doThis: "Create customer (pending). Approve Coastal Retail or your new profile.",
        lookFor: "Status Active — booking unlocked",
      },
      {
        title: "Commercial terms",
        href: "/contracts",
        screen: "Contracts · Zoning & tariffs",
        doThis: "Review Meridian contract or add a tariff zone.",
        lookFor: "Mode · zone · rate/kg used at booking",
      },
    ],
    receivesFrom: [
      {
        role: "marketing",
        artifact: "Qualified lead",
        why: "Inbound demand from campaigns",
      },
    ],
    handsOffTo: [
      {
        role: "booking",
        artifact: "Approved customer + contract",
        why: "Booking clerks create dockets only for active accounts",
      },
    ],
    worksWith: [
      {
        role: "legal",
        artifact: "Contract review",
        why: "Tariff language and compliance",
      },
      {
        role: "support",
        artifact: "Account issues",
        why: "Post-sale care",
      },
    ],
  },
  {
    role: "booking",
    title: "Booking Clerk",
    group: "Operations",
    homeHref: "/bookings",
    minutes: 8,
    about:
      "Creates the consignment docket — the system of record for the shipment. Prints the warehouse scan label so Hub can identify packages.",
    features: [
      "Docket register",
      "Create docket (Shipment → Cargo → Commercial → Compliance)",
      "View / print barcode scan label",
      "Customer + e-way / invoice fields",
      "Docket detail & tracking peek",
    ],
    youWorkOn: [
      "Create a docket for an active customer (or use DK-10231)",
      "Print / download barcode labels for each package",
      "Confirm chargeable weight and payment mode (TBB)",
    ],
    steps: [
      {
        title: "Open the register",
        href: "/bookings",
        screen: "Bookings",
        doThis: "Find DK-10231 or click + Create docket.",
        lookFor: "Scan label column on every row",
      },
      {
        title: "Create (optional)",
        href: "/bookings/new",
        screen: "Create consignment",
        doThis: "Walk 4 steps. Use Meridian. Save — label modal opens.",
        lookFor: "Freight preview from contract zone",
      },
      {
        title: "Print scan labels",
        href: "/bookings",
        screen: "View / print barcode",
        doThis: "Open barcode for DK-10231. Download or Print. Note BX-… codes.",
        lookFor: "CODE128 package barcodes Warehouse will scan",
      },
    ],
    receivesFrom: [
      {
        role: "sales",
        artifact: "Active customer + tariff",
        why: "Pending customers are blocked at create",
      },
    ],
    handsOffTo: [
      {
        role: "warehouse",
        artifact: "Docket + printed barcode labels",
        why: "Hub scans packages inward before dispatch",
      },
    ],
    worksWith: [
      {
        role: "support",
        artifact: "Booking corrections",
        why: "Customer calls about LR / status",
      },
    ],
  },
  {
    role: "warehouse",
    title: "Warehouse / Hub Operator",
    group: "Operations",
    homeHref: "/warehouse",
    minutes: 8,
    about:
      "Physical gate of the network. Scan every package, build manifests, raise exceptions. Traffic cannot dispatch until scans are complete.",
    features: [
      "Control tab — staging KPIs + handling ledger",
      "Scan — inward/outward, condition, barcode or docket #",
      "Manifests — create audited manifest",
      "Exceptions — damage / shortage / excess / misrouted",
    ],
    youWorkOn: [
      "Scan remaining boxes on DK-10231 (e.g. BX-10231-09)",
      "Create manifest when scan complete",
      "Raise exception if condition is not GOOD",
    ],
    steps: [
      {
        title: "Control view",
        href: "/warehouse",
        screen: "Warehouse · Control",
        doThis: "Read units staging, inward scans, open exceptions.",
        lookFor: "Live handling ledger",
      },
      {
        title: "Scan packages",
        href: "/warehouse",
        screen: "Warehouse · Scan",
        doThis: "Enter BX-10231-09 or DK-10231. Set SCAN_INWARD. Scan until manifest ready.",
        lookFor: "Progress bar + blocked duplicate toast",
      },
      {
        title: "Manifest",
        href: "/warehouse",
        screen: "Warehouse · Manifests",
        doThis: "Create audited manifest for destination hub.",
        lookFor: "MF-###### in register",
      },
    ],
    receivesFrom: [
      {
        role: "booking",
        artifact: "Docket + labels",
        why: "Nothing to scan without a booking",
      },
      {
        role: "procurement",
        artifact: "Packaging / supplies (PO receipt)",
        why: "Hub consumables — parallel support",
      },
    ],
    handsOffTo: [
      {
        role: "traffic",
        artifact: "Fully scanned / manifested load",
        why: "Dispatch gate requires warehouse scan complete",
      },
    ],
    worksWith: [
      {
        role: "fleet",
        artifact: "Bay / capacity awareness",
        why: "Vehicle readiness is Fleet; load is Warehouse",
      },
    ],
  },
  {
    role: "traffic",
    title: "Traffic Manager",
    group: "Operations",
    homeHref: "/traffic",
    minutes: 8,
    about:
      "Plans and dispatches the truck. Chooses vehicle (owned / contracted / market), confirms e-way and scan gates, raises THC for hire, then tracking goes live.",
    features: [
      "Pending load board + vehicle fit scoring",
      "Dispatch with scan / e-way gates",
      "Fleet availability peek",
      "Vendor Costs — create / approve THC",
      "Live Tracking publish after dispatch",
    ],
    youWorkOn: [
      "Select DK-10231 and recommended vehicle",
      "Confirm dispatch → In Transit",
      "Create or approve THC when market/contracted hire",
    ],
    steps: [
      {
        title: "Load board",
        href: "/traffic",
        screen: "Traffic & Dispatch",
        doThis: "Select DK-10231. Review Recommended vehicle score and reasons.",
        lookFor: "Scan complete + e-way gates",
      },
      {
        title: "Dispatch",
        href: "/traffic",
        screen: "Traffic",
        doThis: "Confirm dispatch. Status → In Transit.",
        lookFor: "Trip appears on Live Tracking",
      },
      {
        title: "THC if hired",
        href: "/vendor-costs",
        screen: "Vendor Costs · THC",
        doThis: "Create THC for the trip; Approve on register.",
        lookFor: "Advance amount + pending → approved",
      },
      {
        title: "Publish progress",
        href: "/tracking",
        screen: "Live Tracking",
        doThis: "Select trip. Publish location / ETA. Copy public tracking link.",
        lookFor: "Customer update timeline",
      },
    ],
    receivesFrom: [
      {
        role: "warehouse",
        artifact: "Scanned load",
        why: "Gate blocks incomplete scans",
      },
      {
        role: "fleet",
        artifact: "Available vehicles",
        why: "Fit score uses Fleet master + docs",
      },
    ],
    handsOffTo: [
      {
        role: "delivery",
        artifact: "In-transit / arrived trip",
        why: "Field team does OFD and delivery",
      },
    ],
    worksWith: [
      {
        role: "procurement",
        artifact: "Vendor hire costs",
        why: "THC/BTH settlement later with Accounts",
      },
    ],
  },
  {
    role: "delivery",
    title: "Delivery / Field Operations",
    group: "Operations",
    homeHref: "/delivery",
    minutes: 5,
    about:
      "Last mile. Marks out for delivery and delivered, then POD Cell owns the paper/photo evidence for billing unlock.",
    features: [
      "Delivery run list",
      "Out for delivery / Mark delivered",
      "Tracking + POD handoff",
    ],
    youWorkOn: [
      "Move shipment to Out for delivery",
      "Mark delivered for hero or OFD dockets",
      "Confirm POD queue will pick it up",
    ],
    steps: [
      {
        title: "Delivery board",
        href: "/delivery",
        screen: "Delivery",
        doThis: "Select the in-transit / arrived docket. Mark Out for delivery, then Delivered.",
        lookFor: "Status → delivered / pod_pending",
      },
      {
        title: "Confirm visibility",
        href: "/tracking",
        screen: "Live Tracking",
        doThis: "Optional: Mark arrived / delivered on trip actions.",
        lookFor: "Progress 100%",
      },
    ],
    receivesFrom: [
      {
        role: "traffic",
        artifact: "Dispatched trip",
        why: "No OFD without a vehicle on the road",
      },
    ],
    handsOffTo: [
      {
        role: "pod",
        artifact: "Delivered consignment ready for POD",
        why: "Billing for TBB waits on POD approval",
      },
    ],
    worksWith: [
      {
        role: "support",
        artifact: "Failed delivery tickets",
        why: "Consignee complaints",
      },
    ],
  },
  {
    role: "pod",
    title: "POD Cell",
    group: "Operations",
    homeHref: "/pod",
    minutes: 7,
    about:
      "Proof of Delivery gate for revenue. Ingest evidence (upload / WhatsApp / driver app flags), review, approve — that unlocks Billing for TBB.",
    features: [
      "POD queue filters (attention / approved)",
      "Ingest with channel + signature / GPS flags",
      "Side-by-side review",
      "Approve / Reject / Request review",
      "Billing unlock on approve",
    ],
    youWorkOn: [
      "Ingest POD for delivered docket",
      "Review extracted fields",
      "Approve → billing_eligible",
    ],
    steps: [
      {
        title: "Open POD queue",
        href: "/pod",
        screen: "POD Cell",
        doThis: "Filter Needs attention. Select delivered / pod_pending docket.",
        lookFor: "Upload / review cards",
      },
      {
        title: "Ingest evidence",
        href: "/pod",
        screen: "POD · Ingest",
        doThis: "Pick channel WhatsApp or Direct upload. Ingest and map.",
        lookFor: "Extract beat then side-by-side facts",
      },
      {
        title: "Approve",
        href: "/pod",
        screen: "POD · Review",
        doThis: "Approve POD.",
        lookFor: "Docket → billing_eligible; Billing queue unlocks",
      },
    ],
    receivesFrom: [
      {
        role: "delivery",
        artifact: "Delivered shipment",
        why: "Nothing to prove until delivered",
      },
    ],
    handsOffTo: [
      {
        role: "billing",
        artifact: "Approved POD",
        why: "TBB invoice generation is gated on approval",
      },
    ],
    worksWith: [
      {
        role: "support",
        artifact: "POD disputes",
        why: "Shortage / damage tickets",
      },
    ],
  },
  {
    role: "billing",
    title: "Billing / Accounts",
    group: "Finance",
    homeHref: "/billing",
    minutes: 6,
    about:
      "Turns approved deliveries into tax invoices (CGST/SGST or IGST). Collections cannot settle cash without an invoice.",
    features: [
      "Billing-eligible queue",
      "Tax invoice preview (HSN, place of supply)",
      "Generate invoice",
      "View / Print tax invoice",
      "Customer + contract context",
    ],
    youWorkOn: [
      "Select eligible docket after POD approve",
      "Generate invoice",
      "Print tax invoice for customer",
    ],
    steps: [
      {
        title: "Eligible queue",
        href: "/billing",
        screen: "Billing",
        doThis: "Pick a billing_eligible docket. Read freight lines + GST split.",
        lookFor: "CGST/SGST vs IGST by lane",
      },
      {
        title: "Generate & print",
        href: "/billing",
        screen: "Billing · Register",
        doThis: "Generate and save invoice. View / Print from register.",
        lookFor: "INV-###### issued",
      },
    ],
    receivesFrom: [
      {
        role: "pod",
        artifact: "Approved POD",
        why: "Gate message if POD missing",
      },
    ],
    handsOffTo: [
      {
        role: "collections",
        artifact: "Issued invoice",
        why: "Receipts allocate against invoices",
      },
    ],
    worksWith: [
      {
        role: "sales",
        artifact: "Tariff disputes",
        why: "Rate questions from contract",
      },
    ],
  },
  {
    role: "collections",
    title: "Accounts / Collections",
    group: "Finance",
    homeHref: "/receivables",
    minutes: 6,
    about:
      "Closes the commercial loop: receipt → allocation → outstanding / aging. Last stop on the shipment money spine.",
    features: [
      "Dashboard outstanding KPIs",
      "Receipt entry (NEFT/UPI/Cheque UI)",
      "Customer outstanding",
      "Aging buckets 0–30 … 120+",
      "Receipt history",
    ],
    youWorkOn: [
      "Record receipt against an open invoice",
      "Show aging movement",
      "Confirm customer outstanding drops",
    ],
    steps: [
      {
        title: "Dashboard",
        href: "/receivables",
        screen: "Receivables · Dashboard",
        doThis: "Read total outstanding and pending invoices.",
        lookFor: "Aging KPI strip",
      },
      {
        title: "Record receipt",
        href: "/receivables",
        screen: "Receivables · Receipt Entry",
        doThis: "Select invoice, amount, mode. Record receipt.",
        lookFor: "Partially paid / paid + audit",
      },
      {
        title: "Aging",
        href: "/receivables",
        screen: "Receivables · Aging",
        doThis: "Open Aging tab. Show bucketed open invoices.",
        lookFor: "0–30 / 31–60 / … buckets",
      },
    ],
    receivesFrom: [
      {
        role: "billing",
        artifact: "Issued invoice",
        why: "Nothing to collect without an invoice",
      },
    ],
    handsOffTo: [],
    worksWith: [
      {
        role: "support",
        artifact: "Payment follow-ups",
        why: "Customer promises to pay",
      },
      {
        role: "management",
        artifact: "Aging MIS",
        why: "Cash risk for the hub",
      },
    ],
  },
  {
    role: "support",
    title: "Customer Support",
    group: "Operations",
    homeHref: "/support",
    minutes: 5,
    about:
      "Parallel lane — tickets with SLA at any point in the shipment life. Does not replace Warehouse or POD gates.",
    features: [
      "Ticket create / assign / resolve / close",
      "Severity P1–P3 and categories",
      "Link customer + docket",
      "Tracking status for callers",
    ],
    youWorkOn: [
      "Create a DELAY or DAMAGE ticket on a docket",
      "Assign and resolve with timeline",
    ],
    steps: [
      {
        title: "Raise ticket",
        href: "/support",
        screen: "Support & SLA",
        doThis: "+ Ticket — link Meridian / DK-10231, severity P2.",
        lookFor: "Open queue + SLA due",
      },
      {
        title: "Work & close",
        href: "/support",
        screen: "Support",
        doThis: "Assign → Resolve → Close.",
        lookFor: "Audit timeline on the ticket",
      },
    ],
    receivesFrom: [
      {
        role: "sales",
        artifact: "Customer relationship",
        why: "Account context",
      },
      {
        role: "booking",
        artifact: "Docket reference",
        why: "Caller quotes LR number",
      },
    ],
    handsOffTo: [
      {
        role: "warehouse",
        artifact: "Shortage / damage investigation",
        why: "Ops must fix physical exceptions",
      },
      {
        role: "pod",
        artifact: "POD disputes",
        why: "Evidence review",
      },
    ],
    worksWith: [
      {
        role: "collections",
        artifact: "Billing queries",
        why: "Invoice complaints",
      },
    ],
  },
  {
    role: "fleet",
    title: "Fleet Manager",
    group: "Resources",
    homeHref: "/fleet",
    minutes: 6,
    about:
      "Owns vehicle master, documents and availability. You do not dispatch — Traffic picks from the fleet you keep roadworthy.",
    features: [
      "Vehicle create / edit / delete",
      "Docs status (RC / insurance / fitness)",
      "Maintenance flag",
      "Capacity & utilization",
      "Traffic board peek",
    ],
    youWorkOn: [
      "Add or edit a vehicle",
      "Renew expiring docs",
      "Mark maintenance when offline",
    ],
    steps: [
      {
        title: "Fleet register",
        href: "/fleet",
        screen: "Fleet",
        doThis: "+ Vehicle or edit docs on an existing unit.",
        lookFor: "Insurance / fitness badges",
      },
      {
        title: "Maintenance",
        href: "/fleet",
        screen: "Fleet",
        doThis: "Mark a vehicle Maintenance, then clear when ready.",
        lookFor: "Availability for Traffic scoring",
      },
      {
        title: "See Traffic consume fleet",
        href: "/traffic",
        screen: "Traffic",
        doThis: "Open Traffic — recommended list uses your vehicles.",
        lookFor: "Owned vs contracted fit reasons",
      },
    ],
    receivesFrom: [
      {
        role: "procurement",
        artifact: "Spares / tyres POs",
        why: "Maintenance inputs",
      },
    ],
    handsOffTo: [
      {
        role: "traffic",
        artifact: "Available, documented vehicles",
        why: "Dispatch picks from Fleet master",
      },
    ],
    worksWith: [
      {
        role: "procurement",
        artifact: "Hired fleet / vendor master",
        why: "Market vehicles and vendor GSTIN live under Vendors + Procurement",
      },
    ],
  },
  {
    role: "procurement",
    title: "Procurement",
    group: "Resources",
    homeHref: "/procurement",
    minutes: 6,
    about:
      "Buys for the network (packaging, spares, hub supplies) and helps vendor commercial setup. Not the next step after booking — does not dispatch or deliver.",
    features: [
      "Purchase orders create / order / receive / close",
      "Vendors master",
      "Vendor Costs visibility (THC/BTH)",
    ],
    youWorkOn: [
      "Create PO → Order → Receive → Close",
      "Maintain vendor records",
      "Support Traffic with hire vendor data",
    ],
    steps: [
      {
        title: "Raise a PO",
        href: "/procurement",
        screen: "Procurement",
        doThis: "+ PO for packaging or tyres. Advance Order → Receive → Close.",
        lookFor: "Status pipeline on the PO row",
      },
      {
        title: "Vendors",
        href: "/vendors",
        screen: "Vendors",
        doThis: "Review or add a transport / supply vendor.",
        lookFor: "GSTIN + type",
      },
      {
        title: "Hire cost lane",
        href: "/vendor-costs",
        screen: "THC & BTH",
        doThis: "See how Traffic’s THC appears for settlement.",
        lookFor: "BTH after POD for balance hire",
      },
    ],
    receivesFrom: [
      {
        role: "fleet",
        artifact: "Spares demand",
        why: "Fleet asks for tyres / parts",
      },
      {
        role: "warehouse",
        artifact: "Packaging demand",
        why: "Hub consumables",
      },
    ],
    handsOffTo: [
      {
        role: "fleet",
        artifact: "Received spares",
        why: "Goods receipt closes the PO into Fleet use",
      },
      {
        role: "warehouse",
        artifact: "Received packaging",
        why: "Hub stocks packing material",
      },
    ],
    worksWith: [
      {
        role: "traffic",
        artifact: "Vendor hire (THC)",
        why: "Parallel finance — not a dispatch handoff",
      },
    ],
  },
  {
    role: "hr",
    title: "HR Executive",
    group: "Resources",
    homeHref: "/hr",
    minutes: 6,
    about:
      "People lane — employees, leave, payroll. Does not sit on the shipment spine. Joiners/leavers hand access work to IT.",
    features: [
      "Employee create / edit / soft-exit",
      "Leave approve / reject",
      "Process payroll run",
      "Employee portal",
    ],
    youWorkOn: [
      "Add an employee",
      "Approve a leave request",
      "Process a payroll run",
    ],
    steps: [
      {
        title: "Employees",
        href: "/hr",
        screen: "HR & Payroll",
        doThis: "+ Employee for a hub role. Save.",
        lookFor: "Employee appears in register",
      },
      {
        title: "Leave",
        href: "/hr",
        screen: "HR · Leave",
        doThis: "Approve or reject a pending leave.",
        lookFor: "Status update + toast",
      },
      {
        title: "Payroll",
        href: "/hr",
        screen: "HR · Payroll",
        doThis: "Process payroll run.",
        lookFor: "Run marked processed",
      },
    ],
    receivesFrom: [
      {
        role: "management",
        artifact: "Headcount plan",
        why: "Hiring authorized by leadership",
      },
    ],
    handsOffTo: [
      {
        role: "it",
        artifact: "Joiner / leaver identity",
        why: "IT grants or revokes ERP login access",
      },
    ],
    worksWith: [
      {
        role: "admin",
        artifact: "Role templates",
        why: "Access patterns for new hires",
      },
    ],
  },
  {
    role: "it",
    title: "IT Helpdesk",
    group: "Governance",
    homeHref: "/admin",
    minutes: 5,
    about:
      "Access and audit steward. Turns HR join/exit into working (or revoked) accounts. Same Administration surfaces as Admin for access work.",
    features: [
      "Administration — users & roles",
      "Audit logs",
      "Employee portal support",
    ],
    youWorkOn: [
      "Enable a user or set module override",
      "Disable a leaver",
      "Verify audit after access change",
    ],
    steps: [
      {
        title: "User access",
        href: "/admin",
        screen: "Administration · Users",
        doThis: "Pick a hub user. Toggle a module or disable login.",
        lookFor: "Sidebar / login respect grants immediately",
      },
      {
        title: "Audit proof",
        href: "/audit",
        screen: "Audit",
        doThis: "Find Administration events.",
        lookFor: "Who changed what",
      },
    ],
    receivesFrom: [
      {
        role: "hr",
        artifact: "Join / exit request",
        why: "People events drive access",
      },
      {
        role: "admin",
        artifact: "Role templates",
        why: "Defaults for new accounts",
      },
    ],
    handsOffTo: [
      {
        role: "booking",
        artifact: "Working login for ops staff",
        why: "Example — clerk can book after enable",
      },
    ],
    worksWith: [
      {
        role: "support",
        artifact: "Access tickets",
        why: "Password / unlock style requests in demo narrative",
      },
    ],
  },
  {
    role: "legal",
    title: "Legal & Compliance",
    group: "Governance",
    homeHref: "/compliance",
    minutes: 5,
    about:
      "Licenses, renewals and contract hygiene. Feeds Sales/Booking with clean commercial documents — not a dispatch step.",
    features: [
      "Compliance documents create / renew",
      "Contracts & tariffs",
      "Audit",
      "Customer legal context",
    ],
    youWorkOn: [
      "Add or renew a compliance document",
      "Review customer contracts",
    ],
    steps: [
      {
        title: "Compliance register",
        href: "/compliance",
        screen: "Compliance",
        doThis: "+ Document or Start / Complete renewal.",
        lookFor: "Renewal status changes",
      },
      {
        title: "Contracts",
        href: "/contracts",
        screen: "Contracts",
        doThis: "Review Meridian tariff; note zoning tab.",
        lookFor: "Approved contracts used at booking",
      },
    ],
    receivesFrom: [
      {
        role: "sales",
        artifact: "Draft commercial terms",
        why: "Legal reviews before go-live",
      },
    ],
    handsOffTo: [
      {
        role: "sales",
        artifact: "Cleared contract / license",
        why: "Sales can promise rates safely",
      },
      {
        role: "booking",
        artifact: "Valid contracted modes",
        why: "Booking rates from approved tariffs",
      },
    ],
    worksWith: [
      {
        role: "admin",
        artifact: "Governance",
        why: "Org-level compliance posture",
      },
    ],
  },
];

/** Shipment money/ops spine — strict next */
export const OPS_SPINE: DemoRole[] = [
  "marketing",
  "sales",
  "booking",
  "warehouse",
  "traffic",
  "delivery",
  "pod",
  "billing",
  "collections",
];

export const OPS_SPINE_ARTIFACTS: string[] = [
  "Campaign lead",
  "Approved customer + contract",
  "Docket + scan label",
  "Scanned / manifested load",
  "Dispatched trip (+ THC)",
  "Delivered consignment",
  "Approved POD",
  "Tax invoice",
  "Receipt / settled AR",
];

export function tutorialFor(role: DemoRole): RoleTutorial | undefined {
  return ROLE_TUTORIALS.find((t) => t.role === role);
}

export function tutorialsByGroup() {
  const order: RoleTutorial["group"][] = [
    "Control",
    "Commercial",
    "Operations",
    "Finance",
    "Resources",
    "Governance",
  ];
  return order.map((group) => ({
    group,
    items: ROLE_TUTORIALS.filter((t) => t.group === group),
  }));
}
