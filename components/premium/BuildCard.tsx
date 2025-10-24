"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, ExternalLink, Eye } from "lucide-react";
import { type Features } from "@/lib/pricing";
import { FEATURE_LABELS } from "@/lib/pricing";
import Button from "@/components/ui/Button";

interface BuildCard {
  id: string;
  name: string;
  status: "planning" | "in-progress" | "completed" | "cancelled";
  features: Features;
  createdAt: Date;
  estimatedCompletion?: Date;
  previewUrl?: string;
}

interface BuildCardProps {
  build: BuildCard;
  onViewDetails?: (id: string) => void;
  onViewPreview?: (url: string) => void;
}

const statusConfig = {
  planning: {
    label: "Planning",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/20"
  },
  "in-progress": {
    label: "In Progress",
    color: "text-[var(--mint)]",
    bgColor: "bg-[var(--mint)]/10",
    borderColor: "border-[var(--mint)]/20"
  },
  completed: {
    label: "Completed",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/20"
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/20"
  }
};

export default function BuildCard({ build, onViewDetails, onViewPreview }: BuildCardProps) {
  const status = statusConfig[build.status];
  const selectedFeatures = Object.entries(build.features)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => FEATURE_LABELS[key as keyof Features])
    .slice(0, 3); // Show first 3 features

  const remainingCount = Object.values(build.features).filter(Boolean).length - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6 hover:glass-strong transition-all hover:-translate-y-1"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--txt)] mb-1">{build.name}</h3>
            <div className="flex items-center gap-2">
              <div className={`
                inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border
                ${status.color} ${status.bgColor} ${status.borderColor}
              `}>
                <div className="w-2 h-2 rounded-full bg-current" />
                {status.label}
              </div>
            </div>
          </div>
          
          {build.previewUrl && build.status === "completed" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewPreview?.(build.previewUrl!)}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </Button>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="text-sm text-[var(--muted)]">Features:</div>
          <div className="flex flex-wrap gap-2">
            {selectedFeatures.map((feature) => (
              <div
                key={feature}
                className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-[var(--txt)]"
              >
                {feature}
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-[var(--muted)]">
                +{remainingCount} more
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between text-sm text-[var(--muted)]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Started {build.createdAt.toLocaleDateString()}</span>
          </div>
          
          {build.estimatedCompletion && build.status !== "completed" && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Est. {build.estimatedCompletion.toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {build.status === "in-progress" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">Progress</span>
              <span className="text-[var(--txt)] font-medium">65%</span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails?.(build.id)}
            className="w-full justify-center"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
}