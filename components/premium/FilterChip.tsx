"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface FilterChipProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export default function FilterChip({ options, value, onChange, label }: FilterChipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="glass rounded-full px-4 py-2 text-sm text-[var(--txt)] hover:bg-white/5 transition-colors duration-200 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[var(--muted)] text-xs uppercase tracking-wide">{label}:</span>
        <span>{value}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[var(--muted)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 glass-strong rounded-xl p-2 min-w-[120px] z-20"
          >
            {options.map((option) => (
              <button
                key={option}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  value === option 
                    ? 'bg-[var(--mint)]/20 text-[var(--mint)]' 
                    : 'text-[var(--txt)] hover:bg-white/5'
                }`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}