import type { DemoRole } from "@/data/demo-users";

export interface SalesLead {
  id: string;
  company: string;
  contact: string;
  city: string;
  stage: "new" | "qualified" | "quotation" | "negotiation" | "won" | "lost";
  value: number;
  mode: string;
  owner: string;
  nextAction: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  number: string;
  customer: string;
  lane: string;
  amount: number;
  status: "draft" | "sent" | "approved" | "expired";
  validTill: string;
}

export interface EmployeeRecord {
  id: string;
  code: string;
  name: string;
  role: string;
  department: string;
  hub: string;
  status: "active" | "onboarding" | "notice" | "exited";
  joinDate: string;
  ctc: number;
}

export interface LeaveRequest {
  id: string;
  employee: string;
  type: "CL" | "SL" | "EL" | "Comp-off";
  from: string;
  to: string;
  days: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
}

export interface PayrollRun {
  id: string;
  period: string;
  hub: string;
  headcount: number;
  gross: number;
  net: number;
  status: "draft" | "processing" | "paid";
}

export interface PurchaseOrder {
  id: string;
  number: string;
  vendor: string;
  category: string;
  amount: number;
  status: "draft" | "ordered" | "partial" | "received" | "closed";
  eta: string;
  hub: string;
}

export interface ComplianceDoc {
  id: string;
  title: string;
  entity: string;
  type: "license" | "insurance" | "gst" | "contract" | "permit";
  expiry: string;
  status: "valid" | "expiring" | "expired" | "pending_renewal";
  owner: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  spent: number;
  leads: number;
  qualified: number;
  status: "planned" | "live" | "completed";
  roiNote: string;
}

export const campaigns: Campaign[] = [
  {
    id: "camp-1",
    name: "South Hub PTL Push Q3",
    channel: "LinkedIn + Trade shows",
    budget: 450000,
    spent: 312000,
    leads: 86,
    qualified: 24,
    status: "live",
    roiNote: "Handoff to Sales — 4 open opportunities",
  },
  {
    id: "camp-2",
    name: "Pharma Cold-chain Awareness",
    channel: "Email + Webinar",
    budget: 180000,
    spent: 180000,
    leads: 41,
    qualified: 12,
    status: "completed",
    roiNote: "2 converted customers · Orbit Pharma pipeline",
  },
  {
    id: "camp-3",
    name: "Diwali Surface Capacity",
    channel: "WhatsApp + SMS",
    budget: 120000,
    spent: 0,
    leads: 0,
    qualified: 0,
    status: "planned",
    roiNote: "Launch week of 29 Sep",
  },
];

export const salesLeads: SalesLead[] = [
  {
    id: "lead-1",
    company: "Nexus Autocomponents",
    contact: "Vikram Shah",
    city: "Bengaluru",
    stage: "quotation",
    value: 420000,
    mode: "PTL + FTL",
    owner: "Sales",
    nextAction: "Send revised quote for Hosur lane",
    updatedAt: "2026-09-17T11:20:00+05:30",
  },
  {
    id: "lead-2",
    company: "Coastal Retail Alliance",
    contact: "Neha Shah",
    city: "Mumbai",
    stage: "negotiation",
    value: 890000,
    mode: "PTL",
    owner: "Sales",
    nextAction: "Await commercial approval on credit terms",
    updatedAt: "2026-09-16T16:40:00+05:30",
  },
  {
    id: "lead-3",
    company: "GreenLeaf Agro Exports",
    contact: "Ravi Menon",
    city: "Chennai",
    stage: "qualified",
    value: 260000,
    mode: "Reefer PTL",
    owner: "Sales",
    nextAction: "Site survey at Ambattur cold store",
    updatedAt: "2026-09-15T10:05:00+05:30",
  },
  {
    id: "lead-4",
    company: "Deccan Diagnostics",
    contact: "Sana Mirza",
    city: "Hyderabad",
    stage: "new",
    value: 150000,
    mode: "AIR + PTL",
    owner: "Sales",
    nextAction: "Discovery call — lab sample lanes",
    updatedAt: "2026-09-18T09:10:00+05:30",
  },
];

