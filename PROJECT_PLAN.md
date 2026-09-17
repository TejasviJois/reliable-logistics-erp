# Reliable Logistics ERP — Project Plan

**Product:** Reliable  
**Positioning:** Intelligent transport operations control platform  
**Scope:** High-fidelity demo / mockup (not production Phase 1)  
**Sources:** `Logistics_ERP_User_Flows`, `Logistics_ERP_Functional_Architecture_Structured`  
**UX reference only:** Transport Network competitor screenshots  

---

## 1. Executive summary

Build a presenter-ready enterprise logistics demo that feels production-ready. The demo proves one coherent business story: create shipment → warehouse scan → dispatch → track → deliver → AI+human POD → bill → collect → Copilot summarizes. Information architecture mirrors the full ERP so modules can scale later; only P0 screens are polished and interactive. Polish, coherence, interaction, business story, and visual quality beat screen count.

## 2. Understanding of the client's requirements

The system is an interconnected enterprise operating system spanning:

- Administration (org, branch, hub, users, roles, approvals, audit)
- Marketing, CRM & Sales (campaigns, leads, opportunities, quotations)
- Customer & Contract (master, contacts, contracts, zones, tariffs, billing rules)
- Logistics Operations (pickup, booking, docket, boxes, warehouse, traffic, manifest, e-way, transit, hubs, delivery)
- POD & Customer Support (OCR, mapping, QA, tickets, SLA, exceptions)
- Billing, Finance & Collections (invoices, GST, AR, AP, bank, receipts, aging)
- Transport Vendor & Cost (vendors, THC, BTH, profitability)
- Fleet (vehicles, drivers, fuel, maintenance)
- Procurement & Assets, HR & Payroll, IT / Legal / Documents
- Customer & Employee portals, MIS / BI
- Shared: Auth, RBAC, Approval Engine, Event Bus, Audit, Notifications, Search, Documents, Integrations

**Critical system gates**

| Condition | Effect |
|---|---|
| Customer not Admin-approved | Docket booking blocked |
| Required E-way missing | Manifest / dispatch blocked |
| Market vehicle without THC | Dispatch blocked |
| POD not approved (TBB) | Billing blocked |
| POD approved | Delivered + billing unlocked |
| Receipt entered | Invoice + outstanding update |

## 3. Full module map

| Domain | Modules | Demo depth |
|---|---|---|
| Control | Operations Overview, AI Copilot | P0 |
| Operations | Bookings, Warehouse, Traffic, Tracking, Delivery, POD, Support | P0 / P1 |
| Commercial | Customers, Contracts & Tariffs, CRM & Sales | P0 / P2 |
| Finance | Billing, Receivables, Vendor Costs (THC/BTH), GL | P0 / P1 / P2 |
| Resources | Fleet, Vendors, Procurement, Assets, HR | P1 / P2 |
| Governance | Administration, Audit, Documents, Compliance, Reports | P1 / P2 |
| Portals | Customer Portal, Employee Portal | P2 shells |

## 4. Core entity map

Organization → Branch / Hub → User / Role → Customer / Contact → Contract / Zone / Tariff → Pickup → Docket → DocketBox → Manifest → Trip → Vehicle / Driver / Vendor → EwayBill → HubMovement → Delivery → POD → Exception / Ticket → Invoice → Receipt → Outstanding → THC / BTH → Document → AuditEvent / Notification / Approval

**Hero demo shipment (consistent everywhere)**

- Docket: `DK-10231`
- Customer: Meridian Electronics Pvt Ltd
- Route: Bengaluru → Chennai
- Mode: Surface PTL
- Packages: 9 · Weight: 800 kg · Freight: ₹18,450
- Vehicle: KA01AB4521 · Driver: Ravi Kumar
- Invoice: `INV-2026-0091`

## 5. Department data flow

```
Marketing → Sales → Customer → Admin Approval → Contract/Tariff
→ Pickup → Docket → Boxes → Warehouse → Traffic → Manifest → E-way
→ Transit → Hub Inward → Hub Outward → Delivery → POD → Delivered
→ Billing → Invoice → Receipt → Outstanding → Settled
```

Demo-critical handoffs: Booking→Warehouse, Warehouse→Traffic, Traffic→THC, Delivery→POD, POD→Billing unlock, Billing→Receivable, Receipt→Outstanding.

## 6. User / role model

| Role | Primary demo use |
|---|---|
| Demo Administrator (default) | Full story, all modules |
| Booking Clerk | Docket creation |
| Warehouse Operator | Scan / manifest |
| Traffic Manager | Dispatch |
| POD Cell | POD review |
| Billing / Accounts | Invoice + receipt |

Soft role lens in topbar filters emphasis and attention queues; not a hard RBAC backend.

## 7. Proposed information architecture

Grouped sidebar (not flat module list):

- **CONTROL** — Operations Overview, AI Copilot
- **OPERATIONS** — Bookings, Warehouse, Traffic & Dispatch, Live Tracking, Delivery, POD
- **COMMERCIAL** — Customers, Contracts & Tariffs
- **FINANCE** — Billing, Receivables, Vendor Costs
- **RESOURCES** — Fleet, Vendors
- **GOVERNANCE** — Administration, Audit, Reports
- **PORTALS** — Customer Portal, Employee Portal

