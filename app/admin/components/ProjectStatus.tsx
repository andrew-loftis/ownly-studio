'use client';

interface ProjectStatusProps {
  data: Record<string, number>;
}

const ProjectStatus = ({ data }: ProjectStatusProps) => {
  const totalProjects = Object.values(data).reduce((sum, count) => sum + count, 0);
  
  const statusConfig = {
    'planning': { label: 'Planning', color: '#3b82f6', icon: '📋' },
    'in-progress': { label: 'In Progress', color: '#f59e0b', icon: '🚧' },
    'review': { label: 'In Review', color: '#8b5cf6', icon: '👀' },
    'completed': { label: 'Completed', color: '#10b981', icon: '✅' },
    'on-hold': { label: 'On Hold', color: '#6b7280', icon: '⏸️' },
    'cancelled': { label: 'Cancelled', color: '#ef4444', icon: '❌' },
  };

  const sortedData = Object.entries(data)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  if (totalProjects === 0) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
          Project Status
        </h3>
        <div className="text-center py-8 text-[var(--txt-tertiary)]">
          No projects found
        </div>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
          Project Status
        </h3>
        <span className="text-sm text-[var(--txt-tertiary)]">
          {totalProjects} Total
        </span>
      </div>

      {/* Donut Chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
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
                    r="35"
                    fill="transparent"
                    stroke={config.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              });
            })()}
          </svg>
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--txt-primary)]">
                {totalProjects}
              </div>
              <div className="text-xs text-[var(--txt-secondary)]">
                Projects
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {sortedData.map(([status, count]) => {
          const percentage = ((count / totalProjects) * 100).toFixed(1);
          const config = statusConfig[status as keyof typeof statusConfig] || {
            label: status.charAt(0).toUpperCase() + status.slice(1),
            color: '#6b7280',
            icon: '📁'
          };

          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">{config.icon}</span>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-medium text-[var(--txt-primary)]">
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--txt-secondary)]">
                  {count}
                </span>
                <span 
                  className="text-xs min-w-[40px] text-right font-medium"
                  style={{ color: config.color }}
                >
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectStatus;