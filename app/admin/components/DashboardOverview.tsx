'use client';

interface DashboardData {
  totalRevenue: number;
  monthlyRevenue: number;
  totalClients: number;
  activeClients: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pendingInvoices: number;
  overdueInvoices: number;
  revenueGrowth: number;
  clientGrowth: number;
  projectGrowth: number;
  avgProjectValue: number;
  conversionRate: number;
  clientSatisfaction: number;
}

interface DashboardOverviewProps {
  data: DashboardData | null;
}

const DashboardOverview = ({ data }: DashboardOverviewProps) => {
  if (!data) return null;

  const formatCurrency = (amount: number) => `$${(amount / 100).toLocaleString()}`;
  const formatGrowth = (growth: number) => `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;

  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      growth: data.revenueGrowth,
      icon: '💰',
      color: 'green'
    },
    {
      title: 'Active Projects',
      value: data.activeProjects.toString(),
      subtitle: `${data.totalProjects} total`,
      growth: data.projectGrowth,
      icon: '🚀',
      color: 'blue'
    },
    {
      title: 'Active Clients',
      value: data.activeClients.toString(),
      subtitle: `${data.totalClients} total`,
      growth: data.clientGrowth,
      icon: '👥',
      color: 'purple'
    },
    {
      title: 'Avg Project Value',
      value: formatCurrency(data.avgProjectValue),
      growth: data.revenueGrowth,
      icon: '📊',
      color: 'amber'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="glass-light rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-${card.color}-500/10 flex items-center justify-center`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className={`text-sm font-medium flex items-center gap-1 ${
              card.growth > 0 ? 'text-green-400' : card.growth < 0 ? 'text-red-400' : 'text-[var(--txt-tertiary)]'
            }`}>
              <span>{card.growth > 0 ? '↗' : card.growth < 0 ? '↘' : '→'}</span>
              <span>{formatGrowth(card.growth)}</span>
            </div>
          </div>

          {/* Value */}
          <div className="mb-2">
            <div className="text-2xl font-bold text-[var(--txt-primary)] mb-1">
              {card.value}
            </div>
            <div className="text-sm font-medium text-[var(--txt-secondary)]">
              {card.title}
            </div>
            {card.subtitle && (
              <div className="text-xs text-[var(--txt-tertiary)] mt-1">
                {card.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardOverview;