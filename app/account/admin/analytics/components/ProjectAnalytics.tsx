'use client';

interface ProjectAnalyticsProps {
  data: Record<string, number>;
}

const ProjectAnalytics = ({ data }: ProjectAnalyticsProps) => {
  const totalProjects = Object.values(data).reduce((sum, count) => sum + count, 0);
  
  // Define status colors and labels
  const statusConfig = {
    'planning': { label: 'Planning', color: 'bg-blue-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
    'in-progress': { label: 'In Progress', color: 'bg-amber-500', bgColor: 'bg-amber-500/10', textColor: 'text-amber-400' },
    'review': { label: 'In Review', color: 'bg-purple-500', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400' },
    'completed': { label: 'Completed', color: 'bg-green-500', bgColor: 'bg-green-500/10', textColor: 'text-green-400' },
    'on-hold': { label: 'On Hold', color: 'bg-gray-500', bgColor: 'bg-gray-500/10', textColor: 'text-gray-400' },
    'cancelled': { label: 'Cancelled', color: 'bg-red-500', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
  };

  // Sort by count descending
  const sortedData = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  if (totalProjects === 0) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
          Project Analytics
        </h3>
        <div className="text-center py-8">
          <div className="text-[var(--txt-tertiary)] text-sm">
            No projects found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
          Project Analytics
        </h3>
        <p className="text-sm text-[var(--txt-secondary)] mt-1">
          Distribution of projects by status
        </p>
      </div>

      {/* Donut Chart */}
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Chart */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {(() => {
              let cumulativePercentage = 0;
              return sortedData.map(([status, count], index) => {
                const percentage = (count / totalProjects) * 100;
                const strokeDasharray = `${percentage} ${100 - percentage}`;
                const strokeDashoffset = -cumulativePercentage;
                cumulativePercentage += percentage;
                
                const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['planning'];
                
                return (
                  <circle
                    key={status}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={`rgb(${config.color.includes('blue') ? '59 130 246' : 
                                  config.color.includes('amber') ? '245 158 11' :
                                  config.color.includes('purple') ? '168 85 247' :
                                  config.color.includes('green') ? '34 197 94' :
                                  config.color.includes('gray') ? '107 114 128' :
                                  '239 68 68'})`}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              });
            })()}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--txt-primary)]">
                {totalProjects}
              </div>
              <div className="text-xs text-[var(--txt-secondary)]">
                Total Projects
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {sortedData.map(([status, count]) => {
            const percentage = ((count / totalProjects) * 100).toFixed(1);
            const config = statusConfig[status as keyof typeof statusConfig] || {
              label: status.charAt(0).toUpperCase() + status.slice(1),
              color: 'bg-gray-500',
              bgColor: 'bg-gray-500/10',
              textColor: 'text-gray-400'
            };

            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${config.color}`} />
                  <span className="text-sm font-medium text-[var(--txt-primary)]">
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--txt-secondary)]">
                    {count}
                  </span>
                  <span className={`text-xs ${config.textColor} min-w-[40px] text-right`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bars */}
      <div className="mt-6 space-y-3">
        {sortedData.slice(0, 3).map(([status, count]) => {
          const percentage = (count / totalProjects) * 100;
          const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['planning'];
          
          return (
            <div key={status} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--txt-secondary)]">{config.label}</span>
                <span className="text-[var(--txt-tertiary)]">{percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[var(--bg-3)] rounded-full h-2">
                <div 
                  className={`h-2 ${config.color} rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectAnalytics;