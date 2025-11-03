// Menu item types for admin dashboard
export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  url?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
  };
  children?: MenuItem[];
  parentKey?: string;
  isTitle?: boolean;
  target?: '_blank' | '_self';
  roles?: ('admin' | 'editor' | 'client')[];
}

// Ownly Studio Admin Menu Items
export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    key: 'overview',
    label: 'Overview',
    isTitle: true,
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'lucide:layout-dashboard',
    url: '/account/admin/dashboard',
    roles: ['admin', 'editor']
  },
  {
    key: 'organizations',
    label: 'Organizations',
    icon: 'lucide:building-2',
    url: '/account/admin/organizations',
    roles: ['admin']
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: 'lucide:folder-open',
    children: [
      {
        key: 'all-projects',
        label: 'All Projects',
        url: '/account/admin/projects',
        parentKey: 'projects',
        roles: ['admin', 'editor']
      },
      {
        key: 'active-projects',
        label: 'Active Projects',
        url: '/account/admin/projects?status=in-progress',
        parentKey: 'projects',
        roles: ['admin', 'editor']
      },
      {
        key: 'create-project',
        label: 'Create Project',
        url: '/account/admin/projects/create',
        parentKey: 'projects',
        roles: ['admin', 'editor']
      }
    ],
    roles: ['admin', 'editor']
  },
  {
    key: 'deliverables',
    label: 'Deliverables',
    icon: 'lucide:package',
    children: [
      {
        key: 'all-deliverables',
        label: 'All Deliverables',
        url: '/account/admin/deliverables',
        parentKey: 'deliverables',
        roles: ['admin', 'editor']
      },
      {
        key: 'pending-deliverables',
        label: 'Pending Review',
        url: '/account/admin/deliverables?status=review',
        parentKey: 'deliverables',
        roles: ['admin', 'editor']
      },
      {
        key: 'overdue-deliverables',
        label: 'Overdue',
        url: '/account/admin/deliverables?overdue=true',
        parentKey: 'deliverables',
        roles: ['admin', 'editor']
      }
    ],
    roles: ['admin', 'editor']
  },
  {
    key: 'clients',
    label: 'Clients',
    icon: 'lucide:users',
    children: [
      {
        key: 'all-clients',
        label: 'All Clients',
        url: '/account/admin/clients',
        parentKey: 'clients',
        roles: ['admin', 'editor']
      },
      {
        key: 'client-organizations',
        label: 'Client Organizations',
        url: '/account/admin/clients/organizations',
        parentKey: 'clients',
        roles: ['admin']
      }
    ],
    roles: ['admin', 'editor']
  },
  {
    key: 'team',
    label: 'Team Management',
    icon: 'lucide:user-check',
    children: [
      {
        key: 'team-members',
        label: 'Team Members',
        url: '/account/admin/team',
        parentKey: 'team',
        roles: ['admin']
      },
      {
        key: 'roles-permissions',
        label: 'Roles & Permissions',
        url: '/account/admin/team/roles',
        parentKey: 'team',
        roles: ['admin']
      }
    ],
    roles: ['admin']
  },
  {
    key: 'business',
    label: 'Business',
    isTitle: true,
  },
  {
    key: 'billing',
    label: 'Billing & Invoices',
    icon: 'lucide:credit-card',
    children: [
      {
        key: 'invoices',
        label: 'All Invoices',
        url: '/account/admin/billing/invoices',
        parentKey: 'billing',
        roles: ['admin']
      },
      {
        key: 'create-invoice',
        label: 'Create Invoice',
        url: '/account/admin/billing/invoices/create',
        parentKey: 'billing',
        roles: ['admin']
      },
      {
        key: 'subscriptions',
        label: 'Subscriptions',
        url: '/account/admin/billing/subscriptions',
        parentKey: 'billing',
        roles: ['admin']
      },
      {
        key: 'revenue',
        label: 'Revenue Reports',
        url: '/account/admin/billing/revenue',
        parentKey: 'billing',
        roles: ['admin']
      }
    ],
    roles: ['admin']
  },
  {
    key: 'analytics',
    label: 'Analytics',
    icon: 'lucide:bar-chart-3',
    children: [
      {
        key: 'overview-analytics',
        label: 'Overview',
        url: '/account/admin/analytics',
        parentKey: 'analytics',
        roles: ['admin']
      },
      {
        key: 'project-analytics',
        label: 'Project Performance',
        url: '/account/admin/analytics/projects',
        parentKey: 'analytics',
        roles: ['admin', 'editor']
      },
      {
        key: 'client-analytics',
        label: 'Client Insights',
        url: '/account/admin/analytics/clients',
        parentKey: 'analytics',
        roles: ['admin']
      }
    ],
    roles: ['admin', 'editor']
  },
  {
    key: 'tools',
    label: 'Tools',
    isTitle: true,
  },
  {
    key: 'file-manager',
    label: 'File Manager',
    icon: 'lucide:folder',
    url: '/account/admin/files',
    roles: ['admin', 'editor']
  },
  {
    key: 'communications',
    label: 'Communications',
    icon: 'lucide:message-circle',
    children: [
      {
        key: 'activity-feed',
        label: 'Activity Feed',
        url: '/account/admin/activity',
        parentKey: 'communications',
        roles: ['admin', 'editor']
      },
      {
        key: 'notifications',
        label: 'Notifications',
        url: '/account/admin/notifications',
        parentKey: 'communications',
        roles: ['admin', 'editor']
      }
    ],
    roles: ['admin', 'editor']
  },
  {
    key: 'automation',
    label: 'Automation',
    icon: 'lucide:zap',
    children: [
      {
        key: 'workflows',
        label: 'Workflows',
        url: '/account/admin/automation/workflows',
        parentKey: 'automation',
        roles: ['admin']
      },
      {
        key: 'integrations',
        label: 'Integrations',
        url: '/account/admin/automation/integrations',
        parentKey: 'automation',
        roles: ['admin']
      }
    ],
    roles: ['admin']
  },
  {
    key: 'settings',
    label: 'Settings',
    isTitle: true,
  },
  {
    key: 'system-settings',
    label: 'System Settings',
    icon: 'lucide:settings',
    children: [
      {
        key: 'general-settings',
        label: 'General',
        url: '/account/admin/settings/general',
        parentKey: 'system-settings',
        roles: ['admin']
      },
      {
        key: 'security-settings',
        label: 'Security',
        url: '/account/admin/settings/security',
        parentKey: 'system-settings',
        roles: ['admin']
      },
      {
        key: 'email-settings',
        label: 'Email Settings',
        url: '/account/admin/settings/email',
        parentKey: 'system-settings',
        roles: ['admin']
      }
    ],
    roles: ['admin']
  }
];

