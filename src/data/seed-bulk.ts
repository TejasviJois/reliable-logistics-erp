import type {
  AuditEvent,
  BTH,
  Contract,
  Customer,
  Docket,
  Driver,
  HubScanEvent,
  Invoice,
  Manifest,
  NetworkLocation,
  PaymentMode,
  POD,
  Receipt,
  TariffZone,
  THC,
  Ticket,
  TransportMode,
  Trip,
  Vendor,
  Vehicle,
  WarehouseException,
  DocketStatus,
} from "@/types";

export function makeBoxes(
  docketId: string,
  count: number,
  scanned: number,
  scannedAt = "2026-09-17T09:12:00+05:30"
): Docket["boxes"] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const isScanned = n <= scanned;
    return {
      id: `${docketId}-box-${n}`,
      barcode: `${docketId.replace("dk-", "BX-")}-${String(n).padStart(2, "0")}`,
      scanned: isScanned,
      scannedAt: isScanned ? scannedAt : undefined,
      status: (isScanned ? "staged" : "pending") as Docket["boxes"][0]["status"],
    };
  });
}

const CITY: Record<
  string,
  { pin: string; state: string; branch: string; gstPrefix: string }
> = {
  Bengaluru: { pin: "560100", state: "KA", branch: "br-blr", gstPrefix: "29" },
  Chennai: { pin: "600032", state: "TN", branch: "br-chn", gstPrefix: "33" },
  Hyderabad: { pin: "500078", state: "TS", branch: "br-hyd", gstPrefix: "36" },
  Mumbai: { pin: "400069", state: "MH", branch: "br-mum", gstPrefix: "27" },
  Pune: { pin: "411019", state: "MH", branch: "br-mum", gstPrefix: "27" },
  Delhi: { pin: "110001", state: "DL", branch: "br-hyd", gstPrefix: "07" },
  Coimbatore: { pin: "641001", state: "TN", branch: "br-chn", gstPrefix: "33" },
  Mysuru: { pin: "570001", state: "KA", branch: "br-blr", gstPrefix: "29" },
  Hosur: { pin: "635109", state: "TN", branch: "br-blr", gstPrefix: "33" },
  Kochi: { pin: "682001", state: "KL", branch: "br-chn", gstPrefix: "32" },
};

function ts(day: number, hour = 10, min = 0) {
  const d = String(day).padStart(2, "0");
  const h = String(hour).padStart(2, "0");
  const m = String(min).padStart(2, "0");
  return `2026-09-${d}T${h}:${m}:00+05:30`;
}

function date(day: number) {
  return `2026-09-${String(day).padStart(2, "0")}`;
}

function gstin(prefix: string, pan: string) {
  return `${prefix}${pan}1Z${pan.slice(-1)}`;
}

function invoiceTax(
  subtotal: number,
  originCity: string,
  destCity: string
): Pick<Invoice, "gst" | "cgst" | "sgst" | "igst" | "hsn" | "placeOfSupply" | "total"> {
  const gst = Math.round(subtotal * 0.18);
  const o = CITY[originCity]?.state ?? "KA";
  const d = CITY[destCity]?.state ?? "TN";
  const inter = o !== d;
  return {
    gst,
    hsn: "996511",
    placeOfSupply: d,
    cgst: inter ? 0 : Math.round(gst / 2),
    sgst: inter ? 0 : gst - Math.round(gst / 2),
    igst: inter ? gst : 0,
    total: subtotal + gst,
  };
}

