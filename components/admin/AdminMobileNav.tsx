"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, Users, CreditCard, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminMobileNavProps {
  userRole: 'admin' | 'editor' | 'client';
  orgId?: string;
}

export default function AdminMobileNav({ userRole, orgId }: AdminMobileNavProps) {
  const pathname = usePathname();

  // Define key navigation items for mobile bottom nav
  const mobileNavItems = userRole === 'client' 
    ? [
        { 
          key: 'projects', 
          label: 'Projects', 
          icon: FolderOpen, 
          href: '/account/client/projects' 
        },
        { 
          key: 'deliverables', 
          label: 'Deliverables', 
          icon: LayoutDashboard, 
          href: '/account/client/deliverables' 
        },
        { 
          key: 'billing', 
          label: 'Billing', 
          icon: CreditCard, 
          href: '/account/client/billing/invoices' 
        },
        { 
          key: 'activity', 
          label: 'Activity', 
          icon: BarChart3, 
          href: '/account/client/activity' 
        }
      ]
    : [
        { 
          key: 'dashboard', 
          label: 'Dashboard', 
          icon: LayoutDashboard, 
          href: '/account/admin/dashboard' 
        },
        { 
          key: 'projects', 
          label: 'Projects', 
          icon: FolderOpen, 
          href: '/account/admin/projects' 
        },
        { 
          key: 'clients', 
          label: 'Clients', 
          icon: Users, 
          href: '/account/admin/clients' 
        },
        { 
          key: 'analytics', 
          label: 'Analytics', 
          icon: BarChart3, 
          href: '/account/admin/analytics' 
        }
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-2)] border-t border-white/10 z-30">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive 
                  ? "text-[var(--mint)]" 
                  : "text-[var(--txt-tertiary)] hover:text-[var(--txt-primary)]"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-[var(--mint)] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}