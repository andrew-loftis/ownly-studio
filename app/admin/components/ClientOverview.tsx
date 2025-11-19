'use client';

interface ClientData {
  name: string;
  email: string;
  revenue: number;
  projects: number;
}

interface ClientOverviewProps {
  clients: ClientData[];
}

const ClientOverview = ({ clients }: ClientOverviewProps) => {
  const formatRevenue = (amount: number) => `$${(amount / 100).toLocaleString()}`;
  const maxRevenue = Math.max(...clients.map(c => c.revenue), 1);

  if (clients.length === 0) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
          Top Clients
        </h3>
        <div className="text-center py-8 text-[var(--txt-tertiary)]">
          No client data available
        </div>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
          Top Clients
        </h3>
        <span className="text-sm text-[var(--txt-tertiary)]">
          By Revenue
        </span>
      </div>

      <div className="space-y-4">
        {clients.map((client, index) => {
          const revenuePercentage = (client.revenue / maxRevenue) * 100;
          
          return (
            <div key={client.email} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--bg-3)] transition-colors">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-500 text-black' :
                index === 1 ? 'bg-gray-400 text-white' :
                index === 2 ? 'bg-amber-600 text-white' :
                'bg-[var(--bg-4)] text-[var(--txt-tertiary)]'
              }`}>
                {index + 1}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 flex items-center justify-center text-white font-semibold">
                {client.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--txt-primary)] truncate">
                  {client.name}
                </div>
                <div className="text-xs text-[var(--txt-secondary)]">
                  {client.projects} project{client.projects !== 1 ? 's' : ''}
                </div>
                
                {/* Revenue bar */}
                <div className="mt-2">
                  <div className="w-full bg-[var(--bg-3)] rounded-full h-1.5">
                    <div 
                      className="h-1.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/60 rounded-full transition-all duration-500"
                      style={{ width: `${revenuePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="text-right">
                <div className="font-semibold text-[var(--txt-primary)]">
                  {formatRevenue(client.revenue)}
                </div>
                <div className="text-xs text-[var(--txt-tertiary)]">
                  {formatRevenue(client.revenue / client.projects)}/project
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--bg-4)] text-center">
        <button className="text-sm text-[var(--accent)] hover:underline">
          View All Clients
        </button>
      </div>
    </div>
  );
};

export default ClientOverview;