/* ——— Customers (hero 4 kept in seed.ts; these are additions) ——— */
const EXTRA_CUSTOMERS: Omit<Customer, "outstanding">[] = [
  {
    id: "cus-nexus",
    code: "CUS-000052",
    name: "Nexus Autocomponents Pvt Ltd",
    gstin: "29AABCN5521Q1Z2",
    pan: "AABCN5521Q",
    address: "Plot 18, Peenya Industrial Area, Bengaluru 560058",
    city: "Bengaluru",
    contactPerson: "Vikram Shah",
    email: "logistics@nexusauto.in",
    phone: "+91 98450 22001",
    status: "active",
    contractedModes: ["PTL", "FTL"],
  },
  {
    id: "cus-forge",
    code: "CUS-000053",
    name: "ForgeWorks Engineering",
    gstin: "33AABCF6611H1Z4",
    pan: "AABCF6611H",
    address: "SIDCO Estate, Coimbatore 641021",
    city: "Coimbatore",
    contactPerson: "Karthik Rajan",
    email: "ops@forgeworks.in",
    phone: "+91 94440 88112",
    status: "active",
    contractedModes: ["PTL"],
  },
  {
    id: "cus-retailone",
    code: "CUS-000054",
    name: "RetailOne Distribution",
    gstin: "29AABCR7711P1Z6",
    pan: "AABCR7711P",
    address: "Yelahanka New Town, Bengaluru 560064",
    city: "Bengaluru",
    contactPerson: "Divya Menon",
    email: "dc@retailone.in",
    phone: "+91 99001 44556",
    status: "active",
    contractedModes: ["PTL", "SURFACE"],
  },
  {
    id: "cus-medsupply",
    code: "CUS-000055",
    name: "MedSupply India Ltd",
    gstin: "07AABCM8811F1Z9",
    pan: "AABCM8811F",
    address: "Okhla Phase II, New Delhi 110020",
    city: "Delhi",
    contactPerson: "Amit Khanna",
    email: "inbound@medsupply.in",
    phone: "+91 98100 22334",
    status: "active",
    contractedModes: ["PTL", "AIR"],
  },
  {
    id: "cus-citycare",
    code: "CUS-000056",
    name: "CityCare Hospitals Group",
    gstin: "27AABCC9911G1Z3",
    pan: "AABCC9911G",
    address: "Bandra Kurla Complex, Mumbai 400051",
    city: "Mumbai",
    contactPerson: "Dr. Priya Sen",
    email: "procurement@citycare.in",
    phone: "+91 98200 66778",
    status: "active",
    contractedModes: ["PTL", "AIR"],
  },
  {
    id: "cus-greenlane",
    code: "CUS-000057",
    name: "GreenLane Agri Exports",
    gstin: "29AABCG1122H1Z5",
    pan: "AABCG1122H",
    address: "APMC Yard, Yeshwanthpur, Bengaluru 560022",
    city: "Bengaluru",
    contactPerson: "Suresh Patil",
    email: "exports@greenlane.in",
    phone: "+91 98860 33445",
    status: "active",
    contractedModes: ["FTL", "SURFACE"],
  },
  {
    id: "cus-silkroute",
    code: "CUS-000058",
    name: "SilkRoute Textiles",
    gstin: "33AABCS2233J1Z7",
    pan: "AABCS2233J",
    address: "Tirupur Textile Hub, Tirupur 641604",
    city: "Coimbatore",
    contactPerson: "Anitha Devi",
    email: "ship@silkroute.in",
    phone: "+91 94430 55667",
    status: "active",
    contractedModes: ["PTL"],
  },
  {
    id: "cus-byteware",
    code: "CUS-000059",
    name: "ByteWare Systems",
    gstin: "36AABCB3344K1Z1",
    pan: "AABCB3344K",
    address: "HITEC City, Hyderabad 500081",
    city: "Hyderabad",
    contactPerson: "Rohan Iyer",
    email: "facilities@byteware.in",
    phone: "+91 90001 77889",
    status: "active",
    contractedModes: ["PTL", "AIR"],
  },
  {
    id: "cus-pearl",
    code: "CUS-000060",
    name: "Pearl Consumer Goods",
    gstin: "27AABCP4455L1Z2",
    pan: "AABCP4455L",
    address: "Andheri MIDC, Mumbai 400093",
    city: "Mumbai",
    contactPerson: "Farhan Qureshi",
    email: "logistics@pearlcg.in",
    phone: "+91 98210 88990",
    status: "active",
    contractedModes: ["PTL", "FTL"],
  },
  {
    id: "cus-valley",
    code: "CUS-000061",
    name: "Valley Fresh Foods",
    gstin: "29AABCV5566M1Z4",
    pan: "AABCV5566M",
    address: "Hosur Road, Electronic City, Bengaluru 560100",
    city: "Bengaluru",
    contactPerson: "Lakshmi Narayan",
    email: "coldchain@valleyfresh.in",
    phone: "+91 98450 99001",
    status: "active",
    contractedModes: ["FTL"],
  },
  {
    id: "cus-apex",
    code: "CUS-000062",
    name: "Apex Steel Traders",
    gstin: "33AABCA6677N1Z6",
    pan: "AABCA6677N",
    address: "Ambattur Industrial Estate, Chennai 600058",
    city: "Chennai",
    contactPerson: "Murugan Selvam",
    email: "dispatch@apexsteel.in",
    phone: "+91 94440 11223",
    status: "active",
    contractedModes: ["FTL", "SURFACE"],
  },
  {
    id: "cus-horizon",
    code: "CUS-000063",
    name: "Horizon Pharma Logistics",
    gstin: "36AABCH7788P1Z8",
    pan: "AABCH7788P",
    address: "Genome Valley Annex, Hyderabad 500078",
    city: "Hyderabad",
    contactPerson: "Sneha Reddy",
    email: "ops@horizonpharma.in",
    phone: "+91 90008 22334",
    status: "active",
    contractedModes: ["PTL", "AIR"],
  },
  {
    id: "cus-pending-2",
    code: "CUS-000071",
    name: "Deccan Retail Mart",
    gstin: "36AABCD8899Q1Z0",
    pan: "AABCD8899Q",
    address: "Secunderabad Cantonment, Hyderabad 500003",
    city: "Hyderabad",
    contactPerson: "Imran Ali",
    email: "imran@deccanmart.in",
    phone: "+91 90100 44556",
    status: "pending",
    contractedModes: [],
  },
  {
    id: "cus-pending-3",
    code: "CUS-000072",
    name: "Western Edge Wholesalers",
    gstin: "27AABCW9900R1Z1",
    pan: "AABCW9900R",
    address: "Thane Industrial Area, Thane 400604",
    city: "Mumbai",
    contactPerson: "Sonal Deshmukh",
    email: "sonal@westernedge.in",
    phone: "+91 98220 55667",
    status: "pending",
    contractedModes: [],
  },
  {
    id: "cus-pending-4",
    code: "CUS-000073",
    name: "Malabar Spice Co-op",
    gstin: "32AABCM1010S1Z3",
    pan: "AABCM1010S",
    address: "Willingdon Island, Kochi 682003",
    city: "Kochi",
    contactPerson: "Joseph Thomas",
    email: "export@malabarspice.in",
    phone: "+91 98470 66778",
    status: "pending",
    contractedModes: [],
  },
  {
    id: "cus-inactive",
    code: "CUS-000080",
    name: "Legacy Print Works (inactive)",
    gstin: "29AABCL2020T1Z5",
    pan: "AABCL2020T",
    address: "Rajajinagar, Bengaluru 560010",
    city: "Bengaluru",
    contactPerson: "Old Account",
    email: "closed@legacyprint.in",
    phone: "+91 98000 00000",
    status: "inactive",
    contractedModes: ["PTL"],
  },
];

export const bulkCustomers: Customer[] = EXTRA_CUSTOMERS.map((c) => ({
  ...c,
  outstanding: 0,
}));

const ACTIVE_CUS = [
  "cus-meridian",
  "cus-southpack",
  "cus-orbit",
  ...EXTRA_CUSTOMERS.filter((c) => c.status === "active").map((c) => c.id),
];

const CUS_META: Record<
  string,
  { name: string; city: string; short: string }
