"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPinned,
  Package,
  Receipt,
  Shield,
  Truck,
  Users,
  Warehouse,
  Wallet,
  Headphones,
  ScrollText,
  Car,
  Handshake,
  BarChart3,
  DoorOpen,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/store/session-store";
import {
  getEffectiveNavHrefs,
  useAccessStore,
} from "@/store/access-store";
import { canAccessHref } from "@/data/access-catalog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const groups = [
  {
    key: "control",
    label: "Control",
    items: [
      { href: "/", label: "Operations Overview", icon: LayoutDashboard },
    ],
  },
  {
    key: "operations",
    label: "Operations",
    items: [
      { href: "/bookings", label: "Bookings", icon: ClipboardList },
      { href: "/warehouse", label: "Warehouse", icon: Warehouse },
      { href: "/traffic", label: "Traffic & Dispatch", icon: Truck },
      { href: "/tracking", label: "Live Tracking", icon: MapPinned },
      { href: "/delivery", label: "Delivery", icon: Package },
      { href: "/pod", label: "POD", icon: FileText },
      { href: "/support", label: "Support", icon: Headphones },
    ],
  },
  {
    key: "commercial",
    label: "Commercial",
    items: [
      { href: "/marketing", label: "Marketing", icon: BarChart3 },
      { href: "/crm", label: "CRM & Sales", icon: Handshake },
      { href: "/customers", label: "Customers", icon: Users },
      { href: "/contracts", label: "Contracts & Tariffs", icon: ScrollText },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    items: [
      { href: "/billing", label: "Billing", icon: Wallet },
      { href: "/receivables", label: "Receivables", icon: Receipt },
      { href: "/vendor-costs", label: "Vendor Costs", icon: Building2 },
    ],
  },
  {
    key: "resources",
    label: "Resources",
    items: [
      { href: "/fleet", label: "Fleet", icon: Car },
      { href: "/vendors", label: "Vendors", icon: Handshake },
      { href: "/procurement", label: "Procurement", icon: Package },
      { href: "/hr", label: "HR & Payroll", icon: UserRound },
    ],
  },
  {
    key: "governance",
    label: "Governance",
    items: [
      { href: "/admin", label: "Administration", icon: Shield },
      { href: "/tutorials", label: "Role tutorials", icon: BookOpen },
      { href: "/audit", label: "Audit", icon: ScrollText },
      { href: "/reports", label: "Reports & MIS", icon: BarChart3 },
      { href: "/compliance", label: "Compliance", icon: Shield },
    ],
  },
  {
    key: "portals",
    label: "Portals",
    items: [
      { href: "/portals/customer", label: "Customer Portal", icon: DoorOpen },
      { href: "/portals/employee", label: "Employee Portal", icon: UserRound },
    ],
  },
];

const STORAGE_KEY = "reliable-sidebar-sections";

function canSeeHref(navHrefs: string[] | undefined, href: string) {
  if (!navHrefs) return false;
  return canAccessHref(navHrefs, href);
}

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function loadOpenState(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const account = useSessionStore((s) => s.account);
  useAccessStore((s) => s.roleAccess);
  useAccessStore((s) => s.userOverrides);

  const navHrefs = account ? getEffectiveNavHrefs(account) : [];

  const visibleGroups = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => canSeeHref(navHrefs, item.href)),
        }))
        .filter((g) => g.items.length > 0),
    [navHrefs]
  );

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    groups.forEach((g) => {
      defaults[g.key] = true;
    });
    return defaults;
  });

  useEffect(() => {
    const saved = loadOpenState();
    setOpenMap((prev) => {
      const next = { ...prev };
      visibleGroups.forEach((g) => {
        if (saved[g.key] !== undefined) next[g.key] = saved[g.key];
        if (g.items.some((item) => isItemActive(pathname, item.href))) {
          next[g.key] = true;
        }
      });
      return next;
    });
  }, [pathname, visibleGroups]);

  const toggle = (key: string) => {
    setOpenMap((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <aside className="flex h-full w-[272px] shrink-0 flex-col border-r border-white/5 bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 border-b border-white/10 px-3 pb-3 pt-3">
        <Link
          href={account?.homeHref || "/"}
          className="pressable block overflow-hidden rounded-lg bg-black p-2.5 ring-1 ring-white/10"
        >
          <Image
            src="/reliable-logo.png"
            alt="Reliable Logistics Solutions Pvt. Ltd."
            width={240}
            height={72}
            className="h-auto w-full object-contain"
            priority
          />
        </Link>
        <p className="mt-2.5 px-1 text-[10px] font-medium tracking-[0.14em] text-brand-secondary uppercase">
          Air · Train · Surface · Warehouse
        </p>
      </div>

      <Separator className="bg-white/10" />

      <ScrollArea className="flex-1">
        <nav className="px-2 py-2.5">
          {visibleGroups.map((group) => {
            const open = openMap[group.key] !== false;
            const hasActive = group.items.some((item) =>
              isItemActive(pathname, item.href)
            );

            return (
              <div key={group.key} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggle(group.key)}
                  aria-expanded={open}
                  className={cn(
                    "pressable flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left",
                    hasActive ? "bg-white/[0.04]" : "hover:bg-white/[0.03]"
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.14em]",
                      hasActive ? "text-accent" : "text-sidebar-muted"
                    )}
                  >
                    {group.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 text-sidebar-muted transition-transform duration-[180ms] [transition-timing-function:var(--ease-out)]",
                      open ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-[200ms] [transition-timing-function:var(--ease-out)]",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-0.5 pb-2 pt-0.5">
                      {group.items.map((item) => {
                        const active = isItemActive(pathname, item.href);
                        const Icon = item.icon;
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={cn(
                                "pressable flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] border-l-2",
                                active
                                  ? "border-accent bg-sidebar-active text-white"
                                  : "border-transparent text-sidebar-foreground/85"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "h-4 w-4 shrink-0",
                                  active ? "text-accent" : "opacity-75"
                                )}
                              />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
