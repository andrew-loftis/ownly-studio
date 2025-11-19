'use client';

import { useState } from 'react';

interface RevenueData {
  month: string;
  revenue: number;
  growth: number;
}

interface RevenueAnalyticsProps {
  data: RevenueData[];
}

const RevenueAnalytics = ({ data }: RevenueAnalyticsProps) => {
  const [viewMode, setViewMode] = useState<'revenue' | 'growth'>('revenue');
  
  if (!data || data.length === 0) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
          Revenue Analytics
        </h3>
        <div className="h-64 flex items-center justify-center text-[var(--txt-tertiary)]">
          No revenue data available
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxGrowth = Math.max(...data.map(d => Math.abs(d.growth)));
  const formatRevenue = (amount: number) => `$${(amount / 100).toLocaleString()}`;

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgGrowth = data.reduce((sum, item) => sum + item.growth, 0) / data.length;

  return (
    <div className="glass-light rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
            Revenue Analytics
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mt-1">
            12-month financial performance overview
          </p>
        </div>
        
        <div className="flex bg-[var(--bg-2)] rounded-lg p-1">
          <button
            onClick={() => setViewMode('revenue')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'revenue'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setViewMode('growth')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'growth'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
            }`}
          >
            Growth %
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64 mb-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full w-16 flex flex-col justify-between text-xs text-[var(--txt-tertiary)]">
          {viewMode === 'revenue' ? (
            <>
              <span>{formatRevenue(maxRevenue)}</span>
              <span>{formatRevenue(maxRevenue * 0.75)}</span>
              <span>{formatRevenue(maxRevenue * 0.5)}</span>
              <span>{formatRevenue(maxRevenue * 0.25)}</span>
              <span>$0</span>
            </>
          ) : (
            <>
              <span>+{Math.round(maxGrowth)}%</span>
              <span>+{Math.round(maxGrowth * 0.5)}%</span>
              <span>0%</span>
              <span>-{Math.round(maxGrowth * 0.5)}%</span>
              <span>-{Math.round(maxGrowth)}%</span>
            </>
          )}
        </div>

        {/* Chart area */}
        <div className="ml-16 h-full flex items-end justify-between gap-1">
          {data.map((item, index) => {
            const value = viewMode === 'revenue' ? item.revenue : item.growth;
            const percentage = viewMode === 'revenue' 
              ? (value / maxRevenue) * 100 
              : maxGrowth > 0 ? (Math.abs(value) / maxGrowth) * 50 + 50 : 50;
            
            const isNegative = viewMode === 'growth' && value < 0;
            
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                {/* Bar */}
                <div 
                  className={`w-full max-w-8 rounded-t transition-all duration-300 hover:opacity-80 relative group ${
                    viewMode === 'revenue' 
                      ? 'bg-gradient-to-t from-[var(--accent)] to-[var(--accent)]/60'
                      : value >= 0 
                        ? 'bg-gradient-to-t from-green-500 to-green-400'
                        : 'bg-gradient-to-t from-red-500 to-red-400'
                  }`}
                  style={{ 
                    height: `${Math.max(percentage, 2)}%`,
                    transform: isNegative ? 'scaleY(-1) translateY(100%)' : 'none'
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--bg-4)] rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {viewMode === 'revenue' 
                      ? formatRevenue(value) 
                      : `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
                    }
                  </div>
                </div>
                
                {/* Month label */}
                <span className="text-xs text-[var(--txt-tertiary)] mt-2 transform -rotate-45 origin-center">
                  {item.month.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Zero line for growth chart */}
        {viewMode === 'growth' && (
          <div className="absolute left-16 right-0 top-1/2 h-px bg-[var(--txt-tertiary)]/30" />
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-[var(--bg-4)]">
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">Total (12M)</div>
          <div className="font-semibold text-[var(--txt-primary)]">
            {formatRevenue(totalRevenue)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">Monthly Avg</div>
          <div className="font-semibold text-[var(--txt-primary)]">
            {formatRevenue(totalRevenue / data.length)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">Best Month</div>
          <div className="font-semibold text-[var(--txt-primary)]">
            {formatRevenue(Math.max(...data.map(d => d.revenue)))}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">Avg Growth</div>
          <div className={`font-semibold ${avgGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {avgGrowth > 0 ? '+' : ''}{avgGrowth.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;