> = {
  "cus-meridian": {
    name: "Meridian Electronics",
    city: "Bengaluru",
    short: "ME",
  },
  "cus-southpack": { name: "SouthPack", city: "Chennai", short: "SP" },
  "cus-orbit": { name: "Orbit Pharma", city: "Hyderabad", short: "OP" },
  "cus-nexus": { name: "Nexus Autocomponents", city: "Bengaluru", short: "NX" },
  "cus-forge": { name: "ForgeWorks", city: "Coimbatore", short: "FW" },
  "cus-retailone": { name: "RetailOne", city: "Bengaluru", short: "RO" },
  "cus-medsupply": { name: "MedSupply", city: "Delhi", short: "MS" },
  "cus-citycare": { name: "CityCare", city: "Mumbai", short: "CC" },
  "cus-greenlane": { name: "GreenLane Agri", city: "Bengaluru", short: "GL" },
  "cus-silkroute": { name: "SilkRoute Textiles", city: "Coimbatore", short: "SR" },
  "cus-byteware": { name: "ByteWare", city: "Hyderabad", short: "BW" },
  "cus-pearl": { name: "Pearl Consumer", city: "Mumbai", short: "PC" },
  "cus-valley": { name: "Valley Fresh", city: "Bengaluru", short: "VF" },
  "cus-apex": { name: "Apex Steel", city: "Chennai", short: "AS" },
  "cus-horizon": { name: "Horizon Pharma", city: "Hyderabad", short: "HP" },
};

export const bulkContracts: Contract[] = ACTIVE_CUS.filter(
  (id) => !["cus-meridian", "cus-southpack"].includes(id)
).flatMap((customerId, i) => {
  const meta = CUS_META[customerId];
  const modes: TransportMode[] =
    EXTRA_CUSTOMERS.find((c) => c.id === customerId)?.contractedModes ??
    (["PTL"] as TransportMode[]);
  return modes.slice(0, 2).map((mode, j) => ({
    id: `ctr-b-${i}-${j}`,
    customerId,
    mode,
    zone: `${meta?.city ?? "South"} Corridor`,
    ratePerKg: mode === "FTL" ? 11 + (i % 3) : mode === "AIR" ? 42 : 15 + (i % 5),
    minFreight: mode === "FTL" ? 16000 : mode === "AIR" ? 2500 : 900 + i * 40,
    effectiveFrom: "2026-04-01",
    effectiveTo: "2027-03-31",
    status: "approved" as const,
  }));
});

export const bulkTariffZones: TariffZone[] = ACTIVE_CUS.flatMap(
  (customerId, i) => {
    const meta = CUS_META[customerId];
    if (!meta) return [];
    const city = meta.city;
    const state = CITY[city]?.state ?? "KA";
    return [
      {
        id: `tz-b-${i}-a`,
        customerId,
        mode: "PTL" as TransportMode,
        name: `${meta.short} ${city} metro`,
        basis: "CITY" as const,
        members: city,
        ratePerKg: 16 + (i % 4),
        minFreight: 1000,
        cftFactor: 7,
      },
      {
        id: `tz-b-${i}-b`,
        customerId,
        mode: "PTL" as TransportMode,
        name: `${meta.short} ${state} state`,
        basis: "STATE" as const,
        members: state,
        ratePerKg: 14 + (i % 3),
        minFreight: 1200,
        cftFactor: 6,
      },
    ];
  }
);

export const bulkVendors: Vendor[] = [
  {
    id: "ven-3",
    name: "SafePack Packaging Supplies",
    gstin: "29AABCS3344E1Z1",
    type: "contracted",
    rating: 4.4,
    phone: "+91 98860 55667",
  },
  {
    id: "ven-4",
    name: "Southern Fleet Own",
    gstin: "29AABSO4455F1Z2",
    type: "owned",
    rating: 4.8,
    phone: "+91 99001 66778",
  },
  {
    id: "ven-5",
    name: "Coastal Hire Trucks",
    gstin: "27AABCH5566G1Z3",
    type: "market",
    rating: 3.9,
    phone: "+91 98200 77889",
  },
  {
    id: "ven-6",
    name: "Deccan Cold Chain",
    gstin: "36AABDC6677H1Z4",
    type: "contracted",
    rating: 4.5,
    phone: "+91 90001 88990",
  },
  {
    id: "ven-7",
    name: "Metro Last Mile",
    gstin: "33AABML7788J1Z5",
    type: "market",
    rating: 4.0,
    phone: "+91 94440 99001",
  },
  {
    id: "ven-8",
    name: "National Spare Parts Co",
    gstin: "07AABNS8899K1Z6",
    type: "contracted",
    rating: 4.2,
    phone: "+91 98100 10112",
  },
];

const DRIVER_NAMES = [
  "Suresh Naik",
  "Abdul Rahman",
  "Gopal Krishna",
  "Vinod Shetty",
  "Harish Patel",
  "Naveen Raj",
  "Yusuf Khan",
  "Bala Subramanian",
  "Deepak Joshi",
  "Arun Prakash",
];

export const bulkDrivers: Driver[] = DRIVER_NAMES.map((name, i) => ({
  id: `drv-b-${i + 1}`,
  name,
  phone: `+91 99${String(100 + i).padStart(3, "0")} ${String(22000 + i * 11).slice(0, 5)}`,
  license: `${i % 2 === 0 ? "KA" : "TN"}-${String(10 + i).padStart(2, "0")}-202${i % 5}-${100000 + i * 111}`,
  status: i < 4 ? ("on_trip" as const) : ("available" as const),
}));

const VEH_TYPES = [
  { type: "14 ft Container", kg: 3500, pkgs: 120 },
  { type: "17 ft Open", kg: 5000, pkgs: 160 },
  { type: "32 ft SXL", kg: 9000, pkgs: 280 },
  { type: "Tata Ace", kg: 750, pkgs: 40 },
  { type: "407 Closed", kg: 2500, pkgs: 90 },
  { type: "Reefer 20 ft", kg: 4000, pkgs: 100 },
];

export const bulkVehicles: Vehicle[] = Array.from({ length: 8 }, (_, i) => {
  const t = VEH_TYPES[i % VEH_TYPES.length];
  const states = ["KA", "TN", "TS", "MH", "KA", "TN", "MH", "KA"];
  const st = states[i];
  const vendorId = ["ven-1", "ven-2", "ven-4", "ven-5", "ven-1", "ven-6", "ven-7", "ven-4"][i];
  const driverId = bulkDrivers[i]?.id ?? "drv-1";
  const status: Vehicle["status"] =
    i < 3 ? "in_transit" : i === 7 ? "maintenance" : "available";
  return {
    id: `veh-b-${i + 1}`,
    registration: `${st}${String(1 + (i % 9)).padStart(2, "0")}${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(66 + (i % 25))}${1000 + i * 37}`,
    type: t.type,
    capacityKg: t.kg,
    capacityPackages: t.pkgs,
    vendorId,
    driverId,
    status,
    currentUtilizationPct: status === "in_transit" ? 40 + i * 5 : 0,
    docs: {
      rc: "Valid",
      insurance: i === 5 ? "Expiring" : "Valid",
      permit: "Valid",
      fitness: i === 7 ? "Due" : "Valid",
    },
    insuranceExpiry: i === 5 ? "2026-09-22" : "2027-03-15",
    lat: 12.9 + i * 0.3,
    lng: 77.5 + i * 0.4,
  };
});

type Lane = {
  origin: string;
  dest: string;
  status: DocketStatus;
  mode: TransportMode;
  pay: PaymentMode;
  pkgs: number;
  weight: number;
  day: number;
  scanned?: number;
};

const LANES: Lane[] = [
  // booked / warehouse / exception / billing / invoiced mix
  { origin: "Bengaluru", dest: "Chennai", status: "booked", mode: "PTL", pay: "TBB", pkgs: 4, weight: 180, day: 17 },
  { origin: "Bengaluru", dest: "Hyderabad", status: "booked", mode: "PTL", pay: "TBB", pkgs: 6, weight: 240, day: 17 },
  { origin: "Chennai", dest: "Bengaluru", status: "booked", mode: "PTL", pay: "TO_PAY", pkgs: 3, weight: 95, day: 18 },
  { origin: "Mumbai", dest: "Pune", status: "booked", mode: "FTL", pay: "TBB", pkgs: 20, weight: 2800, day: 16 },
  { origin: "Hyderabad", dest: "Chennai", status: "booked", mode: "PTL", pay: "TBB", pkgs: 5, weight: 160, day: 18 },
  { origin: "Bengaluru", dest: "Mysuru", status: "warehouse", mode: "PTL", pay: "TBB", pkgs: 7, weight: 210, day: 17, scanned: 4 },
  { origin: "Chennai", dest: "Coimbatore", status: "warehouse", mode: "PTL", pay: "TBB", pkgs: 8, weight: 300, day: 16, scanned: 8 },
  { origin: "Hyderabad", dest: "Bengaluru", status: "warehouse", mode: "PTL", pay: "TBB", pkgs: 5, weight: 150, day: 17, scanned: 2 },
  { origin: "Bengaluru", dest: "Hosur", status: "warehouse", mode: "SURFACE", pay: "TBB", pkgs: 10, weight: 400, day: 17, scanned: 10 },
  { origin: "Mumbai", dest: "Bengaluru", status: "warehouse", mode: "PTL", pay: "TBB", pkgs: 6, weight: 220, day: 15, scanned: 6 },
  { origin: "Chennai", dest: "Hyderabad", status: "in_transit", mode: "PTL", pay: "TBB", pkgs: 9, weight: 360, day: 14, scanned: 9 },
  { origin: "Bengaluru", dest: "Pune", status: "in_transit", mode: "FTL", pay: "TBB", pkgs: 28, weight: 3600, day: 13, scanned: 28 },
  { origin: "Hyderabad", dest: "Mumbai", status: "in_transit", mode: "PTL", pay: "TBB", pkgs: 7, weight: 280, day: 14, scanned: 7 },
  { origin: "Chennai", dest: "Kochi", status: "in_transit", mode: "PTL", pay: "TO_PAY", pkgs: 4, weight: 140, day: 15, scanned: 4 },
  { origin: "Bengaluru", dest: "Delhi", status: "in_transit", mode: "AIR", pay: "TBB", pkgs: 3, weight: 72, day: 16, scanned: 3 },
  { origin: "Mumbai", dest: "Delhi", status: "in_transit", mode: "PTL", pay: "TBB", pkgs: 11, weight: 520, day: 12, scanned: 11 },
  { origin: "Hyderabad", dest: "Delhi", status: "out_for_delivery", mode: "PTL", pay: "TBB", pkgs: 5, weight: 190, day: 13, scanned: 5 },
  { origin: "Chennai", dest: "Bengaluru", status: "out_for_delivery", mode: "PTL", pay: "TBB", pkgs: 6, weight: 200, day: 14, scanned: 6 },
  { origin: "Bengaluru", dest: "Chennai", status: "out_for_delivery", mode: "PTL", pay: "TBB", pkgs: 8, weight: 310, day: 15, scanned: 8 },
  { origin: "Mumbai", dest: "Pune", status: "out_for_delivery", mode: "PTL", pay: "PAID", pkgs: 4, weight: 110, day: 16, scanned: 4 },
  { origin: "Bengaluru", dest: "Chennai", status: "pod_pending", mode: "PTL", pay: "TBB", pkgs: 5, weight: 175, day: 12, scanned: 5 },
  { origin: "Chennai", dest: "Hyderabad", status: "pod_pending", mode: "PTL", pay: "TBB", pkgs: 7, weight: 250, day: 11, scanned: 7 },
  { origin: "Hyderabad", dest: "Bengaluru", status: "pod_pending", mode: "PTL", pay: "TBB", pkgs: 4, weight: 130, day: 12, scanned: 4 },
  { origin: "Mumbai", dest: "Bengaluru", status: "pod_pending", mode: "FTL", pay: "TBB", pkgs: 22, weight: 3100, day: 10, scanned: 22 },
  { origin: "Bengaluru", dest: "Mysuru", status: "billing_eligible", mode: "PTL", pay: "TBB", pkgs: 3, weight: 88, day: 10, scanned: 3 },
  { origin: "Chennai", dest: "Coimbatore", status: "billing_eligible", mode: "PTL", pay: "TBB", pkgs: 6, weight: 210, day: 9, scanned: 6 },
  { origin: "Hyderabad", dest: "Chennai", status: "billing_eligible", mode: "PTL", pay: "TBB", pkgs: 5, weight: 160, day: 11, scanned: 5 },
  { origin: "Bengaluru", dest: "Hosur", status: "billing_eligible", mode: "SURFACE", pay: "TBB", pkgs: 9, weight: 340, day: 10, scanned: 9 },
  { origin: "Mumbai", dest: "Pune", status: "invoiced", mode: "PTL", pay: "TBB", pkgs: 5, weight: 150, day: 8, scanned: 5 },
  { origin: "Chennai", dest: "Bengaluru", status: "invoiced", mode: "PTL", pay: "TBB", pkgs: 8, weight: 290, day: 7, scanned: 8 },
  { origin: "Bengaluru", dest: "Pune", status: "invoiced", mode: "FTL", pay: "TBB", pkgs: 30, weight: 4000, day: 6, scanned: 30 },
  { origin: "Hyderabad", dest: "Mumbai", status: "invoiced", mode: "AIR", pay: "TBB", pkgs: 2, weight: 45, day: 8, scanned: 2 },
  { origin: "Bengaluru", dest: "Delhi", status: "paid", mode: "PTL", pay: "TBB", pkgs: 4, weight: 120, day: 5, scanned: 4 },
  { origin: "Chennai", dest: "Kochi", status: "paid", mode: "PTL", pay: "TBB", pkgs: 6, weight: 200, day: 4, scanned: 6 },
  { origin: "Mumbai", dest: "Delhi", status: "paid", mode: "PTL", pay: "TBB", pkgs: 7, weight: 260, day: 3, scanned: 7 },
  { origin: "Hyderabad", dest: "Bengaluru", status: "paid", mode: "PTL", pay: "TBB", pkgs: 5, weight: 180, day: 5, scanned: 5 },
  { origin: "Bengaluru", dest: "Chennai", status: "exception", mode: "PTL", pay: "TBB", pkgs: 6, weight: 200, day: 14, scanned: 6 },
  { origin: "Chennai", dest: "Bengaluru", status: "exception", mode: "PTL", pay: "TO_PAY", pkgs: 4, weight: 140, day: 15, scanned: 4 },
  { origin: "Hyderabad", dest: "Chennai", status: "exception", mode: "PTL", pay: "TBB", pkgs: 5, weight: 170, day: 13, scanned: 5 },
  { origin: "Mumbai", dest: "Pune", status: "exception", mode: "PTL", pay: "TBB", pkgs: 3, weight: 90, day: 16, scanned: 3 },
  { origin: "Bengaluru", dest: "Chennai", status: "booked", mode: "FTL", pay: "TBB", pkgs: 35, weight: 4500, day: 18 },
  { origin: "Chennai", dest: "Hyderabad", status: "warehouse", mode: "PTL", pay: "TBB", pkgs: 7, weight: 260, day: 17, scanned: 3 },
  { origin: "Bengaluru", dest: "Kochi", status: "in_transit", mode: "PTL", pay: "TBB", pkgs: 5, weight: 155, day: 14, scanned: 5 },
  { origin: "Hyderabad", dest: "Pune", status: "pod_pending", mode: "PTL", pay: "TBB", pkgs: 6, weight: 210, day: 11, scanned: 6 },
  { origin: "Mumbai", dest: "Hyderabad", status: "billing_eligible", mode: "PTL", pay: "TBB", pkgs: 4, weight: 125, day: 9, scanned: 4 },
  { origin: "Bengaluru", dest: "Mumbai", status: "invoiced", mode: "AIR", pay: "TBB", pkgs: 2, weight: 38, day: 7, scanned: 2 },
  { origin: "Chennai", dest: "Delhi", status: "paid", mode: "PTL", pay: "TBB", pkgs: 8, weight: 300, day: 2, scanned: 8 },
];

function makeDocket(i: number, lane: Lane, customerId: string): Docket {
  const num = 10300 + i;
  const id = `dk-${num}`;
  const meta = CUS_META[customerId];
  const name = meta?.name ?? "Customer";
  const short = meta?.short ?? "XX";
  const freight = Math.max(
    900,
    Math.round(lane.weight * (lane.mode === "AIR" ? 45 : lane.mode === "FTL" ? 12 : 18))
  );
  const fuel = Math.round(freight * 0.14);
  const handling = Math.round(freight * 0.03);
  const scanned =
    lane.scanned ??
    (["booked"].includes(lane.status)
      ? 0
      : lane.status === "warehouse"
        ? Math.max(1, Math.floor(lane.pkgs * 0.6))
        : lane.pkgs);
  const o = CITY[lane.origin];
  const d = CITY[lane.dest];
  return {
    id,
    number: `DK-${num}`,
    customerId,
    consignor: `${name} — ${lane.origin}`,
    consignee: `${name} — ${lane.dest}`,
    originCity: lane.origin,
    originPin: o?.pin ?? "560001",
    destinationCity: lane.dest,
    destinationPin: d?.pin ?? "600001",
    originBranchId: o?.branch ?? "br-blr",
    paymentMode: lane.pay,
    transportMode: lane.mode,
    packages: lane.pkgs,
    actualWeightKg: lane.weight,
    chargeableWeightKg: Math.round(lane.weight * 1.05),
    lengthCm: 50,
    widthCm: 40,
    heightCm: 35,
    freight,
    fuelSurcharge: fuel,
    handling,
    otherCharges: 0,
    gstRate: 18,
    invoiceNumber: `${short}-${4000 + i}`,
    ewayBill:
      lane.weight > 100
        ? `1710 ${String(1000 + i).padStart(4, "0")} ${String(200000 + i * 13).slice(0, 6)}`
        : undefined,
    riskType: "Carrier's Risk",
    edd: date(Math.min(28, lane.day + 2)),
    status: lane.status,
    bookingSource: "Regular Customer",
    createdAt: ts(lane.day, 8 + (i % 6), (i * 7) % 60),
    updatedAt: ts(lane.day, 12 + (i % 5), (i * 11) % 60),
    boxes: makeBoxes(id, lane.pkgs, scanned, ts(lane.day, 9, 15)),
  };
}

