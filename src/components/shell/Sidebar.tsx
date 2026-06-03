"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  LineChart,
  PlusCircle,
  Target,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Log entry", icon: PlusCircle },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/insights", label: "Insights", icon: LineChart },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-white px-3 py-5 md:flex">
      <div className="flex items-center gap-2 px-2 pb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-brand-600)] text-white">
          <HeartPulse size={18} />
        </div>
        <span className="text-lg font-semibold tracking-tight">Pulse</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]",
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-2 pt-6">
        <a
          href="/userguidelines"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-[var(--color-bg)] px-3 py-2.5 text-xs font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-brand-50)] hover:text-[var(--color-brand-700)]"
        >
          <BookOpen size={14} />
          User guide
        </a>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-[var(--color-border)] bg-white py-2 md:hidden">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium",
              active ? "text-[var(--color-brand-700)]" : "text-[var(--color-muted)]",
            )}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