Global search + Cmd+K across Docket, Customer, Invoice, Vehicle, Driver, Manifest, POD, Ticket.

## 8. Competitor UX analysis (Transport Network)

**Strengths:** logistics terminology; dark teal shell; attention queues; master-detail tracking; POD human-in-loop intent; live invoice calc; audited ticket timeline.

**Weaknesses:** flat nav; repeated hero banners; card-everywhere; single-page docket form; tracking without map; traffic without vehicle reasoning; warehouse not scan-first; weak AI extraction UX; poor demo data (`Abc`, `1234`, ₹675); enum noise (`SURFACE_PTL`); opaque footer KPIs; no global search / drawers / journey chrome.

## 9. Specific improvements over competitor

1. Grouped IA + journey-aware entity headers
2. Control Tower pipeline + SLA attention queue
3. 4-step docket wizard + persistent summary
4. Warehouse Scan Package as primary interaction
5. Explainable vehicle recommendation on Traffic
6. Map-based live tracking + timeline
7. POD: document | AI extract | docket facts
8. Billing gated on POD approval
9. Believable Indian mock data + human labels
10. Global search, drawers, audit feeds
11. Copilot over live demo state
12. Fewer banners; density without clutter

## 10. Design principles

Every major screen answers: What is happening? What needs attention? Why does it matter? What can I do? What happened after?

Pattern: **CONTEXT → INSIGHT → WORKFLOW → ACTION → RESULT**

## 11. Design system

- Neutrals: slate scale
- Accent: teal `#0F6B5C`
- Status: booked/amber, transit/blue, delivered/green, exception/red, pending/violet
- Type: Plus Jakarta Sans (UI), IBM Plex Sans (tables)
- Radius 6–8px; 1px borders; minimal shadows
- Components: AppShell, KPIStat, StatusBadge, DataTable, DetailDrawer, Timeline, WorkflowStepper, AIChat, MapPanel, ScanPanel, InvoicePreview, etc.

## 12. Core demo journey

Meridian customer → Create DK-10231 → Scan 9 packages → Dispatch KA01AB4521 → Track on map → Deliver → Upload POD → AI extract → Human approve → Billing unlocked → Invoice INV-2026-0091 → Receipt → Outstanding decreases → Copilot summarizes lifecycle.

## 13. Screen inventory

See section 14 table.

## 14. Screen priority

| Priority | Module | Screen | Purpose | Demo importance | Dependencies |
|---|---|---|---|---|---|
| P0 | Control | Operations Overview | Control tower | Story open | All entities |
| P0 | Control | AI Copilot | Conversational intelligence | Wow close | Live store |
| P0 | Commercial | Customer Detail | Relationship 360 | Scene 3 | Customer graph |
| P0 | Ops | Bookings list | Docket register | Nav hub | Dockets |
| P0 | Ops | Create Docket | Booking wizard | Scene 4 | Customer, tariff |
| P0 | Ops | Warehouse Scan | Physical ops | Scene 5 | Boxes |
| P0 | Ops | Traffic Dispatch | Load + allocate | Scene 6 | Vehicles, vendors |
| P0 | Ops | Live Tracking | Map control tower | Scene 8 | Trips |
| P0 | Ops | Delivery | OFD / delivered | Scene 9 | Trips |
| P0 | Ops | POD Review | AI + human approve | Scenes 10–12 | POD |
| P0 | Finance | Billing / Invoice | Unlock → invoice | Scenes 13–14 | POD gate |
| P0 | Finance | Receivables | Receipt + aging | Scene 15 | Invoices |
| P0 | Shell | Global Search / CmdK | Universal find | Usability | All |
| P1 | Ops | Support Tickets | SLA queue | Credibility | Dockets |
| P1 | Finance | THC (light) | Vendor cost | Cost story | Manifest |
| P1 | Governance | Admin users | RBAC glimpse | Enterprise | Users |
| P1 | Governance | Audit Log | History | Trust | Events |
| P1 | Resources | Fleet list | Docs / expiry | Attention | Vehicles |
| P2 | Shells | CRM, Procurement, HR, Portals, MIS, Compliance | Architecture proof | Scope signal | Nav |

## 15. Detailed screen specifications (P0)

### Operations Overview
- Role: Admin / Management
- Objective: Network health at a glance
- KPIs: Today's shipments, In transit, Out for delivery, Exceptions, Revenue, Outstanding
- Pipeline: Booked → Warehouse → Dispatched → In Transit → At Hub → OFD → Delivered → Billing → Paid
- Attention queue: SLA risks, delayed, pending POD, billing queue, overdue invoices, vehicle doc expiry
- Interaction: Click docket → detail drawer

### Create Docket
- Role: Booking Clerk
- Steps: Shipment → Cargo → Commercial → Compliance
- Summary rail: route, packages, weight, mode, estimated freight
- Actions: Save Draft, Create Docket
- Result: Docket appears in Bookings + Overview