export const bulkDockets: Docket[] = LANES.map((lane, i) =>
  makeDocket(i, lane, ACTIVE_CUS[i % ACTIVE_CUS.length])
);

/** Attach trip/pod/invoice refs after those arrays exist */
function patchDocketLinks() {
  // filled after trips/pods/invoices built — mutate bulkDockets in place below
}

const ALL_VEH = ["veh-1", "veh-2", "veh-3", "veh-4", ...bulkVehicles.map((v) => v.id)];
const ALL_DRV = ["drv-1", "drv-2", "drv-3", ...bulkDrivers.map((d) => d.id)];
const ALL_VEN = ["ven-1", "ven-2", ...bulkVendors.map((v) => v.id)];

const transitStatuses: Trip["status"][] = [
  "planned",
  "dispatched",
  "in_transit",
  "in_transit",
  "arrived",
  "completed",
];

export const bulkTrips: Trip[] = bulkDockets
  .filter((d) =>
    [
      "in_transit",
      "out_for_delivery",
      "pod_pending",
      "billing_eligible",
      "invoiced",
      "paid",
      "warehouse",
    ].includes(d.status)
  )
  .slice(0, 18)
  .map((d, i) => {
    const st = transitStatuses[i % transitStatuses.length];
    const progress =
      st === "planned"
        ? 0
        : st === "dispatched"
          ? 12
          : st === "in_transit"
            ? 45 + (i % 40)
            : 100;
    const tripId = `trip-b-${i + 1}`;
    d.tripId = tripId;
    return {
      id: tripId,
      code: `TRP-${d.originCity.slice(0, 3).toUpperCase()}-${d.destinationCity.slice(0, 3).toUpperCase()}-${d.number.replace("DK-", "")}`,
      docketIds: [d.id],
      vehicleId: ALL_VEH[i % ALL_VEH.length],
      driverId: ALL_DRV[i % ALL_DRV.length],
      vendorId: ALL_VEN[i % ALL_VEN.length],
      origin: d.originCity,
      destination: d.destinationCity,
      status: st,
      progressPct: progress,
      eta: ts(Math.min(28, 18 + (i % 5)), 18, 0),
      departedAt: st === "planned" ? undefined : ts(14 + (i % 4), 6, 0),
      currentLocation:
        st === "completed" || st === "arrived"
          ? d.destinationCity
          : st === "planned"
            ? `${d.originCity} Hub`
            : `${d.originCity} → ${d.destinationCity}`,
      lat: 12 + i * 0.4,
      lng: 77 + i * 0.3,
      checkpoints: [
        {
          label: `Departed ${d.originCity}`,
          at: st === "planned" ? "" : ts(14 + (i % 4), 6, 0),
          done: st !== "planned",
        },
        {
          label: "En route checkpoint",
          at: progress > 40 ? ts(15 + (i % 3), 12, 0) : "",
          done: progress > 40,
        },
        {
          label: `Arrive ${d.destinationCity}`,
          at: progress >= 100 ? ts(16 + (i % 3), 16, 0) : "",
          done: progress >= 100,
        },
      ],
      estimatedCost: Math.round(d.freight * 0.55),
      publicToken: `trk-${d.id}`,
      customerUpdates:
        progress > 40
          ? [
              {
                at: ts(15 + (i % 3), 12, 30),
                message: `In transit on ${d.originCity}–${d.destinationCity} lane`,
                channel: "SMS" as const,
              },
            ]
          : [],
    };
  });

export const bulkManifests: Manifest[] = bulkTrips.slice(0, 7).map((t, i) => ({
  id: `mf-b-${i + 1}`,
  code: `MF-${6717500 + i}`,
  tripId: t.id,
  docketIds: t.docketIds,
  vehicleReg: bulkVehicles[i % bulkVehicles.length]?.registration,
  driverName: bulkDrivers[i % bulkDrivers.length]?.name,
  originHub: `${t.origin} Hub`,
  destinationHub: `${t.destination} Hub`,
  ewayStatus: i % 5 === 0 ? ("pending" as const) : ("generated" as const),
  ewayNumber: i % 5 === 0 ? undefined : `1710 8800 ${112200 + i}`,
  status: t.status === "planned" ? ("draft" as const) : ("dispatched" as const),
  createdAt: ts(14 + (i % 4), 5, 30),
}));

const podCandidates = bulkDockets.filter((d) =>
  ["pod_pending", "billing_eligible", "invoiced", "paid", "out_for_delivery"].includes(
    d.status
  )
);

