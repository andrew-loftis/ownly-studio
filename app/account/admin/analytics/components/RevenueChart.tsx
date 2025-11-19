'use client';

import { useState } from 'react';

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const RevenueChart = ({ data }: RevenueChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'revenue' | 'growth'>('revenue');
  
  // Calculate max value for scaling
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const formatRevenue = (amount: number) => `$${(amount / 100).toLocaleString()}`;

  // Calculate growth rates
  const growthData = data.map((item, index) => {
    if (index === 0) return { ...item, growth: 0 };
    const prevRevenue = data[index - 1].revenue;
    const growth = prevRevenue > 0 ? ((item.revenue - prevRevenue) / prevRevenue) * 100 : 0;
    return { ...item, growth };
  });

  const displayData = selectedPeriod === 'revenue' ? data : growthData;
  const maxValue = selectedPeriod === 'revenue' ? maxRevenue : Math.max(...growthData.map(d => Math.abs(d.growth || 0)));

  return (
    <div className="glass-light rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
            Revenue Analytics
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mt-1">
            Monthly revenue performance over the last 12 months
          </p>
        </div>
        
        {/* Toggle */}
        <div className="flex bg-[var(--bg-2)] rounded-lg p-1">
          <button
            onClick={() => setSelectedPeriod('revenue')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              selectedPeriod === 'revenue'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setSelectedPeriod('growth')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              selectedPeriod === 'growth'
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--txt-secondary)] hover:text-[var(--txt-primary)]'
            }`}
          >
            Growth %
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full w-12 flex flex-col justify-between text-xs text-[var(--txt-tertiary)]">
          {selectedPeriod === 'revenue' ? (
            <>
              <span>{formatRevenue(maxValue)}</span>
              <span>{formatRevenue(maxValue * 0.75)}</span>
              <span>{formatRevenue(maxValue * 0.5)}</span>
              <span>{formatRevenue(maxValue * 0.25)}</span>
              <span>$0</span>
            </>
          ) : (
            <>
              <span>{maxValue > 0 ? `+${Math.round(maxValue)}%` : '0%'}</span>
              <span>{maxValue > 0 ? `+${Math.round(maxValue * 0.5)}%` : '0%'}</span>
              <span>0%</span>
              <span>{maxValue > 0 ? `-${Math.round(maxValue * 0.5)}%` : '0%'}</span>
              <span>{maxValue > 0 ? `-${Math.round(maxValue)}%` : '0%'}</span>
            </>
          )}
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full flex items-end justify-between gap-2">
          {displayData.map((item, index) => {
            const value = selectedPeriod === 'revenue' ? item.revenue : (item as any).growth || 0;
            const percentage = selectedPeriod === 'revenue' 
              ? (value / maxValue) * 100 
              : Math.abs(value) / maxValue * 50 + 50; // Center growth at 50%
            
            const isNegativeGrowth = selectedPeriod === 'growth' && value < 0;
            
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center">
                {/* Bar */}
                <div 
                  className="w-full max-w-8 bg-gradient-to-t from-[var(--accent)] to-[var(--accent)]/60 rounded-t transition-all duration-300 hover:from-[var(--accent)]/80 hover:to-[var(--accent)]/40 relative group"
                  style={{ 
                    height: `${Math.max(percentage, 2)}%`,
                    transform: selectedPeriod === 'growth' && isNegativeGrowth ? 'scaleY(-1) translateY(100%)' : 'none'
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--bg-4)] rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {selectedPeriod === 'revenue' 
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
        {selectedPeriod === 'growth' && (
          <div className="absolute left-12 right-0 top-1/2 h-px bg-[var(--txt-tertiary)]/30" />
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--bg-4)]">
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">Total</div>
          <div className="font-semibold text-[var(--txt-primary)]">
            {formatRevenue(data.reduce((sum, item) => sum + item.revenue, 0))}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">Average</div>
          <div className="font-semibold text-[var(--txt-primary)]">
            {formatRevenue(data.reduce((sum, item) => sum + item.revenue, 0) / data.length)}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">Best Month</div>
          <div className="font-semibold text-[var(--txt-primary)]">
            {formatRevenue(Math.max(...data.map(d => d.revenue)))}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">This Month</div>
          <div className="font-semibold text-[var(--txt-primary)]">
            {formatRevenue(data[data.length - 1]?.revenue || 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;