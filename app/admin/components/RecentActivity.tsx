'use client';

import Link from 'next/link';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: any;
  user?: string;
}

interface Deadline {
  id: string;
  title: string;
  deadlineDate: Date;
  status: string;
  clientEmail?: string;
}

interface RecentActivityProps {
  activities: Activity[];
  deadlines: Deadline[];
}

const RecentActivity = ({ activities, deadlines }: RecentActivityProps) => {
  const formatTimeAgo = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  };

  const formatDeadline = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created': return '🚀';
      case 'invoice_sent': return '📧';
      case 'payment_received': return '💰';
      case 'client_message': return '💬';
      case 'project_completed': return '✅';
      case 'deadline_approaching': return '⏰';
      default: return '📝';
    }
  };

  const getDeadlineUrgency = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days <= 1) return 'urgent';
    if (days <= 3) return 'warning';
    return 'normal';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Activities */}
      <div className="glass-light rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
            Recent Activity
          </h3>
          <Link
            href="/admin/activities"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            View All
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className="text-center py-8 text-[var(--txt-tertiary)]">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 6).map((activity, index) => (
              <div key={activity.id || index} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-2)] hover:bg-[var(--bg-3)] transition-colors">
                <span className="text-lg mt-0.5">
                  {getActivityIcon(activity.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--txt-primary)] leading-relaxed">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[var(--txt-tertiary)]">
                    {activity.user && (
                      <>
                        <span>by {activity.user}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Deadlines */}
      <div className="glass-light rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--txt-primary)]">
            Upcoming Deadlines
          </h3>
          <Link
            href="/admin/projects/deadlines"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            View All
          </Link>
        </div>

        {deadlines.length === 0 ? (
          <div className="text-center py-8 text-[var(--txt-tertiary)]">
            No upcoming deadlines
          </div>
        ) : (
          <div className="space-y-4">
            {deadlines.slice(0, 6).map((deadline, index) => {
              const urgency = getDeadlineUrgency(deadline.deadlineDate);
              
              return (
                <div key={deadline.id || index} className={`p-3 rounded-lg border transition-colors ${
                  urgency === 'urgent' ? 'bg-red-500/10 border-red-500/30' :
                  urgency === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
                  'bg-[var(--bg-2)] border-[var(--bg-4)] hover:bg-[var(--bg-3)]'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg ${
                          urgency === 'urgent' ? '🔴' : 
                          urgency === 'warning' ? '🟡' : '🟢'
                        }`}>
                          {urgency === 'urgent' ? '🔴' : 
                           urgency === 'warning' ? '🟡' : '🟢'}
                        </span>
                        <h4 className="font-medium text-[var(--txt-primary)] truncate">
                          {deadline.title}
                        </h4>
                      </div>
                      {deadline.clientEmail && (
                        <p className="text-xs text-[var(--txt-secondary)] mb-2">
                          Client: {deadline.clientEmail.split('@')[0]}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          deadline.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                          deadline.status === 'review' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {deadline.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        urgency === 'urgent' ? 'text-red-400' :
                        urgency === 'warning' ? 'text-amber-400' :
                        'text-[var(--txt-primary)]'
                      }`}>
                        {formatDeadline(deadline.deadlineDate)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;