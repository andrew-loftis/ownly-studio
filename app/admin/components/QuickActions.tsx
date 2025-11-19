'use client';

import Link from 'next/link';

const QuickActions = () => {
  const actions = [
    {
      title: 'Create Invoice',
      description: 'Generate new invoice for client',
      icon: '📄',
      href: '/admin/billing/invoices/create',
      color: 'blue'
    },
    {
      title: 'Add Client',
      description: 'Onboard new client organization',
      icon: '👤',
      href: '/admin/clients/create',
      color: 'green'
    },
    {
      title: 'New Project',
      description: 'Start new client project',
      icon: '🚀',
      href: '/admin/projects/create',
      color: 'purple'
    },
    {
      title: 'Send Message',
      description: 'Contact client or team',
      icon: '💬',
      href: '/admin/communications/messages',
      color: 'amber'
    },
    {
      title: 'View Reports',
      description: 'Business intelligence reports',
      icon: '📊',
      href: '/admin/reports',
      color: 'cyan'
    },
    {
      title: 'Manage Packages',
      description: 'Update service offerings',
      icon: '📦',
      href: '/admin/packages',
      color: 'pink'
    }
  ];

  return (
    <div className="glass-light rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--txt-primary)]">
          Quick Actions
        </h2>
        <Link
          href="/admin/settings"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Customize
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="group flex flex-col items-center p-4 rounded-xl bg-[var(--bg-2)] hover:bg-[var(--bg-3)] transition-all duration-200 hover:-translate-y-1"
          >
            <div className={`w-12 h-12 rounded-xl bg-${action.color}-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <span className="text-2xl">{action.icon}</span>
            </div>
            <h3 className="font-medium text-sm text-[var(--txt-primary)] text-center mb-1">
              {action.title}
            </h3>
            <p className="text-xs text-[var(--txt-tertiary)] text-center">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;