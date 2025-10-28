"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Briefcase, Layers, User } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/build", label: "Build", icon: Wrench },
  { href: "/services", label: "Services", icon: Layers },
  { href: "/work", label: "Work", icon: Briefcase },
  { href: "/account", label: "Account", icon: User },
];

export default function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 pb-[max(env(safe-area-inset-bottom),0px)]">
      <div className="mx-auto max-w-[1200px] px-3">
        <nav className="glass-strong border border-white/10 rounded-2xl mb-2 overflow-hidden">
          <ul className="grid grid-cols-5">
            {tabs.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] ${active ? "text-[var(--mint)]" : "text-[var(--txt-tertiary)] hover:text-[var(--txt)]"}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-[var(--mint)]" : "text-[var(--txt-tertiary)]"}`} />
                    <span className="leading-none">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
