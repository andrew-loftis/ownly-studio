"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, X, Menu, Building2 } from "lucide-react";
import { ADMIN_MENU_ITEMS, CLIENT_MENU_ITEMS, getMenuItemsByRole, type MenuItem } from "@/lib/menu-items";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  userRole: 'admin' | 'editor' | 'client';
  orgId?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export default function AdminSidebar({ 
  userRole, 
  orgId, 
  collapsed, 
  onToggleCollapse, 
  onClose 
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get appropriate menu items based on user role
  const menuItems = userRole === 'client' 
    ? CLIENT_MENU_ITEMS 
    : getMenuItemsByRole(ADMIN_MENU_ITEMS, userRole);

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const isActiveItem = (item: MenuItem): boolean => {
    if (item.url && pathname === item.url) return true;
    if (item.children) {
      return item.children.some(child => isActiveItem(child));
    }
    return false;
  };

  const renderIcon = (iconName?: string) => {
    if (!iconName) return null;
    
    // Simple icon mapping - you could expand this or use a proper icon library
    const iconMap: Record<string, any> = {
      'lucide:layout-dashboard': '📊',
      'lucide:building-2': '🏢',
      'lucide:folder-open': '📁',
      'lucide:users': '👥',
      'lucide:user-check': '✅',
      'lucide:credit-card': '💳',
      'lucide:bar-chart-3': '📈',
      'lucide:folder': '📂',
      'lucide:message-circle': '💬',
      'lucide:zap': '⚡',
      'lucide:settings': '⚙️',
      'lucide:package': '📦'
    };
    
    return (
      <span className="text-sm">{iconMap[iconName] || '•'}</span>
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (item.isTitle) {
      return (
        <div 
          key={item.key} 
          className={cn(
            "px-4 py-2 text-xs uppercase tracking-wide font-semibold text-[var(--txt-tertiary)]",
            collapsed && "hidden",
            level > 0 && "ml-4"
          )}
        >
          {item.label}
        </div>
      );
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.key);
    const isActive = isActiveItem(item);

    const itemContent = (
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2.5 mx-2 rounded-lg transition-all duration-200 cursor-pointer group",
          isActive 
            ? "bg-gradient-to-r from-[var(--mint)]/20 to-[var(--cyan)]/20 border border-[var(--mint)]/30 text-[var(--mint)]" 
            : "text-[var(--txt-secondary)] hover:bg-white/5 hover:text-[var(--txt-primary)]",
          level > 0 && "ml-4",
          collapsed && !hasChildren && "justify-center"
        )}
        onClick={() => hasChildren ? toggleExpanded(item.key) : undefined}
      >
        <div className="flex items-center gap-3 min-w-0">
          {renderIcon(item.icon)}
          {!collapsed && (
            <span className="font-medium truncate text-sm">{item.label}</span>
          )}
          {item.badge && !collapsed && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              item.badge.variant === 'success' && "bg-green-500/20 text-green-400",
              item.badge.variant === 'warning' && "bg-yellow-500/20 text-yellow-400",
              item.badge.variant === 'danger' && "bg-red-500/20 text-red-400",
              item.badge.variant === 'info' && "bg-blue-500/20 text-blue-400"
            )}>
              {item.badge.text}
            </span>
          )}
        </div>
        
        {hasChildren && !collapsed && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        )}
      </div>
    );

    return (
      <div key={item.key}>
        {item.url ? (
          <Link 
            href={item.url}
            target={item.target}
            onClick={() => window.innerWidth < 1024 && onClose()}
          >
            {itemContent}
          </Link>
        ) : (
          itemContent
        )}

        {/* Submenu */}
        {hasChildren && (
          <AnimatePresence>
            {(isExpanded || collapsed) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={cn("space-y-1 pb-2", collapsed && "hidden")}>
                  {item.children?.map(child => renderMenuItem(child, level + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "h-screen bg-[var(--bg-2)] border-r border-white/10 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-72"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--txt-primary)]">
                Ownly Studio
              </div>
              <div className="text-xs text-[var(--txt-tertiary)]">
                {userRole === 'client' ? 'Client Portal' : 'Admin Dashboard'}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {menuItems.map(item => renderMenuItem(item))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-white/10">
          <div className="glass-strong rounded-lg p-4 text-center">
            <div className="text-sm font-semibold text-[var(--txt-primary)] mb-1">
              Need Help?
            </div>
            <div className="text-xs text-[var(--txt-tertiary)] mb-3">
              Contact support for assistance
            </div>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] text-black text-xs font-medium hover:scale-[1.02] transition-transform"
            >
              Get Support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}