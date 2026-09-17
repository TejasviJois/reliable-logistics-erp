import type { DemoRole } from "@/data/demo-users";

/** All controllable modules in the platform */
export const ACCESS_MODULES: {
  href: string;
  label: string;
  group: string;
}[] = [
  { href: "/", label: "Operations Overview", group: "Control" },
  { href: "/bookings", label: "Bookings", group: "Operations" },
  { href: "/warehouse", label: "Warehouse", group: "Operations" },
  { href: "/traffic", label: "Traffic & Dispatch", group: "Operations" },
  { href: "/tracking", label: "Live Tracking", group: "Operations" },
  { href: "/delivery", label: "Delivery", group: "Operations" },
  { href: "/pod", label: "POD", group: "Operations" },
  { href: "/support", label: "Support", group: "Operations" },
  { href: "/marketing", label: "Marketing", group: "Commercial" },
  { href: "/crm", label: "CRM & Sales", group: "Commercial" },
  { href: "/customers", label: "Customers", group: "Commercial" },
  { href: "/contracts", label: "Contracts & Tariffs", group: "Commercial" },
  { href: "/billing", label: "Billing", group: "Finance" },
  { href: "/receivables", label: "Receivables / Collections", group: "Finance" },
  { href: "/vendor-costs", label: "Vendor Costs (THC/BTH)", group: "Finance" },
  { href: "/fleet", label: "Fleet", group: "Resources" },
  { href: "/vendors", label: "Vendors", group: "Resources" },
  { href: "/procurement", label: "Procurement", group: "Resources" },
  { href: "/hr", label: "HR & Payroll", group: "Resources" },
  { href: "/admin", label: "Administration", group: "Governance" },
  { href: "/audit", label: "Audit", group: "Governance" },
  { href: "/reports", label: "Reports & MIS", group: "Governance" },
  { href: "/compliance", label: "Compliance", group: "Governance" },
  { href: "/portals/customer", label: "Customer Portal", group: "Portals" },
  { href: "/portals/employee", label: "Employee Portal", group: "Portals" },
];

export const ALL_MODULE_HREFS = ACCESS_MODULES.map((m) => m.href);

/** Default module grants — Logistics_ERP_User_Flows.pdf */
export const DEFAULT_ROLE_ACCESS: Record<DemoRole, string[]> = {
  admin: ["*"],
  management: ["*"],
  marketing: ["/marketing", "/crm", "/customers"],
  sales: ["/crm", "/customers", "/contracts", "/bookings"],
  booking: ["/bookings", "/customers", "/tracking", "/warehouse"],
  warehouse: ["/warehouse", "/bookings", "/tracking"],
  traffic: ["/traffic", "/tracking", "/fleet", "/vendor-costs"],
  delivery: ["/delivery", "/tracking", "/pod"],
  pod: ["/pod", "/delivery", "/billing", "/tracking"],
  support: ["/support", "/customers", "/tracking", "/bookings"],
  billing: ["/billing", "/pod", "/customers", "/contracts"],
  collections: ["/receivables", "/billing", "/customers"],
  fleet: ["/fleet", "/traffic", "/vendors", "/tracking"],
  procurement: ["/procurement", "/vendors", "/vendor-costs"],
  hr: ["/hr", "/portals/employee", "/admin"],
  it: ["/admin", "/audit", "/portals/employee"],
  legal: ["/compliance", "/contracts", "/audit", "/customers"],
};

export const ROLE_OPTIONS: { role: DemoRole; label: string }[] = [
  { role: "admin", label: "Admin / Super User" },
  { role: "management", label: "Management / MIS" },
  { role: "marketing", label: "Marketing" },
  { role: "sales", label: "Sales Executive" },
  { role: "booking", label: "Booking Clerk / Data Entry" },
  { role: "warehouse", label: "Warehouse / Hub Operator" },
  { role: "traffic", label: "Traffic Manager" },
  { role: "delivery", label: "Delivery / Field Operations" },
  { role: "pod", label: "POD Cell" },
  { role: "support", label: "Customer Support" },
  { role: "billing", label: "Billing / Accounts" },
  { role: "collections", label: "Accounts / Collections" },
  { role: "fleet", label: "Fleet Manager" },
  { role: "procurement", label: "Procurement" },
  { role: "hr", label: "HR Executive" },
  { role: "it", label: "IT Helpdesk" },
  { role: "legal", label: "Legal & Compliance" },
];

export function moduleLabel(href: string) {
  return ACCESS_MODULES.find((m) => m.href === href)?.label ?? href;
}

export function canAccessHref(navHrefs: string[], href: string) {
  if (navHrefs.includes("*")) return true;
  return navHrefs.some(
    (h) => href === h || (h !== "/" && href.startsWith(h + "/"))
  );
}
