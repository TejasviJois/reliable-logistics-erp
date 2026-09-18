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
  {
    id: "camp-4",
    name: "Mumbai Last-Mile Pilot",
    channel: "Google Ads + Field visits",
    budget: 220000,
    spent: 98000,
    leads: 34,
    qualified: 9,
    status: "live",
    roiNote: "Andheri BO pipeline · 3 site surveys booked",
  },
  {
    id: "camp-5",
    name: "Auto Ancillary Corridor",
    channel: "Industry meet + Print",
    budget: 95000,
    spent: 95000,
    leads: 28,
    qualified: 11,
    status: "completed",
    roiNote: "Nexus + ForgeWorks moved to quotation",
  },
  {
    id: "camp-6",
    name: "Retail Festive Stock-up",
    channel: "WhatsApp Business",
    budget: 75000,
    spent: 41000,
    leads: 52,
    qualified: 15,
    status: "live",
    roiNote: "RetailOne & Pearl Consumer warm leads",
  },
  {
    id: "camp-7",
    name: "Hyderabad Pharma Lane",
    channel: "Email nurture",
    budget: 60000,
    spent: 22000,
    leads: 19,
    qualified: 6,
    status: "live",
    roiNote: "Horizon Pharma discovery in progress",
  },
  {
    id: "camp-8",
    name: "North Hub Soft Launch",
    channel: "LinkedIn Sponsored",
    budget: 150000,
    spent: 0,
    leads: 0,
    qualified: 0,
    status: "planned",
    roiNote: "Kick-off after Diwali capacity settle",
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
  {
    id: "lead-5",
    company: "ForgeWorks Engineering",
    contact: "Karthik Subramanian",
    city: "Coimbatore",
    stage: "quotation",
    value: 380000,
    mode: "FTL",
    owner: "Sales",
    nextAction: "Confirm dedicated truck for weekly Guindy run",
    updatedAt: "2026-09-17T14:00:00+05:30",
  },
  {
    id: "lead-6",
    company: "RetailOne Distribution",
    contact: "Meera Joshi",
    city: "Bengaluru",
    stage: "negotiation",
    value: 540000,
    mode: "PTL",
    owner: "Sales",
    nextAction: "Counter on volumetric rate for Whitefield DC",
    updatedAt: "2026-09-18T08:30:00+05:30",
  },
  {
    id: "lead-7",
    company: "CityCare Hospitals Group",
    contact: "Dr. Ajay Kulkarni",
    city: "Mumbai",
    stage: "qualified",
    value: 310000,
    mode: "Express PTL",
    owner: "Sales",
    nextAction: "Share temperature-control SOP pack",
    updatedAt: "2026-09-16T11:45:00+05:30",
  },
  {
    id: "lead-8",
    company: "SilkRoute Textiles",
    contact: "Lakshmi Narayanan",
    city: "Coimbatore",
    stage: "new",
    value: 195000,
    mode: "PTL",
    owner: "Sales",
    nextAction: "Intro call — Tirupur finishing units",
    updatedAt: "2026-09-18T10:05:00+05:30",
  },
  {
    id: "lead-9",
    company: "ByteWare Systems",
    contact: "Arjun Reddy",
    city: "Hyderabad",
    stage: "won",
    value: 275000,
    mode: "PTL",
    owner: "Sales",
    nextAction: "Handoff to Booking — first ASN expected",
    updatedAt: "2026-09-14T16:20:00+05:30",
  },
  {
    id: "lead-10",
    company: "Apex Steel Traders",
    contact: "Senthil Kumar",
    city: "Chennai",
    stage: "lost",
    value: 480000,
    mode: "FTL",
    owner: "Sales",
    nextAction: "Closed — price lost to rail consolidator",
    updatedAt: "2026-09-12T12:00:00+05:30",
  },
  {
    id: "lead-11",
    company: "Valley Fresh Foods",
    contact: "Deepa Hegde",
    city: "Mysuru",
    stage: "qualified",
    value: 220000,
    mode: "Reefer PTL",
    owner: "Sales",
    nextAction: "Cold-room capacity check at BLR hub",
    updatedAt: "2026-09-17T09:40:00+05:30",
  },
  {
    id: "lead-12",
    company: "Western Edge Wholesalers",
    contact: "Farhan Qureshi",
    city: "Pune",
    stage: "new",
    value: 340000,
    mode: "PTL + FTL",
    owner: "Sales",
    nextAction: "Map Mumbai–Pune daily milk-run",
    updatedAt: "2026-09-18T11:15:00+05:30",
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
  {
    id: "qt-4",
    number: "QT-2026-0191",
    customer: "ForgeWorks Engineering",
    lane: "Coimbatore → Guindy",
    amount: 28600,
    status: "sent",
    validTill: "2026-10-05",
  },
  {
    id: "qt-5",
    number: "QT-2026-0194",
    customer: "RetailOne Distribution",
    lane: "Bengaluru → Mumbai",
    amount: 36500,
    status: "sent",
    validTill: "2026-10-08",
  },
  {
    id: "qt-6",
    number: "QT-2026-0180",
    customer: "CityCare Hospitals Group",
    lane: "Mumbai → Hyderabad",
    amount: 21400,
    status: "approved",
    validTill: "2026-10-20",
  },
  {
    id: "qt-7",
    number: "QT-2026-0155",
    customer: "GreenLane Agri Exports",
    lane: "Bengaluru → Kochi",
    amount: 15200,
    status: "expired",
    validTill: "2026-09-10",
  },
  {
    id: "qt-8",
    number: "QT-2026-0198",
    customer: "Valley Fresh Foods",
    lane: "Mysuru → Chennai",
    amount: 17800,
    status: "draft",
    validTill: "2026-09-28",
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
  {
    id: "emp-7",
    code: "EMP-1224",
    name: "Lakshmi Devi",
    role: "Traffic Coordinator",
    department: "Traffic",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2021-05-18",
    ctc: 540000,
  },
  {
    id: "emp-8",
    code: "EMP-1231",
    name: "Arun Krishnan",
    role: "POD Clerk",
    department: "POD",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2024-02-12",
    ctc: 390000,
  },
  {
    id: "emp-9",
    code: "EMP-1240",
    name: "Fatima Begum",
    role: "Collections Executive",
    department: "Collections",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2022-09-01",
    ctc: 470000,
  },
  {
    id: "emp-10",
    code: "EMP-1162",
    name: "Vignesh R",
    role: "Booking Clerk",
    department: "Booking",
    hub: "Chennai Hub",
    status: "active",
    joinDate: "2023-11-04",
    ctc: 450000,
  },
  {
    id: "emp-11",
    code: "EMP-1170",
    name: "Swathi Reddy",
    role: "Warehouse Supervisor",
    department: "Warehouse",
    hub: "Hyderabad Hub",
    status: "active",
    joinDate: "2020-07-20",
    ctc: 580000,
  },
  {
    id: "emp-12",
    code: "EMP-1255",
    name: "Rohan Desai",
    role: "Delivery Executive",
    department: "Delivery",
    hub: "Mumbai Hub",
    status: "active",
    joinDate: "2025-01-15",
    ctc: 380000,
  },
  {
    id: "emp-13",
    code: "EMP-1260",
    name: "Kavitha Nair",
    role: "HR Executive",
    department: "HR",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2021-02-08",
    ctc: 560000,
  },
  {
    id: "emp-14",
    code: "EMP-1268",
    name: "Sanjay Patil",
    role: "Fleet Mechanic",
    department: "Fleet",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2018-04-30",
    ctc: 430000,
  },
  {
    id: "emp-15",
    code: "EMP-1275",
    name: "Nisha Thomas",
    role: "Support Agent",
    department: "Support",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2024-09-09",
    ctc: 410000,
  },
  {
    id: "emp-16",
    code: "EMP-1282",
    name: "Harish Menon",
    role: "Procurement Officer",
    department: "Procurement",
    hub: "Bengaluru Hub",
    status: "active",
    joinDate: "2022-12-01",
    ctc: 500000,
  },
  {
    id: "emp-17",
    code: "EMP-1290",
    name: "Ayesha Khan",
    role: "Warehouse Operator",
    department: "Warehouse",
    hub: "Mumbai Hub",
    status: "onboarding",
    joinDate: "2026-09-10",
    ctc: 395000,
  },
  {
    id: "emp-18",
    code: "EMP-0912",
    name: "Gopalakrishnan S",
    role: "Traffic Manager",
    department: "Traffic",
    hub: "Chennai Hub",
    status: "exited",
    joinDate: "2016-06-15",
    ctc: 720000,
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
  {
    id: "lv-4",
    employee: "Murugan P",
    type: "CL",
    from: "2026-09-24",
    to: "2026-09-24",
    days: 1,
    status: "pending",
    reason: "School admission",
  },
  {
    id: "lv-5",
    employee: "Lakshmi Devi",
    type: "Comp-off",
    from: "2026-09-20",
    to: "2026-09-20",
    days: 1,
    status: "approved",
    reason: "Night dispatch cover",
  },
  {
    id: "lv-6",
    employee: "Swathi Reddy",
    type: "EL",
    from: "2026-10-10",
    to: "2026-10-14",
    days: 3,
    status: "pending",
    reason: "Wedding in family",
  },
  {
    id: "lv-7",
    employee: "Rohan Desai",
    type: "SL",
    from: "2026-09-18",
    to: "2026-09-18",
    days: 1,
    status: "rejected",
    reason: "Insufficient SL balance",
  },
  {
    id: "lv-8",
    employee: "Fatima Begum",
    type: "CL",
    from: "2026-09-26",
    to: "2026-09-26",
    days: 1,
    status: "pending",
    reason: "Bank work",
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
  {
    id: "pay-4",
    period: "Sep 2026",
    hub: "Hyderabad Hub",
    headcount: 28,
    gross: 1520000,
    net: 1285000,
    status: "draft",
  },
];

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po-1",
    number: "PO-2026-0441",
    vendor: "SafePack Packaging Supplies",
    category: "Cartons & stretch film",
    amount: 186000,
    status: "ordered",
    eta: "2026-09-21",
    hub: "Bengaluru Hub",
  },
  {
    id: "po-2",
    number: "PO-2026-0432",
    vendor: "National Spare Parts Co",
    category: "Tyre set — HCV",
    amount: 92000,
    status: "partial",
    eta: "2026-09-19",
    hub: "Bengaluru Hub",
  },
  {
    id: "po-3",
    number: "PO-2026-0428",
    vendor: "SafePack Packaging Supplies",
    category: "Barcode labels & thermal rolls",
    amount: 45000,
    status: "received",
    eta: "2026-09-12",
    hub: "Chennai Hub",
  },
  {
    id: "po-4",
    number: "PO-2026-0448",
    vendor: "National Spare Parts Co",
    category: "Filters & lubricants",
    amount: 38000,
    status: "draft",
    eta: "2026-09-25",
    hub: "Hyderabad Hub",
  },
  {
    id: "po-5",
    number: "PO-2026-0451",
    vendor: "Deccan Cold Chain",
    category: "Reefer hire — festive week",
    amount: 210000,
    status: "ordered",
    eta: "2026-09-28",
    hub: "Bengaluru Hub",
  },
  {
    id: "po-6",
    number: "PO-2026-0455",
    vendor: "Metro Last Mile",
    category: "Last-mile van contract — Mumbai",
    amount: 165000,
    status: "ordered",
    eta: "2026-09-22",
    hub: "Mumbai Hub",
  },
  {
    id: "po-7",
    number: "PO-2026-0460",
    vendor: "Coastal Hire Trucks",
    category: "FTL hire — CHN–MUM corridor",
    amount: 98000,
    status: "partial",
    eta: "2026-09-20",
    hub: "Chennai Hub",
  },
  {
    id: "po-8",
    number: "PO-2026-0462",
    vendor: "BlueLine Market Trucks",
    category: "Market trip cover — Whitefield",
    amount: 72000,
    status: "received",
    eta: "2026-09-15",
    hub: "Bengaluru Hub",
  },
  {
    id: "po-9",
    number: "PO-2026-0468",
    vendor: "Deccan Haulage Partners",
    category: "Line-haul support — Hosur",
    amount: 145000,
    status: "closed",
    eta: "2026-09-10",
    hub: "Bengaluru Hub",
  },
  {
    id: "po-10",
    number: "PO-2026-0471",
    vendor: "Southern Fleet Own",
    category: "Workshop consumables",
    amount: 28000,
    status: "draft",
    eta: "2026-09-30",
    hub: "Bengaluru Hub",
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
  {
    id: "cd-6",
    title: "GST registration — Maharashtra",
    entity: "Reliable Logistics — Mumbai",
    type: "gst",
    expiry: "2027-03-31",
    status: "valid",
    owner: "Legal",
  },
  {
    id: "cd-7",
    title: "Fitness certificate",
    entity: "Fleet — TN09CD7788",
    type: "permit",
    expiry: "2026-10-15",
    status: "expiring",
    owner: "Fleet",
  },
  {
    id: "cd-8",
    title: "Chennai warehouse fire NOC",
    entity: "Chennai Hub",
    type: "license",
    expiry: "2026-11-30",
    status: "valid",
    owner: "Legal",
  },
  {
    id: "cd-9",
    title: "SouthPack rate contract",
    entity: "cus-southpack",
    type: "contract",
    expiry: "2027-01-15",
    status: "valid",
    owner: "Legal",
  },
  {
    id: "cd-10",
    title: "Motor third-party insurance",
    entity: "Fleet — MH12EF3344",
    type: "insurance",
    expiry: "2026-09-22",
    status: "pending_renewal",
    owner: "Fleet",
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
