"use client";

import { create } from "zustand";
import {
  campaigns as seedCampaigns,
  salesLeads as seedLeads,
  quotations as seedQuotations,
  employees as seedEmployees,
  leaveRequests as seedLeave,
  payrollRuns as seedPayroll,
  purchaseOrders as seedPOs,
  complianceDocs as seedCompliance,
  type Campaign,
  type SalesLead,
  type Quotation,
  type EmployeeRecord,
  type LeaveRequest,
  type PayrollRun,
  type PurchaseOrder,
  type ComplianceDoc,
} from "@/data/role-work";
import { useDemoStore } from "@/store/demo-store";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function audit(
  module: string,
  entityType: string,
  entityId: string,
  action: string,
  previous = "—",
  next = "—"
) {
  useDemoStore.getState().pushAudit({
    user: "Demo Operator",
    module,
    entityType,
    entityId,
    action,
    previous,
    next,
  });
}

interface DeptState {
  campaigns: Campaign[];
  leads: SalesLead[];
  quotations: Quotation[];
  employees: EmployeeRecord[];
  leaveRequests: LeaveRequest[];
  payrollRuns: PayrollRun[];
  purchaseOrders: PurchaseOrder[];
  complianceDocs: ComplianceDoc[];

  createCampaign: (input: Omit<Campaign, "id" | "spent" | "leads" | "qualified" | "status"> & { status?: Campaign["status"] }) => string;
  updateCampaign: (id: string, patch: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  launchCampaign: (id: string) => void;
  completeCampaign: (id: string) => void;

  createLead: (input: Omit<SalesLead, "id" | "updatedAt" | "stage"> & { stage?: SalesLead["stage"] }) => string;
  updateLead: (id: string, patch: Partial<SalesLead>) => void;
  deleteLead: (id: string) => void;
  advanceLead: (id: string) => void;
  handoffLead: (id: string) => void;

  createQuotation: (input: Omit<Quotation, "id" | "number" | "status"> & { status?: Quotation["status"] }) => string;
  updateQuotation: (id: string, patch: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;

  createEmployee: (input: Omit<EmployeeRecord, "id" | "code" | "status"> & { status?: EmployeeRecord["status"] }) => string;
  updateEmployee: (id: string, patch: Partial<EmployeeRecord>) => void;
  exitEmployee: (id: string) => void;

  decideLeave: (id: string, status: "approved" | "rejected") => void;

  processPayroll: (id: string) => void;

  createPO: (input: Omit<PurchaseOrder, "id" | "number" | "status"> & { status?: PurchaseOrder["status"] }) => string;
  updatePO: (id: string, patch: Partial<PurchaseOrder>) => void;
  deletePO: (id: string) => void;
  advancePO: (id: string) => void;

  createComplianceDoc: (input: Omit<ComplianceDoc, "id" | "status"> & { status?: ComplianceDoc["status"] }) => string;
  updateComplianceDoc: (id: string, patch: Partial<ComplianceDoc>) => void;
  deleteComplianceDoc: (id: string) => void;
  startRenewal: (id: string) => void;
  completeRenewal: (id: string) => void;
}

const LEAD_STAGES: SalesLead["stage"][] = [
  "new",
  "qualified",
  "quotation",
  "negotiation",
  "won",
];

const PO_FLOW: PurchaseOrder["status"][] = [
  "draft",
  "ordered",
  "partial",
  "received",
  "closed",
];

export const useDeptStore = create<DeptState>((set, get) => ({
  campaigns: seedCampaigns,
  leads: seedLeads,
  quotations: seedQuotations,
  employees: seedEmployees,
  leaveRequests: seedLeave,
  payrollRuns: seedPayroll,
  purchaseOrders: seedPOs,
  complianceDocs: seedCompliance,

  createCampaign: (input) => {
    const id = uid("camp");
    const campaign: Campaign = {
      id,
      name: input.name,
      channel: input.channel,
      budget: input.budget,
      spent: 0,
      leads: 0,
      qualified: 0,
      status: input.status ?? "planned",
      roiNote: input.roiNote || "New campaign",
    };
    set((s) => ({ campaigns: [campaign, ...s.campaigns] }));
    audit("Marketing", "Campaign", campaign.name, "Created campaign", "—", campaign.status);
    return id;
  },

  updateCampaign: (id, patch) => {
    set((s) => ({
      campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    audit("Marketing", "Campaign", id, "Updated campaign");
  },

  deleteCampaign: (id) => {
    const c = get().campaigns.find((x) => x.id === id);
    set((s) => ({ campaigns: s.campaigns.filter((x) => x.id !== id) }));
    audit("Marketing", "Campaign", c?.name ?? id, "Deleted campaign", c?.status, "Removed");
  },

  launchCampaign: (id) => {
    set((s) => ({
      campaigns: s.campaigns.map((c) =>
        c.id === id && c.status === "planned" ? { ...c, status: "live" } : c
      ),
    }));
    audit("Marketing", "Campaign", id, "Launched campaign", "planned", "live");
  },

  completeCampaign: (id) => {
    set((s) => ({
      campaigns: s.campaigns.map((c) =>
        c.id === id && c.status === "live" ? { ...c, status: "completed" } : c
      ),
    }));
    audit("Marketing", "Campaign", id, "Completed campaign", "live", "completed");
  },

  createLead: (input) => {
    const id = uid("lead");
    const lead: SalesLead = {
      id,
      company: input.company,
      contact: input.contact,
      city: input.city,
      stage: input.stage ?? "new",
      value: input.value,
      mode: input.mode,
      owner: input.owner || "Sales",
      nextAction: input.nextAction || "Discovery call",
      updatedAt: nowIso(),
    };
    set((s) => ({ leads: [lead, ...s.leads] }));
    audit("CRM", "Lead", lead.company, "Created lead", "—", lead.stage);
    return id;
  },

  updateLead: (id, patch) => {
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === id ? { ...l, ...patch, updatedAt: nowIso() } : l
      ),
    }));
    audit("CRM", "Lead", id, "Updated lead");
  },

  deleteLead: (id) => {
    const l = get().leads.find((x) => x.id === id);
    set((s) => ({ leads: s.leads.filter((x) => x.id !== id) }));
    audit("CRM", "Lead", l?.company ?? id, "Deleted lead", l?.stage, "Removed");
  },

  advanceLead: (id) => {
    const lead = get().leads.find((x) => x.id === id);
    if (!lead || lead.stage === "won" || lead.stage === "lost") return;
    const idx = LEAD_STAGES.indexOf(lead.stage);
    const next = LEAD_STAGES[Math.min(idx + 1, LEAD_STAGES.length - 1)];
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === id ? { ...l, stage: next, updatedAt: nowIso() } : l
      ),
    }));
    audit("CRM", "Lead", lead.company, "Advanced stage", lead.stage, next);
  },

  handoffLead: (id) => {
    const lead = get().leads.find((x) => x.id === id);
    if (!lead) return;
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === id
          ? {
              ...l,
              stage: l.stage === "new" ? "qualified" : l.stage,
              owner: "Sales",
              nextAction: "Sales ownership — convert to quotation",
              updatedAt: nowIso(),
            }
          : l
      ),
    }));
    audit("Marketing", "Lead", lead.company, "Handed off to Sales", lead.owner, "Sales");
  },

  createQuotation: (input) => {
    const id = uid("qt");
    const number = `QT-2026-${String(200 + get().quotations.length).padStart(4, "0")}`;
    const q: Quotation = {
      id,
      number,
      customer: input.customer,
      lane: input.lane,
      amount: input.amount,
      status: input.status ?? "draft",
      validTill: input.validTill,
    };
    set((s) => ({ quotations: [q, ...s.quotations] }));
    audit("CRM", "Quotation", q.number, "Created quotation", "—", q.status);
    return id;
  },

  updateQuotation: (id, patch) => {
    set((s) => ({
      quotations: s.quotations.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    }));
    audit("CRM", "Quotation", id, "Updated quotation");
  },

  deleteQuotation: (id) => {
    const q = get().quotations.find((x) => x.id === id);
    set((s) => ({ quotations: s.quotations.filter((x) => x.id !== id) }));
    audit("CRM", "Quotation", q?.number ?? id, "Deleted quotation");
  },

  createEmployee: (input) => {
    const id = uid("emp");
    const code = `EMP-${1100 + get().employees.length}`;
    const emp: EmployeeRecord = {
      id,
      code,
      name: input.name,
      role: input.role,
      department: input.department,
      hub: input.hub,
      status: input.status ?? "onboarding",
      joinDate: input.joinDate || nowIso().slice(0, 10),
      ctc: input.ctc,
    };
    set((s) => ({ employees: [emp, ...s.employees] }));
    audit("HR", "Employee", emp.code, "Created employee", "—", emp.status);
    return id;
  },

  updateEmployee: (id, patch) => {
    set((s) => ({
      employees: s.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
    audit("HR", "Employee", id, "Updated employee");
  },

  exitEmployee: (id) => {
    set((s) => ({
      employees: s.employees.map((e) =>
        e.id === id ? { ...e, status: "exited" } : e
      ),
    }));
    audit("HR", "Employee", id, "Marked exited", "active", "exited");
  },

  decideLeave: (id, status) => {
    const lv = get().leaveRequests.find((x) => x.id === id);
    set((s) => ({
      leaveRequests: s.leaveRequests.map((l) =>
        l.id === id ? { ...l, status } : l
      ),
    }));
    audit("HR", "Leave", lv?.employee ?? id, `Leave ${status}`, "pending", status);
  },

  processPayroll: (id) => {
    const run = get().payrollRuns.find((x) => x.id === id);
    if (!run) return;
    const next =
      run.status === "draft"
        ? "processing"
        : run.status === "processing"
          ? "paid"
          : run.status;
    set((s) => ({
      payrollRuns: s.payrollRuns.map((p) =>
        p.id === id ? { ...p, status: next as PayrollRun["status"] } : p
      ),
    }));
    audit("HR", "Payroll", run.period, "Payroll advanced", run.status, next);
  },

  createPO: (input) => {
    const id = uid("po");
    const number = `PO-2026-${String(450 + get().purchaseOrders.length)}`;
    const po: PurchaseOrder = {
      id,
      number,
      vendor: input.vendor,
      category: input.category,
      amount: input.amount,
      status: input.status ?? "draft",
      eta: input.eta,
      hub: input.hub,
    };
    set((s) => ({ purchaseOrders: [po, ...s.purchaseOrders] }));
    audit("Procurement", "PO", po.number, "Created purchase order", "—", po.status);
    return id;
  },

  updatePO: (id, patch) => {
    set((s) => ({
      purchaseOrders: s.purchaseOrders.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    }));
    audit("Procurement", "PO", id, "Updated PO");
  },

  deletePO: (id) => {
    const po = get().purchaseOrders.find((x) => x.id === id);
    if (po && po.status !== "draft") return;
    set((s) => ({
      purchaseOrders: s.purchaseOrders.filter((x) => x.id !== id),
    }));
    audit("Procurement", "PO", po?.number ?? id, "Deleted draft PO");
  },

  advancePO: (id) => {
    const po = get().purchaseOrders.find((x) => x.id === id);
    if (!po || po.status === "closed") return;
    const idx = PO_FLOW.indexOf(po.status);
    const next = PO_FLOW[Math.min(idx + 1, PO_FLOW.length - 1)];
    set((s) => ({
      purchaseOrders: s.purchaseOrders.map((p) =>
        p.id === id ? { ...p, status: next } : p
      ),
    }));
    audit("Procurement", "PO", po.number, "Advanced PO", po.status, next);
  },

  createComplianceDoc: (input) => {
    const id = uid("cd");
    const doc: ComplianceDoc = {
      id,
      title: input.title,
      entity: input.entity,
      type: input.type,
      expiry: input.expiry,
      status: input.status ?? "valid",
      owner: input.owner || "Legal",
    };
    set((s) => ({ complianceDocs: [doc, ...s.complianceDocs] }));
    audit("Compliance", "Document", doc.title, "Created compliance document");
    return id;
  },

  updateComplianceDoc: (id, patch) => {
    set((s) => ({
      complianceDocs: s.complianceDocs.map((d) =>
        d.id === id ? { ...d, ...patch } : d
      ),
    }));
    audit("Compliance", "Document", id, "Updated document");
  },

  deleteComplianceDoc: (id) => {
    const d = get().complianceDocs.find((x) => x.id === id);
    set((s) => ({
      complianceDocs: s.complianceDocs.filter((x) => x.id !== id),
    }));
    audit("Compliance", "Document", d?.title ?? id, "Deleted document");
  },

  startRenewal: (id) => {
    set((s) => ({
      complianceDocs: s.complianceDocs.map((d) =>
        d.id === id ? { ...d, status: "pending_renewal" } : d
      ),
    }));
    audit("Compliance", "Document", id, "Started renewal", "—", "pending_renewal");
  },

  completeRenewal: (id) => {
    const d = get().complianceDocs.find((x) => x.id === id);
    const nextYear = d
      ? `${Number(d.expiry.slice(0, 4)) + 1}${d.expiry.slice(4)}`
      : "2027-12-31";
    set((s) => ({
      complianceDocs: s.complianceDocs.map((doc) =>
        doc.id === id
          ? { ...doc, status: "valid", expiry: nextYear }
          : doc
      ),
    }));
    audit("Compliance", "Document", id, "Completed renewal", "pending_renewal", "valid");
  },
}));
