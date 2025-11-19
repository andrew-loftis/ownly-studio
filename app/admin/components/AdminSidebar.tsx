'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  url?: string;
  badge?: { text: string; variant: string };
  children?: MenuItem[];
  isTitle?: boolean;
}

// Streamlined menu focused on core admin functions
const menuItems: MenuItem[] = [
  { 
    key: 'dashboard', 
    label: 'Dashboard', 
    icon: '�', 
    url: '/admin' 
  },
  { 
    key: 'setup', 
    label: 'Setup Database', 
    icon: '🔧', 
    url: '/admin/setup',
    badge: { text: 'NEW', variant: 'blue' }
  },
  { 
    key: 'analytics-section', 
    label: 'ANALYTICS & INSIGHTS', 
    isTitle: true 
  },
  {
    key: 'analytics',
    label: 'Advanced Analytics',
    icon: '📈',
    children: [
      { key: 'revenue-analytics', label: 'Revenue Analytics', url: '/admin/analytics/revenue' },
      { key: 'client-analytics', label: 'Client Analytics', url: '/admin/analytics/clients' },
      { key: 'project-analytics', label: 'Project Analytics', url: '/admin/analytics/projects' }
    ]
  },
  { 
    key: 'clients-section', 
    label: 'CLIENT MANAGEMENT', 
    isTitle: true 
  },
  {
    key: 'clients',
    label: 'Client Management',
    icon: '👥',
    children: [
      { key: 'all-clients', label: 'All Clients', url: '/admin/clients' },
      { key: 'client-communication', label: 'Communication Hub', url: '/admin/clients/communication' }
    ]
  },
  {
    key: 'organizations',
    label: 'Organizations',
    icon: '🏢',
    children: [
      { key: 'all-organizations', label: 'All Organizations', url: '/admin/organizations' },
      { key: 'team-management', label: 'Team Management', url: '/admin/organizations/teams' }
    ]
  },
  { 
    key: 'projects-section', 
    label: 'PROJECT OPERATIONS', 
    isTitle: true 
  },
  {
    key: 'projects',
    label: 'Project Management',
    icon: '🚀',
    children: [
      { key: 'all-projects', label: 'All Projects', url: '/admin/projects' },
      { key: 'deliverables', label: 'Deliverables', url: '/admin/projects/deliverables' }
    ]
  },
  { 
    key: 'billing-section', 
    label: 'BILLING & FINANCE', 
    isTitle: true 
  },
  {
    key: 'billing',
    label: 'Billing',
    icon: '💳',
    children: [
      { key: 'invoices', label: 'Invoices', url: '/admin/billing/invoices' },
      { key: 'payments', label: 'Payments', url: '/admin/billing/payments' },
      { key: 'subscriptions', label: 'Subscriptions', url: '/admin/billing/subscriptions' }
    ]
  },
  { 
    key: 'settings-section', 
    label: 'SYSTEM SETTINGS', 
    isTitle: true 
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: '⚙️',
    children: [
      { key: 'general-settings', label: 'General', url: '/admin/settings/general' },
      { key: 'appearance', label: 'Appearance', url: '/admin/settings/appearance' }
    ]
  }
];

interface AdminSidebarProps {
  collapsed: boolean;
  hidden: boolean;
  onToggleCollapse: () => void;
  onHide: () => void;
}

