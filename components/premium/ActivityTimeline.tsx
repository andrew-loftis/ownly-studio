"use client";

import { motion } from "framer-motion";
import { Clock, CheckCircle, AlertCircle, MessageSquare, Calendar, Zap } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "build_started" | "build_completed" | "message_received" | "payment_processed" | "feature_added";
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const activityConfig = {
  build_started: {
    icon: Zap,
    color: "text-blue-400",
    bgColor: "bg-blue-400/20"
  },
  build_completed: {
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-400/20"
  },
  message_received: {
    icon: MessageSquare,
    color: "text-[var(--mint)]",
    bgColor: "bg-[var(--mint)]/20"
  },
  payment_processed: {
    icon: CheckCircle,
    color: "text-green-400",
    bgColor: "bg-green-400/20"
  },
  feature_added: {
    icon: Zap,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20"
  }
};

export default function ActivityTimeline({ activities, maxItems = 10 }: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, maxItems);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {displayActivities.map((activity, index) => {
        const config = activityConfig[activity.type];
        const Icon = config.icon;
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start gap-4"
          >
            {/* Timeline Line */}
            {index < displayActivities.length - 1 && (
              <div className="absolute left-6 top-12 w-px h-8 bg-white/10" />
            )}
            
            {/* Icon */}
            <div className={`
              flex items-center justify-center w-12 h-12 rounded-xl border border-white/10
              ${config.bgColor} flex-shrink-0
            `}>
              <Icon className={`w-5 h-5 ${config.color}`} />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-medium text-[var(--txt)] mb-1">{activity.title}</h4>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{activity.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-[var(--muted)] flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(activity.timestamp)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
      
      {activities.length === 0 && (
        <div className="text-center py-8 text-[var(--muted)]">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <p>No activity yet</p>
          <p className="text-xs mt-1">Your project updates will appear here</p>
        </div>
      )}
    </div>
  );
}