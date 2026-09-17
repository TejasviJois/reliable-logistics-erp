# Demo Presentation Script — Reliable Logistics Solutions

Presenter role: **Demo Administrator** · Branch: **Bengaluru Hub**

Hero shipment: **DK-10231** · Meridian Electronics · Bengaluru → Chennai · 9 pkgs · 800 kg

---

## Scene 0 — Sign in (demo accounts)
1. Open `/login` (unauthenticated visits redirect here)
2. Tabs: **Admin** · **Bengaluru Hub** · **Chennai Hub** · **Hyderabad Hub**
3. Click any role card — no password · **Switch user** in topbar to change

| Scope | Accounts |
| --- | --- |
| Admin | Demo Administrator (`admin@reliable.in`) — full nav, all branches |
| Each hub | 14 roles (same set per hub) |

**Roles per hub:** Branch Manager · Sales Executive · Booking Clerk · Warehouse Operator · Traffic Manager · Delivery Operations · POD Cell · Customer Support · Billing / Accounts · Fleet Manager · Procurement · HR Executive · IT Helpdesk · Legal & Compliance

Nav is filtered **by module** for each role (not just group). Each role lands on their department workbench with a **Your work today** queue.

| Role | Lands on | Work they see |
| --- | --- | --- |
| Admin / Super User | `/` | Org, RBAC, approvals, MIS, audit |
| Management / MIS | `/` | Executive / ops control tower |
| Marketing | `/marketing` | Campaigns → leads → sales handoff |
| Sales Executive | `/customers` | Customer create → approval → CRM |
| Booking Clerk | `/bookings` | Docket creation |
| Warehouse / Hub | `/warehouse` | Label · scan · manifest |
| Traffic Manager | `/traffic` | Load · vehicle · THC/BTH |
| Delivery / Field | `/delivery` | OFD · POD upload |
| POD Cell | `/pod` | OCR · approve → billing unlock |
| Customer Support | `/support` | Tickets · SLA · status |
| Billing / Accounts | `/billing` | Invoice queue post-POD |
| Accounts / Collections | `/receivables` | Receipt · aging · settlement |
| Fleet | `/fleet` | Vehicles · docs · availability |
| Procurement | `/procurement` | PR / PO / vendors |
| HR | `/hr` | Employees · leave · payroll |
| IT Helpdesk | `/admin` | Access · audit |
| Legal & Compliance | `/compliance` | Licenses · renewals |

Roles and primary flows are aligned to `Logistics_ERP_User_Flows.pdf`.

**Admin access control** (`/admin` as Admin / IT / Branch Manager):
- **Role access** — toggle modules for each role template (applies to all users of that role)
- **User access** — enable/disable login per account, or set a custom module override
- Sidebar and login respect these grants immediately (persisted in browser)

---

## Scene 1–2 — Operations Overview
1. Open `/`
2. Walk KPI strip, attention queue, top lanes
3. Click DK-10231 row → detail drawer → show workflow stepper

## Scene 3 — Customer
1. Open `/customers/cus-meridian`
2. Show contracts, shipments, invoices, tickets as one relationship

## Scene 4 — Booking (optional create, or use seeded DK-10231)
1. `/bookings/new` — walk 4 steps + summary rail
2. Or open `/bookings/dk-10231`

## Scene 5 — Warehouse
1. `/warehouse`
2. Scan `BX-10231-09` (8/9 already done)
3. Show progress → Manifest ready
4. Try duplicate scan to show blocked + audit

## Scene 6–7 — Traffic & Dispatch
1. `/traffic`
2. Select DK-10231 · show **Recommended** vehicle with fit score + reasons
3. Confirm gates: scan complete · e-way ready
4. Confirm dispatch → Status In Transit (THC raised for market/contracted hire)

## Scene 8 — Live Tracking
1. `/tracking`
2. Real map with corridor + moving vehicle markers
3. Select hero trip · timeline + ETA

## Scene 9 — Delivery
1. `/delivery`
2. Out for delivery → Mark delivered

## Scene 3b — Customer approval gate (optional wow)
1. `/customers` · Coastal Retail Alliance (pending)
2. Click **Approve** → booking unlocked for that profile

## Scene 10–12 — POD
1. `/pod?docket=dk-10231` (or after Mark delivered)
2. Ingest → short extract beat → side-by-side review
3. **Approve POD** → billing unlocks (TBB)
4. Reject re-opens upload; Request review marks pending

## Scene 13–14 — Billing
1. `/billing`
2. Eligible queue · tax invoice preview with CGST/SGST or IGST + HSN
3. Generate invoice → **INV-2026-0091**

## Scene 15 — Receivables
1. `/receivables`
2. Record receipt against the invoice
3. Outstanding decreases

## Scene 16 — Department create / work beats (role lens)

Each beat: switch user → land on their workbench → create or advance something → confirm toast + `/audit`.

| Role | Path | Beat |
| --- | --- | --- |
| Marketing | `/marketing` | **+ Campaign** → save → **Launch** → **+ Lead** → **Handoff to Sales** |
| Sales Executive | `/crm` then `/customers` | **+ Lead** → advance stage → **+ Quotation** → mark won; **+ Customer** (pending) |
| Fleet Manager | `/fleet` | **+ Vehicle** → set docs → **Maintenance** → edit capacity |
| Procurement | `/procurement` | **+ PO** → **Order** → **Receive** → **Close** (or delete draft) |
| HR Executive | `/hr` | **+ Employee** → **Approve/Reject leave** → **Process payroll** |
| Legal & Compliance | `/compliance` | **+ Document** → **Start renewal** → **Complete** |
| Sales / Ops (vendors) | `/vendors` | **+ Vendor** → edit → **Deactivate** |
| Sales / Ops (contracts) | `/contracts` | **+ Contract** → edit tariff → **Deactivate** |
| Customer Support | `/support` | **+ Ticket** → **Assign** → **Resolve** / **Close** |
| Booking / Warehouse / Traffic / Delivery / POD / Billing / Collections | existing scenes | Keep ops mutations; cancel draft / gates as already demoed |

Create / Edit / Delete buttons only show for the owning role (Admin sees all). Mutations persist in the browser session and write to the audit trail.

## Scene 17 — Close
1. Open `/audit` to show the full activity trail (ops + department CRUD)
2. Optionally reopen `/bookings/dk-10231` for end-to-end status

---

## Shortcuts
- `⌘K` / `Ctrl+K` — global search (`DK-10231`, Meridian, invoice numbers)
- Role lens in topbar — soft emphasis only
- Audit feed updates after every key action (`/audit`)