const AdminSidebar = ({ collapsed, hidden, onToggleCollapse }: AdminSidebarProps) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => 
      prev.includes(key) 
        ? prev.filter(item => item !== key)
        : [...prev, key]
    );
  };

  const isActive = (url?: string) => {
    if (!url) return false;
    return pathname === url || (url !== '/admin' && pathname.startsWith(url));
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.isTitle) {
      return (
        <li key={item.key} className={`px-4 py-2 text-[10px] font-bold text-[var(--txt-tertiary)] uppercase tracking-[0.1em] ${collapsed ? 'hidden' : ''}`}>
          {item.label}
        </li>
      );
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.key);
    const itemIsActive = isActive(item.url) || (hasChildren && item.children?.some(child => isActive(child.url)));

    const BaseComponent = item.url ? Link : 'button';
    const baseProps: any = item.url ? { href: item.url } : { onClick: () => hasChildren && toggleExpanded(item.key) };

    return (
      <li key={item.key} className="relative">
        <BaseComponent
          {...baseProps}
          className={`group w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl mx-2 backdrop-blur-xl transition-all duration-200 border ${
            itemIsActive
              ? 'bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent)]/10 to-transparent border-[var(--accent)]/50 text-[var(--accent)] shadow-[0_0_0_1px_var(--accent)/20,0_4px_12px_-2px_var(--accent)/30] backdrop-saturate-150'
              : 'glass-light border-white/5 hover:border-[var(--accent)]/30 hover:bg-[var(--bg-3)]/40 text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]'
          }`}
        >
          <span className="text-lg drop-shadow-sm transition-transform group-hover:scale-105">{item.icon}</span>
          {!collapsed && (
            <>
              <span className="flex-1 tracking-wide transition-all duration-200 group-hover:translate-x-0.5">{item.label}</span>
              {hasChildren && !item.url && (
                <motion.span
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="text-xs opacity-70 group-hover:opacity-100 transition-opacity"
                >
                  ▶
                </motion.span>
              )}
              {item.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full 
                  bg-gradient-to-r from-blue-500/20 to-blue-400/10 text-blue-300 
                  border border-blue-400/30 shadow-[0_0_8px_-2px_rgb(59,130,246,0.3)]
                  backdrop-blur-sm tracking-wide`}>
                  {item.badge.text}
                </span>
              )}
            </>
          )}
        </BaseComponent>
        <AnimatePresence>
          {hasChildren && isExpanded && !collapsed && (
            <motion.ul
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="mt-1 space-y-1 overflow-hidden"
            >
              {item.children?.map(child => (
                <li key={child.key}>
                  <Link
                    href={child.url || '#'}
                    className={`flex items-center gap-3 px-4 py-2 ml-6 text-xs rounded-lg transition-all duration-200 border backdrop-blur-sm group ${
                      isActive(child.url)
                        ? 'bg-gradient-to-r from-[var(--accent)]/15 to-transparent border-[var(--accent)]/40 text-[var(--accent)] font-medium shadow-[0_0_0_1px_var(--accent)/20]'
                        : 'glass-light border-white/5 hover:bg-[var(--bg-3)]/30 hover:border-[var(--accent)]/25 text-[var(--txt-tertiary)] hover:text-[var(--txt-primary)]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 group-hover:opacity-80 transition-all group-hover:scale-125"></span>
                    <span className="tracking-wide">{child.label}</span>
                  </Link>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full transition-all duration-300 ease-in-out z-40 ${
        hidden ? '-translate-x-full' : 'translate-x-0'
      } ${collapsed ? 'w-18' : 'w-72'} 
        flex flex-col bg-gradient-to-b from-[var(--bg-2)]/90 via-[var(--bg-1)]/80 to-[var(--bg-1)]/70 
        backdrop-blur-2xl backdrop-saturate-150 border-r border-white/10
        shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_40px_-12px_rgba(0,0,0,0.6)]
        before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none`}
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center px-4 border-b border-white/10 backdrop-blur-sm relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent)] to-[var(--cyan)] 
                         border border-white/20 flex items-center justify-center font-bold text-black 
                         shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_6px_20px_-4px_var(--accent)/50]
                         transition-all hover:scale-105">
            OS
          </div>
        ) : (
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--accent)] to-[var(--cyan)] 
                           border border-white/20 flex items-center justify-center font-bold text-black 
                           shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_6px_20px_-4px_var(--accent)/50]
                           transition-all group-hover:scale-105 group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_8px_24px_-4px_var(--accent)/60]">
              OS
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wide text-[var(--txt-primary)] 
                             group-hover:text-white transition-colors duration-200">
                Ownly Studio
              </span>
              <span className="text-xs text-[var(--txt-tertiary)] font-medium tracking-wider uppercase">
                Admin Dashboard
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-1 custom-scrollbar relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-2)]/20 to-transparent pointer-events-none opacity-50"></div>
        <ul className="space-y-1.5 pb-8 relative z-10">
          {menuItems.map(item => renderMenuItem(item))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-white/10 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <motion.button
          onClick={onToggleCollapse}
          className="group w-full flex items-center justify-center p-3 rounded-xl 
                     text-[var(--txt-secondary)] hover:text-[var(--txt-primary)] 
                     hover:bg-[var(--bg-3)]/50 transition-all duration-200 
                     border border-white/10 hover:border-[var(--accent)]/40 
                     backdrop-blur-sm hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]
                     active:scale-95"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span 
            className="text-lg transition-all duration-200"
            animate={{ rotate: collapsed ? 0 : 180 }}
          >
            ▶
          </motion.span>
          {!collapsed && (
            <span className="ml-2 text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
              Collapse
            </span>
          )}
        </motion.button>
      </div>
    </aside>
  );
};

export default AdminSidebar;