export const bulkPods: POD[] = podCandidates.slice(0, 12).map((d, i) => {
  const statuses: POD["status"][] = [
    "pending",
    "extracted",
    "extracted",
    "approved",
    "approved",
    "rejected",
  ];
  const status = statuses[i % statuses.length];
  const id = `pod-b-${i + 1}`;
  d.podId = id;
  return {
    id,
    docketId: d.id,
    status,
    receiverName: ["Ramesh K", "Sita Devi", "Imran Shaikh", "Anita Rao", "John Mathew"][
      i % 5
    ],
    deliveryAt: ts(12 + (i % 6), 14, 20),
    signatureDetected: status !== "rejected",
    sealDetected: i % 3 !== 0,
    gpsVerified: true,
    ocrConfidence: status === "rejected" ? 0.55 : 0.82 + (i % 10) / 100,
    imageLabel: `POD scan — ${d.number}`,
    remarks: status === "rejected" ? "Signature mismatch — re-upload" : undefined,
    createdAt: ts(12 + (i % 6), 15, 0),
  };
});

const invoiceCandidates = bulkDockets.filter((d) =>
  ["invoiced", "paid", "billing_eligible"].includes(d.status)
);

export const bulkInvoices: Invoice[] = invoiceCandidates.slice(0, 16).map((d, i) => {
  const subtotal = d.freight + d.fuelSurcharge + d.handling;
  const tax = invoiceTax(subtotal, d.originCity, d.destinationCity);
  const paid = d.status === "paid";
  const partial = !paid && i % 5 === 0;
  const id = `inv-b-${i + 1}`;
  if (d.status === "invoiced" || d.status === "paid") {
    d.billingInvoiceId = id;
  }
  return {
    id,
    number: `INV-2026-${String(100 + i).padStart(4, "0")}`,
    customerId: d.customerId,
    docketId: d.id,
    invoiceDate: date(Math.max(1, 8 + (i % 10))),
    dueDate: date(Math.min(28, 18 + (i % 8))),
    subtotal,
    ...tax,
    status: paid
      ? ("paid" as const)
      : partial
        ? ("partially_paid" as const)
        : d.status === "billing_eligible"
          ? ("draft" as const)
          : ("issued" as const),
    amountReceived: paid
      ? tax.total
      : partial
        ? Math.round(tax.total * 0.4)
        : 0,
  };
});

export const bulkReceipts: Receipt[] = [
  ...bulkInvoices
    .filter((inv) => inv.amountReceived > 0)
    .map((inv, i) => ({
      id: `rcpt-b-${i + 1}`,
      number: `RCT-2026-${String(50 + i).padStart(4, "0")}`,
      customerId: inv.customerId,
      invoiceIds: [inv.id],
      amount: inv.amountReceived,
      mode: ["NEFT", "RTGS", "UPI", "Cheque"][i % 4],
      receivedAt: ts(10 + (i % 8), 11, 30),
    })),
  // Extra AR activity against issued invoices (partial collections)
  ...bulkInvoices
    .filter((inv) => inv.status === "issued" && inv.amountReceived === 0)
    .slice(0, 4)
    .map((inv, i) => {
      const amount = Math.round(inv.total * 0.35);
      inv.amountReceived = amount;
      inv.status = "partially_paid";
      return {
        id: `rcpt-b-x-${i + 1}`,
        number: `RCT-2026-${String(80 + i).padStart(4, "0")}`,
        customerId: inv.customerId,
        invoiceIds: [inv.id],
        amount,
        mode: ["NEFT", "UPI", "RTGS", "Cheque"][i % 4],
        receivedAt: ts(14 + i, 15, 10),
      };
    }),
];

// Recompute outstanding on bulk customers from unpaid invoices
{
  const owed = new Map<string, number>();
  for (const inv of bulkInvoices) {
    const bal = inv.total - inv.amountReceived;
    if (bal <= 0) continue;
    owed.set(inv.customerId, (owed.get(inv.customerId) ?? 0) + bal);
  }
  for (const c of bulkCustomers) {
    c.outstanding = Math.round(owed.get(c.id) ?? 0);
  }
}

export const bulkTickets: Ticket[] = Array.from({ length: 8 }, (_, i) => {
  const d = bulkDockets[i * 3] ?? bulkDockets[0];
  return {
    id: `tkt-b-${i + 1}`,
    number: `TKT-2026-091${i}-${String(i + 10).padStart(2, "0")}`,
    subject: [
      "ETA enquiry",
      "Damage claim follow-up",
      "Invoice copy request",
      "Wrong delivery address",
      "POD not uploaded",
      "Rate dispute",
      "Vehicle delay",
      "Shortage at hub",
    ][i],
    customerId: d.customerId,
    docketId: d.id,
    severity: (["P1", "P2", "P2", "P3", "P1", "P3", "P2", "P2"] as const)[i],
    category: ["DELAY", "DAMAGE", "BILLING", "DELIVERY", "POD", "COMMERCIAL", "DELAY", "SHORTAGE"][i],
    status: (["open", "in_progress", "open", "resolved", "in_progress", "closed", "open", "in_progress"] as const)[i],
    owner: "Support Desk",
    slaDue: ts(18, 18, 0),
    createdAt: ts(12 + (i % 6), 10, 0),
    updates: [
      {
        action: "CREATED",
        note: "Ticket logged from customer portal",
        at: ts(12 + (i % 6), 10, 0),
      },
    ],
  };
});

export const bulkThcs: THC[] = bulkTrips.slice(0, 5).map((t, i) => ({
  id: `thc-b-${i + 1}`,
  number: `THC-2026-${320 + i}`,
  tripId: t.id,
  vendorId: t.vendorId,
  vehicleId: t.vehicleId,
  contractAmount: t.estimatedCost,
  advance: Math.round(t.estimatedCost * 0.3),
  status: (["draft", "submitted", "approved", "approved", "completed"] as const)[i],
  createdAt: ts(14 + (i % 3), 5, 50),
}));

export const bulkBths: BTH[] = bulkThcs.slice(0, 3).map((thc, i) => ({
  id: `bth-b-${i + 1}`,
  number: `BTH-2026-${100 + i}`,
  thcId: thc.id,
  balanceAmount: thc.contractAmount - thc.advance,
  podStatus: (["PENDING", "RECEIVED", "NOT_REQUIRED"] as const)[i],
  additionalCharges:
    i === 1 ? [{ type: "Detention", amount: 800 }] : [],
  status: (["pending_accounts", "pending_payment", "paid"] as const)[i],
  utr: i === 2 ? "UTRNEFT998877" : undefined,
  createdAt: ts(15 + i, 9, 0),
}));