### Warehouse Scan
- Primary: Scan package barcode
- Shows: docket context, N/M progress, duplicate/unknown warnings, recent activity, manifest readiness

### Traffic & Dispatch
- Pending load by destination/mode
- Vehicle cards: capacity, utilization, driver, vendor, est. cost
- AI recommendation with explainable reasons
- Action: Dispatch → In Transit

### Live Tracking
- Map with active vehicles
- Selected journey panel + ETA + timeline

### POD Review
- Left: document · Center: AI extraction + confidence · Right: docket facts
- Actions: Approve / Request Review / Reject
- Result: Billing unlocked + audit event

### Billing
- Eligible queue after POD approve
- Charges, GST, live invoice preview
- Generate invoice → receivables

### Receivables
- Outstanding by customer
- Record receipt → allocate → outstanding decreases

### AI Copilot
- Answers against live store
- Structured, explainable, action-oriented
- Never silently mutates records

## 16. Navigation architecture

Grouped sidebar + topbar (branch context, global search, role lens, AI shortcut, user). Entity headers deep-link across modules. Detail drawers for peek without full navigation.

## 17. Component architecture

AppShell, Sidebar, Topbar, GlobalSearch, CommandPalette, KPIStat, StatusBadge, DataTable, FilterBar, DetailDrawer, Timeline, WorkflowStepper, ActivityFeed, ApprovalCard, ExceptionCard, EmptyState, AIChat, AIRecommendation, MapPanel, EntityHeader, PageHeader, ScanPanel, InvoicePreview, MetricCard.

## 18. Mock data architecture

Centralized entities under `src/data`. Views derive from entities. No duplicated hardcoded values across screens. Hero shipment data identical everywhere.

## 19. Interaction architecture

Mutations in demo store: `createDocket`, `scanBox`, `dispatchTrip`, `markDelivered`, `ingestPod`, `approvePod`, `generateInvoice`, `recordReceipt`. Each appends AuditEvent. Overview and Copilot subscribe to live state.

## 20. AI Copilot strategy

| Feature | Interactive | Human approval |
|---|---|---|
| Ops Q&A | Yes | N/A (read) |
| Vehicle matching | Yes (Traffic) | Confirm Dispatch |
| Document AI (POD) | Yes | Approve / Reject |
| Delay / SLA insight | Yes | Recommend only |
| Rate hint | Soft | User accepts |
| Forecast / return-load / fraud | Canned insights only | Not executable |

Pattern: READ → ANALYZE → RECOMMEND → HUMAN APPROVAL → EXECUTE.

## 21. Approval / audit strategy

States: Draft → Submitted → Pending Approval → Approved / Rejected / On Hold → Completed.  
Audit fields: user, timestamp, branch, module, entity, old value, new value, action. Visible on entity timelines and Audit Log.

## 22. Responsive strategy

Desktop-first: 1440 / 1280 / 1024. Collapsible sidebar on tablet. No mobile-first redesign for demo.

## 23. Technical architecture

- Next.js App Router, React, TypeScript
- Tailwind CSS + shadcn/ui + Lucide
- Recharts for simple charts
- Leaflet / react-leaflet for map
- Zustand for demo store
- Mock data only (no backend required)

Future seams: Supabase/Postgres, Auth/RBAC, E-way, GST, WhatsApp, GPS providers.

## 24. Folder structure

```
/app                      # routes
/src/components/ui        # shadcn primitives
/src/components           # composites
/src/modules              # feature screens
/src/data                 # seed entities
/src/store                # demo state
/src/types
/src/lib
/public
PROJECT_PLAN.md
```

## 25. Implementation phases

1. Foundation — shell, tokens, types, seed, store  
2. P0 journey screens + mutations  
3. Copilot + search + drawers  
4. P1 — Support, THC, Admin, Audit, Fleet  
5. P2 shells + demo script dry-run  

## 26. Demo presentation flow

1. Operations Overview  
2. Network health  
3. Open Meridian customer  
4. Create / show DK-10231  
5. Warehouse scan  
6. Traffic dispatch  
7. Transit starts  
8. Live tracking map  
9. Delivery  
10. POD upload  
11. AI extraction  
12. Human approve  
13. Billing unlocked  
14. Generate invoice  
15. Record receipt  
16. Copilot: complete picture of DK-10231  

## 27. Risks / ambiguities

- Competitor is a prior same-scope demo — do not clone layouts  
- Real E-way / GST / WhatsApp / GPS out of scope — simulate  
- Rating engine simplified  
- Soft role lens vs hard RBAC  
- Brand locked as Reliable unless changed  

## 28. Things that should NOT be built in the first demo

Full GL/P&L, bank reconciliation, payroll, recruitment, RFQ comparison, real NIC E-way, real GPS providers, multi-tenant backend, WhatsApp gateway, full credit/debit notes, dense CRUD for every master, mobile apps.

## 29. Future production architecture considerations

Follow architecture doc phases: Foundation → CRM → Core Logistics → Transit → POD → Billing → Vendor/Fleet → HR/Procurement → Portals/MIS → Enterprise controls. Demo store entities map 1:1 to core tables in Part E. Shared services (event bus, approval, documents, integrations) become real backends.
