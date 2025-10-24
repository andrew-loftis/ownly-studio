"use client";

import { motion } from "framer-motion";

interface StatBadgeProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  gradient?: string;
  className?: string;
}

export default function StatBadge({ 
  value, 
  label, 
  icon, 
  gradient = "from-[var(--mint)] to-[var(--cyan)]",
  className = "" 
}: StatBadgeProps) {
  return (
    <motion.div
      className={`glass-strong rounded-xl p-6 text-center group cursor-default border border-[var(--border-1)] hover:border-[var(--border-accent)] ${className}`}
      whileHover={{ 
        scale: 1.02,
        y: -4,
      }}
      transition={{ 
        duration: 0.2,
        ease: "easeOut"
      }}
    >
      {icon && (
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:shadow-[var(--glow-mint)] transition-all duration-200`}>
          <div className="text-black text-base font-medium">
            {icon}
          </div>
        </div>
      )}
      <div className="text-2xl font-bold text-[var(--txt-primary)] group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-[var(--mint)] group-hover:to-[var(--cyan)] transition-all duration-200">
        {value}
      </div>
      <div className="text-xs text-[var(--txt-tertiary)] uppercase tracking-wide font-medium">
        {label}
      </div>
    </motion.div>
  );
}