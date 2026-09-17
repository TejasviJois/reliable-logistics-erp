export type DocketStatus =
  | "draft"
  | "booked"
  | "warehouse"
  | "dispatched"
  | "in_transit"
  | "at_hub"
  | "out_for_delivery"
  | "delivered"
  | "pod_pending"
  | "pod_approved"
  | "billing_eligible"
  | "invoiced"
  | "paid"
  | "exception";

export type PaymentMode = "TBB" | "TO_PAY" | "PAID";
export type TransportMode = "PTL" | "FTL" | "RAIL" | "AIR" | "SURFACE";
export type ApprovalStatus =
  | "draft"
  | "submitted"
  | "pending"
  | "approved"
  | "rejected"
  | "on_hold"
  | "completed";

export type RoleLens =
  | "admin"
  | "booking"
  | "warehouse"
  | "traffic"
  | "pod"
  | "billing";

export interface Branch {
  id: string;
  name: string;
  city: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  initials: string;
  status: "active" | "inactive";
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: "pending" | "active" | "inactive";
  contractedModes: TransportMode[];
  outstanding: number;
}

export interface Contract {
  id: string;
  customerId: string;
  mode: TransportMode;
  zone: string;
  ratePerKg: number;
  minFreight: number;
  effectiveFrom: string;
  effectiveTo: string;
  status: ApprovalStatus;
}

export interface DocketBox {
  id: string;
  barcode: string;
  scanned: boolean;
  scannedAt?: string;
  status: "pending" | "received" | "staged" | "manifested" | "in_transit" | "delivered";
}

export interface Docket {
  id: string;
  number: string;
  customerId: string;
  consignor: string;
  consignee: string;
  originCity: string;
  originPin: string;
  destinationCity: string;
  destinationPin: string;
  originBranchId: string;
  paymentMode: PaymentMode;
  transportMode: TransportMode;
  packages: number;
  actualWeightKg: number;
  chargeableWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  freight: number;
  fuelSurcharge: number;
  handling: number;
  otherCharges: number;
  gstRate: number;
  invoiceNumber?: string;
  ewayBill?: string;
  riskType: string;
  edd: string;
  status: DocketStatus;
  bookingSource: string;
  createdAt: string;
  updatedAt: string;
  tripId?: string;
  podId?: string;
  billingInvoiceId?: string;
  boxes: DocketBox[];
}

export interface Vehicle {
  id: string;
  registration: string;
  type: string;
  capacityKg: number;
  capacityPackages: number;
  vendorId: string;
  driverId: string;
  status: "available" | "in_transit" | "maintenance";
  currentUtilizationPct: number;
  docs: { rc: string; insurance: string; permit: string; fitness: string };
  insuranceExpiry: string;
  lat: number;
  lng: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
  status: "available" | "on_trip";
}

export interface Vendor {
  id: string;
  name: string;
  gstin: string;
  type: "market" | "owned" | "contracted";
  rating: number;
  phone: string;
}

export interface Trip {
  id: string;
  code: string;
  docketIds: string[];
  vehicleId: string;
  driverId: string;
  vendorId: string;
  origin: string;
  destination: string;
  status: "planned" | "dispatched" | "in_transit" | "arrived" | "completed";
  progressPct: number;
  eta: string;
  departedAt?: string;
  currentLocation: string;
  lat: number;
  lng: number;
  checkpoints: { label: string; at: string; done: boolean }[];
  estimatedCost: number;
  delayed?: boolean;
  publicToken?: string;
  customerUpdates?: TripCustomerUpdate[];
}

export interface Manifest {
  id: string;
  code: string;
  tripId: string;
  docketIds: string[];
  vehicleReg?: string;
  driverName?: string;
  originHub?: string;
  destinationHub?: string;
  ewayStatus: "pending" | "generated" | "failed";
  ewayNumber?: string;
  status: "draft" | "generated" | "dispatched";
  createdAt: string;
}

export interface WarehouseException {
  id: string;
  docketId: string;
  scanCode: string;
  type: "DAMAGE" | "SHORTAGE" | "EXCESS" | "MISROUTED";
  severity: "HIGH" | "MEDIUM" | "LOW";
  hub: string;
  remarks: string;
  status: "open" | "investigating" | "closed";
  createdAt: string;
}

export interface HubScanEvent {
  id: string;
  docketId: string;
  barcode: string;
  movement: "SCAN_INWARD" | "SCAN_OUTWARD";
  hub: string;
  packages: number;
  weightKg?: number;
  condition: "GOOD" | "DAMAGED" | "OPEN" | "WET" | "SHORT";
  remarks?: string;
  at: string;
}

export interface BTH {
  id: string;
  number: string;
  thcId: string;
  balanceAmount: number;
  podStatus: "RECEIVED" | "PENDING" | "NOT_REQUIRED";
  additionalCharges: { type: string; amount: number }[];
  status:
    | "pending_accounts"
    | "pending_payment"
    | "paid"
    | "completed"
    | "hold"
    | "rejected";
  utr?: string;
  createdAt: string;
}

export interface NetworkLocation {
  id: string;
  code: string;
  name: string;
  type: "REGION" | "BRANCH" | "BOOKING_OFFICE" | "TRANSSHIPMENT_HUB";
  region: string;
  state: string;
  city: string;
  pin: string;
  parentId?: string;
}

export interface TariffZone {
  id: string;
  customerId: string;
  mode: TransportMode;
  name: string;
  basis: "CITY" | "STATE";
  members: string;
  ratePerKg: number;
  minFreight: number;
  cftFactor: number;
}

export interface TripCustomerUpdate {
  at: string;
  message: string;
  channel: "SMS" | "EMAIL" | "WHATSAPP" | "PORTAL";
}

export interface POD {
  id: string;
  docketId: string;
  status: "pending" | "extracted" | "approved" | "rejected";
  receiverName?: string;
  deliveryAt?: string;
  signatureDetected?: boolean;
  sealDetected?: boolean;
  gpsVerified?: boolean;
  ocrConfidence?: number;
  imageLabel: string;
  remarks?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  docketId: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  gst: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  hsn?: string;
  placeOfSupply?: string;
  total: number;
  status: "draft" | "issued" | "partially_paid" | "paid";
  amountReceived: number;
}

export interface Receipt {
  id: string;
  number: string;
  customerId: string;
  invoiceIds: string[];
  amount: number;
  mode: string;
  receivedAt: string;
}

export interface Ticket {
  id: string;
  number: string;
  subject: string;
  customerId: string;
  docketId?: string;
  severity: "P1" | "P2" | "P3";
  category: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  owner: string;
  slaDue: string;
  createdAt: string;
  updates: { action: string; note: string; at: string }[];
}

export interface THC {
  id: string;
  number: string;
  tripId: string;
  vendorId: string;
  vehicleId: string;
  contractAmount: number;
  advance: number;
  status: ApprovalStatus;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  at: string;
  user: string;
  module: string;
  entityType: string;
  entityId: string;
  action: string;
  previous?: string;
  next?: string;
  remarks?: string;
}

export interface AttentionItem {
  id: string;
  type: string;
  title: string;
  severity: "high" | "medium" | "low";
  href: string;
  meta?: string;
}
