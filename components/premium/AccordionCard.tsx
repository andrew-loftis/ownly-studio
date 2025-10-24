"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  details: string[];
  className?: string;
}

export default function AccordionCard({ 
  title, 
  subtitle, 
  icon, 
  details,
  className = "" 
}: AccordionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      className={`glass-strong rounded-xl overflow-hidden group border border-[var(--border-1)] hover:border-[var(--border-accent)] ${className}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <button
        className="w-full p-6 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--mint)] to-[var(--cyan)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:shadow-[var(--glow-mint)] transition-all duration-200">
            <div className="text-black font-medium">
              {icon}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--txt-primary)] group-hover:text-[var(--mint)] transition-colors duration-200">
              {title}
            </h3>
            <p className="text-[var(--txt-tertiary)] text-sm mt-1 leading-relaxed">
              {subtitle}
            </p>
            
            <div className="flex items-center gap-2 mt-3 text-xs text-[var(--txt-muted)] font-medium">
              <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-[var(--border-1)]"
          >
            <div className="p-6 pt-4 bg-[var(--bg-2)]/50">
              <ul className="space-y-3">
                {details.map((detail, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center text-sm text-[var(--txt-secondary)]"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[var(--mint)] to-[var(--cyan)] mr-3 flex-shrink-0" />
                    {detail}
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}