export const quotations: Quotation[] = [
  {
    id: "qt-1",
    number: "QT-2026-0188",
    customer: "Nexus Autocomponents",
    lane: "Bengaluru → Hosur",
    amount: 18500,
    status: "sent",
    validTill: "2026-09-30",
  },
  {
    id: "qt-2",
    number: "QT-2026-0172",
    customer: "Coastal Retail Alliance",
    lane: "Mumbai → Chennai",
    amount: 42000,
    status: "approved",
    validTill: "2026-10-15",
  },
  {
    id: "qt-3",
    number: "QT-2026-0161",
    customer: "Orbit Pharma Distributors",
    lane: "Hyderabad → Bengaluru",
    amount: 9800,
    status: "draft",
    validTill: "2026-09-25",
  },
];

export const employees: EmployeeRecord[] = [
  {
    id: "emp-1",
    code: "EMP-1042",
    name: "Suresh Rao",
    role: "Warehouse Operator",
    department: "Warehouse",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2022-03-14",
    ctc: 420000,
  },
  {
    id: "emp-2",
    code: "EMP-1108",
    name: "Priya Nair",
    role: "Booking Clerk",
    department: "Booking",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2023-01-09",
    ctc: 480000,
  },
  {
    id: "emp-3",
    code: "EMP-1188",
    name: "Imran Shaikh",
    role: "Delivery Executive",
    department: "Delivery",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2024-06-01",
    ctc: 360000,
  },
  {
    id: "emp-4",
    code: "EMP-1210",
    name: "Ananya Kulkarni",
    role: "Sales Associate",
    department: "Sales",
    hub: "Bengaluru Hub",
    status: "onboarding",
    joinDate: "2026-09-15",
    ctc: 520000,
  },
  {
    id: "emp-5",
    code: "EMP-0988",
    name: "Ramesh Iyer",
    role: "Accounts Executive",
    department: "Billing",
    hub: "Bengaluru Hub",
    status: "notice",
    joinDate: "2019-11-20",
    ctc: 610000,
  },
  {
    id: "emp-6",
    code: "EMP-1155",
    name: "Murugan P",
    role: "Warehouse Operator",
    department: "Warehouse",
    hub: "Chennai Hub",
    status: "active",
    joinDate: "2023-08-22",
    ctc: 400000,
  },
];

export const leaveRequests: LeaveRequest[] = [
  {
    id: "lv-1",
    employee: "Suresh Rao",
    type: "CL",
    from: "2026-09-22",
    to: "2026-09-22",
    days: 1,
    status: "pending",
    reason: "Personal errand",
  },
  {
    id: "lv-2",
    employee: "Priya Nair",
    type: "EL",
    from: "2026-10-02",
    to: "2026-10-06",
    days: 3,
    status: "pending",
    reason: "Family travel",
  },
  {
    id: "lv-3",
    employee: "Imran Shaikh",
    type: "SL",
    from: "2026-09-16",
    to: "2026-09-17",
    days: 2,
    status: "approved",
    reason: "Fever",
  },
];

export const payrollRuns: PayrollRun[] = [
  {
    id: "pay-1",
    period: "Aug 2026",
    hub: "Bengaluru Hub",
    headcount: 48,
    gross: 2850000,
    net: 2410000,
    status: "paid",
  },
  {
    id: "pay-2",
    period: "Sep 2026",
    hub: "Bengaluru Hub",
    headcount: 49,
    gross: 2915000,
    net: 2468000,
    status: "processing",
  },
  {
    id: "pay-3",
    period: "Sep 2026",
    hub: "Chennai Hub",
    headcount: 36,
    gross: 1980000,
    net: 1675000,
    status: "draft",
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1",
    number: "PO-2026-0441",
    vendor: "SafePack Packaging",
    category: "Cartons & stretch film",
    amount: 186000,
    status: "ordered",
    eta: "2026-09-21",
    hub: "Bengaluru Hub",
  },
  {
    id: "po-2",
    number: "PO-2026-0432",
    vendor: "FleetCare Tyres",
    category: "Tyre set — HCV",
    amount: 92000,
    status: "partial",
    eta: "2026-09-19",
    hub: "Bengaluru Hub",
  },
  {
    id: "po-3",
    number: "PO-2026-0428",
    vendor: "ScanTech Devices",
    category: "Handheld barcode scanners",
    amount: 145000,
    status: "received",
    eta: "2026-09-12",
    hub: "Chennai Hub",
  },
  {
    id: "po-4",
    number: "PO-2026-0448",
    vendor: "OfficeKart Supplies",
    category: "Stationery / labels",
    amount: 24000,
    status: "draft",
    eta: "2026-09-25",
    hub: "Hyderabad Hub",
  },
];

export const complianceDocs: ComplianceDoc[] = [
  {
    id: "cd-1",
    title: "All-India National Permit",
    entity: "Fleet — KA01AB4521",
    type: "permit",
    expiry: "2026-10-08",
    status: "expiring",
    owner: "Legal",
  },
  {
    id: "cd-2",
    title: "GST registration — Karnataka",
    entity: "Reliable Logistics Solutions",
    type: "gst",
    expiry: "2027-03-31",
    status: "valid",
    owner: "Legal",
  },
  {
    id: "cd-3",
    title: "Goods-in-transit insurance",
    entity: "Network policy",
    type: "insurance",
    expiry: "2026-09-28",
    status: "expiring",
    owner: "Legal",
  },
  {
    id: "cd-4",
    title: "Warehouse trade license",
    entity: "Bengaluru Hub",
    type: "license",
    expiry: "2026-08-30",
    status: "expired",
    owner: "Legal",
  },
  {
    id: "cd-5",
    title: "Meridian MSA addendum",
    entity: "cus-meridian",
    type: "contract",
    expiry: "2026-12-31",
    status: "pending_renewal",
    owner: "Legal",
  },
];

export interface RoleQueueItem {
  id: string;
  title: string;
  meta: string;
  tone: "urgent" | "normal" | "done";
  href: string;
}

/** Today’s work chips for ops roles that already have live modules */
export function roleQueueFor(
  role: DemoRole,
  ctx: {
    docketsPendingScan: number;
    readyToDispatch: number;
    ofdCount: number;
    podPending: number;
    billable: number;
    openTickets: number;
    fleetExpiring: number;
  }
): RoleQueueItem[] {
  switch (role) {
    case "marketing":
      return [
        {
          id: "mk1",
          title: "1 campaign live",
          meta: "South Hub PTL Push · lead handoff to sales",
          tone: "urgent",
          href: "/marketing",
        },
        {
          id: "mk2",
          title: "Qualify new leads",
          meta: "Campaign → CRM opportunity pipeline",
          tone: "normal",
          href: "/crm",
        },
      ];
    case "sales":
      return [
        {
          id: "s1",
          title: "Pending customer approval",
          meta: "Coastal Retail Alliance — Admin approval",
          tone: "urgent",
          href: "/customers",
        },
        {
          id: "s2",
          title: "4 open opportunities",
          meta: "Quotations & account management",
          tone: "normal",
          href: "/crm",
        },
        {
          id: "s3",
          title: "Track booking performance",
          meta: "Assigned accounts",
          tone: "normal",
          href: "/bookings",
        },
      ];
    case "booking":
      return [
        {
          id: "b1",
          title: "Create dockets for confirmed orders",
          meta: "Sales handoff queue",
          tone: "urgent",
          href: "/bookings/new",
        },
        {
          id: "b2",
          title: "DK-10231 in warehouse",
          meta: "Meridian · track booking status",
          tone: "normal",
          href: "/bookings/dk-10231",
        },
      ];
    case "warehouse":
      return [
        {
          id: "w1",
          title: `${ctx.docketsPendingScan} dockets need scan`,
          meta: "Complete inbound / staging scans",
          tone: "urgent",
          href: "/warehouse",
        },
        {
          id: "w2",
          title: "DK-10231 — 8/9 boxes scanned",
          meta: "Find BX-10231-09",
          tone: "urgent",
          href: "/warehouse",
        },
      ];
    case "traffic":
      return [
        {
          id: "t1",
          title: `${ctx.readyToDispatch} ready to dispatch`,
          meta: "Assign vehicle & confirm THC",
          tone: "urgent",
          href: "/traffic",
        },
        {
          id: "t2",
          title: "Monitor live trips",
          meta: "In-transit network view",
          tone: "normal",
          href: "/tracking",
        },
      ];
    case "delivery":
      return [
        {
          id: "d1",
          title: `${ctx.ofdCount} out for delivery`,
          meta: "Mark delivered / exception",
          tone: "urgent",
          href: "/delivery",
        },
      ];
    case "pod":
      return [
        {
          id: "p1",
          title: `${ctx.podPending} POD awaiting review`,
          meta: "Approve to unlock billing",
          tone: "urgent",
          href: "/pod",
        },
      ];
    case "support":
      return [
        {
          id: "su1",
          title: `${ctx.openTickets} open tickets`,
          meta: "Prioritize P1 SLA breaches",
          tone: "urgent",
          href: "/support",
        },
      ];
    case "billing":
      return [
        {
          id: "bi1",
          title: `${ctx.billable} dockets billable`,
          meta: "POD approved → billing queue → GST / e-invoice",
          tone: "urgent",
          href: "/billing",
        },
      ];
    case "collections":
      return [
        {
          id: "co1",
          title: "Outstanding / aging",
          meta: "Receipt → allocation → settlement",
          tone: "urgent",
          href: "/receivables",
        },
        {
          id: "co2",
          title: "Chase Meridian & SouthPack",
          meta: "Customer ledger follow-up",
          tone: "normal",
          href: "/customers",
        },
      ];
    case "fleet":
      return [
        {
          id: "f1",
          title: `${ctx.fleetExpiring} docs expiring`,
          meta: "Fitness / insurance / permit",
          tone: "urgent",
          href: "/fleet",
        },
        {
          id: "f2",
          title: "Vehicle readiness for dispatch",
          meta: "Coordinate with traffic",
          tone: "normal",
          href: "/traffic",
        },
      ];
    case "procurement":
      return [
        {
          id: "pr1",
          title: "2 POs awaiting delivery",
          meta: "Packaging & tyres",
          tone: "urgent",
          href: "/procurement",
        },
      ];
    case "hr":
      return [
        {
          id: "h1",
          title: "2 leave requests pending",
          meta: "Approve before roster lock",
          tone: "urgent",
          href: "/hr",
        },
        {
          id: "h2",
          title: "Sep payroll in processing",
          meta: "Bengaluru Hub · 49 employees",
          tone: "normal",
          href: "/hr",
        },
        {
          id: "h3",
          title: "1 onboarding in progress",
          meta: "Ananya Kulkarni — Sales",
          tone: "normal",
          href: "/hr",
        },
      ];
    case "it":
      return [
        {
          id: "i1",
          title: "Review user access",
          meta: "Offboarding — Ramesh Iyer notice",
          tone: "urgent",
          href: "/admin",
        },
        {
          id: "i2",
          title: "Audit trail check",
          meta: "Recent privileged actions",
          tone: "normal",
          href: "/audit",
        },
      ];
    case "legal":
      return [
        {
          id: "l1",
          title: "3 compliance items due",
          meta: "Permit, insurance, warehouse license",
          tone: "urgent",
          href: "/compliance",
        },
        {
          id: "l2",
          title: "Meridian MSA addendum",
          meta: "Pending commercial sign-off",
          tone: "normal",
          href: "/contracts",
        },
      ];
    case "management":
    case "admin":
      return [
        {
          id: "m1",
          title: "Network attention queue",
          meta: "Operations overview",
          tone: "urgent",
          href: "/",
        },
        {
          id: "m2",
          title: "Hub performance",
          meta: "MIS & reports",
          tone: "normal",
          href: "/reports",
        },
      ];
    default:
      return [];
  }
}
