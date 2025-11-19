import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics - Ownly Studio Admin',
  description: 'Business intelligence and analytics dashboard for Ownly Studio',
};

export default function AnalyticsPage() {
  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--txt-primary)]">Analytics Dashboard</h1>
        <p className="text-[var(--txt-secondary)] mt-2">Business insights and performance metrics</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">$24,500</div>
          <div className="text-sm text-[var(--txt-secondary)]">Total Revenue</div>
          <div className="text-xs text-green-400 mt-1">↗ +12.5% this month</div>
        </div>
        
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">8</div>
          <div className="text-sm text-[var(--txt-secondary)]">Active Projects</div>
          <div className="text-xs text-amber-400 mt-1">→ 12 total projects</div>
        </div>
        
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">6</div>
          <div className="text-sm text-[var(--txt-secondary)]">Active Clients</div>
          <div className="text-xs text-purple-400 mt-1">→ 9 total clients</div>
        </div>
        
        <div className="glass-light rounded-2xl p-6">
          <div className="text-2xl font-bold text-[var(--txt-primary)]">$2,042</div>
          <div className="text-sm text-[var(--txt-secondary)]">Avg Project Value</div>
          <div className="text-xs text-blue-400 mt-1">→ Based on completed</div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-light rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">Revenue Trend</h3>
          <div className="h-64 bg-[var(--bg-2)] rounded-lg flex items-center justify-center">
            <div className="text-[var(--txt-tertiary)]">Revenue chart will be here</div>
          </div>
        </div>
        
        <div className="glass-light rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">Project Status</h3>
          <div className="h-64 bg-[var(--bg-2)] rounded-lg flex items-center justify-center">
            <div className="text-[var(--txt-tertiary)]">Project analytics will be here</div>
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="glass-light rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">Top Clients</h3>
        <div className="space-y-4">
          {[
            { name: 'TechCorp', revenue: 8500, projects: 3 },
            { name: 'StartupXYZ', revenue: 6200, projects: 2 },
            { name: 'BigCompany', revenue: 4800, projects: 2 },
          ].map((client, index) => (
            <div key={client.name} className="flex items-center justify-between p-4 bg-[var(--bg-2)] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 flex items-center justify-center text-white font-semibold text-sm">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-[var(--txt-primary)]">{client.name}</div>
                  <div className="text-xs text-[var(--txt-secondary)]">{client.projects} projects</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-[var(--txt-primary)]">${client.revenue.toLocaleString()}</div>
                <div className="text-xs text-[var(--txt-tertiary)]">${(client.revenue / client.projects).toLocaleString()}/project</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-[var(--txt-tertiary)]">
        🚧 This is a preview of the analytics dashboard. Full functionality coming soon!
      </div>
    </div>
  );
}