export const bulkNetworkLocations: NetworkLocation[] = [
  {
    id: "loc-west",
    code: "REG-WEST",
    name: "West Region",
    type: "REGION",
    region: "West",
    state: "MH",
    city: "Mumbai",
    pin: "400001",
  },
  {
    id: "loc-north",
    code: "REG-NORTH",
    name: "North Region",
    type: "REGION",
    region: "North",
    state: "DL",
    city: "Delhi",
    pin: "110001",
  },
  {
    id: "loc-mum",
    code: "BR-MUM",
    name: "Mumbai Hub",
    type: "BRANCH",
    region: "West",
    state: "MH",
    city: "Mumbai",
    pin: "400069",
    parentId: "loc-west",
  },
  {
    id: "loc-pun",
    code: "BR-PUN",
    name: "Pune Booking Hub",
    type: "BRANCH",
    region: "West",
    state: "MH",
    city: "Pune",
    pin: "411019",
    parentId: "loc-west",
  },
  {
    id: "loc-del",
    code: "BR-DEL",
    name: "Delhi NCR Hub",
    type: "BRANCH",
    region: "North",
    state: "DL",
    city: "Delhi",
    pin: "110020",
    parentId: "loc-north",
  },
  {
    id: "loc-mum-bo",
    code: "BO-MUM-AND",
    name: "Andheri Booking Office",
    type: "BOOKING_OFFICE",
    region: "West",
    state: "MH",
    city: "Mumbai",
    pin: "400053",
    parentId: "loc-mum",
  },
  {
    id: "loc-chn-bo",
    code: "BO-CHN-GUINDY",
    name: "Guindy Booking Office",
    type: "BOOKING_OFFICE",
    region: "South",
    state: "TN",
    city: "Chennai",
    pin: "600032",
    parentId: "loc-chn",
  },
  {
    id: "loc-hyd-bo",
    code: "BO-HYD-HIT",
    name: "HITEC Booking Office",
    type: "BOOKING_OFFICE",
    region: "South",
    state: "TS",
    city: "Hyderabad",
    pin: "500081",
    parentId: "loc-hyd",
  },
  {
    id: "loc-krish",
    code: "TH-KRISH",
    name: "Krishnagiri Transshipment",
    type: "TRANSSHIPMENT_HUB",
    region: "South",
    state: "TN",
    city: "Krishnagiri",
    pin: "635001",
    parentId: "loc-south",
  },
];

export const bulkWarehouseExceptions: WarehouseException[] = [
  ...bulkDockets
    .filter((d) => d.status === "exception")
    .slice(0, 5)
    .map((d, i) => ({
      id: `wex-b-${i + 1}`,
      docketId: d.id,
      scanCode: d.boxes[0]?.barcode ?? `BX-${d.number}`,
      type: (["DAMAGE", "SHORTAGE", "EXCESS", "MISROUTED", "DAMAGE"] as const)[i],
      severity: (["HIGH", "MEDIUM", "LOW", "HIGH", "MEDIUM"] as const)[i],
      hub: `${d.originCity} Hub`,
      remarks: [
        "Corner crush on carton 1",
        "One package short vs booking",
        "Extra carton without label",
        "Loaded on wrong lane vehicle",
        "Wet damage — tarp failure",
      ][i],
      status: (["open", "investigating", "open", "closed", "investigating"] as const)[i],
      createdAt: ts(14 + (i % 3), 16, 0),
    })),
  {
    id: "wex-b-6",
    docketId: bulkDockets.find((d) => d.status === "warehouse")?.id ?? "dk-10305",
    scanCode: "BX-10305-02",
    type: "SHORTAGE",
    severity: "MEDIUM",
    hub: "Bengaluru Hub",
    remarks: "Booking shows 7; inbound scan counted 6",
    status: "open",
    createdAt: ts(17, 15, 20),
  },
];

export const bulkHubScans: HubScanEvent[] = bulkDockets
  .filter((d) => d.boxes.some((b) => b.scanned))
  .slice(0, 20)
  .map((d, i) => {
    const box = d.boxes.find((b) => b.scanned) ?? d.boxes[0];
    return {
      id: `scan-b-${i + 1}`,
      docketId: d.id,
      barcode: box.barcode,
      movement: (i % 3 === 0 ? "SCAN_OUTWARD" : "SCAN_INWARD") as HubScanEvent["movement"],
      hub: `${d.originCity} Hub`,
      packages: 1,
      weightKg: Math.round(d.actualWeightKg / d.packages),
      condition: (["GOOD", "GOOD", "GOOD", "DAMAGED", "OPEN"] as const)[i % 5],
      remarks: i % 5 === 3 ? "Corner dent noted" : undefined,
      at: ts(15 + (i % 3), 8 + (i % 8), 10),
    };
  });

export const bulkAudit: AuditEvent[] = Array.from({ length: 12 }, (_, i) => ({
  id: `aud-b-${i + 1}`,
  at: ts(12 + (i % 6), 9 + i, 0),
  user: ["Priya Nair", "Suresh Rao", "Anil Mehta", "Kavya Iyer", "Support Desk"][
    i % 5
  ],
  module: ["Booking", "Warehouse", "Traffic", "POD", "Billing"][i % 5],
  entityType: "Docket",
  entityId: bulkDockets[i]?.number ?? "DK-10300",
  action: [
    "Created docket",
    "Package scanned",
    "Manifest generated",
    "Trip dispatched",
    "POD approved",
    "Invoice issued",
  ][i % 6],
  previous: "—",
  next: "Updated",
}));

// silence unused
void patchDocketLinks;
void gstin;
