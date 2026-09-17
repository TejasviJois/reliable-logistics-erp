# Reliable Logistics Solutions — Operations Control

High-fidelity **demo** of an enterprise logistics & transport management ERP for Reliable Logistics Solutions Pvt. Ltd.

## Stack
- Next.js (App Router) · React · TypeScript · Tailwind CSS
- Zustand demo store · Lucide

## Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) — you land on **Sign in** (`/login`).

## Demo sign-in
No password. Pick a scope, then a role card:

| Tab | What you get |
| --- | --- |
| **Admin** | 1 tenant admin — full nav, can switch hubs |
| **Bengaluru / Chennai / Hyderabad Hub** | 14 role accounts each (manager → sales → ops → finance → HR/IT/legal) |

Use **Switch user** in the topbar to change accounts. Role-based nav hides modules outside that role.

## Docs
- [PROJECT_PLAN.md](./PROJECT_PLAN.md) — full product & implementation plan
- [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) — presenter walkthrough

## Demo story
Move **DK-10231** through warehouse → dispatch → track → delivery → POD approval → billing → receipt.
