'use client';

interface RealtimeMetricsProps {
  data: {
    pendingInvoices: number;
    overdueInvoices: number;
    conversionRate: number;
    clientSatisfaction: number;
  } | null;
}

const RealtimeMetrics = ({ data }: RealtimeMetricsProps) => {
  if (!data) return null;

  const metrics = [
    {
      label: 'Pending Invoices',
      value: data.pendingInvoices,
      icon: '⏳',
      status: data.pendingInvoices > 5 ? 'warning' : 'normal'
    },
    {
      label: 'Overdue Invoices',
      value: data.overdueInvoices,
      icon: '⚠️',
      status: data.overdueInvoices > 0 ? 'danger' : 'good'
    },
    {
      label: 'Conversion Rate',
      value: `${data.conversionRate}%`,
      icon: '🎯',
      status: data.conversionRate > 70 ? 'good' : data.conversionRate > 50 ? 'normal' : 'warning'
    },
    {
      label: 'Client Satisfaction',
      value: `${data.clientSatisfaction}%`,
      icon: '😊',
      status: data.clientSatisfaction > 90 ? 'good' : data.clientSatisfaction > 75 ? 'normal' : 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400';
      case 'warning': return 'text-amber-400';
      case 'danger': return 'text-red-400';
      default: return 'text-[var(--txt-primary)]';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500/10';
      case 'warning': return 'bg-amber-500/10';
      case 'danger': return 'bg-red-500/10';
      default: return 'bg-[var(--bg-3)]';
    }
  };

  return (
    <div className="glass-light rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--txt-primary)]">
          Real-time Metrics
        </h2>
        <div className="flex items-center gap-2 text-sm text-[var(--txt-tertiary)]">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Live
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl ${getStatusBg(metric.status)} border border-opacity-20`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">{metric.icon}</span>
              <span className="text-xs font-medium text-[var(--txt-secondary)] uppercase tracking-wider">
                {metric.label}
              </span>
            </div>
            <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(data.overdueInvoices > 0 || data.pendingInvoices > 10) && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-red-400">⚠️</span>
            <div>
              <h3 className="font-medium text-red-400">Action Required</h3>
              <p className="text-sm text-red-300">
                {data.overdueInvoices > 0 && `${data.overdueInvoices} overdue invoices need attention. `}
                {data.pendingInvoices > 10 && `${data.pendingInvoices} pending invoices may need follow-up.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealtimeMetrics;