"use client";

import { motion } from "framer-motion";
import { Check, Crown, Zap, Star } from "lucide-react";

interface PlanBadgeProps {
  plan: "free" | "pro" | "enterprise";
  isActive: boolean;
}

const planConfig = {
  free: {
    name: "Free",
    icon: Star,
    gradient: "from-gray-400 to-gray-600",
    textColor: "text-gray-400",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/20"
  },
  pro: {
    name: "Pro",
    icon: Zap,
    gradient: "from-[var(--mint)] to-[var(--cyan)]",
    textColor: "text-[var(--mint)]",
    bgColor: "bg-[var(--mint)]/10",
    borderColor: "border-[var(--mint)]/20"
  },
  enterprise: {
    name: "Enterprise",
    icon: Crown,
    gradient: "from-yellow-400 to-orange-500",
    textColor: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/20"
  }
};

export default function PlanBadge({ plan, isActive }: PlanBadgeProps) {
  const config = planConfig[plan];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-full border
        ${isActive ? config.bgColor + " " + config.borderColor : "bg-white/5 border-white/10"}
        ${isActive ? config.textColor : "text-[var(--muted)]"}
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{config.name}</span>
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Check className="w-3 h-3" />
        </motion.div>
      )}
    </motion.div>
  );
}