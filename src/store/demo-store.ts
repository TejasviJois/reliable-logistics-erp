"use client";

import { create } from "zustand";
import {
  branches,
  contracts,
  customers as seedCustomers,
  drivers,
  seedAudit,
  seedBths,
  seedDockets,
  seedInvoices,
  seedManifests,
  seedNetworkLocations,
  seedPods,
  seedReceipts,
  seedTariffZones,
  seedThcs,
  seedTickets,
  seedTrips,
  seedWarehouseExceptions,
  users,
  vehicles as seedVehicles,
  vendors,
} from "@/data/seed";
import type {
  AuditEvent,
  BTH,
  Contract,
  Customer,
  Docket,
  HubScanEvent,
  Invoice,
  Manifest,
  NetworkLocation,
  POD,
  Receipt,
  RoleLens,
  TariffZone,
  THC,
  Ticket,
  Trip,
  Vehicle,
  Vendor,
  WarehouseException,
} from "@/types";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface DemoState {
  branchId: string;
  roleLens: RoleLens;
  customers: Customer[];
  dockets: Docket[];
  trips: Trip[];
  vehicles: Vehicle[];
  pods: POD[];
  invoices: Invoice[];
  receipts: Receipt[];
  tickets: Ticket[];
  thcs: THC[];
  bths: BTH[];
  manifests: Manifest[];
  warehouseExceptions: WarehouseException[];
  hubScans: HubScanEvent[];
  networkLocations: NetworkLocation[];
  tariffZones: TariffZone[];
  vendors: Vendor[];
  contracts: Contract[];
  audit: AuditEvent[];
  selectedDocketId: string | null;
  drawerOpen: boolean;
  scanMessage: string | null;

  setBranchId: (id: string) => void;
  setRoleLens: (role: RoleLens) => void;
  openDocketDrawer: (id: string) => void;
  closeDrawer: () => void;
  pushAudit: (event: Omit<AuditEvent, "id" | "at"> & { at?: string }) => void;

  createDocket: (input: {
    customerId: string;
    consignor: string;
    consignee: string;
    originCity: string;
    originPin: string;
    destinationCity: string;
    destinationPin: string;
    paymentMode: Docket["paymentMode"];
    transportMode: Docket["transportMode"];
    packages: number;
    actualWeightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    freight: number;
    invoiceNumber?: string;
    ewayBill?: string;
    riskType: string;
    edd: string;
  }) => { ok: true; id: string } | { ok: false; message: string };

  scanBox: (barcode: string) => {
    ok: boolean;
    message: string;
    docketId?: string;
  };

  dispatchTrip: (
    docketId: string,
    vehicleId: string
  ) => { ok: true } | { ok: false; message: string };
  markOutForDelivery: (docketId: string) => void;
  markDelivered: (docketId: string) => void;
  ingestPod: (docketId: string) => string;
  approvePod: (podId: string) => void;
  rejectPod: (podId: string) => void;
  requestPodReview: (podId: string) => void;
  approveCustomer: (customerId: string) => void;
  generateInvoice: (docketId: string) => string | null;
  recordReceipt: (invoiceId: string, amount: number) => void;
  createThc: (tripId: string) => void;

  createCustomer: (input: {
    name: string;
    city: string;
    contactPerson: string;
    email: string;
    phone: string;
    gstin?: string;
  }) => string;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  deactivateCustomer: (id: string) => void;

  createVehicle: (input: {
    registration: string;
    type: string;
    capacityKg: number;
    vendorId: string;
    driverId: string;
  }) => string;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  setVehicleMaintenance: (id: string) => void;
  renewVehicleDocs: (id: string) => void;

  createVendor: (input: {
    name: string;
    gstin: string;
    type: Vendor["type"];
    phone: string;
  }) => string;
  updateVendor: (id: string, patch: Partial<Vendor>) => void;
  deactivateVendor: (id: string) => void;

  createContract: (input: {
    customerId: string;
    mode: Contract["mode"];
    zone: string;
    ratePerKg: number;
    minFreight: number;
  }) => string;
  updateContract: (id: string, patch: Partial<Contract>) => void;
  deactivateContract: (id: string) => void;

  createTicket: (input: {
    subject: string;
    customerId: string;
    docketId?: string;
    severity: Ticket["severity"];
    category: string;
    owner: string;
  }) => string;
  assignTicket: (id: string, owner: string) => void;
  resolveTicket: (id: string) => void;
  closeTicket: (id: string) => void;

  recordHubScan: (input: {
    barcode: string;
    movement: HubScanEvent["movement"];
    hub: string;
    packages: number;
    weightKg?: number;
    condition: HubScanEvent["condition"];
    remarks?: string;
  }) => { ok: boolean; message: string; docketId?: string };
  createManifest: (input: {
    code?: string;
    vehicleReg: string;
    driverName: string;
    originHub: string;
    destinationHub: string;
    docketIds: string[];
  }) => string;
  raiseWarehouseException: (input: {
    docketId: string;
    scanCode: string;
    type: WarehouseException["type"];
    severity: WarehouseException["severity"];
    hub: string;
    remarks: string;
  }) => string;
  closeWarehouseException: (id: string) => void;

  approveThc: (id: string) => void;
  rejectThc: (id: string) => void;
  createBth: (input: {
    thcId: string;
    balanceAmount: number;
    podStatus: BTH["podStatus"];
    additionalType?: string;
    additionalAmount?: number;
  }) => string;
  payBth: (id: string, utr: string) => void;

  createNetworkLocation: (input: Omit<NetworkLocation, "id">) => string;
  createTariffZone: (input: Omit<TariffZone, "id">) => string;

  publishTripProgress: (
    tripId: string,
    input: { location: string; lat: number; lng: number; eta: string; message: string }
  ) => void;
  reportTripDelay: (tripId: string, reason: string) => void;
  markTripArrived: (tripId: string) => void;
  markTripDelivered: (tripId: string) => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  branchId: "br-blr",
  roleLens: "admin",
  customers: seedCustomers,
  dockets: seedDockets,
  trips: seedTrips,
  vehicles: seedVehicles,
  pods: seedPods,
  invoices: seedInvoices.filter((i) => i.id !== "inv-hero"),
  receipts: seedReceipts,
  tickets: seedTickets,
  thcs: seedThcs,
  bths: seedBths,
  manifests: seedManifests,
  warehouseExceptions: seedWarehouseExceptions,
  hubScans: [],
  networkLocations: seedNetworkLocations,
  tariffZones: seedTariffZones,
  vendors: vendors,
  contracts: contracts,
  audit: seedAudit,
  selectedDocketId: null,
  drawerOpen: false,
  scanMessage: null,

  setBranchId: (id) => set({ branchId: id }),
  setRoleLens: (role) => set({ roleLens: role }),
  openDocketDrawer: (id) => set({ selectedDocketId: id, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),

  pushAudit: (event) =>
    set((s) => ({
      audit: [
        {
          id: uid("aud"),
          at: event.at ?? nowIso(),
          user: event.user,
          module: event.module,
          entityType: event.entityType,
          entityId: event.entityId,
          action: event.action,
          previous: event.previous,
          next: event.next,
          remarks: event.remarks,
        },
        ...s.audit,
      ],
    })),

  createDocket: (input) => {
    const customer = get().customers.find((c) => c.id === input.customerId);
    if (!customer || customer.status !== "active") {
      get().pushAudit({
        user: "Demo Administrator",
        module: "Booking",
        entityType: "Customer",
        entityId: customer?.code ?? input.customerId,
        action: "Booking blocked — customer not Admin-approved",
        previous: customer?.status ?? "missing",
        next: "Blocked",
      });
      return {
        ok: false,
        message:
          "Gate: customer must be Admin-approved before booking. Approve the profile first.",
      };
    }
    if (!input.ewayBill?.trim() && input.actualWeightKg * input.freight > 50000) {
      /* soft warn only for high value — still require e-way string for demo clarity */
    }
    if (!input.ewayBill?.trim()) {
      return {
        ok: false,
        message: "Gate: e-way bill number is required before creating the docket.",
      };
    }

    const number = `DK-${10232 + get().dockets.length}`;
    const id = `dk-${number.slice(3)}`;
    const boxes = Array.from({ length: input.packages }, (_, i) => ({
      id: `${id}-box-${i + 1}`,
      barcode: `BX-${number.slice(3)}-${String(i + 1).padStart(2, "0")}`,
      scanned: false,
      status: "pending" as const,
    }));
    const volumetric =
      (input.lengthCm * input.widthCm * input.heightCm * input.packages) / 4500;
    const chargeable = Math.max(input.actualWeightKg, Math.round(volumetric));
    const docket: Docket = {
      id,
      number,
      customerId: input.customerId,
      consignor: input.consignor,
      consignee: input.consignee,
      originCity: input.originCity,
      originPin: input.originPin,
      destinationCity: input.destinationCity,
      destinationPin: input.destinationPin,
      originBranchId:
        get().branchId === "all" ? "br-blr" : get().branchId,
      paymentMode: input.paymentMode,
      transportMode: input.transportMode,
      packages: input.packages,
      actualWeightKg: input.actualWeightKg,
      chargeableWeightKg: chargeable,
      lengthCm: input.lengthCm,
      widthCm: input.widthCm,
      heightCm: input.heightCm,
      freight: input.freight,
      fuelSurcharge: Math.round(input.freight * 0.12),
      handling: 200,
      otherCharges: 0,
      gstRate: 18,
      invoiceNumber: input.invoiceNumber,
      ewayBill: input.ewayBill,
      riskType: input.riskType,
      edd: input.edd,
      status: "booked",
      bookingSource: "Regular Customer",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      boxes,
    };
    set((s) => ({ dockets: [docket, ...s.dockets] }));
    get().pushAudit({
      user: "Demo Administrator",
      module: "Booking",
      entityType: "Docket",
      entityId: number,
      action: "Created docket",
      previous: "—",
      next: "Booked",
    });
    return { ok: true, id };
  },

  scanBox: (barcode) => {
    const state = get();
    const raw = barcode.trim();
    const key = raw.toLowerCase();

    // Package barcode, or docket number / id from printed scan label
    let docket = state.dockets.find((d) =>
      d.boxes.some((b) => b.barcode.toLowerCase() === key)
    );
    let targetBarcode = raw;

    if (!docket) {
      docket = state.dockets.find(
        (d) => d.number.toLowerCase() === key || d.id.toLowerCase() === key
      );
      if (docket) {
        const next = docket.boxes.find((b) => !b.scanned);
        if (!next) {
          const message = `All packages already scanned for ${docket.number}`;
          set({ scanMessage: message });
          return { ok: false, message, docketId: docket.id };
        }
        targetBarcode = next.barcode;
      }
    }

    if (!docket) {
      const message = `Unknown barcode: ${raw}`;
      set({ scanMessage: message });
      return { ok: false, message };
    }
    const box = docket.boxes.find(
      (b) => b.barcode.toLowerCase() === targetBarcode.toLowerCase()
    )!;
    if (box.scanned) {
      const message = `Duplicate scan blocked for ${targetBarcode}`;
      set({ scanMessage: message });
      get().pushAudit({
        user: "Suresh Rao",
        module: "Warehouse",
        entityType: "DocketBox",
        entityId: targetBarcode,
        action: "Duplicate scan blocked",
        previous: "Staged",
        next: "Staged",
      });
      return { ok: false, message, docketId: docket.id };
    }
    set((s) => ({
      dockets: s.dockets.map((d) => {
        if (d.id !== docket.id) return d;
        const boxes = d.boxes.map((b) =>
          b.barcode.toLowerCase() === targetBarcode.toLowerCase()
            ? {
                ...b,
                scanned: true,
                scannedAt: nowIso(),
                status: "staged" as const,
              }
            : b
        );
        const allScanned = boxes.every((b) => b.scanned);
        return {
          ...d,
          boxes,
          status: allScanned ? "warehouse" : d.status === "booked" ? "warehouse" : d.status,
          updatedAt: nowIso(),
        };
      }),
      scanMessage: `✓ ${targetBarcode} verified and staged`,
    }));
    get().pushAudit({
      user: "Suresh Rao",
      module: "Warehouse",
      entityType: "DocketBox",
      entityId: targetBarcode,
      action: "Package scanned",
      previous: "Pending",
      next: "Staged",
    });
    return { ok: true, message: `Scanned ${targetBarcode}`, docketId: docket.id };
  },

  dispatchTrip: (docketId, vehicleId) => {
    const docket = get().dockets.find((d) => d.id === docketId);
    const vehicle = get().vehicles.find((v) => v.id === vehicleId);
    if (!docket || !vehicle) {
      return { ok: false, message: "Select a docket and vehicle." };
    }
    if (!docket.boxes.every((b) => b.scanned)) {
      return {
        ok: false,
        message: "Gate: warehouse scan incomplete — all packages must be staged.",
      };
    }
    if (!docket.ewayBill?.trim()) {
      return {
        ok: false,
        message: "Gate: e-way bill missing — generate e-way before dispatch.",
      };
    }
    if (vehicle.capacityKg < docket.actualWeightKg) {
      return {
        ok: false,
        message: `Gate: ${vehicle.registration} capacity ${vehicle.capacityKg} kg is below load ${docket.actualWeightKg} kg.`,
      };
    }

    const vendor = get().vendors.find((v) => v.id === vehicle.vendorId);
    const needsThc = vendor?.type === "market" || vendor?.type === "contracted";

    const tripId = uid("trip");
    const trip: Trip = {
      id: tripId,
      code: `TRP-${docket.originCity.slice(0, 3).toUpperCase()}-${docket.destinationCity.slice(0, 3).toUpperCase()}-${docket.number.slice(3)}`,
      docketIds: [docketId],
      vehicleId,
      driverId: vehicle.driverId,
      vendorId: vehicle.vendorId,
      origin: docket.originCity,
      destination: docket.destinationCity,
      status: "in_transit",
      progressPct: 8,
      eta: docket.edd + "T18:00:00+05:30",
      departedAt: nowIso(),
      currentLocation: `${docket.originCity} Hub — Departed`,
      lat: vehicle.lat,
      lng: vehicle.lng + 0.15,
      checkpoints: [
        { label: `Departed ${docket.originCity} Hub`, at: nowIso(), done: true },
        { label: "En route checkpoint", at: "", done: false },
        { label: `Arrive ${docket.destinationCity} Hub`, at: "", done: false },
      ],
      estimatedCost: Math.round(docket.freight * 0.5),
    };

    set((s) => ({
      trips: [trip, ...s.trips],
      vehicles: s.vehicles.map((v) =>
        v.id === vehicleId
          ? {
              ...v,
              status: "in_transit",
              currentUtilizationPct: Math.min(
                95,
                Math.round((docket.actualWeightKg / v.capacityKg) * 100)
              ),
            }
          : v
      ),
      dockets: s.dockets.map((d) =>
        d.id === docketId
          ? {
              ...d,
              status: "in_transit",
              tripId,
              updatedAt: nowIso(),
              boxes: d.boxes.map((b) => ({
                ...b,
                status: "in_transit" as const,
              })),
            }
          : d
      ),
    }));

    if (needsThc) {
      get().createThc(tripId);
    }

    get().pushAudit({
      user: "Anil Mehta",
      module: "Traffic",
      entityType: "Trip",
      entityId: trip.code,
      action: needsThc
        ? "Dispatched vehicle · THC raised"
        : "Dispatched vehicle",
      previous: "Warehouse",
      next: "In Transit",
      remarks: `${vehicle.registration} · e-way ${docket.ewayBill} · ${docket.number}`,
    });
    return { ok: true };
  },

  markOutForDelivery: (docketId) => {
    set((s) => ({
      dockets: s.dockets.map((d) =>
        d.id === docketId
          ? { ...d, status: "out_for_delivery", updatedAt: nowIso() }
          : d
      ),
      trips: s.trips.map((t) =>
        t.docketIds.includes(docketId)
          ? {
              ...t,
              progressPct: 92,
              currentLocation: "Out for delivery",
              status: "in_transit",
            }
          : t
      ),
    }));
    const d = get().dockets.find((x) => x.id === docketId);
    get().pushAudit({
      user: "Demo Administrator",
      module: "Delivery",
      entityType: "Docket",
      entityId: d?.number ?? docketId,
      action: "Marked out for delivery",
      previous: "In Transit",
      next: "Out for Delivery",
    });
  },

  markDelivered: (docketId) => {
    set((s) => ({
      dockets: s.dockets.map((d) =>
        d.id === docketId
          ? { ...d, status: "pod_pending", updatedAt: nowIso() }
          : d
      ),
      trips: s.trips.map((t) =>
        t.docketIds.includes(docketId)
          ? {
              ...t,
              progressPct: 100,
              status: "arrived",
              currentLocation: "Delivered — awaiting POD",
            }
          : t
      ),
    }));
    const d = get().dockets.find((x) => x.id === docketId);
    get().pushAudit({
      user: "Demo Administrator",
      module: "Delivery",
      entityType: "Docket",
      entityId: d?.number ?? docketId,
      action: "Marked delivered — POD pending",
      previous: "Out for Delivery",
      next: "POD Pending",
    });
  },

  ingestPod: (docketId) => {
    const docket = get().dockets.find((d) => d.id === docketId);
    if (!docket) return "";
    const podId = uid("pod");
    const pod: POD = {
      id: podId,
      docketId,
      status: "extracted",
      receiverName:
        docket.number === "DK-10231" ? "Lakshmi Narayanan" : "Authorized Receiver",
      deliveryAt: nowIso(),
      signatureDetected: true,
      sealDetected: true,
      gpsVerified: true,
      ocrConfidence: 0.93,
      imageLabel: `POD scan — ${docket.number}`,
      createdAt: nowIso(),
    };
    set((s) => ({
      pods: [pod, ...s.pods],
      dockets: s.dockets.map((d) =>
        d.id === docketId
          ? { ...d, podId, status: "pod_pending", updatedAt: nowIso() }
          : d
      ),
    }));
    get().pushAudit({
      user: "Kavya Iyer",
      module: "POD",
      entityType: "POD",
      entityId: docket.number,
      action: "POD ingested — mapped to docket",
      previous: "Delivered",
      next: "POD Pending",
      remarks: "Awaiting verification",
    });
    return podId;
  },

  approvePod: (podId) => {
    const pod = get().pods.find((p) => p.id === podId);
    if (!pod) return;
    const docket = get().dockets.find((d) => d.id === pod.docketId);
    set((s) => ({
      pods: s.pods.map((p) =>
        p.id === podId ? { ...p, status: "approved" } : p
      ),
      dockets: s.dockets.map((d) =>
        d.id === pod.docketId
          ? {
              ...d,
              status:
                d.paymentMode === "TBB" ? "billing_eligible" : "delivered",
              updatedAt: nowIso(),
            }
          : d
      ),
    }));
    get().pushAudit({
      user: "Kavya Iyer",
      module: "POD",
      entityType: "POD",
      entityId: docket?.number ?? podId,
      action: "Approved POD",
      previous: "POD Pending",
      next: "POD Approved · Billing Unlocked",
    });
  },

  rejectPod: (podId) => {
    const pod = get().pods.find((p) => p.id === podId);
    if (!pod) return;
    const docket = get().dockets.find((d) => d.id === pod.docketId);
    set((s) => ({
      pods: s.pods.filter((p) => p.id !== podId),
      dockets: s.dockets.map((d) =>
        d.id === pod.docketId
          ? {
              ...d,
              podId: undefined,
              status: "pod_pending",
              updatedAt: nowIso(),
            }
          : d
      ),
    }));
    get().pushAudit({
      user: "Kavya Iyer",
      module: "POD",
      entityType: "POD",
      entityId: docket?.number ?? podId,
      action: "Rejected POD — re-upload requested",
      previous: "POD Pending",
      next: "POD Rejected · Upload open",
    });
  },

  requestPodReview: (podId) => {
    const pod = get().pods.find((p) => p.id === podId);
    if (!pod) return;
    const docket = get().dockets.find((d) => d.id === pod.docketId);
    set((s) => ({
      pods: s.pods.map((p) =>
        p.id === podId ? { ...p, status: "pending", remarks: "Sent for review" } : p
      ),
    }));
    get().pushAudit({
      user: "Kavya Iyer",
      module: "POD",
      entityType: "POD",
      entityId: docket?.number ?? podId,
      action: "Requested POD review",
      previous: "Extracted",
      next: "Pending review",
    });
  },

  approveCustomer: (customerId) => {
    const customer = get().customers.find((c) => c.id === customerId);
    if (!customer) return;
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === customerId ? { ...c, status: "active" } : c
      ),
    }));
    get().pushAudit({
      user: "Demo Administrator",
      module: "Administration",
      entityType: "Customer",
      entityId: customer.code,
      action: "Approved customer for booking",
      previous: "Pending",
      next: "Active",
    });
  },

  generateInvoice: (docketId) => {
    const docket = get().dockets.find((d) => d.id === docketId);
    if (!docket) return null;
    if (docket.billingInvoiceId) return docket.billingInvoiceId;
    const podApproved = get().pods.some(
      (p) => p.docketId === docketId && p.status === "approved"
    );
    const eligible =
      docket.status === "billing_eligible" ||
      podApproved ||
      docket.paymentMode !== "TBB";
    if (!eligible) return null;

    const subtotal =
      docket.freight +
      docket.fuelSurcharge +
      docket.handling +
      docket.otherCharges;
    const gst = Math.round(subtotal * (docket.gstRate / 100));
    const total = subtotal + gst;
    const stateOf = (city: string) => {
      if (["Bengaluru", "Mysuru"].includes(city)) return "KA";
      if (["Chennai", "Coimbatore"].includes(city)) return "TN";
      if (["Hyderabad"].includes(city)) return "TS";
      if (["Mumbai", "Pune"].includes(city)) return "MH";
      if (["Delhi"].includes(city)) return "DL";
      return city;
    };
    const interState =
      stateOf(docket.originCity) !== stateOf(docket.destinationCity);
    const half = Math.round(gst / 2);
    const number = `INV-2026-${String(90 + get().invoices.length).padStart(4, "0")}`;
    const invoice: Invoice = {
      id: uid("inv"),
      number: docket.number === "DK-10231" ? "INV-2026-0091" : number,
      customerId: docket.customerId,
      docketId,
      invoiceDate: "2026-09-18",
      dueDate: "2026-10-18",
      subtotal,
      gst,
      cgst: interState ? 0 : half,
      sgst: interState ? 0 : gst - half,
      igst: interState ? gst : 0,
      hsn: "996511",
      placeOfSupply: docket.destinationCity,
      total,
      status: "issued",
      amountReceived: 0,
    };
    set((s) => ({
      invoices: [invoice, ...s.invoices],
      dockets: s.dockets.map((d) =>
        d.id === docketId
          ? {
              ...d,
              status: "invoiced",
              billingInvoiceId: invoice.id,
              updatedAt: nowIso(),
            }
          : d
      ),
      customers: s.customers.map((c) =>
        c.id === docket.customerId
          ? { ...c, outstanding: c.outstanding + total }
          : c
      ),
    }));
    get().pushAudit({
      user: "Demo Administrator",
      module: "Billing",
      entityType: "Invoice",
      entityId: invoice.number,
      action: "Generated invoice",
      previous: "Billing Eligible",
      next: "Issued",
    });
    return invoice.id;
  },

  recordReceipt: (invoiceId, amount) => {
    const invoice = get().invoices.find((i) => i.id === invoiceId);
    if (!invoice) return;
    const received = Math.min(amount, invoice.total - invoice.amountReceived);
    const newReceived = invoice.amountReceived + received;
    const paid = newReceived >= invoice.total;
    const receipt: Receipt = {
      id: uid("rcpt"),
      number: `RCT-2026-${String(40 + get().receipts.length).padStart(4, "0")}`,
      customerId: invoice.customerId,
      invoiceIds: [invoiceId],
      amount: received,
      mode: "NEFT",
      receivedAt: nowIso(),
    };
    set((s) => ({
      receipts: [receipt, ...s.receipts],
      invoices: s.invoices.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              amountReceived: newReceived,
              status: paid ? "paid" : "partially_paid",
            }
          : i
      ),
      customers: s.customers.map((c) =>
        c.id === invoice.customerId
          ? { ...c, outstanding: Math.max(0, c.outstanding - received) }
          : c
      ),
      dockets: s.dockets.map((d) =>
        d.id === invoice.docketId && paid
          ? { ...d, status: "paid", updatedAt: nowIso() }
          : d
      ),
    }));
    get().pushAudit({
      user: "Demo Administrator",
      module: "Receivables",
      entityType: "Receipt",
      entityId: receipt.number,
      action: "Recorded receipt",
      previous: `Outstanding ₹${invoice.total - invoice.amountReceived}`,
      next: paid ? "Fully Paid" : "Partially Paid",
    });
  },

  createThc: (tripId) => {
    const trip = get().trips.find((t) => t.id === tripId);
    if (!trip) return;
    const thc: THC = {
      id: uid("thc"),
      number: `THC-2026-${String(300 + get().thcs.length)}`,
      tripId,
      vendorId: trip.vendorId,
      vehicleId: trip.vehicleId,
      contractAmount: trip.estimatedCost,
      advance: Math.round(trip.estimatedCost * 0.3),
      status: "pending",
      createdAt: nowIso(),
    };
    set((s) => ({ thcs: [thc, ...s.thcs] }));
    get().pushAudit({
      user: "Anil Mehta",
      module: "THC",
      entityType: "THC",
      entityId: thc.number,
      action: "Created THC — pending traffic & accounts approval",
      previous: "—",
      next: "Pending Approval",
    });
  },

  createCustomer: (input) => {
    const id = uid("cus");
    const code = `CUS-${String(200 + get().customers.length).padStart(4, "0")}`;
    const customer: Customer = {
      id,
      code,
      name: input.name,
      gstin: input.gstin || "29AABCR0000A1Z5",
      pan: "AABCR0000A",
      address: `${input.city}`,
      city: input.city,
      contactPerson: input.contactPerson,
      email: input.email,
      phone: input.phone,
      status: "pending",
      contractedModes: ["PTL"],
      outstanding: 0,
    };
    set((s) => ({ customers: [customer, ...s.customers] }));
    get().pushAudit({
      user: "Sales",
      module: "Customers",
      entityType: "Customer",
      entityId: code,
      action: "Created customer — pending Admin approval",
      previous: "—",
      next: "Pending",
    });
    return id;
  },

  updateCustomer: (id, patch) => {
    set((s) => ({
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    get().pushAudit({
      user: "Sales",
      module: "Customers",
      entityType: "Customer",
      entityId: id,
      action: "Updated customer",
      previous: "—",
      next: "Updated",
    });
  },

  deactivateCustomer: (id) => {
    set((s) => ({
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, status: "inactive" } : c
      ),
    }));
    get().pushAudit({
      user: "Admin",
      module: "Customers",
      entityType: "Customer",
      entityId: id,
      action: "Deactivated customer",
      previous: "active",
      next: "inactive",
    });
  },

  createVehicle: (input) => {
    const id = uid("veh");
    const vehicle: Vehicle = {
      id,
      registration: input.registration,
      type: input.type,
      capacityKg: input.capacityKg,
      capacityPackages: Math.round(input.capacityKg / 40),
      vendorId: input.vendorId,
      driverId: input.driverId,
      status: "available",
      currentUtilizationPct: 0,
      docs: { rc: "Valid", insurance: "Valid", permit: "Valid", fitness: "Valid" },
      insuranceExpiry: "2027-09-18",
      lat: 12.97,
      lng: 77.59,
    };
    set((s) => ({ vehicles: [vehicle, ...s.vehicles] }));
    get().pushAudit({
      user: "Fleet",
      module: "Fleet",
      entityType: "Vehicle",
      entityId: vehicle.registration,
      action: "Added vehicle",
      previous: "—",
      next: "available",
    });
    return id;
  },

  updateVehicle: (id, patch) => {
    set((s) => ({
      vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }));
    get().pushAudit({
      user: "Fleet",
      module: "Fleet",
      entityType: "Vehicle",
      entityId: id,
      action: "Updated vehicle",
      previous: "—",
      next: "Updated",
    });
  },

  deleteVehicle: (id) => {
    const v = get().vehicles.find((x) => x.id === id);
    if (v?.status === "in_transit") return;
    set((s) => ({ vehicles: s.vehicles.filter((x) => x.id !== id) }));
    get().pushAudit({
      user: "Fleet",
      module: "Fleet",
      entityType: "Vehicle",
      entityId: v?.registration ?? id,
      action: "Deleted vehicle",
      previous: v?.status ?? "—",
      next: "Removed",
    });
  },

  setVehicleMaintenance: (id) => {
    set((s) => ({
      vehicles: s.vehicles.map((v) =>
        v.id === id ? { ...v, status: "maintenance" } : v
      ),
    }));
    get().pushAudit({
      user: "Fleet",
      module: "Fleet",
      entityType: "Vehicle",
      entityId: id,
      action: "Marked maintenance",
      previous: "available",
      next: "maintenance",
    });
  },

  renewVehicleDocs: (id) => {
    set((s) => ({
      vehicles: s.vehicles.map((v) =>
        v.id === id
          ? {
              ...v,
              docs: {
                rc: "Valid",
                insurance: "Valid",
                permit: "Valid",
                fitness: "Valid",
              },
              insuranceExpiry: "2027-12-31",
              status: v.status === "maintenance" ? "available" : v.status,
            }
          : v
      ),
    }));
    get().pushAudit({
      user: "Fleet",
      module: "Fleet",
      entityType: "Vehicle",
      entityId: id,
      action: "Renewed vehicle documents",
      previous: "Expiring",
      next: "Valid",
    });
  },

  createVendor: (input) => {
    const id = uid("ven");
    const vendor: Vendor = {
      id,
      name: input.name,
      gstin: input.gstin,
      type: input.type,
      rating: 4,
      phone: input.phone,
    };
    set((s) => ({ vendors: [vendor, ...s.vendors] }));
    get().pushAudit({
      user: "Procurement",
      module: "Vendors",
      entityType: "Vendor",
      entityId: vendor.name,
      action: "Created vendor",
      previous: "—",
      next: input.type,
    });
    return id;
  },

  updateVendor: (id, patch) => {
    set((s) => ({
      vendors: s.vendors.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    }));
    get().pushAudit({
      user: "Procurement",
      module: "Vendors",
      entityType: "Vendor",
      entityId: id,
      action: "Updated vendor",
      previous: "—",
      next: "Updated",
    });
  },

  deactivateVendor: (id) => {
    set((s) => ({
      vendors: s.vendors.map((v) =>
        v.id === id ? { ...v, rating: 0 } : v
      ),
    }));
    get().pushAudit({
      user: "Procurement",
      module: "Vendors",
      entityType: "Vendor",
      entityId: id,
      action: "Deactivated vendor (rating cleared)",
      previous: "active",
      next: "inactive",
    });
  },

  createContract: (input) => {
    const id = uid("ctr");
    const contract: Contract = {
      id,
      customerId: input.customerId,
      mode: input.mode,
      zone: input.zone,
      ratePerKg: input.ratePerKg,
      minFreight: input.minFreight,
      effectiveFrom: nowIso().slice(0, 10),
      effectiveTo: "2027-12-31",
      status: "approved",
    };
    set((s) => ({ contracts: [contract, ...s.contracts] }));
    get().pushAudit({
      user: "Sales",
      module: "Contracts",
      entityType: "Contract",
      entityId: id,
      action: "Created tariff contract",
      previous: "—",
      next: "approved",
    });
    return id;
  },

  updateContract: (id, patch) => {
    set((s) => ({
      contracts: s.contracts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
    get().pushAudit({
      user: "Sales",
      module: "Contracts",
      entityType: "Contract",
      entityId: id,
      action: "Updated contract",
      previous: "—",
      next: "Updated",
    });
  },

  deactivateContract: (id) => {
    set((s) => ({
      contracts: s.contracts.map((c) =>
        c.id === id ? { ...c, status: "on_hold" } : c
      ),
    }));
    get().pushAudit({
      user: "Legal",
      module: "Contracts",
      entityType: "Contract",
      entityId: id,
      action: "Put contract on hold",
      previous: "approved",
      next: "on_hold",
    });
  },

  createTicket: (input) => {
    const id = uid("tkt");
    const number = `TKT-2026-${String(50 + get().tickets.length).padStart(4, "0")}`;
    const ticket: Ticket = {
      id,
      number,
      subject: input.subject,
      customerId: input.customerId,
      docketId: input.docketId,
      severity: input.severity,
      category: input.category,
      status: "open",
      owner: input.owner,
      slaDue: new Date(Date.now() + 86400000).toISOString(),
      createdAt: nowIso(),
      updates: [
        {
          action: "Opened",
          note: "Ticket created from Support desk",
          at: nowIso(),
        },
      ],
    };
    set((s) => ({ tickets: [ticket, ...s.tickets] }));
    get().pushAudit({
      user: "Support",
      module: "Support",
      entityType: "Ticket",
      entityId: number,
      action: "Created ticket",
      previous: "—",
      next: "open",
    });
    return id;
  },

  assignTicket: (id, owner) => {
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === id
          ? {
              ...t,
              owner,
              status: "in_progress",
              updates: [
                {
                  action: "Assigned",
                  note: `Assigned to ${owner}`,
                  at: nowIso(),
                },
                ...t.updates,
              ],
            }
          : t
      ),
    }));
    get().pushAudit({
      user: "Support",
      module: "Support",
      entityType: "Ticket",
      entityId: id,
      action: `Assigned to ${owner}`,
      previous: "open",
      next: "in_progress",
    });
  },

  resolveTicket: (id) => {
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "resolved",
              updates: [
                { action: "Resolved", note: "Issue resolved", at: nowIso() },
                ...t.updates,
              ],
            }
          : t
      ),
    }));
    get().pushAudit({
      user: "Support",
      module: "Support",
      entityType: "Ticket",
      entityId: id,
      action: "Resolved ticket",
      previous: "in_progress",
      next: "resolved",
    });
  },

  closeTicket: (id) => {
    set((s) => ({
      tickets: s.tickets.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "closed",
              updates: [
                { action: "Closed", note: "Ticket closed", at: nowIso() },
                ...t.updates,
              ],
            }
          : t
      ),
    }));
  },

  recordHubScan: (input) => {
    const result = get().scanBox(input.barcode);
    if (!result.ok || !result.docketId) return result;
    const event: HubScanEvent = {
      id: uid("scan"),
      docketId: result.docketId,
      barcode: input.barcode,
      movement: input.movement,
      hub: input.hub,
      packages: input.packages,
      weightKg: input.weightKg,
      condition: input.condition,
      remarks: input.remarks,
      at: nowIso(),
    };
    set((s) => ({ hubScans: [event, ...s.hubScans] }));
    if (input.condition !== "GOOD") {
      get().pushAudit({
        user: "Suresh Rao",
        module: "Warehouse",
        entityType: "HubScan",
        entityId: input.barcode,
        action: `Condition ${input.condition} on ${input.movement}`,
        next: input.condition,
      });
    }
    return {
      ok: true,
      message: `${input.movement.replace("_", " ")} recorded · ${result.message}`,
      docketId: result.docketId,
    };
  },

  createManifest: (input) => {
    const id = uid("mf");
    const code =
      input.code?.trim() ||
      `MF-${String(6700000 + get().manifests.length + 1)}`;
    const manifest: Manifest = {
      id,
      code,
      tripId: "",
      docketIds: input.docketIds,
      vehicleReg: input.vehicleReg,
      driverName: input.driverName,
      originHub: input.originHub,
      destinationHub: input.destinationHub,
      ewayStatus: "pending",
      status: "generated",
      createdAt: nowIso(),
    };
    set((s) => ({
      manifests: [manifest, ...s.manifests],
      dockets: s.dockets.map((d) =>
        input.docketIds.includes(d.id)
          ? {
              ...d,
              boxes: d.boxes.map((b) => ({
                ...b,
                status: "manifested" as const,
              })),
              updatedAt: nowIso(),
            }
          : d
      ),
    }));
    get().pushAudit({
      user: "Suresh Rao",
      module: "Warehouse",
      entityType: "Manifest",
      entityId: code,
      action: "Created audited manifest",
      next: `${input.docketIds.length} dockets`,
    });
    return id;
  },

  raiseWarehouseException: (input) => {
    const id = uid("wex");
    const ex: WarehouseException = {
      id,
      ...input,
      status: "open",
      createdAt: nowIso(),
    };
    set((s) => ({
      warehouseExceptions: [ex, ...s.warehouseExceptions],
      dockets: s.dockets.map((d) =>
        d.id === input.docketId
          ? { ...d, status: "exception", updatedAt: nowIso() }
          : d
      ),
    }));
    get().pushAudit({
      user: "Suresh Rao",
      module: "Warehouse",
      entityType: "Exception",
      entityId: id,
      action: `Raised ${input.type} exception`,
      next: input.severity,
    });
    return id;
  },

  closeWarehouseException: (id) => {
    set((s) => ({
      warehouseExceptions: s.warehouseExceptions.map((e) =>
        e.id === id ? { ...e, status: "closed" } : e
      ),
    }));
  },

  approveThc: (id) => {
    set((s) => ({
      thcs: s.thcs.map((t) =>
        t.id === id ? { ...t, status: "approved" } : t
      ),
    }));
    const thc = get().thcs.find((t) => t.id === id);
    get().pushAudit({
      user: "Anil Mehta",
      module: "THC",
      entityType: "THC",
      entityId: thc?.number ?? id,
      action: "THC approved (Traffic + Accounts)",
      previous: "pending",
      next: "approved",
    });
  },

  rejectThc: (id) => {
    set((s) => ({
      thcs: s.thcs.map((t) =>
        t.id === id ? { ...t, status: "rejected" } : t
      ),
    }));
  },

  createBth: (input) => {
    const id = uid("bth");
    const number = `BTH-2026-${String(get().bths.length + 1).padStart(4, "0")}`;
    const bth: BTH = {
      id,
      number,
      thcId: input.thcId,
      balanceAmount: input.balanceAmount,
      podStatus: input.podStatus,
      additionalCharges:
        input.additionalType && input.additionalAmount
          ? [{ type: input.additionalType, amount: input.additionalAmount }]
          : [],
      status: "pending_accounts",
      createdAt: nowIso(),
    };
    set((s) => ({ bths: [bth, ...s.bths] }));
    get().pushAudit({
      user: "Accounts",
      module: "BTH",
      entityType: "BTH",
      entityId: number,
      action: "Created BTH for balance hire settlement",
      next: "pending_accounts",
    });
    return id;
  },

  payBth: (id, utr) => {
    set((s) => ({
      bths: s.bths.map((b) =>
        b.id === id ? { ...b, status: "completed", utr } : b
      ),
    }));
    const bth = get().bths.find((b) => b.id === id);
    get().pushAudit({
      user: "Accounts",
      module: "BTH",
      entityType: "BTH",
      entityId: bth?.number ?? id,
      action: "BTH paid and locked",
      next: utr,
    });
  },

  createNetworkLocation: (input) => {
    const id = uid("loc");
    set((s) => ({
      networkLocations: [{ id, ...input }, ...s.networkLocations],
    }));
    get().pushAudit({
      user: "Demo Administrator",
      module: "Administration",
      entityType: "NetworkLocation",
      entityId: input.code,
      action: "Created network master record",
      next: input.type,
    });
    return id;
  },

  createTariffZone: (input) => {
    const id = uid("tz");
    set((s) => ({
      tariffZones: [{ id, ...input }, ...s.tariffZones],
    }));
    get().pushAudit({
      user: "Sales",
      module: "Contracts",
      entityType: "TariffZone",
      entityId: input.name,
      action: "Created customer tariff zone",
      next: input.mode,
    });
    return id;
  },

  publishTripProgress: (tripId, input) => {
    set((s) => ({
      trips: s.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              currentLocation: input.location,
              lat: input.lat,
              lng: input.lng,
              eta: input.eta,
              publicToken: t.publicToken ?? `trk-${t.id}`,
              customerUpdates: [
                {
                  at: nowIso(),
                  message: input.message,
                  channel: "SMS" as const,
                },
                ...(t.customerUpdates ?? []),
              ],
            }
          : t
      ),
    }));
    get().pushAudit({
      user: "Traffic",
      module: "Tracking",
      entityType: "Trip",
      entityId: tripId,
      action: "Published truck progress to customer",
      next: input.location,
    });
  },

  reportTripDelay: (tripId, reason) => {
    set((s) => ({
      trips: s.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              delayed: true,
              customerUpdates: [
                {
                  at: nowIso(),
                  message: `Delay reported: ${reason}`,
                  channel: "WHATSAPP" as const,
                },
                ...(t.customerUpdates ?? []),
              ],
            }
          : t
      ),
    }));
    get().pushAudit({
      user: "Traffic",
      module: "Tracking",
      entityType: "Trip",
      entityId: tripId,
      action: "Reported delay",
      next: reason,
    });
  },

  markTripArrived: (tripId) => {
    set((s) => ({
      trips: s.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: "arrived",
              progressPct: 100,
              currentLocation: t.destination,
            }
          : t
      ),
    }));
  },

  markTripDelivered: (tripId) => {
    const trip = get().trips.find((t) => t.id === tripId);
    set((s) => ({
      trips: s.trips.map((t) =>
        t.id === tripId ? { ...t, status: "completed", progressPct: 100 } : t
      ),
      dockets: s.dockets.map((d) =>
        trip?.docketIds.includes(d.id)
          ? { ...d, status: "delivered", updatedAt: nowIso() }
          : d
      ),
    }));
  },
}));

export const masterData = {
  branches,
  users,
  get contracts() {
    return useDemoStore.getState().contracts;
  },
  drivers,
  get vendors() {
    return useDemoStore.getState().vendors;
  },
  get manifests() {
    return useDemoStore.getState().manifests;
  },
};
