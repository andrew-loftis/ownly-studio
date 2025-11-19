'use client';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  variant: 'primary' | 'success' | 'warning' | 'info';
}

const StatCard = ({ title, value, icon, trend, trendValue, variant }: StatCardProps) => {
  const variantClasses = {
    primary: 'text-blue-400 bg-blue-500/10',
    success: 'text-green-400 bg-green-500/10', 
    warning: 'text-amber-400 bg-amber-500/10',
    info: 'text-purple-400 bg-purple-500/10'
  };

  const trendClasses = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-[var(--txt-tertiary)]'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <div className="glass-light rounded-2xl p-6 hover:-translate-y-0.5 transition-transform duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${variantClasses[variant]} flex items-center justify-center`}>
          <span className="text-xl">📊</span>
        </div>
        <div className={`text-sm font-medium ${trendClasses[trend]} flex items-center gap-1`}>
          <span>{trendIcons[trend]}</span>
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="text-2xl font-bold text-[var(--txt-primary)] mb-1">
          {value}
        </div>
        <div className="text-sm font-medium text-[var(--txt-secondary)]">
          {title}
        </div>
      </div>

      {/* Trend */}
      <div className={`text-xs ${trendClasses[trend]}`}>
        {trendValue}
      </div>
    </div>
  );
};

export default StatCard;