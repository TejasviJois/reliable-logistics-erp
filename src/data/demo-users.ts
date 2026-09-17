export type DemoRole =
  | "admin"
  | "management"
  | "marketing"
  | "sales"
  | "booking"
  | "warehouse"
  | "traffic"
  | "delivery"
  | "pod"
  | "support"
  | "billing"
  | "collections"
  | "fleet"
  | "procurement"
  | "hr"
  | "it"
  | "legal";

export type DemoScope = "admin" | "br-blr" | "br-chn" | "br-hyd";

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: DemoRole;
  roleLabel: string;
  department: string;
  /** PDF primary flow summary */
  primaryFlow: string;
  initials: string;
  branchId: DemoScope;
  branchLabel: string;
  color: string;
  /** Exact sidebar hrefs; ["*"] = full platform */
  navHrefs: string[];
  homeHref: string;
}

export const DEMO_SCOPES: {
  id: DemoScope;
  label: string;
  description: string;
}[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Tenant-wide super user",
  },
  {
    id: "br-blr",
    label: "Bengaluru Hub",
    description: "South network origin hub",
  },
  {
    id: "br-chn",
    label: "Chennai Hub",
    description: "Tamil Nadu hub operations",
  },
  {
    id: "br-hyd",
    label: "Hyderabad Hub",
    description: "Telangana hub operations",
  },
];

const ALL_NAV = ["*"];

/** Aligned to Logistics_ERP_User_Flows.pdf ROLE → PRIMARY FLOW + department flows */
const ROLE_DEFS: Omit<
  DemoAccount,
  "id" | "email" | "branchId" | "branchLabel" | "name" | "initials" | "color"
>[] = [
  {
    role: "management",
    roleLabel: "Management / MIS",
    department: "Management",
    primaryFlow:
      "Operational + sales + finance data → MIS / executive dashboard → decisions",
    navHrefs: ALL_NAV,
    homeHref: "/",
  },
  {
    role: "marketing",
    roleLabel: "Marketing",
    department: "Marketing",
    primaryFlow:
      "Campaign → leads → qualification → handoff to sales → ROI attribution",
    navHrefs: ["/marketing", "/crm", "/customers", "/tutorials"],
    homeHref: "/marketing",
  },
  {
    role: "sales",
    roleLabel: "Sales Executive",
    department: "Sales",
    primaryFlow:
      "Customer creation → admin approval → account management → performance",
    navHrefs: ["/crm", "/customers", "/contracts", "/bookings", "/tutorials"],
    homeHref: "/customers",
  },
  {
    role: "booking",
    roleLabel: "Booking Clerk / Data Entry",
    department: "Booking",
    primaryFlow:
      "Booking source → docket → shipment details → docket creation",
    navHrefs: ["/bookings", "/customers", "/tracking", "/warehouse", "/tutorials"],
    homeHref: "/bookings",
  },
  {
    role: "warehouse",
    roleLabel: "Warehouse / Hub Operator",
    department: "Warehouse",
    primaryFlow: "Label → scan → inward → outward → manifest",
    navHrefs: ["/warehouse", "/bookings", "/tracking", "/tutorials"],
    homeHref: "/warehouse",
  },
  {
    role: "traffic",
    roleLabel: "Traffic Manager",
    department: "Traffic",
    primaryFlow:
      "Pending load → planning → vehicle / vendor → dispatch → transit · THC/BTH",
    navHrefs: ["/traffic", "/tracking", "/fleet", "/vendor-costs", "/tutorials"],
    homeHref: "/traffic",
  },
  {
    role: "delivery",
    roleLabel: "Delivery / Field Operations",
    department: "Delivery",
    primaryFlow:
      "Outward for delivery → delivery run → consignee → signed POD upload",
    navHrefs: ["/delivery", "/tracking", "/pod", "/tutorials"],
    homeHref: "/delivery",
  },
  {
    role: "pod",
    roleLabel: "POD Cell",
    department: "POD",
    primaryFlow:
      "POD intake → OCR / mapping → review → approve / reject → billing unlock",
    navHrefs: ["/pod", "/delivery", "/billing", "/tracking", "/tutorials"],
    homeHref: "/pod",
  },
  {
    role: "support",
    roleLabel: "Customer Support",
    department: "Support",
    primaryFlow:
      "Tracking → customer status → issues → charges → tickets / reports",
    navHrefs: ["/support", "/customers", "/tracking", "/bookings", "/tutorials"],
    homeHref: "/support",
  },
  {
    role: "billing",
    roleLabel: "Billing / Accounts",
    department: "Billing",
    primaryFlow:
      "Billing queue → freight / GST / e-invoice → invoice lock & distribute",
    navHrefs: ["/billing", "/pod", "/customers", "/contracts", "/tutorials"],
    homeHref: "/billing",
  },
  {
    role: "collections",
    roleLabel: "Accounts / Collections",
    department: "Collections",
    primaryFlow:
      "Receipt → allocation → settlement → outstanding / aging",
    navHrefs: ["/receivables", "/billing", "/customers", "/tutorials"],
    homeHref: "/receivables",
  },
  {
    role: "fleet",
    roleLabel: "Fleet Manager",
    department: "Fleet",
    primaryFlow:
      "Vehicle master → docs / expiry → availability → trip / maintenance",
    navHrefs: ["/fleet", "/traffic", "/vendors", "/tracking", "/tutorials"],
    homeHref: "/fleet",
  },
  {
    role: "procurement",
    roleLabel: "Procurement",
    department: "Procurement",
    primaryFlow:
      "PR → RFQ → PO → goods receipt → vendor bill → AP handoff",
    navHrefs: ["/procurement", "/vendors", "/vendor-costs", "/tutorials"],
    homeHref: "/procurement",
  },
  {
    role: "hr",
    roleLabel: "HR Executive",
    department: "HR",
    primaryFlow:
      "Employee master → attendance / leave → payroll → offboarding → IT access",
    navHrefs: ["/hr", "/portals/employee", "/admin", "/tutorials"],
    homeHref: "/hr",
  },
  {
    role: "it",
    roleLabel: "IT Helpdesk",
    department: "IT",
    primaryFlow:
      "Access / devices → support tickets → resolution → SLA · offboarding revoke",
    navHrefs: ["/admin", "/audit", "/portals/employee", "/tutorials"],
    homeHref: "/admin",
  },
  {
    role: "legal",
    roleLabel: "Legal & Compliance",
    department: "Legal",
    primaryFlow:
      "Licenses / agreements → expiry → renewal → contract review",
    navHrefs: ["/compliance", "/contracts", "/audit", "/customers", "/tutorials"],
    homeHref: "/compliance",
  },
];