// Client Portal Menu Items  
export const CLIENT_MENU_ITEMS: MenuItem[] = [
  {
    key: 'my-projects',
    label: 'My Projects',
    icon: 'lucide:folder-open',
    url: '/account/client/projects'
  },
  {
    key: 'deliverables',
    label: 'Deliverables',
    icon: 'lucide:package',
    url: '/account/client/deliverables'
  },
  {
    key: 'billing',
    label: 'Billing',
    icon: 'lucide:credit-card',
    children: [
      {
        key: 'invoices',
        label: 'Invoices',
        url: '/account/client/billing/invoices',
        parentKey: 'billing'
      },
      {
        key: 'subscription',
        label: 'Subscription',
        url: '/account/client/billing/subscription',
        parentKey: 'billing'
      }
    ]
  },
  {
    key: 'communication',
    label: 'Communication',
    icon: 'lucide:message-circle',
    children: [
      {
        key: 'activity',
        label: 'Project Activity',
        url: '/account/client/activity',
        parentKey: 'communication'
      },
      {
        key: 'support',
        label: 'Support',
        url: '/account/client/support',
        parentKey: 'communication'
      }
    ]
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: 'lucide:settings',
    url: '/account/client/settings'
  }
];

// Filter menu items by user role
export function getMenuItemsByRole(items: MenuItem[], userRole: 'admin' | 'editor' | 'client'): MenuItem[] {
  return items.filter(item => {
    // Title items are always shown
    if (item.isTitle) return true;
    
    // If no roles specified, show to all
    if (!item.roles) return true;
    
    // Check if user role is in allowed roles
    const hasAccess = item.roles.includes(userRole);
    
    // If item has children, filter children too
    if (hasAccess && item.children) {
      item.children = getMenuItemsByRole(item.children, userRole);
      // Only show parent if it has accessible children
      return item.children.length > 0;
    }
    
    return hasAccess;
  });
}