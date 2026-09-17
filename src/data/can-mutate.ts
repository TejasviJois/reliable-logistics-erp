import type { DemoRole } from "@/data/demo-users";

export type MutateModule =
  | "marketing"
  | "crm"
  | "customers"
  | "fleet"
  | "procurement"
  | "hr"
  | "compliance"
  | "vendors"
  | "contracts"
  | "support";

const OWNERS: Record<MutateModule, DemoRole[]> = {
  marketing: ["marketing", "admin", "management"],
  crm: ["sales", "marketing", "admin", "management"],
  customers: ["sales", "admin", "management"],
  fleet: ["fleet", "admin", "management"],
  procurement: ["procurement", "admin", "management"],
  hr: ["hr", "admin", "management"],
  compliance: ["legal", "admin", "management"],
  vendors: ["procurement", "fleet", "admin", "management"],
  contracts: ["sales", "legal", "admin", "management"],
  support: ["support", "admin", "management"],
};

export function canMutate(
  role: DemoRole | undefined | null,
  module: MutateModule
) {
  if (!role) return false;
  return OWNERS[module].includes(role);
}