const BRANCH_PEOPLE: Record<
  Exclude<DemoScope, "admin">,
  {
    prefix: string;
    city: string;
    people: {
      role: DemoRole;
      name: string;
      initials: string;
      color: string;
    }[];
  }
> = {
  "br-blr": {
    prefix: "blr",
    city: "Bengaluru",
    people: [
      { role: "management", name: "Anita Rao", initials: "AR", color: "#7c3aed" },
      { role: "marketing", name: "Rohini Das", initials: "RD", color: "#db2777" },
      { role: "sales", name: "Karthik Menon", initials: "KM", color: "#e31e24" },
      { role: "booking", name: "Priya Nair", initials: "PN", color: "#4b65af" },
      { role: "warehouse", name: "Suresh Rao", initials: "SR", color: "#0f766e" },
      { role: "traffic", name: "Anil Mehta", initials: "AM", color: "#c2410c" },
      { role: "delivery", name: "Imran Shaikh", initials: "IS", color: "#0369a1" },
      { role: "pod", name: "Kavya Iyer", initials: "KI", color: "#be185d" },
      { role: "support", name: "Deepa Krishnan", initials: "DK", color: "#4338ca" },
      { role: "billing", name: "Ramesh Iyer", initials: "RI", color: "#15803d" },
      { role: "collections", name: "Geetha Menon", initials: "GM", color: "#047857" },
      { role: "fleet", name: "Vijay Patil", initials: "VP", color: "#a16207" },
      { role: "procurement", name: "Sneha Reddy", initials: "SN", color: "#6d28d9" },
      { role: "hr", name: "Lakshmi Narayan", initials: "LN", color: "#9f1239" },
      { role: "it", name: "Arjun Desai", initials: "AD", color: "#1e40af" },
      { role: "legal", name: "Meera Joshi", initials: "MJ", color: "#374151" },
    ],
  },
  "br-chn": {
    prefix: "chn",
    city: "Chennai",
    people: [
      { role: "management", name: "Senthil Kumar", initials: "SK", color: "#7c3aed" },
      { role: "marketing", name: "Lavanya R", initials: "LR", color: "#db2777" },
      { role: "sales", name: "Divya Raman", initials: "DR", color: "#e31e24" },
      { role: "booking", name: "Aravindan S", initials: "AS", color: "#4b65af" },
      { role: "warehouse", name: "Murugan P", initials: "MP", color: "#0f766e" },
      { role: "traffic", name: "Balaji V", initials: "BV", color: "#c2410c" },
      { role: "delivery", name: "Faisal Ahmed", initials: "FA", color: "#0369a1" },
      { role: "pod", name: "Nithya Chandran", initials: "NC", color: "#be185d" },
      { role: "support", name: "Keerthana M", initials: "KM", color: "#4338ca" },
      { role: "billing", name: "Ganesh Babu", initials: "GB", color: "#15803d" },
      { role: "collections", name: "Padma S", initials: "PS", color: "#047857" },
      { role: "fleet", name: "Prakash G", initials: "PG", color: "#a16207" },
      { role: "procurement", name: "Aishwarya R", initials: "AI", color: "#6d28d9" },
      { role: "hr", name: "Shalini Devi", initials: "SD", color: "#9f1239" },
      { role: "it", name: "Vignesh K", initials: "VK", color: "#1e40af" },
      { role: "legal", name: "Radhika Nair", initials: "RN", color: "#374151" },
    ],
  },
  "br-hyd": {
    prefix: "hyd",
    city: "Hyderabad",
    people: [
      { role: "management", name: "Srinivas Reddy", initials: "SR", color: "#7c3aed" },
      { role: "marketing", name: "Preethi Rao", initials: "PR", color: "#db2777" },
      { role: "sales", name: "Fatima Begum", initials: "FB", color: "#e31e24" },
      { role: "booking", name: "Rohit Varma", initials: "RV", color: "#4b65af" },
      { role: "warehouse", name: "Naresh Goud", initials: "NG", color: "#0f766e" },
      { role: "traffic", name: "Kiran Teja", initials: "KT", color: "#c2410c" },
      { role: "delivery", name: "Sameer Khan", initials: "SK", color: "#0369a1" },
      { role: "pod", name: "Pallavi Rao", initials: "PL", color: "#be185d" },
      { role: "support", name: "Anusha Pillai", initials: "AP", color: "#4338ca" },
      { role: "billing", name: "Harish Chandra", initials: "HC", color: "#15803d" },
      { role: "collections", name: "Jyothi N", initials: "JN", color: "#047857" },
      { role: "fleet", name: "Manoj Yadav", initials: "MY", color: "#a16207" },
      { role: "procurement", name: "Swathi Naidu", initials: "SW", color: "#6d28d9" },
      { role: "hr", name: "Bhavana Rao", initials: "BR", color: "#9f1239" },
      { role: "it", name: "Nikhil Joshi", initials: "NJ", color: "#1e40af" },
      { role: "legal", name: "Ayesha Siddiqui", initials: "AY", color: "#374151" },
    ],
  },
};

function roleDef(role: DemoRole) {
  return ROLE_DEFS.find((r) => r.role === role)!;
}

export const ADMIN_ACCOUNT: DemoAccount = {
  id: "user-admin",
  name: "Demo Administrator",
  email: "admin@reliable.in",
  role: "admin",
  roleLabel: "Admin / Super User",
  department: "Administration",
  primaryFlow:
    "Org / branch setup → user / role → approvals → network monitoring → MIS → audit",
  initials: "DA",
  branchId: "admin",
  branchLabel: "All India",
  color: "#e31e24",
  navHrefs: ALL_NAV,
  homeHref: "/",
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  ADMIN_ACCOUNT,
  ...(["br-blr", "br-chn", "br-hyd"] as const).flatMap((branchId) => {
    const cfg = BRANCH_PEOPLE[branchId];
    const branchLabel =
      branchId === "br-blr"
        ? "Bengaluru Hub"
        : branchId === "br-chn"
          ? "Chennai Hub"
          : "Hyderabad Hub";
    return cfg.people.map((p) => {
      const def = roleDef(p.role);
      const localPart = `${def.role}.${cfg.prefix}`;
      return {
        id: `user-${cfg.prefix}-${p.role}`,
        name: p.name,
        email: `${localPart}@reliable.in`,
        role: p.role,
        roleLabel: def.roleLabel,
        department: def.department,
        primaryFlow: def.primaryFlow,
        initials: p.initials,
        branchId,
        branchLabel,
        color: p.color,
        navHrefs: def.navHrefs,
        homeHref: def.homeHref,
      } satisfies DemoAccount;
    });
  }),
];

export function accountsForScope(scope: DemoScope): DemoAccount[] {
  if (scope === "admin") return [ADMIN_ACCOUNT];
  return DEMO_ACCOUNTS.filter((a) => a.branchId === scope);
}

export function getAccountById(id: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find((a) => a.id === id);
}

export { ROLE_DEFS };
