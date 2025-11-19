'use client';

interface ClientData {
  name: string;
  revenue: number;
  projects: number;
}

interface ClientInsightsProps {
  clients: ClientData[];
}

const ClientInsights = ({ clients }: ClientInsightsProps) => {
  const formatRevenue = (amount: number) => `$${(amount / 100).toLocaleString()}`;
  const maxRevenue = Math.max(...clients.map(c => c.revenue), 1);

  if (clients.length === 0) {
    return (
      <div className="glass-light rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-[var(--txt-primary)] mb-4">
          Top Clients
        </h3>
        <div className="text-center py-8">
          <div className="text-[var(--txt-tertiary)] text-sm">
            No client data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
            Top Clients
          </h3>
          <p className="text-sm text-[var(--txt-secondary)] mt-1">
            Revenue leaders and project volume
          </p>
        </div>
        
        <div className="text-sm text-[var(--txt-tertiary)]">
          Top {clients.length} clients
        </div>
      </div>

      {/* Client list */}
      <div className="space-y-4">
        {clients.map((client, index) => {
          const revenuePercentage = (client.revenue / maxRevenue) * 100;
          const isTopClient = index === 0;
          
          return (
            <div 
              key={client.name} 
              className={`relative p-4 rounded-xl border transition-all duration-200 hover:border-[var(--accent)]/30 ${
                isTopClient 
                  ? 'bg-gradient-to-r from-[var(--accent)]/5 to-transparent border-[var(--accent)]/20' 
                  : 'bg-[var(--bg-2)] border-[var(--bg-4)]'
              }`}
            >
              {/* Rank */}
              <div className="absolute -left-2 -top-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-amber-600 text-white' :
                  'bg-[var(--bg-4)] text-[var(--txt-tertiary)]'
                }`}>
                  {index + 1}
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Client info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 flex items-center justify-center text-white font-semibold">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Name and projects */}
                    <div>
                      <div className="font-medium text-[var(--txt-primary)]">
                        {client.name}
                      </div>
                      <div className="text-xs text-[var(--txt-secondary)]">
                        {client.projects} project{client.projects !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Revenue bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--txt-secondary)]">Revenue contribution</span>
                      <span className="font-medium text-[var(--txt-primary)]">
                        {formatRevenue(client.revenue)}
                      </span>
                    </div>
                    <div className="w-full bg-[var(--bg-3)] rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/60 rounded-full transition-all duration-500"
                        style={{ width: `${revenuePercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Revenue display */}
                <div className="text-right ml-4">
                  <div className={`text-lg font-bold ${
                    isTopClient ? 'text-[var(--accent)]' : 'text-[var(--txt-primary)]'
                  }`}>
                    {formatRevenue(client.revenue)}
                  </div>
                  <div className="text-xs text-[var(--txt-tertiary)]">
                    ${(client.revenue / client.projects / 100).toLocaleString()}/project
                  </div>
                </div>
              </div>

              {/* Top client badge */}
              {isTopClient && (
                <div className="absolute -top-1 -right-1">
                  <div className="bg-[var(--accent)] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    Top Client
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--bg-4)]">
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">Total Revenue</div>
          <div className="font-semibold text-[var(--txt-primary)]">
            {formatRevenue(clients.reduce((sum, client) => sum + client.revenue, 0))}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm text-[var(--txt-tertiary)]">Avg Revenue/Client</div>
          <div className="font-semibold text-[var(--txt-primary)]">
            {formatRevenue(clients.reduce((sum, client) => sum + client.revenue, 0) / clients.length)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInsights;