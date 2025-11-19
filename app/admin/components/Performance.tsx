'use client';

interface PerformanceProps {
  data: {
    conversionRate: number;
    clientSatisfaction: number;
    avgProjectValue: number;
    totalRevenue: number;
  } | null;
}

const Performance = ({ data }: PerformanceProps) => {
  if (!data) return null;

  const formatCurrency = (amount: number) => `$${(amount / 100).toLocaleString()}`;

  const metrics = [
    {
      label: 'Conversion Rate',
      value: data.conversionRate,
      target: 80,
      format: (val: number) => `${val.toFixed(1)}%`,
      icon: '🎯',
      color: '#10b981'
    },
    {
      label: 'Client Satisfaction',
      value: data.clientSatisfaction,
      target: 95,
      format: (val: number) => `${val.toFixed(1)}%`,
      icon: '😊',
      color: '#8b5cf6'
    },
    {
      label: 'Avg Project Value',
      value: data.avgProjectValue / 100,
      target: 5000,
      format: (val: number) => `$${val.toLocaleString()}`,
      icon: '💎',
      color: '#f59e0b'
    }
  ];

  return (
    <div className="glass-light rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
          Performance Metrics
        </h3>
        <span className="text-sm text-[var(--txt-tertiary)]">
          vs Targets
        </span>
      </div>

      <div className="space-y-6">
        {metrics.map((metric, index) => {
          const percentage = (metric.value / metric.target) * 100;
          const isOnTarget = percentage >= 100;
          const isGood = percentage >= 90;
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{metric.icon}</span>
                  <span className="text-sm font-medium text-[var(--txt-primary)]">
                    {metric.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    isOnTarget ? 'text-green-400' : 
                    isGood ? 'text-amber-400' : 
                    'text-red-400'
                  }`}>
                    {metric.format(metric.value)}
                  </div>
                  <div className="text-xs text-[var(--txt-tertiary)]">
                    Target: {metric.format(metric.target)}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <div className="w-full bg-[var(--bg-3)] rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: metric.color
                    }}
                  />
                  {percentage > 100 && (
                    <div 
                      className="absolute top-0 left-0 h-2 rounded-full bg-green-400 opacity-50"
                      style={{ width: '100%' }}
                    />
                  )}
                </div>
                
                {/* Target marker */}
                <div 
                  className="absolute top-0 w-0.5 h-2 bg-white/60"
                  style={{ left: '100%' }}
                />
              </div>

              <div className="flex justify-between text-xs text-[var(--txt-tertiary)]">
                <span>0</span>
                <span>{Math.round(percentage)}% of target</span>
                <span>{metric.format(metric.target)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall score */}
      <div className="mt-6 pt-6 border-t border-[var(--bg-4)]">
        <div className="text-center">
          <div className="text-2xl font-bold text-[var(--txt-primary)] mb-1">
            {Math.round(metrics.reduce((sum, m) => sum + Math.min((m.value / m.target) * 100, 100), 0) / metrics.length)}%
          </div>
          <div className="text-sm text-[var(--txt-secondary)]">
            Overall Performance Score
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;